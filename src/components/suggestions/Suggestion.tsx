"use client";
import { getTrendingCreators } from '@/services/trendingcreators';
import { TrendingCreatorsData } from '@/types/usersTypes';
import useUserRedirection from '@/utils/userRedirection';
import { useCallback, useEffect, useState } from 'react'; // Add useCallback import
import Avatar from '../Avatar/Avatar';
import FollowButton from '../FollowButton/FollowButton';

const Suggestion = ({ isfull }: { isfull?: boolean }) => {
    const [suggestionData, setSuggestionData] = useState<TrendingCreatorsData[]>([]);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const redirectUser = useUserRedirection();

    const shuffleSuggestions = (data: TrendingCreatorsData[]) => {
        if (!data) {
            return [];
        }

        const shuffled = [...data];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    };

    // Wrap getSuggestion with useCallback
    const getSuggestion = useCallback(async () => {
        try {
            setSuggestionLoading(true);
            const response = await getTrendingCreators();
            if (response.isSuccess) {
                const sugesstion = Array.isArray(response.data)
                    ? response.data.filter(creator => !creator.isFollowing)
                    : [];
                setSuggestionData(shuffleSuggestions(sugesstion));
            }
        } catch (error) {
} finally {
            setSuggestionLoading(false);
        }
    }, []); // Empty dependency array since it doesn't depend on any props or state

    // Add getSuggestion to the useEffect dependency array
    useEffect(() => {
        getSuggestion();
    }, [getSuggestion]);

    return (
        <div className={`${isfull ? '' : 'lg:w-1/4'} flex flex-col gap-5 p-5`}>
            <div className='flex flex-col w-full bg-primary-bg-color max-w-2xl rounded-md p-4 gap-5'>
                <div className='flex justify-between'>
                    <p className="font-semibold text-text-color">People You Might Know</p>
                </div>

                <div className='flex flex-col gap-3 items-center'>
                    {suggestionLoading ? (
                        <div className='w-80 max-md:hidden'>
                            {/* Suggestion placeholder */}
                            <div className="p-4 rounded-lg">
                                <div className="h-10 bg-secondary-bg-color animate-pulse w-1/2 rounded mb-6"></div>
                                {Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center mb-4">
                                        <div className="w-10 h-10 rounded-full bg-secondary-bg-color animate-pulse mr-2"></div>
                                        <div className="flex-grow">
                                            <div className="h-4 bg-secondary-bg-color animate-pulse w-2/3 rounded mb-1"></div>
                                            <div className="h-3 bg-secondary-bg-color animate-pulse w-1/3 rounded"></div>
                                        </div>
                                        <div className="w-20 h-8 bg-secondary-bg-color animate-pulse rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {suggestionData.slice(0, 8).map(suggestion => (
                                <div key={suggestion.userId} className="flex w-80 items-center justify-between gap-2 ">
                                    <button
                                        onClick={() => redirectUser(suggestion.userId, `/home/users/${suggestion.userId}`)}
                                        className="flex items-center gap-2 flex-1"
                                    >
                                        <Avatar width="w-12" height="h-12" name={suggestion.userName} src={suggestion.userProfileImage} />
                                        <div className="flex flex-col items-start flex-1">
                                            {suggestion.userName && (
                                                <div className="flex w-full ">
                                                    <p className="font-semibold text-sm text-text-color flex-shrink-0 whitespace-nowrap">
                                                        {suggestion.userFullName ? suggestion.userFullName : `@${suggestion.userName}`}
                                                    </p>
                                                </div>
                                            )}
                                            <p className="text-sm text-text-color truncate overflow-hidden text-ellipsis flex-1  text-left">
                                                {suggestion.userFullName ? `@${suggestion.userName}` : '\u00A0'}
                                            </p>
                                            {/* <p className="text-xs">reason for suggestion</p> */}
                                        </div>
                                    </button>
                                    <FollowButton
                                        isPrivate={false}
                                        isFollowing={suggestion.isFollowing}
                                        requestId={suggestion.userId}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Suggestion;