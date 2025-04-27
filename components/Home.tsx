import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useStudyStore } from '@/store/useStudyStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGoalsStore } from '@/store/useGoalsStore';
import { useAuth } from '@/store/useAuth';
import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';
import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';

interface Session {
  id: string;
  subject: string;
  duration: number;
  date: string;
  points: number;
}

export const Home = () => {
  const { sessions } = useStudyStore();
  const { settings } = useSettingsStore();
  const { goals } = useGoalsStore();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Calculate statistics
  const totalPoints = sessions.reduce((sum, session) => sum + session.points, 0);
  const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
  const sessionCount = sessions.length;
  const dailyProgress = (goals.currentDaily / goals.daily) * 100;
  const weeklyProgress = (goals.currentWeekly / goals.weekly) * 100;

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchLoading(true);
      const response = await searchGoogle(query, searchType);
      setSearchResults(searchType === 'web' ? response.results : response.images);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Chart data
  const chartData = Array(7).fill(0).map((_, i) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
    minutes: sessions
      .filter(s => new Date(s.date).getDay() === i)
      .reduce((sum, s) => sum + (s.duration / 60), 0)
  }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Overview</Text>
        <CloudSyncIndicator />
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <SearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={() => handleSearch(searchQuery)}
            isLoading={searchLoading}
            placeholder="Search for study resources..."
          />
        </View>
      )}

      <View style={styles.statsContainer}>
        <StatCard value={sessionCount} label="Sessions" icon="🎯" />
        <StatCard value={Math.floor(totalDuration / 60)} label="Hours" icon="⏳" />
        <StatCard value={totalPoints} label="Points" icon="⭐" />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
          <VictoryBar
            data={chartData}
            x="day"
            y="minutes"
            style={{ data: { fill: '#6366f1' } }}
          />
        </VictoryChart>
      </View>

      <View style={styles.goalsContainer}>
        <Pressable style={styles.goalItem}>
          <View>
            <Text style={styles.goalTitle}>Daily Goal</Text>
            <Text style={styles.goalText}>
              {Math.floor(goals.currentDaily)} / {goals.daily} minutes
            </Text>
            <ProgressBar progress={dailyProgress} />
          </View>
          <ChevronRight color="#64748b" />
        </Pressable>

        <Pressable style={styles.goalItem}>
          <View>
            <Text style={styles.goalTitle}>Weekly Goal</Text>
            <Text style={styles.goalText}>
              {Math.floor(goals.currentWeekly)} / {goals.weekly} minutes
            </Text>
            <ProgressBar progress={weeklyProgress} />
          </View>
          <ChevronRight color="#64748b" />
        </Pressable>
      </View>

      <RecentSessions sessions={sessions.slice(0, 5)} />
    </ScrollView>
  );
};

const CloudSyncIndicator = () => {
  const { session } = useAuth();
  return (
    <View style={styles.syncContainer}>
      <View style={[styles.syncDot, { backgroundColor: session ? '#10b981' : '#ef4444' }]} />
      <Text style={styles.syncText}>
        {session ? 'Synced' : 'Offline'}
      </Text>
    </View>
  );
};

const StatCard = ({ value, label, icon }: { value: number; label: string; icon: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={styles.progressBar}>
    <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
  </View>
);

const RecentSessions = ({ sessions }: { sessions: Session[] }) => (
  <View style={styles.recentActivity}>
    <Text style={styles.sectionTitle}>Recent Sessions</Text>
    {sessions.map((session, index) => (
      <SessionItem key={index} session={session} />
    ))}
  </View>
);

const SessionItem = ({ session }: { session: Session }) => (
  <View style={styles.sessionItem}>
    <Text style={styles.sessionSubject}>{session.subject}</Text>
    <Text style={styles.sessionTime}>
      {Math.floor(session.duration / 60)}h {session.duration % 60}m
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1e293b',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 16,
  },
  goalsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  goalItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  goalText: {
    fontSize: 14,
    color: '#64748b',
    marginVertical: 4,
    fontFamily: 'Inter_400Regular',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  recentActivity: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sessionSubject: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  sessionTime: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  searchContainer: {
    marginBottom: 16,
  },
});