import { FinalJsonContext } from '@/context/useInteractiveVideo';
import { createPostForS3 } from '@/services/createpostnewfors3';
import { fetchPresignedUrls } from '@/services/presignedurls';
import { FileType } from '@/types/fileTypes';
import { PostData } from '@/types/uploadTypes';
import { calculateDateDifference } from '@/utils/features';
import React, { useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CreationCommonModal from '../creationComponents/CreationCommonModal';
import { sanitizeFileName } from '../messageComponents/utils';
import AddInteractiveElements from './AddInteractiveElements';
import CreateSnipModal from './CreateSnipModal';
import { uploadImage } from '@/utils/fileupload';
import { useProgressBar } from '@/context/ProgressBarContext';
import toast from 'react-hot-toast';
interface CreateSnipFlowProps {
    toggleCreatingOptions: () => void;
    toggleSnipCreate: () => void;
}

export const generateUUID = (): string => {
    return uuidv4();
};
const CreateSnipFlow: React.FC<CreateSnipFlowProps> = ({ toggleCreatingOptions, toggleSnipCreate }) => {
    const context = useContext(FinalJsonContext);
    if (!context) {
        throw new Error('CreateSnipFlow must be used within a FinalJsonProvider');
    }
    const { videoList } = context;
    const [step, setStep] = useState<number>(1);
    const [fileType, setFileType] = useState<FileType>(null);
    const [fileUploadLoading, setFileUploadLoading] = useState<boolean>(false);
    const [finalSubmitLoading, setFinalSubmitLoading] = useState<boolean>(false);
    const [coverFileImage, setCoverFileImage] = useState<string>("");
    const [videoFileSrc, setVideoFileSrc] = useState<string | null>(null);
    const [audioDetails, setAudioDetails] = useState({
        audioUrl: '',
        audioDuration: '',
        audioFileName: ''
    });
    const [imageDetails, setImageDetails] = useState({
        imagePath: '',
    });
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    const [videoDuration, setVideoDuration] = useState<number>(startTime ? Math.abs(endTime! - startTime) : 0);
    const [postInformation, setPostInformation] = useState<{
        title: string;
        isForAll: boolean;
        scheduleDateTime: string;
        hashArray: string[];
        friendArray: string[];
        usersSelectedate: Date | null;
        collaborators: number[];
        isAllowComment: 0 | 1;
        location: string
    }>({
        title: '',
        isForAll: false,
        scheduleDateTime: '',
        hashArray: [],
        friendArray: [],
        usersSelectedate: null,
        collaborators: [],
        isAllowComment: 1,
        location: ''
    });
    const { startProgress, stopProgress, toggleProgressBar } = useProgressBar();
    let uploadedCoverImage = ""
    const handleFileSelect = (file: File, type: FileType, isForFirst: boolean): Promise<any> => {
        return new Promise((resolve, reject) => {
            try {
                setFileUploadLoading(true);
                setFileType(type);

                const localFilePath = URL.createObjectURL(file);
                setVideoFileSrc(localFilePath);

                let resultsReturns = {
                    videoUrl: localFilePath,
                    videoFile: file,
                    imageUrl: '',
                    audioUrl: '',
                    audioDuration: '',
                    audioFileName: '',
                };

                if (isForFirst) {
                    const placeholderImage = localFilePath;
                    setCoverFileImage(placeholderImage);
                    resultsReturns.imageUrl = placeholderImage;
                }

                setFileUploadLoading(false);
                resolve(resultsReturns);

                if (isForFirst) {
                    handleNextStep();
                }
            } catch (error) {
                setFileUploadLoading(false);
                reject(new Error("Error processing local file"));
            }
        });
    };


    const handleNextStep = () => setStep((prevStep) => prevStep + 1);
    const handlePreviousStep = () => setStep((prevStep) => prevStep - 1);

    const handleClose = () => {
        toggleSnipCreate();
    };

    const finalSubmit = async () => {
        try {
            toggleSnipCreate();
            startProgress();
            const selectedDate = new Date(postInformation.usersSelectedate!);
            const difference = calculateDateDifference(selectedDate);
            setPostInformation(prev => ({ ...prev, scheduleDateTime: difference }));

            // Helper function to upload files to S3
            const uploadFileToS3 = async (file: File, folder: string): Promise<{
                fileUrl: string,
                audioUrl?: string,
                audioDuration?: string,
                imageUrl?: string
            }> => {
                return new Promise((resolve, reject) => {
                    const contentType = file.type || "video/mp4";
                    const sanitizedFile = sanitizeFileName(file.name);
                    const fileName = `Bigshorts/Flix/${folder}/${generateUUID()}_${sanitizedFile}`;
                    const fileUrl = `https://d1332u4stxguh3.cloudfront.net/${fileName}`;
const fileDetails = [{ fileName, contentType }];

                    fetchPresignedUrls(fileDetails, contentType)
                        .then((responseUrls) => {
                            const presignedUrl = responseUrls[0];
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('fileName', file.name);
                            formData.append('presignedUrl', presignedUrl);
                            const xhr = new XMLHttpRequest();
                            xhr.open('POST', '/api/process-video', true);

                            xhr.onload = function () {
                                if (xhr.status === 200) {
                                    const response = JSON.parse(xhr.responseText);
                                    if (response.success) {
                                        const result: any = { fileUrl };
                                        let audioPromise = Promise.resolve();
                                        let imagePromise = Promise.resolve();

                                        // Handle audio extraction and upload
                                        if (response.audioFileName && response.audioBuffer) {
                                            const filenameaudio = `Bigshorts/Flix/audioFiles/${generateUUID()}_${response.audioFileName}`;

                                            audioPromise = fetchPresignedUrls([{
                                                fileName: filenameaudio,
                                                // contentType: 'audio/mpeg' 
                                            }], 'audio/mpeg')
                                                .then((audioResponseUrls) => {
                                                    const audioPresignedUrl = audioResponseUrls[0];
                                                    const audioBlob = new Blob([new Uint8Array(atob(response.audioBuffer).split('').map(char => char.charCodeAt(0)))], { type: 'audio/mpeg' });
                                                    const audioFile = new File([audioBlob], filenameaudio, { type: 'audio/mpeg' });

                                                    const audioFormData = new FormData();
                                                    audioFormData.append('file', audioFile);
                                                    audioFormData.append('fileName', response.audioFileName);
                                                    audioFormData.append('presignedUrl', audioPresignedUrl);

                                                    return new Promise<void>((resolveAudio, rejectAudio) => {
                                                        const xhrAudio = new XMLHttpRequest();
                                                        xhrAudio.open('POST', '/api/upload', true);

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

                                        // Handle thumbnail image extraction and upload
                                        if (response.imageFileName && response.imageBuffer) {

                                            // Sanitize the filename, with special handling for long names
                                            let sanitizedImageFileName = response.imageFileName.length > 10
                                                ? sanitizeFileName(response.imageFileName.substring(response.imageFileName.length - 10))
                                                : sanitizeFileName(response.imageFileName);

                                            const filenameimage = `Bigshorts/Flix/coverFiles/${generateUUID()}_${sanitizedImageFileName}`;


                                            imagePromise = fetchPresignedUrls([{
                                                fileName: filenameimage,
                                                // contentType: 'image/jpeg' 
                                            }], 'image/jpeg')
                                                .then((imageResponseUrls) => {
                                                    const imagePresignedUrl = imageResponseUrls[0];
                                                    const imageBlob = new Blob([
                                                        new Uint8Array(
                                                            atob(response.imageBuffer).split('').map(char => char.charCodeAt(0))
                                                        )
                                                    ], { type: 'image/jpeg' });
                                                    const imageFile = new File([imageBlob], filenameimage, { type: 'image/jpeg' });

                                                    const imageFormData = new FormData();
                                                    imageFormData.append('file', imageFile);
                                                    imageFormData.append('filePath', response.outputImagePath);
                                                    imageFormData.append('presignedUrl', imagePresignedUrl);

                                                    return new Promise<void>((resolveImage, rejectImage) => {
                                                        const xhrImage = new XMLHttpRequest();
                                                        xhrImage.open('POST', '/api/upload', true);

                                                        xhrImage.onload = function () {
                                                            if (xhrImage.status === 200) {
                                                                const imageResponse = JSON.parse(xhrImage.responseText);
                                                                if (imageResponse.success) {
                                                                    const imageUrl = `https://d1332u4stxguh3.cloudfront.net/${filenameimage}`;
result.imageUrl = imageUrl;
                                                                    uploadedCoverImage = imageUrl;
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

                                        // Resolve when both audio and image are handled
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

            // Upload all videos in the videoList
            const uploadedVideoUrls: string[] = [];
            const uploadedAudioUrls: string[] = [];
            const audioDurationsArray: string[] = [];
            const uploadedCoverFile: string[] = [];
            // let uploadedCoverImage =  || imageDetails.imagePath;

            // Process each video in the videoList
            for (let i = 0; i < videoList.length; i++) {
                const video = videoList[i];

                // Check if this video has a path property that appears to be a local file
                // (if it doesn't start with http, it's likely a local file that needs uploading)
                const needsUpload = typeof video.path === 'string' &&
                    !video.path.startsWith('http') &&
                    !video.path.startsWith('https') &&
                    video.path !== "SkipTimeOnSameVideo";

                if (needsUpload) {
                    try {
                        // Get the local file from the system
                        const videoFile = await fetch(video.path).then(r => r.blob());
                        const file = new File([videoFile], `video_${i}.mp4`, { type: 'video/mp4' });

                        // Upload the video file
                        const result = await uploadFileToS3(file, 'InteractiveVideos');

                        // Store the video URL
                        uploadedVideoUrls.push(result.fileUrl);

                        // Handle audio if extracted
                        if (result.audioUrl) {
                            uploadedAudioUrls.push(result.audioUrl);
                            audioDurationsArray.push(result.audioDuration || '0');

                            // Update audio details if this is the main audio
                            if (!audioDetails.audioUrl) {
                                setAudioDetails(prev => ({
                                    ...prev,
                                    audioUrl: result.audioUrl || "",
                                    audioDuration: result.audioDuration || '',
                                    audioFileName: result.audioUrl?.split('/').pop() || ''
                                }));
                            }
                        }

                        // Set cover image if not already set
                        if (result.imageUrl && !uploadedCoverImage) {
                            uploadedCoverImage = result.imageUrl;
                            setCoverFileImage(result.imageUrl);
                            setImageDetails({ imagePath: result.imageUrl });
                        }
                    } catch (error) {
                        console.error('Error uploading video:', error);
                        throw error;
                    }
                } else if (video.path === "SkipTimeOnSameVideo") {
                    // For skip time entries, keep the marker
                    uploadedVideoUrls.push("SkipTimeOnSameVideo");
                } else if (typeof video.path === 'string') {
                    // Add existing video URLs directly
                    uploadedVideoUrls.push(video.path);

                    // Add existing audio URLs if available
                    if (video.audioFilePath) {
                        uploadedAudioUrls.push(video.audioFilePath);
                        if (video.audioDuration) {
                            audioDurationsArray.push(video.audioDuration.toString());
                        } else {
                            audioDurationsArray.push('0');
                        }
                    }
                }
            }

            // Collect additional media from videoList
            const interactiveImages = videoList
                .flatMap(video => video.functionality_datas?.list_of_images?.map(image => image.img_path) || [])
                .filter(Boolean);

            // Upload interactive images to S3
            const uploadPromises = interactiveImages.map(async (imagePath) => {
                if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('https')) {
                    try {
                        const imageFile = await fetch(imagePath).then(r => r.blob());
                        const file = new File([imageFile], `interactive_${uploadPromises.length}.jpg`, { type: 'image/jpeg' });

                        const filenameimage = `Bigshorts/Flix/coverFiles/${generateUUID()}_${file.name}`;
                        const imageFileDetails = [{ fileName: filenameimage, contentType: file.type }];
                        const presignedUrls = await fetchPresignedUrls(imageFileDetails, file.type);
                        const presignedUrl = presignedUrls[0];

                        const imageFormData = new FormData();
                        imageFormData.append('file', file);
                        imageFormData.append('filePath', filenameimage);
                        imageFormData.append('presignedUrl', presignedUrl);

                        return new Promise((resolve, reject) => {
                            const xhrImage = new XMLHttpRequest();
                            xhrImage.open('POST', '/api/upload', true);

                            xhrImage.onload = function () {
                                if (xhrImage.status === 200) {
                                    const imageResponse = JSON.parse(xhrImage.responseText);
                                    if (imageResponse.success) {
                                        const imageUrl = `https://d1332u4stxguh3.cloudfront.net/${filenameimage}`;
                                        resolve(imageUrl);
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
                    } catch (error) {
                        console.error('Error uploading interactive image:', error);
                        throw error;
                    }
                } else if (imagePath) {
                    return Promise.resolve(imagePath);
                }
            });

            const uploadedInteractiveImages = await Promise.all(uploadPromises);
//upload coverfile
            if (coverFileImage) {
                const coverFileBlob = await fetch(coverFileImage).then(r => r.blob());
                const file = new File([coverFileBlob], `coverFile.jpg`, { type: 'image/jpeg' });
                const result = await uploadImage(file, "coverFiles", false);
                if (!result) {
                    throw new Error("Cover file upload failed");
                }
                uploadedCoverFile.push(result);
            } else (
                console.error("coverfile not found")
            )

            const userData: PostData = {
                videofile: uploadedVideoUrls,
                imagefile: uploadedCoverFile[0] || uploadedCoverImage,  //use coverImage extracted by backend if userUpload not found
                audioFiles: uploadedAudioUrls.length > 0 ? uploadedAudioUrls : [audioDetails.audioFileName],
                audioIds: videoList.map(_ => "0").filter(Boolean),
                audioDurations: audioDurationsArray.length > 0 ? audioDurationsArray : [audioDetails.audioDuration],
                isSimpleVideo: false,
                isForVideo: false,
                is_selcted: false,
                isForInteractiveImage: 0,
                isForInteractiveVideo: 1,
                interactiveJSON: '',
                interactiveimages: uploadedInteractiveImages as string[],
                interactiveVideo: JSON.stringify(videoList.map((video, index) => {
                    // For each video, replace local paths with uploaded S3 URLs
                    const updatedVideo = { ...video };

                    // Update video path if we have an uploaded URL
                    if (uploadedVideoUrls[index]) {
                        updatedVideo.path = uploadedVideoUrls[index];
                    }

                    // Update audio path if we have an uploaded URL
                    if (uploadedAudioUrls[index]) {
                        updatedVideo.audioFilePath = uploadedAudioUrls[index];
                    }

                    return updatedVideo;
                })),
                title: postInformation.title,
                languageId: -1,
                isAllowComment: postInformation.isAllowComment,
                scheduleDateTime: postInformation.scheduleDateTime || '0 days 0 hours 0 minutes',
                isPost: 1,
                postId: 0,
                hashArray: postInformation.hashArray || [],
                friendArray: postInformation.friendArray || [],
                isForAll: postInformation.isForAll ? 1 : 0,
                audioFilesForPost: [audioDetails.audioFileName],
                post_type: 'Post',
                totalBlankVideoContent: '-1',
                totalVideoCount: videoList.length.toString(),
                collaborators: postInformation.collaborators,
                // location: postInformation.location
            };

            const response = await createPostForS3(userData);

        } catch (error) {
            console.error("Error during post submission", error);
        } finally {
            stopProgress();
            toast.success("Snip created successfully");
            setPostInformation({
                title: '',
                hashArray: [],
                friendArray: [],
                isForAll: false,
                scheduleDateTime: '',
                usersSelectedate: null,
                collaborators: [],
                isAllowComment: 1,
                location: ''
            });
            setFinalSubmitLoading(false);
        }
    };


    return (
        <CreationCommonModal
            onClose={handleClose}
            title="Create Snip"
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
                        <CreateSnipModal
                            onClose={handleClose}
                            onFileSelect={handleFileSelect}
                        />
                    );
                }

                return (
                    <AddInteractiveElements
                        step={step}
                        previewVideoSrc={videoFileSrc}
                        setStartTime={setStartTime}
                        setEndTime={setEndTime}
                        setVideoDuration={setVideoDuration}
                        finalSubmitLoading={finalSubmitLoading}
                        coverFileImage={coverFileImage}
                        onSubmit={finalSubmit}
                        setPostInformation={setPostInformation}
                        fileType={fileType}
                        videoFileSrc={videoFileSrc}
                        audioDetails={audioDetails}
                        startTime={startTime}
                        endTime={endTime}
                        onNext={handleNextStep}
                        videoDuration={videoDuration}
                        handleFileSelect={handleFileSelect}
                        fileUploadLoading={fileUploadLoading}
                        setCoverFileImage={setCoverFileImage}
                    />
                );
            }}
            renderActionButtons={(step) => {
                if (step > 1 && step <= 3) {
                    return (
                        <button onClick={handleNextStep} className="text-text-color">
                            Next
                        </button>
                    );
                }
                return null;
            }}
        />

    );
};

export default CreateSnipFlow;

