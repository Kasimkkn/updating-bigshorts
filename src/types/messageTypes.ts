import { CommonResponse } from "@/models/commonResponse";

interface RepliedMessage {
    messageId: number;         
    userId: number;              
    message: string;
    isread: string;           //"0" | "1";          
    messageTime: string;            
    updatedAt: string;    
    replyId: number;                
    reaction: string;                
    filePath: string;                
    duration: string;                
    type: string;           
    postDetails: any | null;   // replace any with proper type if known
}
export interface GetUserMessage {
    userData: {
        chatId: number;
        userId: number;
        userFullName: string;
        userName: string;
        userProfileImage: string;
        chatUserId: number;
        chatUserFullName: string;
        chatUserName: string;
        chatUserProfileImage: string;
    };
    chatData: Array<{
        messageId: number;
        userId: number;
        reaction: string;
        message: string | null;
        type: string;
        filePath: string;
        duration: string;
        messageTime: string;
        postDetails: string;
        replyId: number;
        repliedMessage?: RepliedMessage
    }>;
}

export interface GetUserMessageReponse extends CommonResponse<GetUserMessage> { }


export interface MessageUserListData {
    chatId: number;
    userId: number;
    userFullName: string;
    userName: string;
    isVerified: number;
    userProfileImage: string;
    isApproved: number;
    isFriend: number;
    unreadCount: number;
    isOnline: number;
    lastMessage: string;
    type: string;
    messageTime: string;
    isMuted: number;
    isBlocked: number;
}

export interface MessageUserListResponse extends CommonResponse<MessageUserListData[]> { }

