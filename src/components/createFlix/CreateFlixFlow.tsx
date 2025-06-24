import { FinalJsonContext } from "@/context/useInteractiveVideo";
import { createFlixForS3 } from "@/services/createflixnewfors3";
import { fetchPresignedUrls } from "@/services/presignedurls";
import { FileType } from "@/types/fileTypes";
import { PostData } from "@/types/uploadTypes";
import { calculateDateDifference } from "@/utils/features";
import { useContext, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { LoadingSpinner } from "../LoadingSpinner";
import CommonModalLayer from "../modal/CommonModalLayer";
import CreateFlixModal from "./CreateFlixModal";
import EditFlix from "./EditFlix";
import { uploadImage } from '@/utils/fileupload';
import { useProgressBar } from "@/context/ProgressBarContext";
import toast from "react-hot-toast";

interface CreateFlixFlowProps {
    toggleCreatingOptions: () => void;
    toggleFlixCreate: () => void;
}

export const generateUUID = (): string => {
    return uuidv4();
};
const CreateFlixFlow: React.FC<CreateFlixFlowProps> = ({ toggleCreatingOptions, toggleFlixCreate }) => {
    const context = useContext(FinalJsonContext);
    if (!context) {
        throw new Error('CreateFlixFlow must be used within a FinalJsonProvider');
    }

    const { startProgress, stopProgress, toggleProgressBar } = useProgressBar();
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
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [videoDuration, setVideoDuration] = useState<number>(startTime ? Math.abs(endTime! - startTime) : 0);
    const [flixInformation, setFlixInformation] = useState<{
        title: string;
        scheduleDateTime: string;
        hashArray: string[];
        friendArray: string[];
        isAllowComment: 0 | 1;
        description: string;
        genreId: number
    }>({
        title: '',
        scheduleDateTime: '',
        hashArray: [],
        friendArray: [],
        isAllowComment: 1,
        description: '',
        genreId: 1
    });

    const handleClose = () => {
        toggleFlixCreate();
    }

    const handleFileSelect = async (file: File, type: FileType): Promise<any> => {
        try {
            setFileUploadLoading(true);
            setFileType(type);
    
            // Create a local URL for immediate preview
            const localFilePath = URL.createObjectURL(file);
            setVideoFileSrc(localFilePath);
    
            // Just upload the video to S3, no processing yet
            const contentType = file.type || "video/mp4";
            const fileName = `Bigshorts/LongForm/InteractiveVideos/${generateUUID()}_${file.name}`;
            const fileUrl = `https://d1332u4stxguh3.cloudfront.net/${fileName}`;
    
            const fileDetails = [{ fileName, contentType }];
            const responseUrls = await fetchPresignedUrls(fileDetails, contentType);
            const presignedUrl = responseUrls[0];
    
            // Use XMLHttpRequest to upload to S3 (no processing)
            // await new Promise<void>((resolve, reject) => {
            //     const formData = new FormData();
            //     formData.append('file', file);
            //     formData.append('fileName', file.name);
            //     formData.append('presignedUrl', presignedUrl);
    
            //     const xhr = new XMLHttpRequest();
            //     xhr.open('POST', `/api/upload`, true);
    
            //     xhr.onload = function () {
            //         if (xhr.status === 200) {
            //             const response = JSON.parse(xhr.responseText);
            //             if (response.success) {
            //                 resolve();
            //             } else {
            //                 reject(new Error('Upload failed.'));
            //             }
            //         } else {
            //             reject(new Error('Failed to upload file.'));
            //         }
            //     }
    
            //     xhr.onerror = function () {
            //         reject(new Error('Network error during file upload.'));
            //     };
    
            //     xhr.send(formData);
            // });
    
            // Set placeholder values - actual processing will happen in finalSubmit
            setStartTime(0);
            setEndTime(30); // Default duration, will be updated after processing
            setVideoDuration(30);
    
            setFlixInformation({
                title: 'New Mini',
                scheduleDateTime: '',
                hashArray: [],
                friendArray: [],
                isAllowComment: 1,
                description: 'Video uploaded, processing will happen on submit',
                genreId: 1
            });
    
            setFileUploadLoading(false);
            setStep(3);
    
            return {
                videoUrl: fileUrl,
                videoFile: file,
                imageUrl: '', // Will be set after processing
                audioUrl: '', // Will be set after processing
                audioDuration: '30', // Default, will be updated
                audioFileName: '', // Will be set after processing
            };
    
        } catch (error) {
            console.error('Error in handleFileSelect:', error);
            setFileUploadLoading(false);
            throw new Error(`Error uploading file: `);
        }
    };
    // Helper function to upload audio to S3
// Replace your existing uploadAudioToS3 function with this XMLHttpRequest version
const uploadAudioToS3XMLHttp = async (audioBuffer: string, audioFileName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const filenameaudio = `Bigshorts/LongForm/audioFiles/${generateUUID()}_${audioFileName}`;
        const audioUrl = `https://d1332u4stxguh3.cloudfront.net/${filenameaudio}`;

        fetchPresignedUrls([{ fileName: filenameaudio }], 'audio/mpeg')
            .then((audioResponseUrls) => {
                const audioPresignedUrl = audioResponseUrls[0];
                
                // Convert base64 to blob
                const audioBlob = new Blob([
                    new Uint8Array(atob(audioBuffer).split('').map(char => char.charCodeAt(0)))
                ], { type: 'audio/mpeg' });

                // Direct upload to S3
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', audioPresignedUrl, true);
                xhr.setRequestHeader('Content-Type', 'audio/mpeg');

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        resolve(audioUrl);
                    } else {
                        reject(new Error(`Audio upload failed with status: ${xhr.status}`));
                    }
                };

                xhr.onerror = function () {
                    reject(new Error('Network error during audio upload'));
                };

                xhr.send(audioBlob);
            })
            .catch((error) => {
                reject(new Error("Failed to fetch audio presigned URLs"));
            });
    });
};

