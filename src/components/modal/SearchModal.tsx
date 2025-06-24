"use client";
import { useEffect, useRef, useState } from "react";
import { getSearched } from "@/services/discoverSearch";
import { SearchData } from "@/models/searchResponse";
import { IoClose } from "react-icons/io5";
import SearchComponent from "../SearchComponent/SearchComponent";

interface SearchModalProps {
  onClose: () => void;
  toggleSearch: () => void;
  toggleSidebar: () => void;
}

const SearchModal = ({ onClose, toggleSearch, toggleSidebar }: SearchModalProps) => {
  const [searchData, setSearchData] = useState<SearchData>([] as unknown as SearchData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("User");
  const [pageNo, setPageNo] = useState<number>(1);
  const [isNewSearch, setIsNewSearch] = useState<boolean>(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const searchFn = async (category: string, page: number) => {
    try {
      setIsLoading(true);

      let params;
      switch (category) {
        case "User":
          params = { isAll: 0, isAudio: 0, isHashTag: 0, isUser: 1, pageNo: page, searchValue: searchInput };
          break;
        case "HashTag":
          params = { isAll: 0, isAudio: 0, isHashTag: 1, isUser: 0, pageNo: page, searchValue: searchInput };
          break;
        default:
          params = { isAll: 1, isAudio: 0, isHashTag: 0, isUser: 0, pageNo: page, searchValue: searchInput };
      }

      const response = await getSearched(params);
      const newSearch: SearchData = {
        data: Array.isArray(response.data) ? response.data : [],
      };

      // Append only on scroll, not on new search
      setSearchData((prev) => (isNewSearch ? newSearch : { data: [...prev.data, ...newSearch.data] }));
      setHasMore(newSearch.data.length > 0);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching search data:", error);
      setIsLoading(false);
    }
  };
  const isThemeSelectionOpen = false;
  const loadMore = () => {
    setIsNewSearch(false);
    setPageNo((prevPageNo) => prevPageNo + 1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsNewSearch(true);
    setHasMore(true);
    setSearchInput(e.target.value);
    setPageNo(1);
  };

  const handleCategoryClick = (category: string) => {
    setIsNewSearch(true);
    setHasMore(true);
    setActiveCategory(category);
    setPageNo(1);
    searchFn(category, 1);
  };



  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((e.target as HTMLElement).id === "modalBackdrop") {
      onClose(); // Close the modal
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [isLoading, hasMore]);

  useEffect(() => {
    searchFn(activeCategory, pageNo);
  }, [activeCategory, searchInput, pageNo]);

  useEffect(() => {
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      id="modalBackdrop"
      className={`fixed inset-0 ${isThemeSelectionOpen ? "" : "backdrop-blur-[2px]"
        } flex items-center justify-center z-[100]`}
      onClick={handleBackdropClick} // Detect clicks on the backdrop
    >
      <div id="searchModal" className="w-[28%] fixed max-lg:w-2/4 max-md:w-[100%] bg-bg-color h-full overflow-y-auto px-3 md:left-56">
        <section className="flex flex-col gap-4 h-[98vh] overflow-y-scroll">
          <h2 className="text-text-color mt-4 text-2xl">Search</h2>

          <button
            onClick={onClose}
            className="absolute z-40 top-2 right-4 md:right-0 p-2 rounded-full bg-secondary-bg-color focus:outline-none hover:rotate-90 transition-all cursor-pointer"
          >
            <IoClose className='text-xl text-text-color' />
          </button>
          <SearchComponent
            dropdownStyle="style2"
            toggleSearch={toggleSearch}
            toggleSidebar={toggleSidebar}
          />
        </section>
      </div>
    </div>
  );
};

export default SearchModal;