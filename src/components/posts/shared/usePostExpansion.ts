import { useState, useEffect } from 'react';

export const usePostExpansion = () => {
    const [isPostExpanded, setIsPostExpanded] = useState<{
        type: 'like' | 'comment' | 'share';
        postId: number;
        isExpanded: boolean;
    } | null>(null);

    useEffect(() => {
        if (!isPostExpanded) return;

        const handleClickOutside = (e: MouseEvent) => {
            const targetElement = e.target as HTMLElement;
            const isInsideExpandedContainer = targetElement.closest('.expanded-container');
            if (!isInsideExpandedContainer) {
                setIsPostExpanded(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isPostExpanded]);

    const collapsePost = () => {
        setIsPostExpanded(null);
    };

    return {
        isPostExpanded,
        setIsPostExpanded,
        collapsePost
    };
};
