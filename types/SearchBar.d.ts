// Create a types/SearchBar.d.ts file
declare module '@/components/SearchBar' {
  import React from 'react';
  interface SearchBarProps {
    searchQuery?: string;
    onSearchQueryChange: (text: string) => void;
    onSearch: () => void;
    isLoading: boolean;
    placeholder?: string;
    searchType?: 'web' | 'image';
    onSearchTypeChange?: (type: 'web' | 'image') => void;
  }
  const SearchBar: React.FC<SearchBarProps>;
  export default SearchBar;
}