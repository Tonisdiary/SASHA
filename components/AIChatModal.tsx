import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Send, X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AIChatModal({ visible, onClose }: Props) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);

  const handleSend = async () => {
    if (!question.trim()) return;

    const userMessage = { role: 'user' as const, content: question };
    setConversation((prev) => [...prev, userMessage]);
    setQuestion('');

    // Simulate AI response - Replace with actual OpenAI integration
    setTimeout(() => {
      const aiMessage = {
        role: 'ai' as const,
        content: 'This is a simulated AI response. In production, this would be connected to the OpenAI API.',
      };
      setConversation((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ask AI Tutor</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.conversationContainer}>
            {conversation.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.message,
                  message.role === 'ai' ? styles.aiMessage : styles.userMessage,
                ]}>
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'ai' ? styles.aiMessageText : styles.userMessageText,
                  ]}>
                  {message.content}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask anything..."
              placeholderTextColor="#94a3b8"
              multiline
            />
            <Pressable onPress={handleSend} style={styles.sendButton}>
              <Send size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  conversationContainer: {
    flex: 1,
  },
  message: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#1e293b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
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
});