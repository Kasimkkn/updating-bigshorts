import Image from 'next/image'
import React from 'react'
import Avatar from '../Avatar/Avatar'
import SafeImage from '../shared/SafeImage';


interface StoryQueueProps {
    coverFile: string;
    profileImage: string;
    userName: string;
    userFullName: string;
    uploadTime: string;
}

const StoryQueue = ({ coverFile, profileImage, userName, userFullName, uploadTime }: StoryQueueProps) => {
    // Format time to Instagram-like format
    const formatTime = (timestamp: string) => {
        if (!timestamp) return '';

        // Parse the timestamp
        const uploadDate = new Date(timestamp);
        const now = new Date();

        // Calculate time difference in milliseconds
        const diffMs = now.getTime() - uploadDate.getTime();

        // Convert to seconds, minutes, hours, days
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        // Format based on difference
        if (diffSecs < 60) {
            return 'just now';
        } else if (diffMins < 60) {
            return `${diffMins}m`;
        } else if (diffHours < 24) {
            return `${diffHours}h`;
        } else if (diffDays < 7) {
            return `${diffDays}d`;
        } else {
            // For older posts, return the date in format: MM/DD
            return `${uploadDate.getMonth() + 1}/${uploadDate.getDate()}`;
        }
    };

    const formattedTime = uploadTime ? formatTime(uploadTime) : '';

    return (
        <div
            className="relative 
                       w-[250px] h-[60vh] 
                       lg:w-[250px] xl:w-[270px] 2xl:w-[280px]
                       max-lg:hidden 
                       bg-bg-color rounded-lg transition-all mx-1 sm:mx-2 z-10"
        >
            <SafeImage
                onContextMenu={(e) => e.preventDefault()}
                src={coverFile}
                alt="Story of non center user"
                className="w-full h-full object-cover rounded-lg blur-md"
            />

            <div className="absolute inset-0 w-full h-full flex items-center justify-center flex-col px-3">
                <Avatar
                    src={profileImage}
                    name={userName}
                    width="w-12 lg:w-14 xl:w-16"
                    height="h-12 lg:h-14 xl:h-16"
                    isMoreBorder={false}
                />
                <h2 className="text-primary-text-color text-xs lg:text-sm xl:text-base font-medium text-center mt-2 px-2">
                    {userFullName}
                </h2>
                <p className="text-primary-text-color text-xs lg:text-sm opacity-75 mt-1 text-center">
                    {formattedTime}
                </p>
            </div>
        </div>
    )
}

export default StoryQueue