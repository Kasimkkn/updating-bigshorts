import API_ENDPOINTS from '@/config/apiConfig'
import { SavedResponse } from '@/models/savedResponse';
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse<SavedResponse>) {
    if (req.method === 'POST') {
        try {

            const response = await fetch(API_ENDPOINTS.saved.all, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SavedResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('User Post details failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    postId: 0,
                    postTitle: "",
                    languageId: 0,
                    coverFile: "",
                    userProfileImage: "",
                    isAllowComment: 0,
                    isPosted: 0,
                    tagUserCount: 0,
                    scheduleTime: "",
                    userId: 0,
                    userFullName: "",
                    userName: "",
                    userMobileNo: "",
                    userEmail: "",
                    isVerified: 0,
                    likeCount: 0,
                    superLikeCount: 0,
                    isSuperLiked: 0,
                    dislikeCount: 0,
                    isDislike: 0,
                    saveCount: 0,
                    isLiked: 0,
                    isSaved: 0,
                    commentCount: 0,
                    isCommented: 0,
                    shareCount: 0,
                    whatsappShareCount: 0,
                    isFriend: 0,
                    isInteractive: "",
                    interactiveVideo: [],
                    isForInteractiveImage: 0,
                    isForInteractiveVideo: 0,
                    audioId: 0,
                    audioName: "",
                    audioDuration: "",
                    audioOwnerName: "",
                    audioCoverImage: "",
                    audioFile: "",
                    viewCounts: 0,
                    savedDate: "",
                    videoFile: [],
                    videoFile_base: [],
                    mediaType: 0,
                    postTagUser: [],
                }
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}