// Replace your existing uploadImageToS3 function with this XMLHttpRequest version
const uploadImageToS3XMLHttp = async (imageBuffer: string, imageFileName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const filename = `Bigshorts/LongForm/coverFiles/${generateUUID()}_${imageFileName}`;
        const imageUrl = `https://d1332u4stxguh3.cloudfront.net/${filename}`;

        fetchPresignedUrls([{ fileName: filename }], 'image/jpeg')
            .then((imageResponseUrls) => {
                const imagePresignedUrl = imageResponseUrls[0];
                
                // Convert base64 to blob
                const imageBlob = new Blob([
                    new Uint8Array(atob(imageBuffer).split('').map(char => char.charCodeAt(0)))
                ], { type: 'image/jpeg' });

                // Direct upload to S3
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', imagePresignedUrl, true);
                xhr.setRequestHeader('Content-Type', 'image/jpeg');

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        resolve(imageUrl);
                    } else {
                        reject(new Error(`Image upload failed with status: ${xhr.status}`));
                    }
                };

                xhr.onerror = function () {
                    reject(new Error('Network error during image upload'));
                };

                xhr.send(imageBlob);
            })
            .catch((error) => {
                reject(new Error("Failed to fetch image presigned URLs"));
            });
    });
};
    // Replace your existing uploadFileToS3 function with this clean version
    const uploadFileToS3 = async (file: File, folder: string): Promise<{
        fileUrl: string,
    }> => {
        return new Promise((resolve, reject) => {
            const contentType = file.type || "video/mp4";
            const fileName = `Bigshorts/LongForm/${folder}/${generateUUID()}_${file.name}`;
            const fileUrl = `https://d1332u4stxguh3.cloudfront.net/${fileName}`;
    
            const fileDetails = [{ fileName, contentType }];
    
            fetchPresignedUrls(fileDetails, contentType)
                .then((responseUrls) => {
                    const presignedUrl = responseUrls[0];
                    
                    // Direct upload to S3 using XMLHttpRequest
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', presignedUrl, true);
                    xhr.setRequestHeader('Content-Type', contentType);
    
                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            resolve({ fileUrl });
                        } else {
                            reject(new Error(`Upload failed with status: ${xhr.status}`));
                        }
                    };
                    
                    xhr.onerror = function () {
                        reject(new Error('Network error during file upload.'));
                    };
                    
                    // Upload the file directly to S3
                    xhr.send(file);
                })
                .catch((error) => {
                    reject(new Error("Failed to fetch presigned URLs"));
                });
        });
    };

    const handleNextStep = () => setStep((prevStep) => prevStep + 1);
    const handlePreviousStep = () => {
        // If we're at step 3 (and we skipped step 2), go back to step 1
        if (step === 3) {
            setStep(1);
        } else {
            setStep((prevStep) => prevStep - 1);
        }
    };

    const finalSubmit = async () => {
        try {
            toggleFlixCreate();
            toggleCreatingOptions();
            startProgress();
            const selectedDate = new Date(flixInformation.scheduleDateTime!);
            const difference = calculateDateDifference(selectedDate);
            setFlixInformation(prev => ({ ...prev, scheduleDateTime: difference }));
    
            const uploadedVideoUrls: string[] = [];
            const uploadedAudioUrls: string[] = [];
            const audioDurationsArray: string[] = [];
            let uploadedCoverImage: string = '';
    
            for (let i = 0; i < videoList.length; i++) {
                const video = videoList[i];
    
                // Check if this is the main video uploaded in handleFileSelect (needs processing)
                // const isMainUploadedVideo = typeof video.path === 'string' &&
                //     video.path.startsWith('https://d1332u4stxguh3.cloudfront.net/') &&
                //     i === 0; // Assuming first video is the main one from handleFileSelect
    
                // Check if this is a local file that needs upload
                const needsUpload = typeof video.path === 'string' &&
                    !video.path.startsWith('http') &&
                    !video.path.startsWith('https') &&
                    video.path !== "SkipTimeOnSameVideo";
               
                    // This is the main video from handleFileSelect - process it now
                    try {
                        const videoFile = await fetch(video.path).then(r => r.blob());
                        const file = new File([videoFile], `video_${i}.mp4`, { type: 'video/mp4' });
                    
                        // Upload directly to S3
                        const uploadResult = await uploadFileToS3(file, 'InteractiveVideos');
                        uploadedVideoUrls.push(uploadResult.fileUrl);
                        
                        // Process the video from S3 URL (no file upload needed)
                        const processResponse = await fetch('/api/process-video-from-s3', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                videoUrl: uploadResult.fileUrl,
                                fileName: `video_${i}.mp4`
                            })
                        });
    
                        if (!processResponse.ok) {
                            throw new Error(`Processing failed! status: ${processResponse.status}`);
                        }
    
                        const result = await processResponse.json();
    
                        if (!result.success) {
                            throw new Error(result.message || 'Video processing failed');
                        }
    
                        // Handle audio upload if extracted
                        if (result.audioBuffer && result.audioFileName) {
                            const audioUrl = await uploadAudioToS3XMLHttp(result.audioBuffer, result.audioFileName);
                            uploadedAudioUrls.push(audioUrl);
                            audioDurationsArray.push(result.audioDuration || '0');
    
                            setAudioDetails({
                                audioUrl,
                                audioDuration: result.audioDuration || '',
                                audioFileName: result.audioFileName
                            });
                        }
    
                        // Handle cover image upload if extracted
                        if (result.imageBuffer && result.imageFileName) {
                            uploadedCoverImage = await uploadImageToS3XMLHttp(result.imageBuffer, result.imageFileName);
                            setCoverFileImage(uploadedCoverImage);
                        }
    
                    } catch (error) {
                        console.error('Error processing main video:', error);
                        throw error;
                    }
                
                 
                //  if (typeof video.path === 'string') {
                //     // Video is already fully processed - just collect URLs
                //     uploadedVideoUrls.push(video.path);
    
                //     if (video.audioFilePath) {
                //         uploadedAudioUrls.push(video.audioFilePath);
                //         audioDurationsArray.push(video.audioDuration?.toString() || '0');
                //     }
                // }
            }
    
            // Use processed audio details as fallback
            if (uploadedAudioUrls.length === 0 && audioDetails.audioUrl) {
                uploadedAudioUrls.push(audioDetails.audioUrl);
                audioDurationsArray.push(audioDetails.audioDuration || '0');
            }
    
            // Use processed cover image or fallback
            if (!uploadedCoverImage) {
                uploadedCoverImage = coverFileImage || '';
            }
    
            
    
    
            const userData: PostData = {
                videofile: uploadedVideoUrls,
                imagefile: uploadedCoverImage,
                audioFiles: uploadedAudioUrls,
                audioIds: videoList.map(_ => "0"),
                audioDurations: audioDurationsArray,
                isSimpleVideo: false,
                isForVideo: false,
                is_selcted: false,
                isForInteractiveImage: 0,
                isForInteractiveVideo: true,
                interactiveJSON: '',
                interactiveimages: [],
                interactiveVideo: JSON.stringify(videoList), // 🔥 Use cleaned version
                title: flixInformation.title,
                description: flixInformation.description,
                languageId: -1,
                isAllowComment: flixInformation.isAllowComment,
                scheduleDateTime: flixInformation.scheduleDateTime || '0 days 0 hours 0 minutes',
                isPost: 1,
                postId: 0,
                hashArray: flixInformation.hashArray || [],
                friendArray: flixInformation.friendArray || [],
                isForAll: 1,
                audioFilesForPost: [audioDetails.audioFileName],
                post_type: 'Post',
                totalBlankVideoContent: '-1',
                totalVideoCount: videoList.length.toString(),
                genreId: flixInformation.genreId
            };
    
            // Final payload size check
            const totalSize = JSON.stringify(userData).length;
           
    
           
    
            const response = await createFlixForS3(userData);
    
        } catch (error) {
            console.error("Error during flix submission", error);
        } finally {
            stopProgress();
            toast.success("Mini created successfully");
            resetForm();
        }
    };
    // Add this function to your component (same as before)
