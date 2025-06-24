import React from "react";
import Image from "next/image";
import { SearchResultItem as FlixSearchResultItem } from "@/services/flixsearch";
import { SearchMinisSkeleton } from '@/components/Skeletons/Skeletons';
import SafeImage from "../shared/SafeImage";

interface SearchMinisProps {
  searchResults: FlixSearchResultItem[];
  isSearching: boolean;
  loadMoreResults: (e: React.MouseEvent) => void;
  searchTerm: string;
  handleResultClick: (result: FlixSearchResultItem) => void;
}

const SearchMinis: React.FC<SearchMinisProps> = ({
  searchResults,
  isSearching,
  loadMoreResults,
  searchTerm,
  handleResultClick,
}) => {
  return (
    <div>
      {isSearching && searchResults.length === 0 ? (
        <SearchMinisSkeleton />
      ) : searchResults.length > 0 ? (
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar divide-y divide-border-color">
          {searchResults.map((result, index) => (
            <div
              key={`mini-result-${result.id}-${index}`}
              className="flex items-center gap-3 p-3 hover:bg-secondary-bg-color cursor-pointer transition-colors duration-200"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex-shrink-0">
                {result.coverFile ? (
                  <SafeImage
                  src={result.coverFile}
                  alt={result.title}
                  className="w-20 h-12 object-cover rounded"
                 />
                ) : (
                  <div className="w-20 h-12 bg-secondary-bg-color flex items-center justify-center">
                    <span className="text-xs text-text-light">No thumbnail</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-text-color line-clamp-1">
                  {result.title || "Untitled Video"}
                </h3>
                <p className="text-xs text-primary-text-color">
                  {result.username || "Unknown User"}
                </p>
              </div>
            </div>
          ))}
          {searchResults.length >= 6 && (
            <button
              onClick={loadMoreResults}
              className="w-full py-2 text-center text-sm font-medium text-primary"
            >
              Show More
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-4 px-6">
          <p className="text-primary-text-color">
            No results found for &quot;{searchTerm}&quot;
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchMinis;