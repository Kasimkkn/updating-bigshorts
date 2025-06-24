export const formatTime = (timestamp: string): string => {
    if (!timestamp) return '';

    const uploadDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - uploadDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${uploadDate.getMonth() + 1}/${uploadDate.getDate()}`;
};

export const parseInteractiveVideo = (interactiveVideo: string): any[] => {
    try {
        return JSON.parse(interactiveVideo.toString());
    } catch (error) {
        console.error("Error parsing interactiveVideo:", error);
        return [];
    }
};

export const extractVideoUrl = (interactiveVideo: string): string => {
    try {
        const interactiveVideoArray = parseInteractiveVideo(interactiveVideo);
        const rawVideoPath = interactiveVideoArray[0]?.path || "";
        return rawVideoPath.replace('https://d1332u4stxguh3.cloudfront.net/', '/video/');
    } catch (error) {
        console.error("Error extracting video URL:", error);
        return "";
    }
};

export const processAudioName = (audioName: string, userName: string): string => {
    const isRandomAudioName = /^_?\d+.*\.m4a$/i.test(audioName);
    return isRandomAudioName ? `${userName}'s Original Audio` : audioName;
};

export const processAudioUrl = (audioFile: string): string => {
    return audioFile.replace('https://d1332u4stxguh3.cloudfront.net/', '/audio/');
};

