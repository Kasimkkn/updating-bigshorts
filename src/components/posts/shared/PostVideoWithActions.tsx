import React from 'react';
import { PostlistItem } from '@/models/postlistResponse';
import VideoPlayerWidget from '@/components/VideoAndImagesComp/VideoPlayerWidget';
import PostActions from './PostActions';

interface PostVideoWithActionsProps {
    post: PostlistItem;
    index: number;
    userId: number;
    newVideoUrl: string;
    isThisVideoPlaying: boolean;
    activeVideoIndex: number | null;
    videoMuteStates: { [key: number]: boolean };
    onMuteToggle: (postId: number) => void;
    onTaggedUsers: () => void;
    onInsights: () => void;
    onRedirect: () => void;
    videoDivRef: React.RefObject<HTMLDivElement>;
    videoPlayerRef: React.RefObject<any>;
    className?: string;
}

const PostVideoWithActions: React.FC<PostVideoWithActionsProps> = ({
    post,
    index,
    userId,
    newVideoUrl,
    isThisVideoPlaying,
    activeVideoIndex,
    videoMuteStates,
    onMuteToggle,
    onTaggedUsers,
    onInsights,
    onRedirect,
    videoDivRef,
    videoPlayerRef,
    className = "relative w-full flex justify-center items-center h-[550px] overflow-hidden bg-primary-bg-color dark-gray-600 rounded-lg max-md:my-2"
}) => {
    return (
        <div
            className={className}
            ref={videoDivRef}
            data-index={index}
        >
            <button onClick={onRedirect}>
                <VideoPlayerWidget
                    videoUrl={newVideoUrl}
                    isMuted={videoMuteStates[post.postId] || !isThisVideoPlaying}
                    handleMute={() => onMuteToggle(post.postId)}
                    isPlaying={activeVideoIndex === index}
                    handleNext={() => { }}
                    setCurrentTime={() => { }}
                    jumpDuration={0}
                    currentTime={0}
                    allCurrentVideos={[]}
                    currentVideoIndex={0}
                    currentPost={post}
                    updateCurrentIndex={() => { }}
                    currentIndex={index}
                    displayType={1}
                    onHomeScreen={true}
                    videoRef={videoPlayerRef}
                    key={'posts-' + index}
                />
            </button>

            <PostActions
                hasTaggedUsers={post.postTagUser.length > 0}
                onTaggedUsersClick={onTaggedUsers}
                showInsights={post.userId.toString() === userId.toString()}
                onInsightsClick={onInsights}
                showAudioToggle={true}
                isMuted={videoMuteStates[post.postId]}
                onAudioToggle={() => onMuteToggle(post.postId)}
                className="absolute bottom-9 left-4 right-4 flex justify-between items-center z-20"
            />
        </div>
    );
};

export default PostVideoWithActions;
