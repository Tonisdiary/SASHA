// app/(tabs)/calendar.tsx
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { Calendar as CalendarComponent } from 'react-native-calendars';
import { Clock, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { useStudyStore } from 'store/useStudyStore';
import { useSubjectsStore } from 'store/useSubjectsStore';
import { format, parseISO } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
  const { sessions, addSession } = useStudyStore();
  const { subjects } = useSubjectsStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({
    subjectId: '',
    duration: '60',
    date: selectedDate,
  });

  const markedDates = sessions.reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = { marked: true, dotColor: '#6366f1' };
    }
    return acc;
  }, {} as Record<string, { marked: boolean; dotColor: string; selected?: boolean; selectedColor?: string }>);

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: '#6366f1',
    };
  }

  const selectedSessions = sessions.filter((session) => session.date === selectedDate);
  const totalPoints = selectedSessions.reduce((sum, session) => sum + session.points, 0);

  const handleAddSession = () => {
    if (!newSession.subjectId || !newSession.duration) {
      alert('Please select a subject and enter duration');
      return;
    }

    addSession({
      subject: newSession.subjectId,
      duration: parseInt(newSession.duration),
      date: newSession.date,
      completed: true,
    });

    setShowAddSession(false);
    setNewSession({ subjectId: '', duration: '60', date: selectedDate });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Study Calendar</Text>
          <Pressable style={styles.addButton} onPress={() => setShowAddSession(true)}>
            <Plus size={24} color="#ffffff" />
          </Pressable>
        </View>

        <Modal visible={showAddSession} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Study Session</Text>
            
            <Text style={styles.label}>Subject</Text>
            <View style={styles.picker}>
              {subjects.map(subject => (
                <Pressable
                  key={subject.id}
                  style={[
                    styles.subjectOption,
                    newSession.subjectId === subject.id && styles.selectedSubject
                  ]}
                  onPress={() => setNewSession(prev => ({ ...prev, subjectId: subject.id }))}>
                  <Text style={styles.subjectOptionText}>{subject.name}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={newSession.date}
              onChangeText={(text) => setNewSession(prev => ({ ...prev, date: text }))}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={newSession.duration}
              onChangeText={(text) => setNewSession(prev => ({ ...prev, duration: text }))}
            />

            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddSession(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.submitButton]}
                onPress={handleAddSession}>
                <Text style={styles.buttonText}>Add Session</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View style={styles.calendarContainer}>
          <CalendarComponent
            markedDates={markedDates}
            onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#64748b',
              selectedDayBackgroundColor: '#6366f1',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#6366f1',
              dayTextColor: '#1e293b',
              textDisabledColor: '#94a3b8',
              dotColor: '#6366f1',
              selectedDotColor: '#ffffff',
              arrowColor: '#6366f1',
              monthTextColor: '#1e293b',
              textDayFontFamily: 'Inter_400Regular',
              textMonthFontFamily: 'Inter_600SemiBold',
              textDayHeaderFontFamily: 'Inter_600SemiBold',
            }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.dateHeader}>
            <Text style={styles.sectionTitle}>{format(parseISO(selectedDate), 'MMMM dd, yyyy')}</Text>
            {totalPoints > 0 && (
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>{totalPoints} points</Text>
              </View>
            )}
          </View>
              {selectedSessions.length > 0 ? (
            selectedSessions.map((session, index) => {
              const subject = subjects.find(s => s.name === session.subject);
              return (
                <View key={index} style={styles.sessionCard}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionSubject}>{subject?.name || 'Unknown Subject'}</Text>
                    <View style={styles.sessionMeta}>
                      <View style={styles.durationContainer}>
                        <Clock size={16} color="#6366f1" />
                        <Text style={styles.durationText}>
                          {Math.floor(session.duration / 60)}h {session.duration % 60}m
                        </Text>
                      </View>
                      <View style={styles.pointsBadge}>
                        <Text style={styles.pointsText}>+{session.points}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noSessionsText}>No study sessions on this day</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    padding: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionSubject: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 8,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durationText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  pointsBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  noSessionsText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1e293b',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  subjectOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  selectedSubject: {
    backgroundColor: '#6366f1',
  },
  subjectOptionText: {
    fontWeight: '600',
    color: '#1e293b',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    fontWeight: '600',
    color: '#ffffff',
  },
});
