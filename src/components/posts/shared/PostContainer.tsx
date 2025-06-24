import React, { useEffect } from 'react';

interface PostContainerProps {
    children: React.ReactNode;
    postId: number;
    isExpanded: boolean;
    onExpandedChange?: (isExpanded: boolean) => void;
    className?: string;
}

const PostContainer: React.FC<PostContainerProps> = ({
    children,
    postId,
    isExpanded,
    onExpandedChange,
    className = "md:p-4 rounded-lg relative max-w-lg transition-transform duration-300 ease-in-out bg-bg-color expanded-container shadow-md"
}) => {
    useEffect(() => {
        onExpandedChange?.(isExpanded);
    }, [isExpanded, onExpandedChange]);

    return (
        <div
            id={postId.toString()}
            className={`${className} ${isExpanded ? 'xl:w-[200%] xl:-translate-x-1/4' : ''}`}
            style={{ zIndex: isExpanded ? 50 : 'auto' }}
        >
            {children}
        </div>
    );
};

export default PostContainer;
