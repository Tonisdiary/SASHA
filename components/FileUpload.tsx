import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Upload } from 'lucide-react-native';
import { uploadStudyMaterial } from '@/lib/supabase';

interface FileUploadProps {
  subjectId: string;
  onUploadComplete: (path: string) => void;
  onError: (error: string) => void;
}

export function FileUpload({ subjectId, onUploadComplete, onError }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      onError('Only PDF files are allowed');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const { path, error } = await uploadStudyMaterial(file, subjectId, file.name);
      
      if (error) throw error;
      if (path) {
        onUploadComplete(path);
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.notice}>File upload is only available on web platform</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <Pressable
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
        onPress={() => fileInputRef.current?.click()}
        disabled={uploading}>
        <Upload size={24} color={uploading ? '#94a3b8' : '#ffffff'} />
        <Text style={styles.uploadButtonText}>
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  notice: {
    textAlign: 'center',
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
});