import React, { useEffect, useState } from 'react'
import CommonModalLayer from './CommonModalLayer'
import PostDetails from '../shared/PostDetails/PostDetails'
import { PostlistItem } from '@/models/postlistResponse';
import { generateUUID, uploadImage } from '@/utils/fileupload';
import { createPostForS3 } from '@/services/createpostnewfors3';
import { PostData } from '@/types/uploadTypes';
import { fetchPresignedUrls } from '@/services/presignedurls';
import { getRequestedCollaborators } from '@/services/getrequestedcollaborators';

interface EditSnipModalProps {
    post: PostlistItem;
    onClose: () => void;
    isSnipsPage?: boolean;
}
const EditSnipModal = ({ post, onClose, isSnipsPage }: EditSnipModalProps) => {

    const [postInformation, setPostInformation] = React.useState({
        title: '',
        isForAll: true,
        scheduleDateTime: '',
        hashArray: [] as string[],
        friendArray: [] as string[],
        usersSelectedate: null as Date | null,
        collaborators: [] as number[],
        isAllowComment: 0 as 0 | 1,
        location: '',
    });

    const [loading, setLoading] = React.useState(false);
    const [coverFileImage, setCoverFileImage] = React.useState('');
    const [videoUrl, setVideoUrl] = React.useState('');
    const [collaborators, setCollaborators] = useState<{userId: number, profileImage: string}[]>([]);

    const fetchCollaborators = async (postId: number) => {
        try {
            const response = await getRequestedCollaborators({postId: postId});
if(response.isSuccess){
                const collaboratorsInfo = response.data.map((item) => { return {userId: item.userId, profileImage: item.userProfileImage}});
                if(collaborators.length === 0){
                    setCollaborators(collaboratorsInfo);
                }
            }
        } catch (error) {
            console.error('Error fetching collaborators:', error);
        }
    }

    const onSubmit = async () => {
        try {
            setLoading(true);
            let uploadedCoverFile = [];

            // Handle image upload if coverFileImage exists
            if (coverFileImage != post.coverFile) {
                try {
                    const imageFile = await fetch(coverFileImage).then(r => r.blob());
                    const file = new File([imageFile], `cover_file_${Date.now()}.jpg`, { type: 'image/jpeg' });

                    const filenameimage = `Bigshorts/Flix/coverFiles/${generateUUID()}_${file.name}`;
                    const imageFileDetails = [{ fileName: filenameimage, contentType: file.type }];
                    const presignedUrls = await fetchPresignedUrls(imageFileDetails, file.type);
                    const presignedUrl = presignedUrls[0];

                    const imageFormData = new FormData();
                    imageFormData.append('file', file);
                    imageFormData.append('filePath', filenameimage);
                    imageFormData.append('presignedUrl', presignedUrl);

                    // Upload the image using XHR
                    const imageUrl = await new Promise((resolve, reject) => {
                        const xhrImage = new XMLHttpRequest();
                        xhrImage.open('POST', '/api/upload', true);

                        xhrImage.onload = function () {
                            if (xhrImage.status === 200) {
                                const imageResponse = JSON.parse(xhrImage.responseText);
                                if (imageResponse.success) {
                                    resolve(`https://d198g8637lsfvs.cloudfront.net/${filenameimage}`);
                                } else {
                                    reject(new Error('Image upload failed'));
                                }
                            } else {
                                reject(new Error('Failed to upload image file'));
                            }
                        };

                        xhrImage.onerror = function () {
                            reject(new Error('Network error during image upload'));
                        };

                        xhrImage.send(imageFormData);
                    });

                    uploadedCoverFile.push(imageUrl);
                } catch (error) {
                    console.error('Error uploading cover image:', error);
                }
            }

            const prevCollaboratorId = new Set(collaborators.map(obj => obj.userId));
            const isEditCollaborators = (postInformation.collaborators.some(id => !prevCollaboratorId.has(id))) || postInformation.collaborators.length !== collaborators.length ? 1 : 0;

            // Prepare user data for post creation/update
            const userData = {
                title: postInformation.title,
                languageId: -1,
                coverFile: uploadedCoverFile.length > 0 ? uploadedCoverFile[0] : post.coverFile,
                isAllowComment: postInformation.isAllowComment,
                scheduleDateTime: postInformation.scheduleDateTime || '0 days 0 hours 0 minutes',
                isPost: 1,
                postId: post.postId,
                hashArray: postInformation.hashArray || [],
                friendArray: postInformation.friendArray || [],
                audioIds: [post.audioId.toString()],
                isForVideo: true,
                isForInteractiveImage: false,
                isForInteractiveVideo: false,
                isForAll: postInformation.isForAll ? 1 : 0,
                audioDurations: 0,
                post_type: 'Post',
                collaborators: postInformation.collaborators,
                isEditCollaborators: isEditCollaborators,
            };

            // Create/update the post
            const response = await createPostForS3(userData);

        } catch (error) {
} finally {
            setLoading(false);
            onClose();
        }
    };

    useEffect(() => {
        if (post.coverFile) {
            setCoverFileImage(post.coverFile);
        }
        if (post.videoFile && post.videoFile.length > 0) {
            setVideoUrl(post.videoFile[0]);
        }
    }, [post]);

    useEffect(()=>{
        if(post.postId){
            fetchCollaborators(post.postId);
        }
    },[post.postId]);

    const initialValues = {
        caption: post.postTitle || '',
        isAllowComment: post.isAllowComment === 1,
        collaborators: collaborators,
    };

    return (
        <CommonModalLayer 
            height="max-h" 
            width={
                isSnipsPage
                    ? "w-[98vw] max-w-4xl min-w-[320px] sm:min-w-[570px] sm:w-[90vw]"
                    : "w-[95vw] max-w-xl min-w-[280px] sm:min-w-[400px]"
            }
            onClose={onClose}
            isModal={true}
        >
            <div className="w-full flex flex-col gap-4 p-2 sm:p-6 items-center justify-center">
                <PostDetails
                    finalSubmitLoading={loading}
                    setPostInformation={setPostInformation}
                    onSubmit={onSubmit}
                    coverFileImage={coverFileImage}
                    setCoverFileImage={setCoverFileImage}
                    videoUrl={videoUrl}
                    isEditing={true}
                    initialValues={initialValues}
                />
            </div>
        </CommonModalLayer>
    )
}

export default EditSnipModal