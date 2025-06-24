import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface InteractiveVideo {
    id: number;
    parent_id: number;
    path: string;
    ios_streaming_url: string;
    android_streaming_url: string;
    duration: string;
    is_selected: boolean;
    on_video_end: any;
    aspect_ratio: number;
    post_id: number;
    video_id: number;
}

export interface Story {
    postId: number;
    postTitle: string;
    languageId: number;
    coverFile: string;
    isAllowComment: number;
    isPosted: number;
    scheduleTime: string;
    isInteractive: string;
    interactiveVideo: string;
    isForInteractiveImage: number;
    isForInteractiveVideo: number;
    audioId: number;
    audioName: string;
    audioDuration: string;
    audioOwnerName: string;
    audioCoverImage: string;
    audioFile: string;
    viewCounts: number;
    isRead: number;
    storyEndTime: string;
    taggedUser: any[];
}

export interface ArchivesReponseTypes {
    userId: number;
    userProfileImage: string;
    userFullName: string;
    userName: string;
    userMobileNo: string;
    userEmail: string;
    isVerified: number;
    isMuted: number;
    stories: Story[];
}

interface ArchivesReponse extends CommonResponse<ArchivesReponseTypes[]> { }
async function getArchives(): Promise<ArchivesReponse> {
    try {
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getarchives', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ArchivesReponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Archives failed:', error);
        throw error;
    }
}

export { getArchives }
export type { ArchivesReponse }