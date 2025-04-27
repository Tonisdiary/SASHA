import React from 'react';
import { View, TextInput, Pressable, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  searchQuery?: string;
  onSearchQueryChange?: (text: string) => void; // Make optional
  onSearch: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery = '',
  onSearchQueryChange = () => {}, // Add default function
  onSearch,
  isLoading,
  placeholder = 'Search...'
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Search size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={(text) => onSearchQueryChange(text)}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          onSubmitEditing={onSearch}
          editable={!isLoading}
          returnKeyType="search"
        />
        {isLoading && (
          <ActivityIndicator size="small" color="#6366f1" style={styles.loader} />
        )}
      </View>
      <Pressable
        style={[styles.searchButton, (!searchQuery.trim() || isLoading) && styles.searchButtonDisabled]}
        onPress={onSearch}
        disabled={!searchQuery.trim() || isLoading}
      >
        <Text style={styles.searchButtonText}>
          {isLoading ? 'Searching...' : 'Search'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1e293b',
    fontFamily: 'Inter_400Regular',
  },
  loader: {
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});