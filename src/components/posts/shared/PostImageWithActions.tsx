import React, { useRef } from 'react';
import { PostlistItem } from '@/models/postlistResponse';
import ImageSlider from '../ImageSlider';
import PostActions from './PostActions';
import { transformAudioUrl } from './urlUtils';

interface PostImageWithActionsProps {
    post: PostlistItem;
    index: number;
    userId: number;
    audioMuteStates: { [key: number]: boolean };
    onAudioMuteToggle: (postId: number) => void;
    onTaggedUsers: () => void;
    onInsights: () => void;
    onDoubleClick: () => void;
    videoDivRef: React.RefObject<HTMLDivElement>;
}

const PostImageWithActions: React.FC<PostImageWithActionsProps> = ({
    post,
    index,
    userId,
    audioMuteStates,
    onAudioMuteToggle,
    onTaggedUsers,
    onInsights,
    onDoubleClick,
    videoDivRef
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const newAudioUrl = transformAudioUrl(post?.audioFile || '');

    return (
        <div
            className="relative"
            onDoubleClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDoubleClick();
            }}
            ref={videoDivRef}
            data-index={index}
        >
            <ImageSlider images={post.interactiveVideo} />

            {/* Hidden Audio Player */}
            {newAudioUrl && (
                <audio
                    ref={audioRef}
                    src={newAudioUrl}
                    muted={audioMuteStates[post.postId]}
                    loop
                    style={{ display: 'none' }}
                />
            )}

            <PostActions
                hasTaggedUsers={post.postTagUser.length > 0}
                onTaggedUsersClick={onTaggedUsers}
                showInsights={post.userId.toString() === userId.toString()}
                onInsightsClick={onInsights}
                showAudioToggle={!!newAudioUrl}
                isMuted={audioMuteStates[post.postId]}
                onAudioToggle={() => onAudioMuteToggle(post.postId)}
                className="absolute bottom-5 left-4 right-4 flex justify-end items-center z-20"
            />
        </div>
    );
};

export default PostImageWithActions;