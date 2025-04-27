import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { searchGoogle } from '@/lib/api';

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'web' | 'image'>('web');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    try {
      const query = searchQuery.trim();
      if (!query) {
        setError('Please enter a search term');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      const response = await searchGoogle(query, searchType);
      setResults(searchType === 'web' 
        ? response.results 
        : response.images);
    } catch (error) {
      setError('Failed to perform search. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, searchType]);

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        isLoading={isLoading}
        onSearch={handleSearch}
        placeholder="Search study resources..."
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <SearchResults 
          results={results}
          searchType={searchType}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16
  }
});