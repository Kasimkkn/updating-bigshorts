import { deletePost } from '@/services/deletepost';
import { getStoryViewerList, StoryViewer } from '@/services/getstoryviewer';
import { muteStory } from '@/services/mutestory';
import { storyReaction } from '@/services/storyreaction';
import { sendStoryReply } from '@/services/storyreply';
import { unMuteStory } from '@/services/unmutestory';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseStoryActionsProps {
    story: any;
    currentStory: any;
    userInfo: any;
    onReactionUpdate?: (storyId: number, reaction: string) => void;
    onMuteUpdate: (userId: number, isMuted: number) => void;
    removeStory: (storyId: number, userId: number) => void;
    onAnalyticsStateChange?: (isOpen: boolean) => void;
    onMute: (userId: number, isMuted: number) => void;
    onPrevious: () => void;
    subStoryIndex: number;
}

export const useStoryActions = ({
    story,
    currentStory,
    userInfo,
    onReactionUpdate,
    onMuteUpdate,
    removeStory,
    onAnalyticsStateChange,
    onMute,
    onPrevious,
    subStoryIndex
}: UseStoryActionsProps) => {
    const [storyViewerList, setStoryViewerList] = useState<StoryViewer[]>([]);
    const [isMutedState, setIsMutedState] = useState(story?.isMuted || 0);

    const handleStoryReaction = useCallback(async (emoji: string) => {
        try {
            const response = await storyReaction({
                reaction: emoji,
                storyDetails: `${JSON.stringify(currentStory)}_USERINFO_${JSON.stringify(userInfo)}`,
                storyId: currentStory.postId,
            });

            if (response.isSuccess) {
                onReactionUpdate?.(currentStory.postId, emoji);
            }
        } catch (error) {
            console.error("Error updating reaction:", error);
        }
    }, [currentStory, userInfo, onReactionUpdate]);

    const handleStoryReply = useCallback(async (message: string) => {
        try {
            await sendStoryReply({
                message,
                storyDetails: `${JSON.stringify(currentStory)}_USERINFO_${JSON.stringify(userInfo)}`,
                storyId: currentStory.postId,
            });
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    }, [currentStory, userInfo]);

    const handleMute = useCallback(async (userId: number) => {
        try {
            const response = await muteStory({ user_id: userId });
            if (response.isSuccess) {
                setIsMutedState(1);
                onMuteUpdate(userId, 1);
                onMute(userId, 1);
                toast.success("Story muted successfully!");
            } else {
                toast.error("Failed to mute the story.");
            }
        } catch (error) {
            console.error("Error muting story:", error);
            toast.error("Failed to mute the story.");
        }
    }, [onMuteUpdate, onMute]);

    const handleUnmute = useCallback(async (userId: number) => {
        try {
            const response = await unMuteStory({ user_id: userId });
            if (response.isSuccess) {
                setIsMutedState(0);
                onMuteUpdate(userId, 0);
                onMute(userId, 0);
                toast.success("Story unmuted successfully!");
            } else {
                toast.error("Failed to unmute the story.");
            }
        } catch (error) {
            console.error("Error unmuting story:", error);
            toast.error("Failed to unmute the story.");
        }
    }, [onMuteUpdate, onMute]);

    const handleDelete = useCallback(async (postId: number, userId: number) => {
        try {
            const res = await deletePost({ postId, isPost: 0 });
            if (res.isSuccess) {
                removeStory(postId, userId);
                toast.success("Ssup deleted successfully!");
                if (subStoryIndex === story.stories.length - 1) {
                    onPrevious();
                }
            }
        } catch (error) {
            console.error("Error deleting story:", error);
            toast.error("Failed to delete story.");
        }
    }, [removeStory, story, subStoryIndex, onPrevious]);

    const handleAnalytics = useCallback(async () => {
        try {
            const response = await getStoryViewerList(currentStory.postId);
            if (response.isSuccess) {
                setStoryViewerList(response.data);
                onAnalyticsStateChange?.(true);
                return true;
            }
        } catch (error) {
            console.error("Error fetching story insights:", error);
        }
        return false;
    }, [currentStory, onAnalyticsStateChange]);

    return {
        storyViewerList,
        isMutedState,
        handleStoryReaction,
        handleStoryReply,
        handleMute,
        handleUnmute,
        handleDelete,
        handleAnalytics
    };
};
