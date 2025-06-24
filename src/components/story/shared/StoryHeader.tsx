import React from 'react';
import Avatar from '../../Avatar/Avatar';
import useUserRedirection from '@/utils/userRedirection';
import { AnimatedTimeAudioName } from './AnimatedTimeAudioName';

interface StoryHeaderProps {
    userProfileImage: string;
    userEmail: string;
    userName: string;
    userId: number;
    loggedInUserId: number;
    time?: string;
    audioName?: string;
    hasAudio?: boolean;
}

export const StoryHeader: React.FC<StoryHeaderProps> = ({
    userProfileImage,
    userEmail,
    userName,
    userId,
    loggedInUserId,
    time,
    audioName,
    hasAudio
}) => {
    const redirectUser = useUserRedirection();

    return (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-start px-2 py-4 z-40 max-sm:px-4 max-sm:py-5">
            <div className="flex flex-col w-full">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => redirectUser(userId, `/home/users/${userId}`)}
                        className="focus:outline-none"
                    >
                        <Avatar
                            src={userProfileImage}
                            name={userEmail}
                            width="w-8 sm:w-10"
                            height="h-8 sm:h-10"
                            isMoreBorder={false}
                        />
                    </button>
                    <div className="flex flex-col">
                        <button
                            onClick={() => redirectUser(userId, `/home/users/${userId}`)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <p className="text-white text-sm max-sm:text-base font-medium">
                                {loggedInUserId === userId ? "Your Ssup" : `@${userName}`}
                            </p>
                        </button>
                        {hasAudio && time && audioName && (
                            <div className="flex items-center mt-1">
                                <AnimatedTimeAudioName time={time} audioName={audioName} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
