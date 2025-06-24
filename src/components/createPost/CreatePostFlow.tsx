import { initializeFinalJson } from '@/context/useInteractvieImage';
import { VideoList } from '@/models/videolist';
import { createPostForS3 } from '@/services/createpostnewfors3';
import { FileType } from '@/types/fileTypes';
import { PostData } from '@/types/uploadTypes';
import { uploadImage } from '@/utils/fileupload';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CreationCommonModal from '../creationComponents/CreationCommonModal';
import AddInteractiveElementsImage from './AddInteractiveElementsImage';
import CreatePostModal from './CreatePostModal';
import { useProgressBar } from '@/context/ProgressBarContext';
import toast from 'react-hot-toast';

interface CreatePostFlowProps {
    toggleCreatingOptions: () => void;
    togglePostCreate: () => void;
}

export const generateUUID = (): string => {
    return uuidv4();
};
const CreatePostFlow: React.FC<CreatePostFlowProps> = ({ toggleCreatingOptions, togglePostCreate }) => {
    const [imageJsonList, setImageJsonList] = useState<VideoList[]>([]);
    const [step, setStep] = useState<number>(1);
    const [fileUploadLoading, setFileUploadLoading] = useState<boolean>(false);
    const [finalSubmitLoading, setFinalSubmitLoading] = useState<boolean>(false);
    const [coverFile, setCoverFile] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [postInformation, setPostInformation] = useState<{
        title: string;
        isForAll: boolean;
        scheduleDateTime: string;
        hashArray: string[];
        friendArray: string[];
        usersSelectedate: Date | null;
        collaborators: number[];
        isAllowComment: 0 | 1;
        location: string;
    }>({
        title: '',
        isForAll: false,
        scheduleDateTime: '',
        hashArray: [],
        friendArray: [],
        usersSelectedate: null,
        collaborators: [],
        isAllowComment: 1,
        location: '',
    });

    const { startProgress, stopProgress, toggleProgressBar } = useProgressBar();
    const getAspectRatioNumber = (aspectRatio: "1:1" | "4:5" | "16:9") => {
        if (aspectRatio === "1:1") return 1;
        else if (aspectRatio === "4:5") return 4 / 5;
        else return 16 / 9;
    }

    const handleFileSelect = (files: File[], aspectRatio: "1:1" | "4:5" | "16:9") => {
        const aspectRatioNumber = getAspectRatioNumber(aspectRatio);
        for (let i = 0; i < files.length; i++) {
            const imageUrl = URL.createObjectURL(files[i]);
            const imageId = Date.now();

            const newFinalJson = initializeFinalJson({
                path: imageUrl,
                duration: '',
                id: imageId,
                parent_id: 0,
                aspect_ratio: aspectRatioNumber,
            })

            setImageJsonList((prevList) => [...prevList, newFinalJson]);
        }
    }

    const handleNextStep = () => {
        setStep((prevStep) => prevStep + 1)
    };
    const handlePreviousStep = () => {
        if (step === 2) {
            setImageJsonList([]);
        }
        setStep((prevStep) => prevStep - 1)
    };

    const handleClose = () => {
        togglePostCreate();
    };


    const finalSubmtit = async () => {
        try {
            togglePostCreate();
            startProgress();
            const uploadedImageUrls: string[] = [];
            const uploadedCoverFile: string[] = [];

            // Upload image files
            for (let i = 0; i < imageJsonList.length; i++) {
                const image = imageJsonList[i];

                // Check if this image has a path property that appears to be a local file
                // (if it doesn't start with http, it's likely a local file that needs uploading)
                const needsUpload = typeof image.path === 'string' &&
                    !image.path.startsWith('http') &&
                    !image.path.startsWith('https')

                if (needsUpload) {
                    try {
                        // Get the local file from the system
                        const videoFile = await fetch(image.path).then(r => r.blob());
                        const file = new File([videoFile], `image_${i}.jpg`, { type: 'image/jpeg' });

                        // Upload the image file
                        const result = await uploadImage(file, "InteractiveVideos", false); // videoFiles for both video and image use InteractiveVideos folder

                        // Store the image URL
                        if (!result) {
                            throw new Error("Image upload failed");
                        }
                        uploadedImageUrls.push(result);
                    } catch (error) {
                        console.error('Error uploading video:', error);
                        throw error;
                    }
                } else if (typeof image.path === 'string') {
                    // Add existing image URLs directly
                    uploadedImageUrls.push(image.path);
                }
            }

            // Upload cover file if it exists
            if (coverFile) {
                const coverFileBlob = await fetch(coverFile).then(r => r.blob());
                const file = new File([coverFileBlob], `coverFile.jpg`, { type: 'image/jpeg' });
                const result = await uploadImage(file, "coverFiles", false);
                if (!result) {
                    throw new Error("Cover file upload failed");
                }
                uploadedCoverFile.push(result);
            } else (
                console.error("coverfile not found")
            )

            // Upload interactive images
            const interactiveImages = imageJsonList
                .flatMap(image => image.functionality_datas?.list_of_images?.map(image => image.img_path) || [])
                .filter(Boolean);

            const uploadPromises = interactiveImages.map(async (imagePath) => {
                if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('https')) {
                    try {
                        const imageFile = await fetch(imagePath).then(r => r.blob());
                        const file = new File([imageFile], `interactive_${uploadPromises.length}.jpg`, { type: 'image/jpeg' });
                        const result = await uploadImage(file, "InteractiveImages", false); // Use InteractiveImages folder for interactive images
                        return new Promise((resolve, reject) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(new Error("Interactive image upload failed"));
                            }
                        })
                    } catch (error) {
                        console.error('Error uploading interactive image:', error);
                        throw error;
                    }
                } else if (imagePath) {
                    return Promise.resolve(imagePath);
                }
            });

            const uploadedInteractiveImages = await Promise.all(uploadPromises);

            let userData: PostData = {
                videofile: uploadedImageUrls,
                imagefile: uploadedCoverFile[0],
                audioFiles: [],
                audioIds: [],
                audioDurations: [],
                isSimpleVideo: false,
                is_selcted: false,
                isForVideo: false,
                isForInteractiveVideo: 0,
                isForInteractiveImage: 1,
                interactiveJSON: '',
                interactiveimages: uploadedInteractiveImages as string[],
                interactiveVideo: JSON.stringify(imageJsonList.map((image, index) => {
                    // For each video, replace local paths with uploaded S3 URLs
                    const updatedImage = { ...image };

                    // Update video path if we have an uploaded URL
                    if (uploadedImageUrls[index]) {
                        updatedImage.path = uploadedImageUrls[index];
                    }

                    // Update functionality_datas if it exists
                    if (updatedImage.functionality_datas?.list_of_images) {
                        updatedImage.functionality_datas.list_of_images = updatedImage.functionality_datas.list_of_images.map((img, imgIndex) => {
                            const updatedImg = { ...img };
                            if (uploadedInteractiveImages[imgIndex]) {
                                updatedImg.img_path = uploadedInteractiveImages[imgIndex] as string;
                            }
                            return updatedImg;
                        });

                    }
                    return updatedImage;
                })),
                title: postInformation.title,
                languageId: -1,
                isAllowComment: postInformation.isAllowComment,
                scheduleDateTime: postInformation.scheduleDateTime || '0 days 0 hours 0 minutes',
                isPost: 1,
                postId: 0,
                hashArray: postInformation.hashArray,
                friendArray: postInformation.friendArray,
                isForAll: postInformation.isForAll ? 1 : 0,
                audioFilesForPost: [],
                post_type: 'Post',
                totalBlankVideoContent: '-1',
                totalVideoCount: uploadedImageUrls.length.toString(),
                collaborators: postInformation.collaborators,
            }
