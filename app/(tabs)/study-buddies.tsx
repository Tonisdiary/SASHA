import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image, 
  ActivityIndicator, 
  Switch,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { MapPin, Users, Brain, Clock, BookOpen, MessageCircle, X, Star, DollarSign, Award, CircleCheck as CheckCircle } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { Map, Marker } from '@/components/Map';
import { router } from 'expo-router';

interface StudyBuddy {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  subjects: string[];
  availability: string;
  last_active: string;
  study_level: number;
  preferred_study_time: string;
  learning_style: string;
  ai_match_score: number;
  is_tutor: boolean;
  hourly_rate: number;
  expertise_level: string;
  verified: boolean;
  subjects_expertise: string[];
  average_rating: number;
  review_count: number;
  distance: number;
  bio: string;
  gender: string;
  study_preferences: string;
  communication_style: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
}

export default function StudyBuddiesScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [buddies, setBuddies] = useState<StudyBuddy[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedBuddy, setSelectedBuddy] = useState<StudyBuddy | null>(null);
  const [showBuddyDetails, setShowBuddyDetails] = useState(false);
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [searchRadius, setSearchRadius] = useState(5);
  const [showTutorsOnly, setShowTutorsOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    initializeLocation();
    fetchUserSubjects();
    subscribeToPresence();
  }, []);

  const subscribeToPresence = () => {
    const channel = supabase.channel('online_users');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        fetchNearbyBuddies(location?.coords.latitude || 0, location?.coords.longitude || 0);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: (await supabase.auth.getUser()).data.user?.id,
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  };

  const fetchUserSubjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('subjects')
        .select('name')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserSubjects(data?.map(s => s.name) || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      updateUserLocation(location);
      fetchNearbyBuddies(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const updateUserLocation = async (location: Location.LocationObject) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('study_buddies')
        .upsert({
          user_id: user.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          is_available: isAvailable,
          subjects: userSubjects,
          last_active: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const fetchNearbyBuddies = async (latitude: number, longitude: number) => {
    try {
      const { data, error } = await supabase
        .rpc('find_nearby_study_buddies', {
          include_tutors: showTutorsOnly,
          radius_km: searchRadius,
          user_latitude: latitude,
          user_longitude: longitude
        });

      if (error) throw error;

      // Ensure all buddies have the expected structure
      const buddiesWithScore = (data || []).map((buddy: StudyBuddy) => ({
        ...buddy,
        profiles: buddy.profiles || { username: 'Anonymous', avatar_url: null },
        distance: calculateDistance(
          latitude,
          longitude,
          buddy.latitude,
          buddy.longitude
        ),
        ai_match_score: calculateMatchScore(buddy)
      }));

      setBuddies(buddiesWithScore);
    } catch (error) {
      console.error('Error fetching buddies:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  };

  const calculateMatchScore = (buddy: StudyBuddy) => {
    let score = 0;
    const commonSubjects = buddy.subjects.filter(s => userSubjects.includes(s));
    score += (commonSubjects.length / Math.max(userSubjects.length, buddy.subjects.length)) * 40;

    if (buddy.is_tutor) {
      score += 20;
      if (buddy.verified) score += 10;
      if (buddy.average_rating >= 4.5) score += 10;
    }

    return Math.round(score);
  };

  const handleConnectBuddy = async (buddy: StudyBuddy) => {
  try {
    const { data: chatRoom } = await supabase.rpc('create_direct_chat_room', {
      user2_id: buddy.user_id
    });

    if (chatRoom) {
      // Update to use the new MessagesScreen roomId param
      router.push({
        pathname: '/messages',
        params: { roomId: chatRoom.id }
      });
    }
  } catch (error) {
    console.error('Error creating chat:', error);
    Alert.alert('Error', 'Failed to create chat. Please try again.');
  }
};

  const toggleAvailability = async () => {
    setIsAvailable(!isAvailable);
    if (location) {
      await updateUserLocation(location);
    }
  };

  const renderBuddyMarker = (buddy: StudyBuddy) => {
    const markerColor = buddy.is_tutor ? '#10b981' : getBuddyMarkerColor(buddy.ai_match_score);
    
    return (
      <Pressable
        onPress={() => {
          setSelectedBuddy(buddy);
          setShowBuddyDetails(true);
        }}
        style={[styles.buddyMarker, { backgroundColor: markerColor }]}>
        {buddy.is_tutor ? (
          <Award size={20} color="#ffffff" />
        ) : (
          <Users size={20} color="#ffffff" />
        )}
      </Pressable>
    );
  };

  const getBuddyMarkerColor = (matchScore: number) => {
    if (matchScore >= 80) return '#10b981';
    if (matchScore >= 50) return '#f59e0b';
    return '#6366f1';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Buddies</Text>
        <View style={styles.headerButtons}>
          <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityLabel}>Available</Text>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#cbd5e1', true: '#86efac' }}
              thumbColor={isAvailable ? '#10b981' : '#94a3b8'}
            />
          </View>
          <Pressable
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}>
            <Brain size={24} color="#6366f1" />
          </Pressable>
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Search Radius (km)</Text>
            <View style={styles.radiusButtons}>
              {[1, 5, 10, 20].map((radius) => (
                <Pressable
                  key={radius}
                  style={[
                    styles.radiusButton,
                    searchRadius === radius && styles.radiusButtonActive,
                  ]}
                  onPress={() => {
                    setSearchRadius(radius);
                    location && fetchNearbyBuddies(location.coords.latitude, location.coords.longitude);
                  }}>
                  <Text style={[
                    styles.radiusButtonText,
                    searchRadius === radius && styles.radiusButtonTextActive,
                  ]}>
                    {radius}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterLabel}>Show Tutors Only</Text>
              <Switch
                value={showTutorsOnly}
                onValueChange={(value) => {
                  setShowTutorsOnly(value);
                  location && fetchNearbyBuddies(location.coords.latitude, location.coords.longitude);
                }}
                trackColor={{ false: '#cbd5e1', true: '#86efac' }}
                thumbColor={showTutorsOnly ? '#10b981' : '#94a3b8'}
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.mapContainer}>
        {location && (
          <Map
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}>
              <View style={styles.currentUserMarker} />
            </Marker>

            {buddies.map((buddy) => (
              <Marker
                key={buddy.id}
                coordinate={{
                  latitude: buddy.latitude,
                  longitude: buddy.longitude,
                }}>
                {renderBuddyMarker(buddy)}
              </Marker>
            ))}
          </Map>
        )}
      </View>

      {showBuddyDetails && selectedBuddy && (
        <View style={styles.buddyDetailsContainer}>
          <View style={styles.buddyDetailsHeader}>
            <View style={styles.buddyTitleContainer}>
              <Text style={styles.buddyDetailsTitle}>
                {selectedBuddy?.profiles?.username || 'Anonymous'}
                {selectedBuddy.verified && (
                  <CheckCircle size={16} color="#10b981" style={styles.verifiedIcon} />
                )}
              </Text>
              <Text style={styles.buddySubtitle}>
                {selectedBuddy.is_tutor ? 'Professional Tutor' : 'Study Buddy'}
                {selectedBuddy.gender && ` • ${selectedBuddy.gender}`}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowBuddyDetails(false)}
              style={styles.closeButton}>
              <X size={24} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.buddyDetailsContent}>
            <View style={styles.buddyProfile}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {selectedBuddy.profiles?.avatar_url ? (
                    <Image
                      source={{ uri: selectedBuddy.profiles.avatar_url }}
                      style={styles.avatar}
                    />
                  ) : (
                    <Users size={32} color="#64748b" />
                  )}
                </View>
                <View style={styles.headerStats}>
                  <View style={styles.statItem}>
                    <MapPin size={18} color="#64748b" />
                    <Text style={styles.statText}>
                      {selectedBuddy.distance} km away
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Clock size={18} color="#64748b" />
                    <Text style={styles.statText}>
                      Active {formatDistanceToNow(new Date(selectedBuddy.last_active))} ago
                    </Text>
                  </View>
                  {selectedBuddy.is_tutor && (
                    <View style={styles.statItem}>
                      <Star size={18} color="#f59e0b" />
                      <Text style={styles.statText}>
                        {selectedBuddy.average_rating.toFixed(1)}/5 ({selectedBuddy.review_count} reviews)
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {selectedBuddy.bio && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>About</Text>
                  <Text style={styles.bioText}>{selectedBuddy.bio}</Text>
                </View>
              )}

              {selectedBuddy.is_tutor ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tutoring Details</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <DollarSign size={20} color="#10b981" />
                      <Text style={styles.detailText}>
                        ${selectedBuddy.hourly_rate}/hour
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Award size={20} color="#f59e0b" />
                      <Text style={styles.detailText}>
                        {selectedBuddy.expertise_level}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <BookOpen size={20} color="#6366f1" />
                      <Text style={styles.detailText}>
                        {selectedBuddy.subjects_expertise.length} subjects
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Study Preferences</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <BookOpen size={20} color="#6366f1" />
                      <Text style={styles.detailText}>
                        Level {selectedBuddy.study_level}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Clock size={20} color="#6366f1" />
                      <Text style={styles.detailText}>
                        Prefers {selectedBuddy.preferred_study_time}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Brain size={20} color="#6366f1" />
                      <Text style={styles.detailText}>
                        {selectedBuddy.learning_style} learner
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {selectedBuddy.is_tutor ? 'Teaching Subjects' : 'Study Subjects'}
                </Text>
                <View style={styles.chipContainer}>
                  {(selectedBuddy.is_tutor 
                    ? selectedBuddy.subjects_expertise 
                    : selectedBuddy.subjects
                  ).map((subject, index) => (
                    <View key={index} style={styles.chip}>
                      <Text style={styles.chipText}>{subject}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.actionButton, styles.messageButton]}
                  onPress={() => handleConnectBuddy(selectedBuddy)}>
                  <MessageCircle size={20} color="#ffffff" />
                  <Text style={styles.buttonText}>
                    {selectedBuddy.is_tutor ? 'Contact Tutor' : 'Message Buddy'}
                  </Text>
                </Pressable>
                
                {!selectedBuddy.is_tutor && (
                  <Pressable
                    style={[styles.actionButton, styles.matchButton]}>
                    <Users size={20} color="#ffffff" />
                    <Text style={styles.buttonText}>Request Study Session</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1e293b',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  radiusButtonActive: {
    backgroundColor: '#6366f1',
  },
  radiusButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  radiusButtonTextActive: {
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  currentUserMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  buddyMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  buddyDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buddyDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  buddyTitleContainer: {
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  buddyDetailsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  buddySubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  closeButton: {
    padding: 8,
  },
  buddyDetailsContent: {
    padding: 20,
  },
  buddyProfile: {
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  headerStats: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#475569',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    fontFamily: 'Inter_400Regular',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Inter_400Regular',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  messageButton: {
    backgroundColor: '#6366f1',
  },
  matchButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
  errorText: {
    color: '#ef4444',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
});