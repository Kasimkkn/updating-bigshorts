interface AddInteractiveElementsProps {
    fileType: 'photo' | 'video' | null;
    videoFileSrc?: string | null;
    audioDetails?: {
        audioUrl: string;
        audioDuration: string;
        audioFileName: string;
    }
    imageFileSrc?: string | null;
    startTime?: number;
    endTime?: number;
    onNext: () => void;
    videoDuration?: number;
    handleFileSelect: (file: File, type: 'photo' | 'video', isForFirst: boolean) => Promise<{
        videoUrl: string;
        imageUrl: string;
        audioUrl: string;
        audioDuration: string;
        audioFileName: string;
    }>;
    fileUploadLoading: boolean
    step: number;
    previewVideoSrc: string | null;
    setStartTime: (time: number) => void;
    setEndTime: (time: number) => void;
    setVideoDuration: (time: number) => void;
    setCoverFileImage: React.Dispatch<React.SetStateAction<string>>
    onSubmit: () => void;
    finalSubmitLoading: boolean;
    coverFileImage?: string | null;
    setPostInformation: React.Dispatch<React.SetStateAction<{
        title: string,
        isForAll: boolean,
        scheduleDateTime: string,
        hashArray: string[],
        friendArray: string[],
        usersSelectedate: Date | null
        collaborators: number[],
        isAllowComment: 0 | 1;
        location:string
    }>>
}

type InteractiveElement = {
    id_of_video_list: number | null;
    elementId: number | null;
    id: number | null;
    video_path: string | null;
    start_time: string;
    end_time: string;
    link_url: string | null;
};

type ElementType = 'button' | 'text' | 'image' | 'hotspot';


export type { AddInteractiveElementsProps, InteractiveElement, ElementType };