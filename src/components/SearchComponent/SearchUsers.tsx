import React from "react";
import Image from "next/image";
import { SearchResultItem as FlixSearchResultItem } from "@/services/flixsearch";
import { SearchUsersSkeleton } from '@/components/Skeletons/Skeletons';
import SafeImage from "../shared/SafeImage";

interface SearchUsersProps {
  searchResults: FlixSearchResultItem[];
  isSearching: boolean;
  loadMoreResults: (e: React.MouseEvent) => void;
  searchTerm: string;
  handleResultClick: (result: FlixSearchResultItem) => void;
}

const SearchUsers: React.FC<SearchUsersProps> = ({
  searchResults,
  isSearching,
  loadMoreResults,
  searchTerm,
  handleResultClick,
}) => {
  return (
    <div>
      {isSearching && searchResults.length === 0 ? (
        <SearchUsersSkeleton />
      ) : searchResults.length > 0 ? (
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar divide-y divide-border-color">
          {searchResults.map((result, index) => (
            <div
              key={`user-result-${result.id}-${index}`}
              className="flex items-center gap-3 p-3 hover:bg-secondary-bg-color cursor-pointer transition-colors duration-200"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex-shrink-0">
                {result.userProfileImage ? (
                  <SafeImage
                    src={result.userProfileImage}
                    alt={result.username}
                    className="w-10 h-10 object-cover rounded-full"
                    height={40}
                    width={40}
                  />
                ) : (
                  <div className="w-10 h-10 bg-secondary-bg-color rounded-full flex items-center justify-center">
                    {result.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-text-color">
                  @{result.username}
                </h3>
                {/* <p className="text-xs text-primary-text-color">
                  {result.userFullName || "Unknown User"}
                </p> */}
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

export default SearchUsers;