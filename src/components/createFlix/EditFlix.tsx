import { useContext, useEffect, useRef, useState } from "react";
import { CustomFabricObject } from "../shared/allNeededFunction";
import { FinalJsonContext, initializeFinalJson } from "@/context/useInteractiveVideo";
import VideoSettings from "../createSnip/VideoSettings";
import FlixDetails from "../shared/PostDetails/FlixDetails";

interface EditFlixProps {
    fileType: 'photo' | 'video' | null;
    videoFileSrc?: string | null;
    audioDetails?: {
        audioUrl: string;
        audioDuration: string;
        audioFileName: string;
    }
    startTime?: number | null;
    endTime?: number | null;
    videoDuration?: number;
    step: number;
    setStartTime: (time: number) => void;
    setEndTime: (time: number) => void;
    setVideoDuration: (time: number) => void;
    onSubmit: () => void;
    finalSubmitLoading: boolean;
    coverFileImage: string;
    setFlixInformation: React.Dispatch<React.SetStateAction<{
        title: string,
        scheduleDateTime: string,
        hashArray: string[],
        friendArray: string[],
        isAllowComment: 0 | 1,
        description: string,
        genreId:number
    }>>;
    setCoverFileImage: React.Dispatch<React.SetStateAction<string>>
}

const EditFlix: React.FC<EditFlixProps> = ({
    fileType,
    videoFileSrc,
    audioDetails,
    startTime,
    endTime,
    videoDuration,
    step,
    setStartTime,
    setEndTime,
    setVideoDuration,
    finalSubmitLoading,
    coverFileImage,
    onSubmit,
    setFlixInformation,
    setCoverFileImage,
}) => {
    const context = useContext(FinalJsonContext);
    if (!context) {
        throw new Error('EditFlix must be used within a FinalJsonProvider');
    }
    
    const { finalJsondetails, setFinalJsondetails, setVideoList, videoList } = context;
    const [activeObject, setActiveObject] = useState<CustomFabricObject | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [maxDuration, setMaxDuration] = useState<number>(0);
    const videoInitializedRef = useRef(false);

    const handleVideoLoadedMetadata = () => {
        setVideoDuration(videoRef.current!.duration);
        setMaxDuration(videoRef.current!.duration);
        setEndTime(videoRef.current!.duration);
    };

    useEffect(() => {
        if (videoFileSrc) {
            const newFinalJson = initializeFinalJson({
                duration: audioDetails?.audioDuration || '0',
                path: videoFileSrc,
                id: 0,
                parent_id: -1,
                audioDuration: videoDuration?.toFixed(1).toString()!,
                audioPath: audioDetails?.audioUrl || '',
            });
            setFinalJsondetails(newFinalJson);
            setVideoList([newFinalJson]);
            videoInitializedRef.current = true;
        }
    }, [videoFileSrc, videoDuration, audioDetails]);

    return (
        <div className="w-full h-full flex flex-col relative items-center gap-2 overflow-hidden">
            
            {/* <div className="md:h-60 max-md:w-full aspect-video bg-bg-color overflow-hidden rounded-md flex-shrink-0">
                {videoList.length > 0  && (
                    
                    <video
                        ref={videoRef}
                        src={videoList[0].path}
                        className="object-contain w-full h-full"
                        autoPlay
                        muted
                        loop
                        onLoadedMetadata={()=>{
                            handleVideoLoadedMetadata();
                            if (videoRef.current) {
                                videoRef.current.currentTime = startTime || 0;
                            }
                        }}
                        onTimeUpdate={() => {
                            if (videoRef.current && endTime && videoRef.current.currentTime >= endTime) {
                                videoRef.current.currentTime = startTime || 0;
                                videoRef.current.play();
                            }
                        }}
                    />
                )}
            </div> */}

            <div className="w-full flex-1 overflow-hidden">
                {/* {step === 2 && fileType === 'video' && (
                    <VideoSettings
                        maxDuration={maxDuration}
                        playerRef={videoRef}
                        setStartTime={setStartTime}
                        setEndTime={setEndTime}
                        setVideoDuration={setVideoDuration}
                    />
                )} */}
                {step === 3 && !finalSubmitLoading && videoList.length > 0 && (
                    <FlixDetails
                        finalSubmitLoading={finalSubmitLoading}
                        coverFileImage={coverFileImage}
                        onSubmit={onSubmit}
                        setFlixInformation={setFlixInformation}
                        setCoverFileImage={setCoverFileImage}
                        videoUrl={videoList[0]?.path || ''}
                    />
                )}
            </div>
        </div>
    )
}

export default EditFlix