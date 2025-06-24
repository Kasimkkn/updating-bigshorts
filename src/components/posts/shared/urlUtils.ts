export const transformVideoUrl = (videoFile: string): string => {
    const baseUrls = [
        'https://d198g8637lsfvs.cloudfront.net/',
        'https://d1332u4stxguh3.cloudfront.net/'
    ];

    let newVideoUrl = videoFile;
    if (videoFile && typeof videoFile === 'string') {
        if (videoFile.startsWith(baseUrls[0])) {
            newVideoUrl = videoFile.replace(baseUrls[0], '/video/');
        } else if (videoFile.startsWith(baseUrls[1])) {
            newVideoUrl = videoFile.replace(baseUrls[1], '/interactivevideo/');
        }
    }
    return newVideoUrl;
};

export const transformAudioUrl = (audioFile: string): string => {
    const baseUrls = [
        'https://d198g8637lsfvs.cloudfront.net/',
        'https://d1332u4stxguh3.cloudfront.net/'
    ];

    let newAudioUrl = audioFile;
    if (audioFile && typeof audioFile === 'string') {
        if (audioFile.startsWith(baseUrls[0])) {
            newAudioUrl = audioFile.replace(baseUrls[0], '/audio/');
        } else if (audioFile.startsWith(baseUrls[1])) {
            newAudioUrl = audioFile.replace(baseUrls[1], '/audio/');
        }
    }
    return newAudioUrl;
};