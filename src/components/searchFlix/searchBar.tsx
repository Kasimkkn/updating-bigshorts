"use client";
import React, { useRef, useState } from 'react';
import { useSearch } from '@/context/SearchContext';
import { MdClose, MdSearch } from 'react-icons/md';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string, tab: "users" | "videos" | "snips") => void;
  activeTab: "users" | "videos" | "snips"; // Add activeTab as a prop
  setActiveTab: (tab: "users" | "videos") => void;
  noResults?: boolean; 
  dropdownVisibility?: (value: boolean) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Search...', 
  className = '',
  onSearch,
  activeTab,
  setActiveTab,
  noResults = false,
  dropdownVisibility = () => {}, // Default to a no-op function
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setGlobalSearchTerm } = useSearch();  // Move hook inside component
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setGlobalSearchTerm(value); // Optional, update global state
    onSearch?.(value.trim(), activeTab); // Dynamically trigger API calls during typing
    dropdownVisibility(!!value)
  };

const handleSearchSubmit = () => {
  if (!searchTerm.trim()) return;
  router.push(`/home/search?q=${encodeURIComponent(searchTerm)}&tab=${activeTab}`);
  dropdownVisibility(false);
};

  const handleClearSearch = () => {
    setSearchTerm('');
    setGlobalSearchTerm('');
    onSearch?.('', activeTab); 
    inputRef.current?.focus();
  };

  return (
    <div className={`w-full max-w-3xl ${className}`}>
      {/* Search Bar */}
      <div className="flex items-center">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
            className="w-full px-4 py-2 pr-16 rounded-lg 
                       bg-bg-color border border-border-color 
                       text-text-color placeholder:text-primary-text-color
                       focus:outline-none focus:border-primary
                       hover:bg-secondary-bg-color transition-colors duration-200"
            placeholder={placeholder}
          />
          {searchTerm && 
            <button 
              onClick={handleClearSearch} 
              className='p-2 rounded-full hover:bg-secondary-bg-color absolute right-8 top-1/2 transform -translate-y-1/2 text-text-light text-lg'
            >
              <MdClose/>
            </button>
          }
          <button 
            onClick={handleSearchSubmit} 
            className='p-2 rounded-full hover:bg-secondary-bg-color absolute right-1 top-1/2 transform -translate-y-1/2 text-text-light text-lg'
          >
            <MdSearch/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;