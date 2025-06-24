import React from 'react';
import { MusicSaved } from '@/types/savedTypes';
import { transformAudioUrl } from './shared/urlUtils';
import SafeImage from '../shared/SafeImage';

interface AudioPostProps {
    post: MusicSaved;
}

const AudioPost: React.FC<AudioPostProps> = ({ post }) => {
    const newAudioUrl = transformAudioUrl(post.audioFile || "");

    return (
        <div className="p-2 rounded-xl w-[90vw] max-w-lg md:p-4 bg-bg-color shadow-md">
            <div className="flex items-center justify-between mb-4 w-full">
                <div className="flex items-center">
                    <SafeImage
                        onContextMenu={(e) => e.preventDefault()}
                        src={post.audioCoverImage}
                        alt={post.audioName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-2">
                        <p className="font-bold">{post.audioName}</p>
                    </div>
                </div>
            </div>

            {newAudioUrl && (
                <div className="w-lg h-auto mt-4 rounded-lg">
                    <audio controls className="w-full">
                        <source src={newAudioUrl} type="audio/mp3" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </div>
    );
};

export default AudioPost;