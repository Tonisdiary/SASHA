// study.tsx
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Play, Pause, RotateCcw, BookOpen } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useStudyStore } from '@/store/useStudyStore';
import { useSubjectsStore } from '@/store/useSubjectsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { format } from 'date-fns';

export default function StudyScreen() {
  const { subjects } = useSubjectsStore();
  const { addSession } = useStudyStore();
  const { settings, updateSettings } = useSettingsStore();
  const [isStudying, setIsStudying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.studyDuration * 60);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [breakMode, setBreakMode] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSubjects();
    return () => clearInterval(intervalRef.current!);
  }, []);

  useEffect(() => {
    if (isStudying && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(intervalRef.current!);
  }, [isStudying, timeLeft]);

  const loadSubjects = async () => {
    try {
      await useSubjectsStore.getState().fetchSubjects();
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load subjects');
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (!selectedSubject && !isStudying && !breakMode) {
      Alert.alert('Select Subject', 'Please select a subject before starting');
      return;
    }
    setIsStudying(!isStudying);
  };

  const handleSessionComplete = async () => {
    setIsStudying(false);
    clearInterval(intervalRef.current!);

    if (!selectedSubject || breakMode) {
      resetTimer();
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const sessionDuration = settings.studyDuration * 60;
      const points = Math.floor(sessionDuration / 30) * 10;

      // Save to Supabase
      const { error } = await supabase.from('study_sessions').insert([{
        user_id: user.id,
        subject_id: selectedSubject,
        duration: sessionDuration,
        date: format(new Date(), 'yyyy-MM-dd'),
        points: points,
        completed: true
      }]);

      if (error) throw error;

      // Update local store
      addSession({
        id: Math.random().toString(),
        subjectId: selectedSubject,
        duration: sessionDuration,
        date: format(new Date(), 'yyyy-MM-dd'),
        points: points,
        completed: true
      });

      handleBreakSequence();
    } catch (error) {
      Alert.alert('Error', 'Failed to save session');
    }
  };

  const handleBreakSequence = () => {
    setCompletedSessions(prev => {
      const newCount = prev + 1;
      if (newCount < 4) {
        Alert.alert('Break Time!', 'Take a short break', [
          { text: 'Start Break', onPress: () => startBreak(settings.shortBreak) },
          { text: 'Skip', onPress: resetTimer }
        ]);
      } else {
        Alert.alert('Long Break!', 'Take a longer break', [
          { text: 'Start Break', onPress: () => startBreak(settings.longBreak) },
          { text: 'Skip', onPress: () => {
            resetTimer();
            setCompletedSessions(0);
          }}
        ]);
      }
      return newCount % 4;
    });
  };

  const startBreak = (minutes: number) => {
    setBreakMode(true);
    setTimeLeft(minutes * 60);
    setIsStudying(true);
  };

  const resetTimer = () => {
    setBreakMode(false);
    setTimeLeft(settings.studyDuration * 60);
    setIsStudying(false);
  };

  const TimeEditor = () => {
    const [editMode, setEditMode] = useState(false);
    const [tempSettings, setTempSettings] = useState(settings);

    const handleSave = () => {
      updateSettings(tempSettings);
      setTimeLeft(tempSettings.studyDuration * 60);
      setEditMode(false);
    };

    return (
      <View style={styles.settingsSection}>
        <View style={styles.settingsHeader}>
          <Text style={styles.sectionTitle}>Timer Settings</Text>
          {editMode ? (
            <Pressable onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setEditMode(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </Pressable>
          )}
        </View>

        {editMode ? (
          <View style={styles.timeInputs}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Study (mins)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={tempSettings.studyDuration.toString()}
                onChangeText={(t) => setTempSettings(s => ({ ...s, studyDuration: Number(t) }))}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Short Break</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={tempSettings.shortBreak.toString()}
                onChangeText={(t) => setTempSettings(s => ({ ...s, shortBreak: Number(t) }))}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Long Break</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={tempSettings.longBreak.toString()}
                onChangeText={(t) => setTempSettings(s => ({ ...s, longBreak: Number(t) }))}
              />
            </View>
          </View>
        ) : (
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>
              Study: {settings.studyDuration}min
            </Text>
            <Text style={styles.timeText}>
              Breaks: {settings.shortBreak}/{settings.longBreak}min
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Session</Text>
        {breakMode && <Text style={styles.breakText}>Break Time!</Text>}
      </View>

      <View style={[styles.timerCard, breakMode && styles.breakCard]}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <View style={styles.buttonGroup}>
          <Pressable
            style={[
              styles.timerButton,
              isStudying && styles.timerButtonActive,
              breakMode && styles.breakButton
            ]}
            onPress={handleStartStop}>
            {isStudying ? (
              <Pause size={24} color="#ffffff" />
            ) : (
              <Play size={24} color="#ffffff" />
            )}
          </Pressable>
          <Pressable style={styles.resetButton} onPress={resetTimer}>
            <RotateCcw size={24} color="#6366f1" />
          </Pressable>
        </View>
        <Text style={styles.timerLabel}>
          {breakMode ? 'Break Timer' : isStudying ? 'Pause Session' : 'Start Session'}
        </Text>
        {selectedSubject && !breakMode && (
          <View style={styles.subjectBadge}>
            <BookOpen size={16} color="#6366f1" />
            <Text style={styles.selectedSubject}>
              {subjects.find(s => s.id === selectedSubject)?.name}
            </Text>
          </View>
        )}
      </View>

      <TimeEditor />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
          {subjects.map((subject) => (
            <Pressable
              key={subject.id}
              style={[
                styles.subjectChip,
                selectedSubject === subject.id && styles.subjectChipSelected
              ]}
              onPress={() => setSelectedSubject(subject.id)}>
              <Text style={[
                styles.subjectText,
                selectedSubject === subject.id && styles.subjectTextSelected
              ]}>
                {subject.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Progress Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedSessions * settings.studyDuration}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedSessions * settings.studyDuration * 2}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Next Long Break: {4 - completedSessions} sessions
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedSessions / 4) * 100}%` }]} />
          </View>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1e293b',
  },
  breakText: {
    fontSize: 16,
    color: '#10b981',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  timerCard: {
    margin: 20,
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  breakCard: {
    backgroundColor: '#f0fdf4',
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: '#1e293b',
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  timerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerButtonActive: {
    backgroundColor: '#dc2626',
  },
  breakButton: {
    backgroundColor: '#10b981',
  },
  resetButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'Inter_600SemiBold',
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  selectedSubject: {
    fontSize: 14,
    color: '#6366f1',
    fontFamily: 'Inter_600SemiBold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 12,
  },
  subjectScroll: {
    flexDirection: 'row',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  subjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectChipSelected: {
    backgroundColor: '#6366f1',
  },
  subjectText: {
    fontSize: 14,
    color: '#1e293b',
    fontFamily: 'Inter_600SemiBold',
  },
  subjectTextSelected: {
    color: '#ffffff',
  },
  infoSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#1e293b',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  settingsSection: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    color: '#6366f1',
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    color: '#10b981',
    fontFamily: 'Inter_600SemiBold',
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  timeText: {
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
});