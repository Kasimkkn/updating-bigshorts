import { StoryInsightsData } from '@/types/storyTypes';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoEyeOutline, IoStatsChartSharp, IoClose } from "react-icons/io5";
import Avatar from '../Avatar/Avatar';
import { StoryViewer } from '@/services/getstoryviewer';
import { getStoryInsights } from '@/services/getstoryinsights';

interface StoryAnalyticsProps {
    storyViewerList: StoryViewer[];
    storyId: number;
    onClose?: () => void;
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}

const StoryAnalytics: React.FC<StoryAnalyticsProps> = ({
    storyViewerList,
    storyId,
    onClose,
    onMouseEnter,
    onMouseLeave
}) => {
    const [activeTab, setActiveTab] = useState('viewers');
    const [storyInsights, setStoryInsights] = useState<StoryInsightsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStoryInsights = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getStoryInsights({ storyId });
            if (response.isSuccess) {
                setStoryInsights(response.data);
            } else {
                setError(response.message || 'Failed to fetch story insights');
            }
        } catch (err) {
            setError('An error occurred while fetching insights');
            console.error('Error fetching story insights:', err);
        } finally {
            setIsLoading(false);
        }
    }, [storyId]);

    useEffect(() => {
        if (activeTab === 'insights') {
            fetchStoryInsights();
        }
    }, [activeTab, storyId, fetchStoryInsights]);

    return (
        <div className='absolute 
                    top-[240px] left-0 right-0 bottom-0 
                    max-sm:top-[180px] max-sm:right-2 max-sm:bottom-2
                    w-full max-w-full bg-bg-color rounded-t-lg 
                    max-sm:rounded-lg
                    z-40 flex flex-col'
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Close button - responsive */}
            {onClose && (
                <button
                    onClick={onClose}
                    className='absolute -top-2 -right-2 
                       max-sm:-top-3 max-sm:-right-3 
                       bg-primary-bg-color text-text-color hover:text-primary rounded-full
                       p-1 max-sm:p-2'
                    aria-label="Close"
                >
                    <IoClose size={24} className="max-sm:w-6 max-sm:h-6" />
                </button>
            )}

            {/* Tab navigation - responsive */}
            <div className='flex border-b border-secondary-bg-color'>
                <button
                    onClick={() => setActiveTab('viewers')}
                    className={`flex-1 py-4 max-sm:py-5 flex items-center justify-center gap-2 
                        text-sm max-sm:text-base font-medium ${activeTab === 'viewers'
                            ? 'border-b-2 border-primary-border-color text-text-color'
                            : 'text-text-color'
                        }`}
                >
                    <IoEyeOutline size={20} className="max-sm:w-6 max-sm:h-6" />
                    <span className="max-sm:text-base">Viewers</span>
                </button>
                <button
                    onClick={() => setActiveTab('insights')}
                    className={`flex-1 py-4 max-sm:py-5 flex items-center justify-center gap-2 
                        text-sm max-sm:text-base font-medium ${activeTab === 'insights'
                            ? 'border-b-2 border-primary-border-color text-text-color'
                            : 'text-text-color'
                        }`}
                >
                    <IoStatsChartSharp size={20} className="max-sm:w-6 max-sm:h-6" />
                    <span className="max-sm:text-base">Insights</span>
                </button>
            </div>

            {/* Content area - responsive height */}
            <div className='h-[50vh] max-sm:h-[60vh] overflow-y-auto'>
                {activeTab === 'viewers' ? (
                    <div className="p-4 max-sm:p-6 space-y-4 max-sm:space-y-6">
                        {storyViewerList.length > 0 ? (
                            <>
                                {Array.from(
                                    new Set(storyViewerList.map(viewer => viewer.userId))
                                ).map(uniqueUserId => {
                                    const viewer = storyViewerList.find(v => v.userId === uniqueUserId);
                                    return viewer && (
                                        <div key={uniqueUserId}
                                            className="flex items-center justify-between py-2 max-sm:py-3
                                                border-b border-border-color  last:border-b-0">
                                            <div className="flex items-center gap-3 max-sm:gap-4">
                                                <Avatar
                                                    src={viewer.userProfileImage}
                                                    name={viewer.userFullName}
                                                    width="w-10 max-sm:w-12"
                                                    height="h-10 max-sm:h-12"
                                                    isMoreBorder={false}
                                                />
                                                <div>
                                                    <h3 className="text-sm max-sm:text-base font-medium text-primary-text-color">
                                                        {viewer.userFullName}
                                                    </h3>
                                                    <p className="text-xs max-sm:text-sm text-primary-text-color opacity-75">

                                                        @{viewer.userName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-32 max-sm:h-40">
                                <p className='text-primary-text-color text-center text-sm max-sm:text-base opacity-75'>
                                    No viewers found
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-4 max-sm:p-6 space-y-4 max-sm:space-y-6">
                        {isLoading ? (
                            <div className="text-center text-primary-text-color flex items-center justify-center h-32 max-sm:h-40">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border-color"></div>
                                    <span className="text-sm max-sm:text-base">Loading insights...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 flex items-center justify-center h-32 max-sm:h-40">
                                <span className="text-sm max-sm:text-base">{error}</span>
                            </div>
                        ) : storyInsights ? (
                            <>
                                {/* Overview Section - responsive */}
                                <div className="bg-secondary-bg-color p-4 max-sm:p-5 rounded-lg">
                                    <h2 className="text-lg max-sm:text-xl font-semibold mb-3 max-sm:mb-4 text-text-color">
                                        Overview
                                    </h2>
                                    <div className="grid grid-cols-3 gap-4 max-sm:gap-6">
                                        <div className="text-center">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.accountReached ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Accounts Reached
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.accountEngaged ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Accounts Engaged
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.profileActivity ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Profile Activity
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Engagement Section - responsive */}
                                <div className="bg-secondary-bg-color p-4 max-sm:p-5 rounded-lg">
                                    <h2 className="text-lg max-sm:text-xl font-semibold mb-3 max-sm:mb-4 text-text-color">
                                        Engagement
                                    </h2>
                                    <div className="flex justify-around gap-4 max-sm:gap-6">
                                        <div className="text-center flex-1">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.accountReached ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Account Reached
                                            </p>
                                        </div>
                                        <div className="text-center flex-1">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.accountEngaged ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Account Engaged
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reach Section - responsive */}
                                <div className="bg-secondary-bg-color p-4 max-sm:p-5 rounded-lg">
                                    <h2 className="text-lg max-sm:text-xl font-semibold mb-3 max-sm:mb-4 text-text-color">
                                        Reach
                                    </h2>
                                    <div className="flex justify-around gap-4 max-sm:gap-6">
                                        <div className="text-center flex-1">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.followerReach ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Followers
                                            </p>
                                        </div>
                                        <div className="text-center flex-1">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.nonFollowerReach ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Non-Followers
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactions Section - responsive */}
                                <div className="bg-secondary-bg-color p-4 max-sm:p-5 rounded-lg">
                                    <h2 className="text-lg max-sm:text-xl font-semibold mb-3 max-sm:mb-4 text-text-color">
                                        Story Interactions
                                    </h2>
                                    <div className="grid grid-cols-3 gap-4 max-sm:gap-6">
                                        <div className="text-center">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.totalReplies ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Replies
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.totalReaction ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Reactions
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg max-sm:text-xl font-medium text-text-color">
                                                {storyInsights?.totalShare ?? 'N/A'}
                                            </p>
                                            <p className="text-xs max-sm:text-sm text-text-color mt-1 max-sm:mt-2">
                                                Share
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-text-color flex items-center justify-center h-32 max-sm:h-40">
                                <span className="text-sm max-sm:text-base opacity-75">No insights available</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryAnalytics;