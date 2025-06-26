import React, { useState, useEffect, useRef } from 'react';
import Button from '../Button';
import Image from 'next/image';
import { BiImageAdd } from 'react-icons/bi';
import ThumbnailPicker from './ThumbnailPicker';
import { FaRegCommentAlt } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { HashtagList, hashtagSearch } from '@/services/hashtagsearch';
import { getFollowerList } from '@/services/userfriendlist';
import { FollowingModalData } from '@/types/usersTypes';
import Avatar from '../../Avatar/Avatar';
import { LoadingSpinner } from '../../LoadingSpinner';
import { PostlistItem } from '@/models/postlistResponse';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '../SafeImage';

interface EditFlixDetailsProps {
    flix: PostlistItem
    finalSubmitLoading: boolean;
    setFlixInformation: React.Dispatch<React.SetStateAction<FlixInformation>>;
    onSubmit: () => void;
    coverFileImage: string;
    setCoverFileImage: React.Dispatch<React.SetStateAction<string>>;
    videoUrl: string;
}

interface FlixInformation {
    title: string;
    description: string;
    isAllowComment: number;
    scheduleDateTime: string;
    hashArray: string[];
    friendArray: string[];
    genreId: number;
}

const EditFlixDetails: React.FC<EditFlixDetailsProps> = ({
    finalSubmitLoading,
    flix,
    setFlixInformation,
    onSubmit,
    coverFileImage,
    setCoverFileImage,
    videoUrl
}) => {
    const [flixInfo, setFlixInfo] = useState<FlixInformation>({
        title: flix.postTitle || '',
        description: flix.description || '',
        isAllowComment: 1,
        scheduleDateTime: flix.scheduleTime || '',
        hashArray: [],
        friendArray: [],
        genreId: flix.genreId || 0
    });

    // References
    const captionRef = useRef<HTMLTextAreaElement>(null);

    // State for hashtags and mentions
    const [hashtags, setHashtags] = useState<Set<string>>(new Set());
    const [friendArray, setFriendArray] = useState<string[]>([]);

    // State for suggestions
    const [captionSuggestions, setCaptionSuggestions] = useState<HashtagList[] | FollowingModalData[]>([]);
    const [captionSuggestionsFilter, setCaptionSuggestionsFilter] = useState<string | null>(null);
    const [captionSuggestionsLoading, setCaptionSuggestionsLoading] = useState<boolean>(false);

    // Other state
    const [isThumbnailPickerOpen, setIsThumbnailPickerOpen] = useState<boolean>(false);

    // Get user ID from local storage
    const [id] = useLocalStorage<string>('userId', '');
    const userId = id ? parseInt(id) : 0;

    // Extract hashtags and mentions from the caption
    useEffect(() => {
        if (flixInfo.title.length > 0) {
            const extractedHashtags = flixInfo.title.match(/#[\w]+/g) || [];
            const updatedHashtags = new Set(extractedHashtags);

            const extractedFriends = flixInfo.title.match(/@[\w]+/g) || [];
            const updatedFriends = extractedFriends;

            setHashtags(updatedHashtags);
            setFriendArray(updatedFriends);
        } else {
            setHashtags(new Set());
            setFriendArray([]);
            setCaptionSuggestions([]);
        }
    }, [flixInfo.title]);

    // Update hashArray and friendArray in FlixInformation when they change
    useEffect(() => {
        setFlixInformation(prev => ({
            ...prev,
            hashArray: Array.from(hashtags),
            friendArray: friendArray,
        }));
    }, [hashtags, friendArray]);

    // Handle caption change with hashtag and mention detection
    const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;

        // Update flixInfo state
        setFlixInfo(prev => ({
            ...prev,
            title: value
        }));

        // Update parent component state
        setFlixInformation(prev => ({
            ...prev,
            title: value
        }));

        // Check for hashtags or mentions at cursor position
        const matchTaggedUsers = RegExp(/@\w*$/).exec(value);
        const matchHashtags = RegExp(/#\w*$/).exec(value);

        if (matchTaggedUsers) {
            setCaptionSuggestionsFilter(matchTaggedUsers[0]);
        } else if (matchHashtags) {
            setCaptionSuggestionsFilter(matchHashtags[0]);
        } else {
            setCaptionSuggestionsFilter(null);
        }
    };

    // Toggle comment allowance
    const handleToggleComments = () => {
        // Toggle between 0 and 1 for isAllowComment
        const updatedAllowComments = flixInfo.isAllowComment === 1 ? 0 : 1;

        setFlixInfo(prev => ({
            ...prev,
            isAllowComment: updatedAllowComments
        }));

        // Update parent component state using the functional update form
        setFlixInformation(prev => ({
            ...prev,
            isAllowComment: updatedAllowComments
        }));
    };

    const highlightHashtags = (text: string) => {
        const escaped = text
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n$/g, "\n");

        return escaped
            .replace(/#\w+/g, (tag) => `<span class="text-blue-500">${tag}</span>`)
            .replace(/@\w+/g, (tag) => `<span class="text-blue-500">${tag}</span>`)
    };

    // Render suggestions for hashtags and mentions
    const renderCaptionSuggestions = () => {
        const suggestionType = captionSuggestionsFilter ? captionSuggestionsFilter.charAt(0) : "";

        const handleSuggestionClick = (text: string) => {
            if (captionSuggestionsFilter === null) {
                return;
            }
            const newCaption = flixInfo.title.replace(new RegExp(`${captionSuggestionsFilter}(?!.*${captionSuggestionsFilter})`), text);

            setFlixInfo(prev => ({
                ...prev,
                title: newCaption
            }));

            setFlixInformation(prev => ({
                ...prev,
                title: newCaption
            }));

            setCaptionSuggestions([]);
            setCaptionSuggestionsFilter(null);

            setTimeout(() => {
                captionRef.current?.focus();
                if (captionRef.current) {
                    captionRef.current.setSelectionRange(newCaption.length + 1, newCaption.length + 1);
                }
            }, 0);
        };

        return (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-48 w-full p-2 bg-bg-color border border-gray-800 rounded-md shadow-lg">
                {captionSuggestionsLoading ? (
                    <LoadingSpinner />
                ) : (
                    captionSuggestions.map((item: any, index: number) => (
                        <div
                            key={index}
                            className="bg-secondary-bg-color rounded-md hover:bg-secondary-bg-color flex p-2 items-center gap-2 cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestionType === "#" ? item.name : suggestionType === "@" ? `@${item.friendUserName}` : '')}
                        >
                            {suggestionType === '#' ? (
                                <p className="text-primary-text-color truncate">{item?.name}</p>
                            ) : suggestionType === '@' && (
                                <>
                                    <Avatar
                                        src={item.userProfileImage}
                                        name={item.friendName}
                                        width="w-7"
                                        height="h-7"
                                        isMoreBorder={false}
                                    />
                                    <p className="text-primary-text-color truncate">{item.friendUserName}</p>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        );
    };

    // Search for hashtags
    const searchHashtags = async (query: string) => {
        setCaptionSuggestionsLoading(true);
        try {
            const response = await hashtagSearch({ text: query });
            const list = Array.isArray(response.data) ? response.data : [];
            setCaptionSuggestions(list);
        } catch (error) {
            console.error("Error searching hashtags:", error);
            setCaptionSuggestions([]);
        } finally {
            setCaptionSuggestionsLoading(false);
        }
    };

    // Search for users to tag
    const searchTaggedUsers = async (query: string) => {
        setCaptionSuggestionsLoading(true);
        try {
            let data = {
                friendName: query,
                userId: Number(userId),
                isCreatePost: 0,
                page: 1,
                pageSize: 20,
                username: query || null,
            };
            const response = await getFollowerList(data);
            const list = Array.isArray(response.data) ? response.data : [];
            setCaptionSuggestions(list);
        } catch (error) {
            console.error("Error searching users:", error);
            setCaptionSuggestions([]);
        } finally {
            setCaptionSuggestionsLoading(false);
        }
    };

    // Fetch hashtags or users based on user input
    useEffect(() => {
        if (captionSuggestionsFilter !== null) {
            const type = captionSuggestionsFilter.charAt(0);
            const query = captionSuggestionsFilter.substring(1);

            if (type === '#' && query) {
                searchHashtags(query);
            } else if (type === '@' && query) {
                searchTaggedUsers(query);
            }
        } else {
            setCaptionSuggestions([]);
        }
    }, [captionSuggestionsFilter]);

    return (
        <>
            <div className="flex flex-col w-full h-full bg-bg-color text-primary-text-color">
                {/* Header with back button */}
                <div className="flex items-center p-4 border-b border-gray-800">
                    <button className="mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-medium flex-1 text-center">Scheduled: 20/05/2025 05:21 PM</h1>
                    <div className="w-6"></div> {/* Spacer for alignment */}
                </div>

                <div className="space-y-4">
                    {/* Cover image section */}
                    <div className="relative w-full flex justify-center items-center p-4">
                        <div
                            className="aspect-[16/9] w-full h-52 rounded-lg overflow-hidden relative"
                            onClick={() => setIsThumbnailPickerOpen(true)}
                        >
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="absolute inset-0">
                                    {coverFileImage ? (
                                        <SafeImage
                                            src={coverFileImage}
                                            videoUrl={videoUrl || ""}
                                            alt="Thumbnail"
                                            className="w-full h-full object-cover"
                                            width={300}
                                            height={200}
                                        />
                                    ) : (
                                        videoUrl ? (
                                            <video
                                                src={videoUrl}
                                                className="w-full h-full object-cover"
                                                muted
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-secondary-bg-color">
                                                <span className="text-gray-400">No cover selected</span>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-bg-color/0 hover:bg-bg-color/50 hover:cursor-pointer transition-all rounded-md opacity-0 hover:opacity-100 flex flex-col items-center justify-center z-10">
                                    <BiImageAdd size={50} className="text-primary-text-color mb-2" />
                                    <p className="text-primary-text-color text-sm font-medium">Choose Thumbnail</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Caption input with hashtag and mention highlighting */}
                    <div className="p-4 relative">
                        <div className="relative w-full min-h-[80px]">
                            <textarea
                                ref={captionRef}
                                name="title"
                                value={flixInfo.title}
                                onChange={handleCaptionChange}
                                className="absolute top-0 left-0 w-full h-full p-3 text-transparent caret-white bg-transparent border border-gray-800 rounded-lg focus:outline-none resize-none text-base leading-5 font-normal overflow-hidden"
                                placeholder="Write a caption..."
                                spellCheck="false"
                                style={{
                                    fontFamily: 'inherit',
                                    letterSpacing: 'normal',
                                    wordSpacing: 'normal'
                                }}
                            />
                            <div
                                className="absolute top-0 left-0 w-full h-full p-3 whitespace-pre-wrap break-words text-base text-primary-text-color pointer-events-none leading-5 font-normal overflow-hidden flex items-center"
                                dangerouslySetInnerHTML={{ __html: highlightHashtags(flixInfo.title) }}
                                style={{
                                    fontFamily: 'inherit',
                                    letterSpacing: 'normal',
                                    wordSpacing: 'normal'
                                }}
                            />
                        </div>

                        {/* Position the suggestions in a fixed position relative to the textarea */}
                        {captionSuggestions.length > 0 && (
                            <div className="absolute left-0 right-0 z-50" style={{ top: 'calc(100% + 5px)' }}>
                                {renderCaptionSuggestions()}
                            </div>
                        )}
                    </div>

                    {/* Comments toggle */}
                    <div className="p-4 flex items-center justify-between border-t border-b border-gray-800">
                        <div className="flex items-center">
                            <FaRegCommentAlt className="w-6 h-6 mr-2" />
                            <span>Allow Comments</span>
                        </div>
                        <div
                            onClick={handleToggleComments}
                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${flixInfo.isAllowComment === 1 ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-secondary-bg-color'
                                }`}
                        >
                            <div
                                className={`bg-primary-bg-color w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${flixInfo.isAllowComment === 1 ? 'translate-x-6' : ''
                                    }`}
                            ></div>
                        </div>
                    </div>

                    {/* Privacy settings */}
                    <div className="p-4 flex items-center justify-between border-b border-gray-800">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Who can Watch this post?</span>
                        </div>
                        <div className="flex items-center">
                            <span>Everyone</span>
                            <FaChevronRight className="ml-2" />
                        </div>
                    </div>
                </div>
                {/* Submit button */}
                <div className="mt-auto p-4">
                    <Button
                        isLinearBtn={true}
                        onClick={onSubmit}
                        disabled={finalSubmitLoading}
                        className={'w-full'}
                    >
                        {finalSubmitLoading ? 'Uploading...' : 'Update Flix'}
                    </Button>
                </div>
            </div>

            {isThumbnailPickerOpen && setCoverFileImage && videoUrl &&
                <ThumbnailPicker
                    setThumbnail={setCoverFileImage}
                    onClose={() => setIsThumbnailPickerOpen(false)}
                    videoUrl={videoUrl}
                    isFor="flix"
                    defaultThumbnail={coverFileImage || undefined}
                />
            }
        </>
    );
};

export default EditFlixDetails;