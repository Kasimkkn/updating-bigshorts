import { useState, useEffect } from 'react';
import { PostlistItem } from '@/models/postlistResponse';
import { IoIosMusicalNotes } from 'react-icons/io';

interface CyclingLocationAudioProps {
    post: PostlistItem;
}

const CyclingLocationAudio = ({ post }: CyclingLocationAudioProps) => {
    const [showAudio, setShowAudio] = useState(true);
    const interactiveVideos = JSON.parse(post.interactiveVideo.toString());
    let audio_name = interactiveVideos[0]?.audio_name || "";

    const isRandomAudioName = /^_?\d+.*\.m4a$/i.test(audio_name);

    // Fallback to a generic name if it looks random
    if (isRandomAudioName) {
    audio_name = `${post.userName}'s Original Audio`;
    }

    useEffect(() => {
        // Only set up the interval if both audioFile and location exist
        if (audio_name && post.postLocation?.[0]?.locationName) {
            const interval = setInterval(() => {
                setShowAudio(prev => !prev);
            }, 5000); // Switch every 5 seconds

            return () => clearInterval(interval);
        }
    }, [audio_name, post.postLocation]);

    // If both are present, cycle between them
    if (audio_name && post.postLocation?.[0]?.locationName) {
        return (
            <div className="h-5 overflow-hidden"> {/* Fixed height to prevent layout shift */}
            <p className={`text-start text-sm truncate text-ellipsis transition-opacity duration-300 ${
              post.isForInteractiveImage === 1 ? 'text-text-color' : 'text-white'
            }`}>
              {showAudio ? audio_name : post.postLocation[0].locationName}
            </p>
          </div>
        );
    }

    // If only location is present
    if (post.postLocation?.[0]?.locationName) {
        return (
            <p className="text-start text-sm text-text-color">
                {post.postLocation[0].locationName}
            </p>
        );
    }

    // If only audio is present
    if (post.audioFile) {
        return (
            <p className="text-start text-sm text-text-color truncate text-ellipsis">
                <IoIosMusicalNotes className="inline-block align-middle" />{audio_name}
            </p>
        );
    }

    // If neither is present
    return null;
};

export default CyclingLocationAudio;