const response = await createPostForS3(userData);

        } catch (error) {
        } finally {
            stopProgress();
            toast.success("Shot created successfully!");
            setPostInformation({
                title: '',
                hashArray: [],
                friendArray: [],
                isForAll: false,
                scheduleDateTime: '',
                usersSelectedate: null,
                collaborators: [],
                isAllowComment: 1,
                location: '',
            });
            setFinalSubmitLoading(false);
        }
    };

    return (
        <CreationCommonModal
            onClose={handleClose}
            title="Create Shot"
            step={step}
            fileUploadLoading={fileUploadLoading}
            finalSubmitLoading={finalSubmitLoading}
            handlePreviousStep={handlePreviousStep}
            handleNextStep={handleNextStep}
            width="max-w-4xl"
            height="h-[90vh]"
            renderStepContent={(step) => {
                if (step === 1) {
                    return (
                        <CreatePostModal
                            onClose={handleClose}
                            onFileSelect={handleFileSelect}
                            handleNextStep={handleNextStep}
                            setCoverFile={setCoverFile}
                        />
                    );
                }

                if (step > 1) {
                    return (
                        <AddInteractiveElementsImage
                            fileUploadLoading={fileUploadLoading}
                            finalSubmitLoading={finalSubmitLoading}
                            onSubmit={finalSubmtit}
                            setPostInformation={setPostInformation}
                            step={step}
                            imageJsonList={imageJsonList}
                            setImageJsonList={setImageJsonList}
                        />
                    );
                }

                return null;
            }}
            renderActionButtons={(step) => {
                return step === 2 ? (
                    <button onClick={handleNextStep} className="text-text-color">
                        Next
                    </button>
                ) : null;
            }}
        />

    );
};

export default CreatePostFlow;