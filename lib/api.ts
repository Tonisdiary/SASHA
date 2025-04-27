import axios from 'axios';
import axiosRetry from 'axios-retry';

// Configure axios-retry
axiosRetry(axios, { 
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => {
    return Boolean(
      axiosRetry.isNetworkOrIdempotentRequestError(error) || 
      error.response?.status === 429 ||
      (error.response?.status && error.response?.status >= 500)
    );
  }
});

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

// Fallback results when API fails
const FALLBACK_RESULTS = {
  web: {
    results: [
      {
        title: 'Effective Study Techniques',
        link: 'https://www.edx.org/learn/studying',
        description: 'Learn proven study techniques and strategies to improve your academic performance.',
        position: 1
      },
      {
        title: 'Student Success Guide',
        link: 'https://www.coursera.org/student-success',
        description: 'Comprehensive guide to academic success and effective learning strategies.',
        position: 2
      },
      {
        title: 'Time Management for Students',
        link: 'https://www.mindtools.com/time-management',
        description: 'Master time management skills to balance your studies and personal life.',
        position: 3
      }
    ],
    totalResults: 3
  },
  image: {
    images: [
      {
        title: 'Modern Study Space',
        imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
        thumbnailUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200',
        source: 'Unsplash',
        width: 1920,
        height: 1280
      },
      {
        title: 'Library Study Area',
        imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=200',
        source: 'Unsplash',
        width: 1920,
        height: 1280
      },
      {
        title: 'Student Workspace',
        imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a',
        thumbnailUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=200',
        source: 'Unsplash',
        width: 1920,
        height: 1280
      }
    ],
    totalResults: 3
  }
};

interface SearchResult {
  title: string;
  link: string;
  description: string;
  position: number;
}

interface ImageResult {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  width: number;
  height: number;
}

interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
}

interface ImageSearchResponse {
  images: ImageResult[];
  totalResults: number;
}

interface CacheItem {
  data: SearchResponse | ImageSearchResponse;
  timestamp: number;
}

// In-memory cache
const cache = new Map<string, CacheItem>();

// Cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);

export async function searchGoogle(
  query: string, 
  type: 'web' | 'image' = 'web'
): Promise<SearchResponse | ImageSearchResponse> {
  try {
    // Return fallback for empty queries
    if (!query.trim()) {
      return type === 'web' ? FALLBACK_RESULTS.web : FALLBACK_RESULTS.image;
    }

    // Check cache
    const cacheKey = `${type}:${query.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // SerpApi parameters
    const params: any = {
      q: query,
      api_key: process.env.EXPO_PUBLIC_SERPAPI_KEY,
      engine: type === 'web' ? 'google' : 'google_images',
      num: 10,
      gl: 'us',
      hl: 'en'
    };

    // Make API request using axios
    const response = await axios.get('https://serpapi.com/search', { params });

    const data = response.data;

    // Transform the response based on search type
    let transformedResults;
    if (type === 'web') {
      transformedResults = {
        results: (data.organic_results || []).map((result: any) => ({
          title: result.title,
          link: result.link,
          description: result.snippet,
          position: result.position
        })),
        totalResults: data.search_information?.total_results || 0
      };
    } else {
      transformedResults = {
        images: (data.images_results || []).map((result: any) => ({
          title: result.title,
          imageUrl: result.original,
          thumbnailUrl: result.thumbnail,
          source: result.source,
          width: result.original_width,
          height: result.original_height
        })),
        totalResults: data.search_information?.total_results || 0
      };
    }

    // Cache successful results
    cache.set(cacheKey, {
      data: transformedResults,
      timestamp: Date.now()
    });

    return transformedResults;
  } catch (error) {
    console.error('Search error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return fallback results
    return type === 'web' ? FALLBACK_RESULTS.web : FALLBACK_RESULTS.image;
  }
}
