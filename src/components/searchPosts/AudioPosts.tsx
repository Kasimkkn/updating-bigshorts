import React from 'react'
import { AudioData } from '@/models/searchResponse'
import Image from 'next/image';
import SafeImage from '../shared/SafeImage';

interface AudioPostsProps {
    data: AudioData[];
}

const AudioPosts: React.FC<AudioPostsProps> = ({ data }) => {
    return (
        <div className="flex flex-wrap gap-1">
            {data.map((audio) => (
                <div key={audio.audioId} className="py-3 px-6  rounded-lg bg-primary-bg-color">
                    <div className="flex gap-2 items-center">
                        {audio.audioCoverImage && (
                            <SafeImage
                            src={audio.audioCoverImage} 
                            alt={audio.audioName} 
                            className="rounded-full w-12 h-12 object-cover" 
                           />
                        )}
                        <h3 className="text-lg text-text-color ">{audio.audioName}</h3>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-base text-text-color ">By {audio.audioOwnerName}</p>
                        <div className='flex justify-between items-center'>
                            {audio.audioDuration && (
                                <p className="text-sm text-text-color ">{audio.audioDuration} mins</p>
                            )}
                            <button className="linearText text-base font-bold uppercase">Play</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AudioPosts;