const processAndUploadVideo = async (file: File): Promise<{
    videoUrl: string;
    audioUrl?: string;
    audioDuration?: string;
    audioFileName?: string;
    imageUrl?: string;
}> => {
    return new Promise((resolve, reject) => {
        const contentType = file.type || "video/mp4";
        const fileName = `Bigshorts/LongForm/InteractiveVideos/${generateUUID()}_${file.name}`;
        const videoUrl = `https://d1332u4stxguh3.cloudfront.net/${fileName}`;

        const fileDetails = [{ fileName, contentType }];

        fetchPresignedUrls(fileDetails, contentType)
            .then((responseUrls) => {
                const presignedUrl = responseUrls[0];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileName', file.name);
                formData.append('presignedUrl', presignedUrl);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', `/api/process-and-upload-video`, true);

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            resolve({
                                videoUrl,
                                audioUrl: response.audioUrl,
                                audioDuration: response.audioDuration,
                                audioFileName: response.audioFileName,
                                imageUrl: response.imageUrl
                            });
                        } else {
                            reject(new Error('Processing failed.'));
                        }
                    } else {
                        reject(new Error('Failed to process file.'));
                    }
                };

                xhr.onerror = function () {
                    reject(new Error('Network error during file processing.'));
                };

                xhr.send(formData);
            })
            .catch((error) => {
                reject(new Error("Failed to fetch presigned URLs"));
            });
    });
};
    const resetForm = () => {
        setFlixInformation({
            title: '',
            hashArray: [],
            friendArray: [],
            scheduleDateTime: '',
            isAllowComment: 1,
            description: '',
            genreId: 1
        });
        setFinalSubmitLoading(false);
    };

    return (
        <CommonModalLayer onClose={handleClose} width='max-w-4xl' height='h-[90vh]'>
            <div className='flex flex-col w-full h-full shadow-md shadow-shadow-color'>

                <div className="flex gap-1 justify-between items-center p-3 flex-shrink-0">
                    {step > 1 && !fileUploadLoading && (
                        <button onClick={handlePreviousStep} className="text-text-color">Back</button>
                    )}
                    <h2 className='text-text-color '>Create Mini</h2>
                    {step < 3 && (
                        <button onClick={handleNextStep} className="text-text-color">Next </button>
                    )}
                </div>

                {fileUploadLoading ? (
                    <div className="flex items-center justify-center flex-1 overflow-hidden">
                        {/* <LoadingSpinner /> */}
                    </div>
                ) : (
                    <div className='flex w-full flex-1 overflow-hidden relative'>
                        {step === 1 &&
                            <div className='flex w-full justify-center items-center h-full px-4'>
                                <CreateFlixModal onClose={handleClose} onFileSelect={handleFileSelect} />
                            </div>
                        }
                        {step > 1 && fileType === 'video' && (
                            <>
                                {!finalSubmitLoading && (
                                    <EditFlix
                                        step={step}
                                        setStartTime={setStartTime}
                                        setEndTime={setEndTime}
                                        setVideoDuration={setVideoDuration}
                                        finalSubmitLoading={finalSubmitLoading}
                                        coverFileImage={coverFileImage}
                                        onSubmit={finalSubmit}
                                        setFlixInformation={setFlixInformation}
                                        fileType={fileType}
                                        videoFileSrc={videoFileSrc}
                                        audioDetails={audioDetails}
                                        startTime={startTime}
                                        endTime={endTime}
                                        videoDuration={videoDuration}
                                        setCoverFileImage={setCoverFileImage}
                                    />
                                )
                                }

                                {step === 3 && finalSubmitLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-opacity-90 z-10">
                                        <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full"></div>
                                        <h1 className="text-xl font-semibold text-center">Creating Mini</h1>
                                        <p className="text-sm text-gray-500 text-center">Content is being uploaded...</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </CommonModalLayer>
    )
}

export default CreateFlixFlow