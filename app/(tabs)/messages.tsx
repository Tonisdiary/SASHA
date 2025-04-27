import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Send, Users } from 'lucide-react-native';
import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: {
    username: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  chat_room_participants: Array<{
    profiles: {
      username: string;
    };
  }>;
  // For derived values
  lastMessage?: string;
  lastMessageTime?: string;
}

export default function MessagesScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(roomId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    getCurrentUser();
    fetchChatRooms();

    // Handle initial room selection from params
    if (roomId) {
      setSelectedRoom(roomId);
      fetchMessages(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, payload => {
        if (payload.new && selectedRoom === payload.new.room_id) {
          fetchMessage(payload.new.id).then(newMessage => {
            if (newMessage) {
              setMessages(prev => [...prev, newMessage]);
              
              // Scroll to bottom when new message arrives
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRoom, currentUser]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to view messages');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setCurrentUser({
        id: user.id,
        username: profile?.username || 'You'
      });
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchChatRooms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to view messages');
        return;
      }

      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          name,
          type,
          chat_room_participants (
            profiles (username)
          )
        `)
        .eq('chat_room_participants.user_id', user.id);

      if (roomsError) throw roomsError;

      // Get the latest message for each room
      const roomsWithMessages = await Promise.all((rooms || []).map(async (room) => {
        // Get latest message
        const { data: latestMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...room,
          lastMessage: latestMessage?.content,
          lastMessageTime: latestMessage?.created_at,
        };
      }));

      // Sort rooms by last message time
      roomsWithMessages.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      setChatRooms(roomsWithMessages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setError('Failed to load chat rooms');
      setLoading(false);
    }
  };

  const fetchMessage = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles (username)
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching single message:', error);
      return null;
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles (username)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      setLoading(false);

      // Scroll to bottom after loading messages
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !currentUser) return;

    try {
      setNewMessage(''); // Clear input immediately for better UX

      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: selectedRoom,
          sender_id: currentUser.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      // No need to update chat_rooms table since we're calculating last message dynamically
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const getRoomName = (room: ChatRoom) => {
    if (room.name) return room.name;
    
    // For direct messages, show the other person's username
    if (room.type === 'direct' && currentUser) {
      const otherParticipant = room.chat_room_participants.find(
        p => p.profiles.username !== currentUser.username
      );
      return otherParticipant?.profiles.username || 'Chat';
    }
    
    return room.chat_room_participants.map(p => p.profiles.username).join(', ');
  };

  const getSenderName = (message: Message) => {
    if (!currentUser) return message.profiles.username;
    return message.sender_id === currentUser.id ? 'You' : message.profiles.username;
  };

  const isSentByMe = (message: Message) => {
    return currentUser?.id === message.sender_id;
  };

  if (loading && !selectedRoom) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sidebar}>
          <ScrollView>
            {chatRooms.length === 0 && !loading ? (
              <View style={styles.emptyRoomsState}>
                <MessageCircle size={32} color="#94a3b8" />
                <Text style={styles.emptyStateText}>No conversations yet</Text>
              </View>
            ) : (
              chatRooms.map((room) => (
                <Pressable
                  key={room.id}
                  style={[
                    styles.roomItem,
                    selectedRoom === room.id && styles.roomItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedRoom(room.id);
                    fetchMessages(room.id);
                  }}>
                  <View style={styles.roomIcon}>
                    {room.type === 'group' ? (
                      <Users size={24} color="#6366f1" />
                    ) : (
                      <MessageCircle size={24} color="#6366f1" />
                    )}
                  </View>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>
                      {getRoomName(room)}
                    </Text>
                    <Text numberOfLines={1} style={styles.lastMessage}>
                      {room.lastMessage || 'No messages yet'}
                    </Text>
                  </View>
                  {room.lastMessageTime && (
                    <Text style={styles.messageTime}>
                      {format(new Date(room.lastMessageTime), 'h:mm a')}
                    </Text>
                  )}
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.chatContainer}>
          {selectedRoom ? (
            <>
              {loading ? (
                <View style={[styles.messageListLoading, styles.centered]}>
                  <ActivityIndicator size="small" color="#6366f1" />
                </View>
              ) : (
                <ScrollView 
                  ref={scrollViewRef}
                  style={styles.messageList}
                  contentContainerStyle={messages.length === 0 ? styles.centered : undefined}
                  onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                  
                  {messages.length === 0 ? (
                    <View style={styles.emptyMessagesState}>
                      <MessageCircle size={40} color="#94a3b8" />
                      <Text style={styles.emptyStateText}>No messages yet</Text>
                      <Text style={styles.emptyStateSubtext}>Send a message to start the conversation</Text>
                    </View>
                  ) : (
                    messages.map((message) => {
                      const sentByMe = isSentByMe(message);
                      return (
                        <View
                          key={message.id}
                          style={[
                            styles.messageItem,
                            sentByMe ? styles.sentMessage : styles.receivedMessage,
                          ]}>
                          {!sentByMe && (
                            <Text style={[
                              styles.senderName,
                              sentByMe ? styles.sentSenderName : styles.receivedSenderName
                            ]}>
                              {getSenderName(message)}
                            </Text>
                          )}
                          <Text style={[
                            styles.messageContent,
                            sentByMe ? styles.sentMessageContent : styles.receivedMessageContent
                          ]}>
                            {message.content}
                          </Text>
                          <Text style={[
                            styles.messageTime,
                            sentByMe ? styles.sentMessageTime : styles.receivedMessageTime
                          ]}>
                            {format(new Date(message.created_at), 'h:mm a')}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </ScrollView>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Type a message..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  maxLength={500}
                />
                <Pressable
                  style={[
                    styles.sendButton,
                    !newMessage.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendMessage}
                  disabled={!newMessage.trim()}>
                  <Send size={20} color="#ffffff" />
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.emptyChatState}>
              <MessageCircle size={48} color="#94a3b8" />
              <Text style={styles.emptyChatText}>
                Select a chat to start messaging
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  sidebar: {
    width: Platform.OS === 'web' ? 300 : '100%',
    height: Platform.OS === 'web' ? '100%' : 200,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderBottomWidth: Platform.OS === 'web' ? 0 : 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  emptyRoomsState: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  roomItemSelected: {
    backgroundColor: '#f1f5f9',
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    maxWidth: '80%',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
  },
  participantsText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messageList: {
    flex: 1,
    padding: 20,
  },
  messageListLoading: {
    flex: 1,
  },
  emptyMessagesState: {
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    textAlign: 'center',
  },
  messageItem: {
    maxWidth: '70%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
  },
  senderName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  sentSenderName: {
    color: '#ffffff',
  },
  receivedSenderName: {
    color: '#64748b',
  },
  messageContent: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  sentMessageContent: {
    color: '#ffffff',
  },
  receivedMessageContent: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sentMessageTime: {
    color: '#ffffff',
    opacity: 0.8,
  },
  receivedMessageTime: {
    color: '#64748b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
    maxHeight: 100,
    fontFamily: 'Inter_400Regular',
    color: '#1e293b',
  },
  sendButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  emptyChatState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
});