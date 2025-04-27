// subjects.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Plus, BookOpen, X, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useSubjectsStore } from '@/store/useSubjectsStore';

interface Subject {
  id: string;
  name: string;
  category: string;
  semester: string;
  description: string;
}

const PRESET_SUBJECTS = [
  { name: 'Mathematics', category: 'Science', description: 'Advanced mathematics and calculus' },
  { name: 'Physics', category: 'Science', description: 'Study of matter and energy' },
  { name: 'Literature', category: 'Humanities', description: 'Analysis of written works' },
  { name: 'History', category: 'Humanities', description: 'Study of past events' },
  { name: 'Computer Science', category: 'Technology', description: 'Programming and computing concepts' },
];

const SEMESTERS = [
  'Fall 2024',
  'Spring 2025',
  'Summer 2025',
  'Fall 2025',
];

const CATEGORIES = [
  'Science',
  'Technology',
  'Engineering',
  'Mathematics',
  'Humanities',
  'Social Sciences',
  'Business',
  'Arts',
  'Other',
];

export default function SubjectsScreen() {
  const router = useRouter();
  const { subjects, fetchSubjects, addSubject, deleteSubject } = useSubjectsStore();
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    category: '',
    semester: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchSubjects();
  }, []);

  const checkAuthAndFetchSubjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/splash');
        return;
      }
      await fetchSubjects();
    } catch (error) {
      console.error('Auth check error:', error);
      setError('Authentication error. Please try again.');
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) {
      setError('Subject name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to add subjects');
        return;
      }

      const { error } = await addSubject({
        name: newSubject.name.trim(),
        category: newSubject.category.trim(),
        semester: newSubject.semester.trim(),
        description: newSubject.description.trim(),
        user_id: user.id,
      });

      if (error) {
        throw new Error(error.message);
      }

      setNewSubject({ name: '', category: '', semester: '', description: '' });
      setShowAddSubject(false);
      setSelectedCategory(null);
      setSelectedSemester(null);
      Alert.alert('Success', 'Subject added successfully!');
    } catch (err: any) {
      console.error('Error adding subject:', err);
      setError(err.message || 'Failed to add subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      setLoading(true);
      await deleteSubject(subjectId);
      Alert.alert('Success', 'Subject deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting subject:', err);
      Alert.alert('Error', err.message || 'Failed to delete subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_SUBJECTS[0]) => {
    setNewSubject({
      ...newSubject,
      name: preset.name,
      category: preset.category,
      description: preset.description,
    });
    setSelectedCategory(preset.category);
    setShowPresets(false);
  };

  const resetForm = () => {
    setNewSubject({ name: '', category: '', semester: '', description: '' });
    setSelectedCategory(null);
    setSelectedSemester(null);
    setError(null);
    setShowPresets(false);
  };

  if (loading && !showAddSubject) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Subjects</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowAddSubject(true);
          }}>
          <Plus size={24} color="#ffffff" />
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {showAddSubject && (
        <View style={styles.addSubjectForm}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Add New Subject</Text>
            <Pressable onPress={() => setShowAddSubject(false)} style={styles.closeButton}>
              <X size={24} color="#64748b" />
            </Pressable>
          </View>

          <Pressable
            style={styles.presetButton}
            onPress={() => setShowPresets(true)}>
            <Text style={styles.presetButtonText}>Choose from presets</Text>
            <ChevronRight size={20} color="#6366f1" />
          </Pressable>

          {showPresets ? (
            <View style={styles.presetList}>
              {PRESET_SUBJECTS.map((preset, index) => (
                <Pressable
                  key={index}
                  style={styles.presetItem}
                  onPress={() => handlePresetSelect(preset)}>
                  <View style={styles.presetIcon}>
                    <BookOpen size={24} color="#6366f1" />
                  </View>
                  <View style={styles.presetInfo}>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <Text style={styles.presetCategory}>{preset.category}</Text>
                  </View>
                  <ChevronRight size={20} color="#64748b" />
                </Pressable>
              ))}
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Subject Name *"
                placeholderTextColor="#94a3b8"
                value={newSubject.name}
                onChangeText={(text) => {
                  setError(null);
                  setNewSubject(prev => ({ ...prev, name: text }));
                }}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}>
                {CATEGORIES.map((category) => (
                  <Pressable
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && styles.categoryChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setNewSubject(prev => ({ ...prev, category }));
                    }}>
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === category && styles.categoryChipTextSelected,
                      ]}>
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.semesterScroll}>
                {SEMESTERS.map((semester) => (
                  <Pressable
                    key={semester}
                    style={[
                      styles.semesterChip,
                      selectedSemester === semester && styles.semesterChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedSemester(semester);
                      setNewSubject(prev => ({ ...prev, semester }));
                    }}>
                    <Text
                      style={[
                        styles.semesterChipText,
                        selectedSemester === semester && styles.semesterChipTextSelected,
                      ]}>
                      {semester}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (Optional)"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={newSubject.description}
                onChangeText={(text) => setNewSubject(prev => ({ ...prev, description: text }))}
              />

              <Pressable 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleAddSubject}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Subject</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      )}

      <View style={styles.subjectsGrid}>
        {subjects.map((subject) => (
          <Pressable
            key={subject.id}
            style={styles.subjectCard}
            onLongPress={() => {
              Alert.alert(
                'Delete Subject',
                'Are you sure you want to delete this subject?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', onPress: () => handleDeleteSubject(subject.id), style: 'destructive' },
                ]
              );
            }}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <BookOpen size={24} color="#6366f1" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                {subject.category && (
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{subject.category}</Text>
                  </View>
                )}
              </View>
            </View>

            {subject.semester && (
              <Text style={styles.subjectSemester}>{subject.semester}</Text>
            )}
            {subject.description && (
              <Text style={styles.subjectDescription}>{subject.description}</Text>
            )}
          </Pressable>
        ))}

        {subjects.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#94a3b8" />
            <Text style={styles.emptyStateTitle}>No subjects yet</Text>
            <Text style={styles.emptyStateText}>
              Add your first subject by clicking the + button above
            </Text>
          </View>
        )}
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
    padding: 20,
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
    fontFamily: 'Poppins_600SemiBold',
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
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  addSubjectForm: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  presetButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#6366f1',
  },
  presetList: {
    marginBottom: 16,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  presetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  presetCategory: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  input: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
    color: '#1e293b',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
  },
  semesterScroll: {
    marginBottom: 12,
  },
  semesterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    marginRight: 8,
  },
  semesterChipSelected: {
    backgroundColor: '#10b981',
  },
  semesterChipText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  semesterChipTextSelected: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  subjectsGrid: {
    padding: 20,
  },
  subjectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  categoryTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#6366f1',
  },
  subjectSemester: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#10b981',
    marginBottom: 8,
  },
  subjectDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    textAlign: 'center',
  },
});