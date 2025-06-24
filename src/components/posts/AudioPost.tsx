"use client";
import { MusicSaved } from '@/types/savedTypes';
import Image from 'next/image';
import React from 'react';
import SafeImage from '../shared/SafeImage';

interface AudioPostProps {
    post: MusicSaved; // Replace with actual type if known
}

const AudioPost = ({ post }: AudioPostProps) => {
    const rawAudioPath = post.audioFile || "";
    const newAudioUrl = rawAudioPath.replace(
              "https://d1332u4stxguh3.cloudfront.net/",
              "/audio/"
            );
    post.audioFile = newAudioUrl;
    return (
        <div className="p-2 rounded-xl w-[90vw] max-w-lg md:p-4 bg-bg-color shadow-md">
            <div className="flex items-center justify-between mb-4 w-full">
                <div className='flex items-center'>
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
            
            {post.audioFile && (
                <div className="w-lg h-auto mt-4 rounded-lg">
                    <audio controls className="w-full">
                        <source src={post.audioFile} type="audio/mp3" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </div>
    );
};

export default AudioPost;
