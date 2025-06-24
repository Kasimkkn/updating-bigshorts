export interface PostData {
    videofile?: string[] | null; // array of video file URLs
    imagefile?: string | null; // cover image file URL
    audioFiles?: string[] | null; // array of audio file URLs
    audioIds?: string[] | null; // list of audio IDs
    // audioDuration?: number | null; // total duration of the audio
    isForVideo: boolean; // flag for simple video or not
    isSimpleVideo: boolean; //
    is_selcted: boolean;
    interactiveJSON?: string | null;
    isForInteractiveVideo: boolean | number; // flag for interactive video
    isForInteractiveImage: number; // flag for interactive image
    isForAll: number; // flag for all media types
    interactiveVideo?: string | null; // interactive JSON for video
    interactiveimages?: string[] | null; // list of interactive images
    title?: string; // title of the post
    languageId: number; // language identifier
    isAllowComment: number; // flag to allow comments
    scheduleDateTime?: string; // scheduled date-time for the post
    isPost: number; // flag indicating if this is a post
    postId?: number; // unique identifier for the post
    hashArray?: string[]; // hashtags used in the post
    friendArray?: string[]; // tagged friends in the post
    audioDurations?: string[]; // array of audio durations
    post_type: string; // type of post, e.g., 'Post'
    totalBlankVideoContent?: string; // total blank video content
    totalVideoCount?: string; // total count of videos
    audioFilesForPost?: string[]; // array of audio file URLs for post
    description?: string; // description for flix
    genreId?: number
    collaborators?: number[];
}

