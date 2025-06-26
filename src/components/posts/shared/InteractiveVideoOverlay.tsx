import React from 'react';
import { PostlistItem } from '@/models/postlistResponse';
import { FiMoreVertical } from 'react-icons/fi';
import PostHeader from './PostHeader';
import MoreOptions from '../../MoreOptions';

interface InteractiveVideoOverlayProps {
    post: PostlistItem;
    userId: number;
    openMoreOptions: number | null;
    onUserClick: (userId: number) => void;
    onCollaboratorsClick: () => void;
    onMoreOptions: (postId: number) => void;
    onContentTreeToggle: (postId: number) => void;
    updatePost: (postId: number, property: string, isBeforeUpdate: number) => void;
}

const InteractiveVideoOverlay: React.FC<InteractiveVideoOverlayProps> = ({
    post,
    userId,
    openMoreOptions,
    onUserClick,
    onCollaboratorsClick,
    onMoreOptions,
    onContentTreeToggle,
    updatePost
}) => {
    return (
        <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center">
            <PostHeader
                post={post}
                userId={userId}
                openMoreOptions={null}
                setOpenMoreOptions={() => { }}
                onUserClick={onUserClick}
                showFollowButton={userId !== post.userId}
                isInteractiveVideo={true}
                onCollaboratorsClick={onCollaboratorsClick}
            />

            <div className="flex items-center gap-2">
                {post.isInteractive === "1" && (
                    <div
                        className="bg-bg-color/40 backdrop-blur-sm rounded-xl px-2 py-1 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onContentTreeToggle(post.postId);
                        }}
                    >
                        <span className="text-transparent bg-clip-text text-sm font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500">
                            {'{I}'}
                        </span>
                    </div>
                )}

                <button
                    className="text-white relative"
                    onClick={() => onMoreOptions(post.postId)}
                >
                    <FiMoreVertical />
                    {openMoreOptions === post.postId && (
                        <MoreOptions
                            post={post}
                            setIsOpen={(value) => {
                                if (typeof value === 'number') {
                                    onMoreOptions(value);
                                } else {
                                    onMoreOptions(0);
                                }
                            }}
                            updatePost={updatePost}
                            page="followers"
                        />
                    )}
                </button>
            </div>
        </div>
    );
};
export default InteractiveVideoOverlay