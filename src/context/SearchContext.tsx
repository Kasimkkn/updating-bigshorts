"use client";
import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  globalSearchTerm: '',
  setGlobalSearchTerm: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  return (
    <SearchContext.Provider value={{ globalSearchTerm, setGlobalSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}