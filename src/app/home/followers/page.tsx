"use client";
import { ModerSpinner } from '@/components/LoadingSpinner';
import LoadingUI from '@/components/LoadingUi';
import useLocalStorage from '@/hooks/useLocalStorage';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
// Import services at module level to avoid re-importing
import Button from '@/components/shared/Button';
import { getPostListNew } from '@/services/auth/getpostlist';
import { getUserProfile } from '@/services/userprofile';

// Dynamically import components that might use browser APIs
const Story = dynamic(() => import('@/components/story/Story'), { ssr: false });
const Posts = dynamic(() => import('@/components/posts/Posts'), { ssr: false });
const Suggestion = dynamic(() => import('@/components/suggestions/Suggestion'), { ssr: false });

// Loading skeleton component for better UX
const PostSkeleton = () => (
  <div className="mb-6 rounded-lg overflow-hidden">
    <div className="h-8 flex items-center p-2 mb-2">
      <div className="w-8 h-8 rounded-md bg-secondary-bg-color animate-pulse mr-2"></div>
      <div className="h-4 bg-secondary-bg-color animate-pulse w-1/4 rounded"></div>
    </div>
    <div className="h-72 bg-secondary-bg-color animate-pulse"></div>
    <div className="h-10 p-2">
      <div className="h-4 bg-secondary-bg-color animate-pulse w-3/4 rounded mb-2"></div>
      <div className="h-3 bg-secondary-bg-color animate-pulse w-1/2 rounded"></div>
    </div>
  </div>
);

// Story skeleton component
const StorySkeleton = () => (
  <div className="max-w-4xl ml-0 mr-auto">
    <div className="h-20 bg-secondary-bg-color animate-pulse rounded-lg mb-4"></div>
  </div>
);

function FollowersPageContent() {
  // Use encrypted localStorage hooks
  const [userId, , userIdHydrated] = useLocalStorage<string>('userId', '');
  const [userData, setUserData, userDataHydrated] = useLocalStorage<any>('userData', {});

  // State management
  const [postData, setPostData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userDataReady, setUserDataReady] = useState(false);

  // Memoize request data to prevent unnecessary re-renders
  const requestData = useMemo(() => ({
    isForYou: "0",
    limit: 10,
    page: page,
    isLogin: userId ? 1 : 0,
  }), [page]);

  // Optimized fetchData function
  const fetchData = useCallback(async (userId: string, currentPage: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const requestData = {
        isForYou: "0",
        limit: 10,
        page: currentPage,
        isLogin: userId ? 1 : 0,
      };
      const response = await getPostListNew(requestData);
      if (response.isSuccess) {
        const data = Array.isArray(response.data) ? response.data : [];
        // Check if we have more data
        if (data.length < 10) {
          setHasMore(false);
        }
        setPostData(prevData =>
          currentPage === 1 ? data : [...prevData, ...data]
        );
      } else {
        throw new Error(response.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      // Only reset data on initial load error
      if (currentPage === 1) {
        setPostData([]);
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (!userIdHydrated) return;
    fetchData(userId, 1, true);
  }, [fetchData, userIdHydrated]);

  // Load more posts function with throttling
  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(userId, nextPage, false);
    }
  }, [loadingMore, hasMore, page, fetchData]);

  // Optimized user data fetching
  useEffect(() => {
    const fetchUserData = async () => {
      // Wait for localStorage to hydrate
      if (!userIdHydrated || !userDataHydrated) return;

      // Skip if no userId or userData already exists and is valid
      if (!userId || (userData && userData.userId)) {
        // If userData exists and has userId, mark it as ready
        if (userData && userData.userId) {
          setUserDataReady(true);
        }
        return;
      }

      try {
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId)) return;

        const res = await getUserProfile({ userId: parsedUserId });
        const profile = Array.isArray(res.data) ? res.data[0] : res.data;
        if (profile) {
          setUserData(profile);
          setUserDataReady(true);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Even if there's an error, we might want to show the story with whatever data we have
        setUserDataReady(true);
      }
    };

    fetchUserData();
  }, [userId, userIdHydrated, userData, userDataHydrated, setUserData]);

  // Error retry function
  const retryFetch = useCallback(() => {
    setPage(1);
    fetchData(userId, 1, true);
  }, [fetchData]);

  return (
    <div className='px-4 pt-2 max-md:pb-20'>
      {/* Conditionally render Story component */}
      {userDataReady ? (
        <div className="max-w-4xl ml-0 mr-auto">
          <Story />
        </div>
      ) : (
        <StorySkeleton />
      )}

      <div className="flex flex-col md:flex-row justify-between px-2 md:px-4 py-2">
        <div className="flex-grow">
          {/* Error state */}
          {error && postData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                onClick={retryFetch}
                isLinearBtn={true}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Loading state for initial load */}
          {loading && postData.length === 0 && !error && (
            <div className="flex-grow">
              {Array(3).fill(0).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Posts content */}
          {!loading && postData.length > 0 && (
            <Posts
              postData={postData}
              loadMorePosts={loadMorePosts}
              isFromSaved={false}
              isFromProfile={false}
            />
          )}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <ModerSpinner />
            </div>
          )}

          {/* No more posts indicator */}
          {!hasMore && postData.length > 0 && (
            <div className="text-center py-4 text-primary-text-color">
              No more posts to load
            </div>
          )}

          {/* Empty state */}
          {!loading && postData.length === 0 && !error && (
            <div className="text-center py-8 text-primary-text-color">
              No posts available
            </div>
          )}
        </div>

        {/* Suggestions sidebar */}
        <div className='max-md:hidden'>
          <Suggestion isfull={true} />
        </div>
      </div>
    </div>
  );
}

// Use dynamic import with ssr:false to prevent server-side rendering
const DynamicFollowersPage = dynamic(() => Promise.resolve(FollowersPageContent), {
  ssr: false,
  loading: () => <LoadingUI />
});

// Export the dynamic component
export default function FollowersPage() {
  return <DynamicFollowersPage />;
}