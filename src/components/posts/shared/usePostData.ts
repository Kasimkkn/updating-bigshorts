import { useState, useEffect, useCallback } from 'react';
import { PostlistItem } from '@/models/postlistResponse';

export const usePostData = (initialData: PostlistItem[], refreshPage?: () => void) => {
    const [postItem, setPostItem] = useState<PostlistItem[]>([]);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setPostItem(initialData);
        }
    }, [initialData]);

    const updatePost = useCallback((postId: number, property: string, isBeforeUpdate: number) => {
        setPostItem(prev => {
            switch (property) {
                case 'like':
                    return prev.map(post =>
                        post.postId === postId
                            ? { ...post, isLiked: isBeforeUpdate ? 0 : 1, likeCount: post.likeCount + (isBeforeUpdate ? -1 : 1) }
                            : post
                    );
                case 'save':
                    return prev.map(post =>
                        post.postId === postId
                            ? { ...post, isSaved: isBeforeUpdate ? 0 : 1, saveCount: post.saveCount + (isBeforeUpdate ? -1 : 1) }
                            : post
                    );
                case 'delete':
                    return prev.filter(post => post.postId !== postId);
                case 'block':
                case 'hide':
                    if (refreshPage) {
                        refreshPage();
                    } else {
                        return prev.filter(post => post.userId !== postId);
                    }
                    return prev;
                case 'share':
                    return prev.map(post =>
                        post.postId === postId
                            ? { ...post, shareCount: post.shareCount + isBeforeUpdate }
                            : post
                    );
                case 'comment':
                    return prev.map(post =>
                        post.postId === postId
                            ? { ...post, commentCount: post.commentCount + isBeforeUpdate }
                            : post
                    );
                case 'collaboration':
                    return prev.map(post =>
                        post.postId === postId
                            ? { ...post, userCollab: 0, collaboratorCount: post.collaboratorCount - 1, firstCollaboratorName: "" }
                            : post
                    );
                default:
                    return prev;
            }
        });
    }, [refreshPage]);

    return { postItem, updatePost };
};

