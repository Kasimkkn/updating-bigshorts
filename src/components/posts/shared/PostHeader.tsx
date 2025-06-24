import React, { Dispatch, SetStateAction } from 'react';
import { FiMoreVertical, FiMoreHorizontal } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import Avatar from '../../Avatar/Avatar';
import FollowButton from '../../FollowButton/FollowButton';
import MoreOptions from '../../MoreOptions';
import { UnifiedPostType, isPostlistItem } from '@/types/postTypes';
import CyclingLocationAudio from '../cyclingLocationAudio';
import { PostlistItem } from '@/models/postlistResponse';

interface PostHeaderProps {
    post: UnifiedPostType;
    userId: number;
    openMoreOptions: number | null;
    setOpenMoreOptions: Dispatch<SetStateAction<number | null>>;
    onUserClick: (userId: number) => void;
    onReport?: (postId: number) => void;
    onAboutAccount?: (userId: number) => void;
    updatePost?: (postId: number, property: string, isBeforeUpdate: number) => void;
    showFollowButton?: boolean;
    isInteractiveVideo?: boolean;
    onCollaboratorsClick?: () => void;
    showCloseButton?: boolean;
    onClose?: () => void;
    iconVariant?: 'horizontal' | 'vertical';
}

const PostHeader: React.FC<PostHeaderProps> = ({
    post,
    userId,
    openMoreOptions,
    setOpenMoreOptions,
    onUserClick,
    onReport,
    onAboutAccount,
    updatePost,
    showFollowButton = true,
    isInteractiveVideo = false,
    onCollaboratorsClick,
    showCloseButton = false,
    onClose,
    iconVariant = 'vertical'
}) => {
    const IconComponent = iconVariant === 'horizontal' ? FiMoreHorizontal : FiMoreVertical;
    const textColor = isInteractiveVideo ? 'text-white' : 'text-text-color';

    // Safely access properties with fallbacks
    const postUserId = post.userId || 0;
    const postUserName = post.userName || '';
    const postUserFullName = post.userFullName || '';
    const postUserProfileImage = post.userProfileImage || '';
    const collaboratorCount = post.collaboratorCount || 0;
    const firstCollaboratorName = post.firstCollaboratorName || '';
    const postLocation = post.postLocation || [];
    const isFriend = post.isFriend || false;
    const postId = post.postId || 0;

    return (
        <div className="flex items-center justify-between mb-4 w-full">
            <div className="flex items-start gap-2">
                <button onClick={() => onUserClick(postUserId)} className="flex items-center">
                    <Avatar src={postUserProfileImage} name={postUserFullName || postUserName} />
                    <div className="ml-2 flex flex-col">
                        <p className={`font-bold ${textColor}`}>
                            <span>{postUserName}</span>
                            {collaboratorCount > 0 && (
                                <span
                                    className={`font-light cursor-pointer ${textColor}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCollaboratorsClick?.();
                                    }}
                                >
                                    {collaboratorCount === 1
                                        ? ` with ${firstCollaboratorName}`
                                        : ` with ${collaboratorCount} others`}
                                </span>
                            )}
                        </p>
                        {isInteractiveVideo ? (
                            postLocation?.[0]?.locationName && (
                                <p className="text-start text-sm text-white">
                                    {postLocation[0].locationName}
                                </p>
                            )
                        ) : (
                            isPostlistItem(post) && <CyclingLocationAudio post={post} />
                        )}
                    </div>
                </button>
                {showFollowButton && userId !== postUserId && (
                    <div className="p-1">
                        <FollowButton
                            requestId={postUserId}
                            isFollowing={isFriend}
                            isForInteractiveImage={isInteractiveVideo}
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                {showCloseButton && onClose && (
                    <button onClick={onClose} className={`${textColor}`}>
                        <IoClose className="text-2xl" />
                    </button>
                )}
                <button
                    className={`${textColor} relative`}
                    onClick={() => setOpenMoreOptions(postId)}
                >
                    <IconComponent />
                    {openMoreOptions === postId && onReport && onAboutAccount && updatePost && (
                        <MoreOptions
                            post={post as PostlistItem}
                            setIsOpen={setOpenMoreOptions}
                            openReport={onReport}
                            updatePost={updatePost}
                            page="followers"
                            openAboutAccount={onAboutAccount}
                        />
                    )}
                </button>
            </div>
        </div>
    );
};

export default PostHeader;

