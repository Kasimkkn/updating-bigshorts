import { useEffect, useCallback, useState, useRef } from 'react';

export const useInfiniteScroll = (loadMorePosts: () => void) => {
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInfiniteScroll = useCallback(() => {
        if (isLoadingMore || scrollTimeoutRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            setIsLoadingMore(true);

            scrollTimeoutRef.current = setTimeout(() => {
                loadMorePosts();
                scrollTimeoutRef.current = null;
                setTimeout(() => setIsLoadingMore(false), 1000);
            }, 300);
        }
    }, [loadMorePosts, isLoadingMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleInfiniteScroll);
        return () => window.removeEventListener('scroll', handleInfiniteScroll);
    }, [handleInfiniteScroll]);

    return { isLoadingMore };
};
