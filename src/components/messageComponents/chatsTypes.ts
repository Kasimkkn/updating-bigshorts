import { GetUserMessage } from "@/types/messageTypes";
import { StoryData } from "@/types/storyTypes";

interface MediaFileDetails{
    filePath: string;
    postDetails: string | null;
    audioDuration: string | null;
    type: number | null;
}

interface ChatUIProps {
    setDeleteMessageId: React.Dispatch<React.SetStateAction<number | null>>;
    showReplyInput: boolean
    setShowReplyInput: React.Dispatch<React.SetStateAction<boolean>>;
    replyMessageDetails: any
    setReplyMessageDetails: React.Dispatch<React.SetStateAction<any>>;
    onBack: () => void;
    userMessage: GetUserMessage;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    setMediaFileDetails: React.Dispatch<React.SetStateAction<MediaFileDetails>>
    setReaction: React.Dispatch<React.SetStateAction<{ messageId: number; reaction: string; } | null>>;
    selectedUser: number;
    isPendingChat: boolean;
    isDeniedChat: boolean;
    setPendingChat: React.Dispatch<React.SetStateAction<boolean>>;
    onApproveChat?: () => void;
    onDenyChat?: () => void;
}

interface MessageState {
    openImage: boolean;
    imagePost: any;
    openFullImage: boolean;
    fullImagePath: string;
    openSsupModal: boolean;
    isSharedVideoModal: boolean;
    sharedVideoSrc: string;
    ssupData: StoryData[] | null;
    scale: number;
    showEmoji: number | null;
    isHovered: boolean;
    hoveredMessageId: number | null,
    isScrolled: boolean;
}


export type { ChatUIProps, MessageState };