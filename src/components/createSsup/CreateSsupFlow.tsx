import { useCreationOption } from '@/context/useCreationOption';
import { FinalJsonContext } from '@/context/useInteractvieImage';
import { createPostForS3 } from '@/services/createpostnewfors3';
import { fetchPresignedUrls } from '@/services/presignedurls';
import { FileType } from '@/types/fileTypes';
import React, { useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CreationCommonModal from '../creationComponents/CreationCommonModal';
import { LoadingSpinner } from '../LoadingSpinner';
import AddInteractiveElementsImage from './AddInteractiveElementsImage';
import CreateSsupModal from './CreateSsupModal';
import { usePathname } from 'next/navigation';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
interface CreateSsupFlowProps {
    toggleCreatingOptions: () => void;
    toggleSsupCreate: () => void;
}

export const generateUUID = (): string => {
    return uuidv4();
};
const CreateSsupFlow: React.FC<CreateSsupFlowProps> = ({ toggleCreatingOptions, toggleSsupCreate }) => {
    const context = useContext(FinalJsonContext);
    if (!context) {
        throw new Error('CreateSsupFlow must be used within a FinalJsonProvider');
    }
    const { setShouldRefreshPosts, setShouldRefreshProfileStory } = useInAppRedirection();

    const { finalJsondetails } = context;
    const [step, setStep] = useState<number>(1);
    const [selectedDuration, setSelectedDuration] = useState<string>('');
    const [fileSrc, setFileSrc] = useState<string | null>(null);
    const [fileType, setFileType] = useState<FileType | null>(null);
    const [coverFile, setCoverFile] = useState<string | null>(null);
    const [storyDetails, setStoryDetails] = useState<boolean>(false);
    const [fileUploadLoading, setFileUploadLoading] = useState<boolean>(false);
    const [finalSubmitLoading, setFinalSubmitLoading] = useState<boolean>(false);
    const [audioDetails, setAudioDetails] = useState({
        audioPath: '',
        audioDuration: '',
        audioFileName: ''
    });
    const { sharedPostData, setSharedPostData } = useCreationOption();
    const { sharedSsupData, setSharedSsupData } = useCreationOption();
    const pathname = usePathname();

    useEffect(() => {
if (sharedPostData) {
            // Set file type based on shared post
            if (sharedPostData.isForInteractiveVideo === 1) {
                setFileType('video');
            } else if (sharedPostData.isForInteractiveImage === 1) {
                setFileType('photo');
            }
const interactiveVideo = JSON.parse(sharedPostData.interactiveVideo);
            // Ensure sharedPostData.videoFile is an array and get the first item
            const videoFilePath = interactiveVideo[0].path    // The first path in the array
            if (videoFilePath) {
                // Trim the path to include only up to '.mp4' (remove anything after it)
                const trimmedPath = videoFilePath.split('.mp4')[0] + '.mp4';
setFileSrc(trimmedPath || null);
                setStep(2); // Set step to 2 to skip file selection and story details
            }
        }

    }, [sharedPostData]);

    useEffect(() => {
if (sharedSsupData) {
            // Set file type based on shared post
            if (sharedSsupData.stories[0].isForInteractiveVideo === 1) {
                setFileType('video');
            } else if (sharedSsupData.isForInteractiveImage === 1) {
                setFileType('photo');
            }
            const interactiveVideo = JSON.parse(sharedSsupData.stories[0].interactiveVideo);
const videoFilePath = interactiveVideo[0].path    // The first path in the array
            if (videoFilePath) {
                // Trim the path to include only up to '.mp4' (remove anything after it)
                const trimmedPath = videoFilePath.split('.mp4')[0] + '.mp4';
setFileSrc(trimmedPath || null);
                setStep(2); // Set step to 2 to skip file selection and story details
            }
        }

    }, [sharedSsupData]);

const generateRandomBackdropGradient = () => {
    const colors = [
        [4290038721, 4282876145, 4282150078, 4284384858, 4284317899],
        [4294901760, 4289003520, 4283453728, 4278190080, 4294967040],
        [4278190335, 4278255360, 4278222848, 4278190080, 4279030271]
    ];
    
    return {
        begin: { x: -1, y: -1 },
        colors: colors[Math.floor(Math.random() * colors.length)],
        end: { x: 1, y: 1 }
    };
};


    const handleFileSelect = (file: File, type: FileType): Promise<any> => {
        return new Promise((resolve, reject) => {
            try {
                setFileUploadLoading(true);
                setFileType(type);

                const localFilePath = URL.createObjectURL(file);
                setFileSrc(localFilePath);

                let resultsReturns = {
                    fileUrl: localFilePath,
                    file: file,
                    imageUrl: '',
                    audioUrl: '',
                    audioDuration: '',
                    audioFileName: '',
                };

                // Generate a thumbnail for videos
                if (type === 'video') {
                    // Create a video element to capture thumbnail
                    const video = document.createElement('video');
                    video.src = localFilePath;
                    video.addEventListener('loadedmetadata', () => {
                        video.currentTime = Math.min(1, video.duration);
                    });
                    video.addEventListener('seeked', () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            const thumbnailUrl = canvas.toDataURL('image/jpeg');
                            setCoverFile(thumbnailUrl);
                            resultsReturns.imageUrl = thumbnailUrl;
                        }
                        setFileUploadLoading(false);
                        resolve(resultsReturns);
                        handleNextStep();
                    });
                    video.load();
                } else {
                    // For images, use the image itself as the cover
                    setCoverFile(localFilePath);
                    resultsReturns.imageUrl = localFilePath;
                    setFileUploadLoading(false);
                    resolve(resultsReturns);
                    handleNextStep();
                }
            } catch (error) {
                setFileUploadLoading(false);
}
        });
    };

    const handleNextStep = () => setStep((prevStep) => prevStep + 1);
    const handlePreviousStep = () => {
        setStoryDetails(false);
        setStep((prevStep) => prevStep - 1)
    };

    const handleClose = () => {
        toggleSsupCreate();
        setSharedPostData(null)
        setSharedSsupData(null)
    };
    

    const openThePopupForStoryDetails = () => {
        setStoryDetails(true);
    }

    const finalSubmit = async () => {
        try {
            setFinalSubmitLoading(true);

            // Helper function to upload files to S3
            const uploadFileToS3 = async (file: File | Blob, folder: string, fileName: string): Promise<{
                fileUrl: string,
                audioUrl?: string,
                audioDuration?: string,
                imageUrl?: string
            }> => {
                return new Promise((resolve, reject) => {
                    // Determine content type based on file or folder
                    const contentType = file instanceof File ? file.type :
                        (folder === 'InteractiveVideos' ? 'video/mp4' :
                            folder === 'audioFiles' ? 'audio/mpeg' : 'image/jpeg');

                    // Create sanitized filename with UUID
                    const actualFileName = file instanceof File ? file.name : fileName;
                    const sanitizedFile = actualFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const finalFileName = `Bigshorts/Flix/${folder}/${generateUUID()}_${sanitizedFile}`;
                    const fileUrl = `https://d1332u4stxguh3.cloudfront.net/${finalFileName}`;
const fileDetails = [{ fileName: finalFileName, contentType }];

                    fetchPresignedUrls(fileDetails, contentType)
                        .then((responseUrls) => {
                            const presignedUrl = responseUrls[0];
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('fileName', actualFileName);
                            formData.append('presignedUrl', presignedUrl);

                            // Use process-video for videos, upload for other file types
                            const endpoint = folder === 'InteractiveVideos' ?
                                `/api/process-video` : `/api/upload`;

                            const xhr = new XMLHttpRequest();
                            xhr.open('POST', endpoint, true);

                            xhr.onload = function () {
                                if (xhr.status === 200) {
                                    const response = JSON.parse(xhr.responseText);
                                    if (response.success) {
                                        const result: any = { fileUrl };
                                        let audioPromise = Promise.resolve();
                                        let imagePromise = Promise.resolve();

                                        // Handle audio extraction and upload if this is a video
                                        if (folder === 'InteractiveVideos' && response.audioFileName && response.audioBuffer) {
                                            const filenameaudio = `Bigshorts/Flix/audioFiles/${generateUUID()}_${response.audioFileName}`;

                                            audioPromise = fetchPresignedUrls([{
                                                fileName: filenameaudio,
                                            }], 'audio/mpeg')
                                                .then((audioResponseUrls) => {
                                                    const audioPresignedUrl = audioResponseUrls[0];
                                                    const audioBlob = response.audioBuffer.data
                                                        ? new Blob([new Uint8Array(response.audioBuffer.data)], { type: 'audio/mpeg' })
                                                        : new Blob([new Uint8Array(atob(response.audioBuffer).split('').map(char => char.charCodeAt(0)))], { type: 'audio/mpeg' });
                                                    const audioFile = new File([audioBlob], filenameaudio, { type: 'audio/mpeg' });

                                                    const audioFormData = new FormData();
                                                    audioFormData.append('file', audioFile);
                                                    audioFormData.append('fileName', response.audioFileName);
                                                    audioFormData.append('presignedUrl', audioPresignedUrl);

                                                    return new Promise<void>((resolveAudio, rejectAudio) => {
                                                        const xhrAudio = new XMLHttpRequest();
                                                        xhrAudio.open('POST', `/api/upload`, true);

                                                        xhrAudio.onload = function () {
                                                            if (xhrAudio.status === 200) {
                                                                const audioResponse = JSON.parse(xhrAudio.responseText);
                                                                if (audioResponse.success) {
                                                                    const audioUrl = `https://d1332u4stxguh3.cloudfront.net/${filenameaudio}`;
                                                                    result.audioUrl = audioUrl;
                                                                    result.audioDuration = response.audioDuration;
                                                                    resolveAudio();
                                                                } else {
                                                                    rejectAudio(new Error('Audio upload failed'));
                                                                }
                                                            } else {
                                                                rejectAudio(new Error('Failed to upload audio file'));
                                                            }
                                                        };

                                                        xhrAudio.onerror = function () {
                                                            rejectAudio(new Error('Network error during audio upload'));
                                                        };

                                                        xhrAudio.send(audioFormData);
                                                    });
                                                });
                                        }

                                        // Handle thumbnail image extraction and upload if this is a video
                                        if (folder === 'InteractiveVideos' && response.imageFileName && response.imageBuffer) {
                                            let sanitizedImageFileName = response.imageFileName.length > 10
                                                ? response.imageFileName.substring(response.imageFileName.length - 10).replace(/[^a-zA-Z0-9.-]/g, '_')
                                                : response.imageFileName.replace(/[^a-zA-Z0-9.-]/g, '_');

                                            const filenameimage = `Bigshorts/Flix/coverFiles/${generateUUID()}_${sanitizedImageFileName}`;

                                            imagePromise = fetchPresignedUrls([{
                                                fileName: filenameimage,
                                            }], 'image/jpeg')
                                                .then((imageResponseUrls) => {
                                                    const imagePresignedUrl = imageResponseUrls[0];
                                                    // Handle different imageBuffer formats
                                                    const imageBlob = response.imageBuffer.data
                                                        ? new Blob([new Uint8Array(response.imageBuffer.data)], { type: 'image/jpeg' })
                                                        : new Blob([new Uint8Array(atob(response.imageBuffer).split('').map(char => char.charCodeAt(0)))], { type: 'image/jpeg' });
                                                    const imageFile = new File([imageBlob], filenameimage, { type: 'image/jpeg' });

                                                    const imageFormData = new FormData();
                                                    imageFormData.append('file', imageFile);
                                                    imageFormData.append('filePath', response.outputImagePath || filenameimage);
                                                    imageFormData.append('presignedUrl', imagePresignedUrl);

                                                    return new Promise<void>((resolveImage, rejectImage) => {
                                                        const xhrImage = new XMLHttpRequest();
                                                        xhrImage.open('POST', `/api/upload`, true);

                                                        xhrImage.onload = function () {
                                                            if (xhrImage.status === 200) {
                                                                const imageResponse = JSON.parse(xhrImage.responseText);
                                                                if (imageResponse.success) {
                                                                    const imageUrl = `https://d1332u4stxguh3.cloudfront.net/${filenameimage}`;
                                                                    result.imageUrl = imageUrl;
                                                                    resolveImage();
                                                                } else {
                                                                    rejectImage(new Error('Image upload failed'));
                                                                }
                                                            } else {
                                                                rejectImage(new Error('Failed to upload image file'));
                                                            }
                                                        };

                                                        xhrImage.onerror = function () {
                                                            rejectImage(new Error('Network error during image upload'));
                                                        };

                                                        xhrImage.send(imageFormData);
                                                    });
                                                });
                                        }

                                        Promise.all([audioPromise, imagePromise])
                                            .then(() => resolve(result))
                                            .catch(err => reject(err));
                                    } else {
                                        reject(new Error('Upload failed'));
                                    }
                                } else {
                                    reject(new Error('Failed to upload file'));
                                }
                            };

                            xhr.onerror = function () {
                                reject(new Error('Network error during file upload'));
                            };

                            xhr.send(formData);
                        })
                        .catch((error) => {
                            reject(new Error("Failed to fetch presigned URLs"));
                        });
                });
            };

            // Upload main file (video or image) if it's a local file
            let mainFileUrl = fileSrc;
            let coverImageUrl = coverFile;
            let audioFileUrl = audioDetails.audioPath;
            let uploadedCoverImage = coverImageUrl;
            let audioDuration = audioDetails.audioDuration;
            let audioFileName = audioDetails.audioFileName;

            if (fileSrc && !fileSrc.startsWith('http') && !fileSrc.startsWith('https')) {
                // Get the file from the local URL
                const response = await fetch(fileSrc);
                const blob = await response.blob();
                const file = new File([blob], `mainFile.${fileType === 'video' ? 'mp4' : 'jpg'}`, {
                    type: fileType === 'video' ? 'video/mp4' : 'image/jpeg'
                });
const result = await uploadFileToS3(
                    file,
                    fileType === 'video' ? 'InteractiveVideos' : 'InteractiveImages',
                    file.name
                );
mainFileUrl = result.fileUrl;
                uploadedCoverImage = mainFileUrl;
                if (result.imageUrl) {
                    uploadedCoverImage = result.imageUrl;
                }
                if (result.audioUrl) {
                    audioFileUrl = result.audioUrl;
                    audioDuration = result.audioDuration || '';
                    audioFileName = result.audioUrl.split('/').pop() || '';
                }
            }

            // Upload interactive images if they exist
            const interactiveImages = finalJsondetails?.functionality_datas?.list_of_images?.map(image => image.img_path) || [];
const uploadedInteractiveImages = await Promise.all(
                interactiveImages.map(async (imagePath, index) => {
                    if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('https')) {
                        try {
                            const imageResponse = await fetch(imagePath);
                            const imageBlob = await imageResponse.blob();
                            const fileName = `interactive_${index}.jpg`;
const result = await uploadFileToS3(imageBlob, 'coverFiles', fileName);
                            return result.fileUrl;
                        } catch (error) {
                            console.error(`Error uploading interactive image ${index}:`, error);
                            return null;
                        }
                    }
                    return imagePath; // Already a URL, no need to upload
                })
            );
// Update finalJsondetails to use the uploaded image URLs
            if (finalJsondetails && finalJsondetails.functionality_datas && finalJsondetails.functionality_datas.list_of_images) {
                const updatedImages = finalJsondetails.functionality_datas.list_of_images.map((image, index) => {
                    if (uploadedInteractiveImages[index]) {
                        return {
                            ...image,
                            img_path: uploadedInteractiveImages[index]
                        };
                    }
                    return image;
                });

                finalJsondetails.functionality_datas.list_of_images = updatedImages;
            }
            const backdropGradient =  generateRandomBackdropGradient();

            const userData = {
                imagefile: uploadedCoverImage ?? null,
                interactiveimages: uploadedInteractiveImages.filter(Boolean),
                title: '',
                coverFile: uploadedCoverImage ?? null,
                languageId: -1,
                isAllowComment: 1,
                scheduleDateTime: '0 days 0 hours 0 minutes',
                isPost: 0,
                postId: 0,
                hashArray: [],
                friendArray: [],
                isForVideo: fileType === 'video',
                isForInteractiveVideo:  (finalJsondetails?.functionality_datas?.snip_share?.snipItem || finalJsondetails?.functionality_datas?.ssup_share)? 0 : fileType === 'video' ? 1 : 0,
                isForInteractiveImage: (finalJsondetails?.functionality_datas?.snip_share?.snipItem || finalJsondetails?.functionality_datas?.ssup_share) ? 1 : fileType === 'photo'? 1 : 0,
                is_selcted: false,
                isForAll: 1,
                audioDuration: Number(audioDuration) || 0,
                post_type: 'story',
                storyendtime: selectedDuration?.toString() ?? '0',
                interactiveVideo: JSON.stringify([{
                    ...finalJsondetails,
                    backdrop_gradient: {
                        begin: { x: -1, y: -1 },
                        colors: [4290038721, 4282876145, 4282150078, 4284384858, 4284317899],
                        end: { x: 1, y: 1 }
                    },
                    path: mainFileUrl,
                    audioFilePath: audioFileUrl,
                    functionality_datas: {
                        ...finalJsondetails?.functionality_datas,
                    }
                }]),
                audioDurations: Number(audioDetails?.audioDuration) || 0,
                videofile: [mainFileUrl ?? ''],
                audioFiles: [audioFileName ?? ''],
                totalBlankVideoContent: "-1",
                totalVideoCount: "1",
            };
setStoryDetails(false);

            const response = await createPostForS3(userData);
            if (response?.isSuccess) {
if(pathname){
                    if(pathname.endsWith('/followers')){
                        setShouldRefreshPosts(true);
                    } else if(pathname.endsWith('/profile')){
                        setShouldRefreshProfileStory(true)
                    }
                }
            }

        } catch (error) {
            console.error("Error while creating post", error);
        } finally {
            setFinalSubmitLoading(false);
            //toggleSsupCreate();
            // toggleCreatingOptions();
            handleClose();
        }
    };
    
    return (
        <CreationCommonModal
            onClose={handleClose}
            title="Create Ssup"
            step={step}
            fileUploadLoading={fileUploadLoading}
            finalSubmitLoading={finalSubmitLoading}
            handlePreviousStep={handlePreviousStep}
            handleNextStep={() => {
                // no-op since you're controlling step externally via "Next" or "Share"
            }}
            width="max-w-4xl"
            height="h-[90vh]"
            isFileSelectionSkipped={!!sharedPostData || !!sharedSsupData}
            renderStepContent={(step) => {
                if (step === 1 && (!sharedPostData || !sharedSsupData )) {
                    return (
                        <CreateSsupModal
                            onClose={handleClose}
                            onFileSelect={handleFileSelect}
                        />
                    );
                }

                if (step === 2 && finalSubmitLoading) {
                    return (
                        <div className="flex items-center justify-center h-full">
                            <LoadingSpinner />
                        </div>
                    );
                }

                if (step === 2 && !finalSubmitLoading && (sharedPostData || sharedSsupData || fileSrc)) {
                    return (
                        <AddInteractiveElementsImage
                            fileSrc={fileSrc}
                            fileType={
                                sharedPostData?.isForInteractiveVideo === 1
                                    ? 'video'
                                    : sharedPostData?.isForInteractiveImage === 1
                                    ? 'photo'
                                    : sharedSsupData?.isForInteractiveVideo === 1
                                    ? 'video'
                                    : sharedSsupData?.isForInteractiveImage === 1
                                    ? 'photo'
                                    : fileType
                            }
                            duration={audioDetails?.audioDuration}
                            storyDetails={storyDetails}
                            selectedDuration={selectedDuration}
                            setSelectedDuration={setSelectedDuration}
                            sharedPostData={sharedPostData}
                            sharedSsupData={sharedSsupData}
                        />
                    );
                }

                return null;
            }}
            renderActionButtons={(step) => {
                if (step > 1 && step<=3) {
                    return storyDetails ? (
                        <button onClick={finalSubmit} className="text-text-color">
                            Share
                        </button>
                    ) : (
                        <button
                            onClick={openThePopupForStoryDetails}
                            className="text-text-color"
                        >
                            Next
                        </button>
                    );
                }
                return null;
            }}
        />

    );
};

export default CreateSsupFlow;

