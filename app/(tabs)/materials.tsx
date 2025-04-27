import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Image, Alert, FlatList, RefreshControl } from 'react-native';
import { FileText, Video, Headphones, Image as ImageIcon, Plus, Download, Eye, X, Upload, File } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { v4 as uuidv4 } from 'uuid';
import * as Linking from 'expo-linking';
import { useSubjectsStore } from '@/store/useSubjectsStore';
import { useStudyStore } from '@/store/useStudyStore';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

interface Material {
  id: string;
  name: string;
  type: string;
  subject_id: string;
  size: number;
  created_at: string;
  downloads: number;
  views: number;
  url: string;
  preview?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'image/*',
  'video/*',
  'audio/*',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileTypes = [
  { label: 'PDF', value: 'pdf', icon: FileText, color: '#ef4444' },
  { label: 'Video', value: 'video', icon: Video, color: '#6366f1' },
  { label: 'Audio', value: 'audio', icon: Headphones, color: '#10b981' },
  { label: 'Image', value: 'image', icon: ImageIcon, color: '#f59e0b' },
  { label: 'Doc', value: 'doc', icon: File, color: '#3b82f6' },
];

export default function MaterialsScreen() {
  const { subjects } = useSubjectsStore();
  const { materials, addMaterial, removeMaterial } = useStudyStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    type: '',
    file: null as any,
    subject_id: '',
  });

  useEffect(() => {
    fetchMaterials();
  }, [selectedCategory]);

  const fetchMaterials = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('type', selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      addMaterial(data || []);
    } catch (err) {
      setError('Failed to fetch materials');
    } finally {
      setRefreshing(false);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_TYPES,
        copyToCacheDirectory: false,
      });

      if (result.type === 'success') {
        if (result.size > MAX_FILE_SIZE) {
          setError('File size exceeds 50MB limit');
          return;
        }

        const fileType = getFileType(result.mimeType || result.name);
        setNewMaterial(prev => ({ ...prev, file: result, type: fileType }));
      }
    } catch (err) {
      setError('Error selecting file');
    }
  };

  const getFileType = (mimeTypeOrName: string) => {
    const typeMap: Record<string, string> = {
      'pdf': 'pdf',
      'image': 'image',
      'video': 'video',
      'audio': 'audio',
      'msword': 'doc',
      'wordprocessingml': 'doc'
    };
    
    return Object.entries(typeMap).find(([key]) => 
      mimeTypeOrName.toLowerCase().includes(key)
    )?.[1] || 'other';
  };

  const generatePreview = async (uri: string) => {
    try {
      return await manipulateAsync(
        uri,
        [{ resize: { width: 300 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
    } catch (error) {
      console.error('Preview generation failed:', error);
      return null;
    }
  };

  const handleAddMaterial = async () => {
    try {
      if (!validateForm()) return;

      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Generate preview for images
      const preview = newMaterial.type === 'image' 
        ? (await generatePreview(newMaterial.file.uri))?.uri 
        : null;

      // Upload file
      const fileExt = newMaterial.file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const uploadResponse = await FileSystem.uploadAsync(
        `${supabase.storage.url}/object/study-materials/${filePath}`,
        newMaterial.file.uri,
        {
          headers: {
            Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
            'Content-Type': newMaterial.file.mimeType,
          },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
        }
      );

      if (uploadResponse.status >= 400) {
        throw new Error(`Upload failed: ${uploadResponse.body}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);

      // Save to database
      const { error } = await supabase.from('study_materials').insert([{
        user_id: user.id,
        name: newMaterial.name.trim(),
        type: newMaterial.type,
        url: urlData.publicUrl,
        subject_id: newMaterial.subject_id,
        size: newMaterial.file.size,
        preview,
      }]);

      if (error) throw error;

      // Update local state
      setNewMaterial({ name: '', type: '', file: null, subject_id: '' });
      setShowAddMaterial(false);
      fetchMaterials();
      Alert.alert('Success', 'Material uploaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      Alert.alert('Error', 'Failed to upload material');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('study_materials').delete().eq('id', id);
      removeMaterial(id);
      Alert.alert('Success', 'Material deleted');
    } catch (err) {
      setError('Failed to delete material');
    }
  };

  const validateForm = () => {
    const validations = [
      [!newMaterial.name.trim(), 'Material name is required'],
      [!newMaterial.type, 'Please select a file type'],
      [!newMaterial.subject_id, 'Please select a subject'],
      [!newMaterial.file, 'Please select a file to upload'],
    ];

    for (const [condition, message] of validations) {
      if (condition) {
        setError(message as string);
        return false;
      }
    }
    return true;
  };

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderItem = ({ item }: { item: Material }) => (
    <View style={styles.card}>
      {item.preview && (
        <Image source={{ uri: item.preview }} style={styles.preview} />
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          {fileTypes.find(t => t.value === item.type)?.icon({
            size: 24,
            color: fileTypes.find(t => t.value === item.type)?.color
          })}
          <Text style={styles.title}>{item.name}</Text>
        </View>
        
        <Text style={styles.subject}>
          {subjects.find(s => s.id === item.subject_id)?.name || 'General'}
        </Text>
        
        <View style={styles.meta}>
          <Text style={styles.size}>{formatSize(item.size)}</Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.actions}>
          <Pressable onPress={() => Linking.openURL(item.url)} style={styles.button}>
            <Download size={16} color="#6366f1" />
            <Text style={styles.buttonText}>{item.downloads}</Text>
          </Pressable>
          
          <Pressable 
            onPress={() => handleDelete(item.id)}
            style={[styles.button, styles.deleteButton]}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Study Materials</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => subjects.length ? setShowAddMaterial(true) : Alert.alert('Add Subject', 'Create a subject first')}
          disabled={subjects.length === 0}>
          <Plus size={24} color="white" />
        </Pressable>
      </View>

      <FlatList
        data={materials.filter(m => 
          selectedCategory === 'All' || m.type === selectedCategory.toLowerCase()
        )}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchMaterials}
            tintColor="#6366f1"
          />
        }
        ListHeaderComponent={
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categories}>
              {['All', 'Documents', 'Videos', 'Audio', 'Images'].map(category => (
                <Pressable
                  key={category}
                  style={[
                    styles.category,
                    selectedCategory === category && styles.activeCategory
                  ]}
                  onPress={() => setSelectedCategory(category)}>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.activeCategoryText
                  ]}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {showAddMaterial && (
              <View style={styles.uploadForm}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Upload New Material</Text>
                  <Pressable onPress={() => setShowAddMaterial(false)}>
                    <X size={24} color="#64748b" />
                  </Pressable>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Material Name"
                  value={newMaterial.name}
                  onChangeText={text => setNewMaterial(p => ({ ...p, name: text }))}
                />

                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.typeSelector}>
                  {fileTypes.map(type => (
                    <Pressable
                      key={type.value}
                      style={[
                        styles.typeButton,
                        newMaterial.type === type.value && styles.selectedTypeButton
                      ]}
                      onPress={() => setNewMaterial(p => ({ ...p, type: type.value }))}>
                      <type.icon size={24} color={newMaterial.type === type.value ? 'white' : type.color} />
                      <Text style={[
                        styles.typeLabel,
                        newMaterial.type === type.value && styles.selectedTypeLabel
                      ]}>
                        {type.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.subjectsList}>
                  {subjects.map(subject => (
                    <Pressable
                      key={subject.id}
                      style={[
                        styles.subjectButton,
                        newMaterial.subject_id === subject.id && styles.selectedSubjectButton
                      ]}
                      onPress={() => setNewMaterial(p => ({ ...p, subject_id: subject.id }))}>
                      <Text style={[
                        styles.subjectButtonText,
                        newMaterial.subject_id === subject.id && styles.selectedSubjectText
                      ]}>
                        {subject.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Pressable
                  style={styles.fileButton}
                  onPress={handleFilePick}
                  disabled={uploading}>
                  <Upload size={20} color="#6366f1" />
                  <Text style={styles.fileButtonText}>
                    {newMaterial.file?.name || 'Select File (max 50MB)'}
                  </Text>
                  {uploading && (
                    <View style={styles.progress}>
                      <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                    </View>
                  )}
                </Pressable>

                {error && <Text style={styles.error}>{error}</Text>}

                <Pressable
                  style={styles.submitButton}
                  onPress={handleAddMaterial}
                  disabled={uploading}>
                  {uploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitText}>Upload Material</Text>
                  )}
                </Pressable>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <FileText size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>
              {subjects.length === 0 
                ? 'Create a subject first' 
                : 'No materials found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  heading: {
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
  categories: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  category: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  activeCategory: {
    backgroundColor: '#6366f1',
  },
  categoryText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  activeCategoryText: {
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  preview: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardBody: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
  subject: {
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  size: {
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    fontSize: 12,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#6366f1',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteText: {
    color: '#dc2626',
    fontFamily: 'Inter_600SemiBold',
  },
  uploadForm: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
  },
  input: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f8fafc',
  },
  selectedTypeButton: {
    backgroundColor: '#6366f1',
  },
  typeLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  selectedTypeLabel: {
    color: 'white',
  },
  subjectsList: {
    marginBottom: 16,
  },
  subjectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    marginRight: 8,
  },
  selectedSubjectButton: {
    backgroundColor: '#6366f1',
  },
  subjectButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  selectedSubjectText: {
    color: 'white',
  },
  fileButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  fileButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#6366f1',
    marginTop: 8,
  },
  progress: {
    height: 4,
    backgroundColor: '#f1f5f9',
    width: '100%',
    marginTop: 8,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
  },
  error: {
    color: '#dc2626',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginTop: 16,
  },
});