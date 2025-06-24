import { PostlistItem } from '@/models/postlistResponse';
import { createPostForS3 } from '@/services/createpostnewfors3';
import { fetchPresignedUrls } from '@/services/presignedurls';
import { generateUUID } from '@/utils/fileupload';
import React, { useEffect } from 'react';
import EditFlixDetails from '../shared/PostDetails/EditFlixDetails';
import CommonModalLayer from './CommonModalLayer';

interface EditFLixModalProps {
    flix: PostlistItem;
    onClose: () => void
}
const EditFLixModal = ({ flix, onClose }: EditFLixModalProps) => {

    const [flixInformation, setFlixInformation] = React.useState({
        title: '',
        scheduleDateTime: '',
        hashArray: [] as string[],
        friendArray: [] as string[],
        isAllowComment: 0 as number,
        description: '',
        genreId: 0 as number
    });

    const [loading, setLoading] = React.useState(false);
    const [coverFileImage, setCoverFileImage] = React.useState('');
    const [videoUrl, setVideoUrl] = React.useState('');

    const onSubmit = async () => {
        try {
            setLoading(true);
            let uploadedCoverFile = [];

            // Handle image upload if coverFileImage exists
            if (coverFileImage !== flix.coverFile) {
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

            // Prepare user data for post creation/update
            const userData = {
                title: flixInformation.title,
                languageId: -1,
                coverFile: uploadedCoverFile.length > 0 ? uploadedCoverFile[0] : flix.coverFile,
                isAllowComment: flixInformation.isAllowComment,
                scheduleDateTime: flixInformation.scheduleDateTime || '0 days 0 hours 0 minutes',
                isPost: 1,
                postId: flix.postId,
                hashArray: flixInformation.hashArray || [],
                friendArray: flixInformation.friendArray || [],
                audioIds: [flix.audioId.toString()],
                isForVideo: true,
                isForInteractiveImage: false,
                isForInteractiveVideo: false,
                isForAll: 0,
                audioDurations: 0,
                post_type: 'Flix',
                isEditCollaborators: 0,
                collaborators: [],
                description: flixInformation.description || '',
            };

            // Create/update the post
            const response = await createPostForS3(userData);

        } catch (error) {
        } finally {
            setLoading(false);
            onClose();
        }
    }

    // Set media files when post changes
    useEffect(() => {
        if (flix.coverFile) {
            setCoverFileImage(flix.coverFile);
        }
        if (flix.videoFile && flix.videoFile.length > 0) {
            setVideoUrl(flix.videoFile[0]);
        }
    }, [flix]);


    return (
        <CommonModalLayer height='max-h' width='max-w-xl' onClose={onClose} >
            <EditFlixDetails
                flix={flix}
                finalSubmitLoading={loading}
                setFlixInformation={setFlixInformation}
                onSubmit={onSubmit}
                coverFileImage={coverFileImage}
                setCoverFileImage={setCoverFileImage}
                videoUrl={videoUrl}
            />
        </CommonModalLayer>
    )
}

export default EditFLixModal