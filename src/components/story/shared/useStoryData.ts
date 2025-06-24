import { useEffect, useState } from 'react';
import { parseInteractiveVideo, processAudioName, processAudioUrl } from '@/components/story/shared/storyUtils';

interface UseStoryDataProps {
    story: any;
    subStoryIndex: number;
}

export const useStoryData = ({ story, subStoryIndex }: UseStoryDataProps) => {
    const [interactiveData, setInteractiveData] = useState<any>(null);
    const [postShare, setPostShare] = useState<any>(null);

    const currentStory = story?.stories?.[subStoryIndex];

    const isVideo = currentStory?.isForInteractiveVideo == 1;
    const hasAudio = typeof currentStory?.audioFile === 'string' && currentStory.audioFile.trim() !== '';

    // Process audio data
    const audioUrl = hasAudio ? processAudioUrl(currentStory.audioFile) : '';
    const interactiveVideos = currentStory?.interactiveVideo ? parseInteractiveVideo(currentStory.interactiveVideo) : [];
    const audioName = processAudioName(interactiveVideos[0]?.audio_name || "", story.userName || "");

    useEffect(() => {
        if (currentStory?.interactiveVideo) {
            try {
                const parsedData = parseInteractiveVideo(currentStory.interactiveVideo);
                setInteractiveData(parsedData[0]);

                // Check for post share data
                const shareData = parsedData[0]?.functionality_datas?.snip_share ||
                    parsedData[0]?.functionality_datas?.ssup_share;
                setPostShare(shareData);
            } catch (error) {
                console.error("Error processing interactive video:", error);
                setInteractiveData(null);
                setPostShare(null);
            }
        } else {
            setInteractiveData(null);
            setPostShare(null);
        }
    }, [currentStory, subStoryIndex]);

    return {
        currentStory,
        isVideo,
        hasAudio,
        audioUrl,
        audioName,
        interactiveData,
        postShare,
        interactiveVideos
    };
};

