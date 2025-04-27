import React, { memo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Pressable, 
  ActivityIndicator,
  FlatList,
  Linking,
  Platform
} from 'react-native';
import { ExternalLink } from 'lucide-react-native';

export interface SearchResult {
  title: string;
  link: string;
  snippet?: string;
  position?: number;
}

export interface ImageResult {
  title: string;
  original: string;
  thumbnail: string;
  source: string;
}

export type SearchResultType = 'web' | 'image';

interface SearchResultsProps {
  results: Array<SearchResult | ImageResult>;
  type: SearchResultType;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

const WebResultItem = memo(({ item }: { item: SearchResult }) => {
  const handlePress = async () => {
    try {
      if (await Linking.canOpenURL(item.link)) {
        await Linking.openURL(item.link);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <Pressable style={styles.webResult} onPress={handlePress}>
      <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.resultUrl} numberOfLines={1}>{item.link}</Text>
      {item.snippet && (
        <Text style={styles.resultDescription} numberOfLines={3}>
          {item.snippet}
        </Text>
      )}
      <View style={styles.linkIcon}>
        <ExternalLink size={16} color="#6366f1" />
      </View>
    </Pressable>
  );
});

const ImageResultItem = memo(({ item }: { item: ImageResult }) => {
  const handlePress = async () => {
    try {
      if (await Linking.canOpenURL(item.original)) {
        await Linking.openURL(item.original);
      }
    } catch (error) {
      console.error('Error opening image:', error);
    }
  };

  return (
    <Pressable style={styles.imageResult} onPress={handlePress}>
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <Text style={styles.imageTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.imageSource} numberOfLines={1}>
        {item.source}
      </Text>
    </Pressable>
  );
});

export const SearchResults = memo<SearchResultsProps>(({
  results,
  type,
  isLoading,
  error,
  hasSearched,
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Searching...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (results.length === 0 && hasSearched) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found</Text>
      </View>
    );
  }

  return type === 'web' ? (
    <FlatList
      data={results as SearchResult[]}
      renderItem={({ item }) => <WebResultItem item={item} />}
      keyExtractor={(item, index) => `web-${index}-${(item as SearchResult).link}`}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <FlatList
      data={results as ImageResult[]}
      renderItem={({ item }) => <ImageResultItem item={item} />}
      keyExtractor={(item, index) => `image-${index}-${(item as ImageResult).thumbnail}`}
      numColumns={2}
      contentContainerStyle={styles.imageGrid}
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  webResult: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  resultTitle: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
    paddingRight: 24,
  },
  resultUrl: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 8,
    fontFamily: 'Inter_400Regular',
  },
  resultDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  linkIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  imageGrid: {
    padding: 8,
  },
  imageResult: {
    flex: 1,
    margin: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  imageTitle: {
    fontSize: 14,
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  imageSource: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
});