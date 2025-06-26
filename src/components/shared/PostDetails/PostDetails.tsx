import { HashtagList, hashtagSearch } from '@/services/hashtagsearch';
import { getFollowerList } from '@/services/userfriendlist';
import { FollowingModalData } from '@/types/usersTypes';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BiImageAdd } from 'react-icons/bi';
import { FaChevronRight, FaRegCommentAlt } from "react-icons/fa";
import { FaLocationDot } from 'react-icons/fa6';
import { TbUsersPlus } from 'react-icons/tb';
import Avatar from '../../Avatar/Avatar';
import { LoadingSpinner, ModerSpinner } from '../../LoadingSpinner';
import Button from '../Button';
import Input from '../Input';
import Collaborators from './Collaborators';
import LocationPicker from './LocationPicker';
import ThumbnailPicker from './ThumbnailPicker';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '../SafeImage';

interface PostDetailsProps {
    onSubmit: () => void;
    finalSubmitLoading?: boolean;
    coverFileImage?: string | null;
    setCoverFileImage?: React.Dispatch<React.SetStateAction<string>>;
    setPostInformation: React.Dispatch<React.SetStateAction<{
        title: string,
        isForAll: boolean,
        scheduleDateTime: string,
        hashArray: string[],
        friendArray: string[],
        usersSelectedate: Date | null,
        collaborators: number[],
        isAllowComment: 0 | 1,
        location: string,
    }>>
    videoUrl?: string;
    isEditing?: boolean
    bgColor?: string
    // Add initial values props
    initialValues?: {
        postId?: number;
        caption?: string;
        isForAll?: boolean;
        scheduleDateTime?: string;
        isAllowComment?: boolean;
        location?: string;
        collaborators?: {userId: number, profileImage: string}[];
    };
}

const PostDetails: React.FC<PostDetailsProps> = ({ onSubmit, finalSubmitLoading, coverFileImage, setPostInformation, setCoverFileImage, videoUrl, initialValues, isEditing = false, bgColor = 'bg-secondary-bg-color' }) => {

    const [caption, setCaption] = useState<string>(initialValues?.caption || '');
    const captionRef = useRef<HTMLTextAreaElement>(null);
    const [hashtags, setHashtags] = useState<Set<string>>(new Set());
    const [friendArray, setFriendArray] = useState<string[]>([]);
    const [captionSuggestions, setCaptionSuggestions] = useState<HashtagList[] | FollowingModalData[]>([]);
    const [captionSuggestionsFilter, setCaptionSuggestionsFilter] = useState<string | null>(null);
    const [captionSuggestionsLoading, setCaptionSuggestionsLoading] = useState<boolean>(false);
    const [collaborators, setCollaborators] = useState<{userId: number, profileImage: string}[]>(initialValues?.collaborators || []);
    const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState<boolean>(false);
    const [location, setLocation] = useState<string>("");
    const [isLocationsOpen, setIsLocationsOpen] = useState<boolean>(false);
    const [isAllowComment, setIsAllowComment] = useState<boolean>(initialValues?.isAllowComment ?? true);
    const [isThumbnailPickerOpen, setIsThumbnailPickerOpen] = useState<boolean>(false);
    const [userId] = useLocalStorage<string>('userId', '');
    const currentDateTime = `${new Date().toLocaleDateString('en-CA')}T${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    const searchHashtagsCallback = useCallback(async (query: string) => {
        setCaptionSuggestionsLoading(true);
        const response = await hashtagSearch({ text: query });
        const list = Array.isArray(response.data) ? response.data : [];
        setCaptionSuggestions(list);
        setCaptionSuggestionsLoading(false);
    }, []);

    const searchTaggedUsersCallback = useCallback(async (query: string) => {
        setCaptionSuggestionsLoading(true);
        let data = {
            friendName: query,
            userId: Number(userId),
            isCreatePost: 0,
            page: 1,
            pageSize: 20,
            username: query ? query : null,
        };
        const response = await getFollowerList(data);
        const list = Array.isArray(response.data) ? response.data : [];
        const filteredList = list.filter((item) => item.isAllowTagging === 1);
        setCaptionSuggestions(filteredList);
        setCaptionSuggestionsLoading(false);
    }, [userId]);

    useEffect(() => {
        setPostInformation((prev) => ({
            ...prev,
            usersSelectedate: new Date(),
        }));
    }, [setPostInformation]);

    useEffect(()=>{
        if(initialValues && initialValues?.collaborators){
            setCollaborators(initialValues?.collaborators)
        }
    },[initialValues?.collaborators])

    useEffect(() => {
        if (caption.length > 0) {
            const extractedHashtags = caption.match(/#[\w]+/g) || [];
            const updatedHashtags = new Set(extractedHashtags);

            const extractedFriends = caption.match(/@[\w]+/g) || [];
            const updatedFriends = new Set(extractedFriends);

            setHashtags(updatedHashtags);
            setFriendArray(Array.from(updatedFriends));
        } else {
            setHashtags(new Set());
            setFriendArray([]);
            setCaptionSuggestions([])
        }
        setPostInformation((prev) => ({
            ...prev,
            title: caption,
        }));
    }, [caption]);

    useEffect(() => {
        setPostInformation((prev) => ({
            ...prev,
            collaborators: collaborators.map((collaborator) => collaborator.userId)
        }));
    }, [collaborators])

    useEffect(() => {
        setPostInformation((prev) => ({
            ...prev,
            location: location
        }));
    }, [location, setPostInformation]);

    useEffect(() => {
        const newVal = isAllowComment ? 1 : 0
        setPostInformation((prev) => ({
            ...prev,
            isAllowComment: newVal
        }));
    }, [isAllowComment, setPostInformation]);

    useEffect(() => {
        setPostInformation((prev) => ({
            ...prev,
            hashArray: Array.from(hashtags),
            friendArray: Array.from(friendArray),
        }));
    }, [hashtags, friendArray, setPostInformation]);

    const renderCaptionSuggestions = () => {
        const suggestionType = captionSuggestionsFilter ? captionSuggestionsFilter.charAt(0) : "";
        const handleSuggestionClick = (text: string) => {
            if (captionSuggestionsFilter === null) {
                return
            }
            const newCaption = caption.replace(new RegExp(`${captionSuggestionsFilter}(?!.*${captionSuggestionsFilter})`), text);
            setCaption(newCaption);
            setCaptionSuggestions([]);
            setCaptionSuggestionsFilter(null);

            setTimeout(() => {
                captionRef.current?.focus();
                if (captionRef.current) {
                    captionRef.current.setSelectionRange(newCaption.length + 1, newCaption.length + 1);
                }
            }, 0);
        }
        return (
            <div className="flex flex-col gap-2 overflow-y-auto h-48 absolute -bottom-[7rem] w-full p-2 bg-bg-color/10 backdrop-blur-sm rounded-md z-20">
                {captionSuggestionsLoading ? <LoadingSpinner />
                    :
                    captionSuggestions.map((item: any, index: number) => {
                        return (
                            <div
                                key={index}
                                className='bg-primary-bg-color rounded-md hover:bg-bg-color flex p-2 items-center gap-2 cursor-pointer'
                                onClick={(e) => handleSuggestionClick(suggestionType === "#" ? item.name : suggestionType === "@" ? `@${item.friendUserName}` : '')}
                            >
                                {suggestionType === '#' ? (
                                    <p className="text-text-color truncate">{item?.name}</p>
                                ) : suggestionType === '@' && (
                                    <>
                                        <Avatar
                                            src={item.userProfileImage}
                                            name={item.friendName}
                                            width="w-7"
                                            height="h-7" isMoreBorder={false}
                                        />
                                        <p className="text-text-color truncate">{item.friendUserName}</p>
                                    </>
                                )}
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    const handleCaptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setCaption(value);
        const matchTaggedUsers = RegExp(/@\w*$/).exec(value)
        const matchHashtags = RegExp(/#\w*$/).exec(value)

        if (matchTaggedUsers) {
            setCaptionSuggestionsFilter(matchTaggedUsers[0])
        } else if (matchHashtags) {
            setCaptionSuggestionsFilter(matchHashtags[0])
        } else {
            setCaptionSuggestionsFilter(null)
        }
    };

    const handleIsForAllChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        if (value === 'false') {
            setPostInformation((prev) => ({
                ...prev,
                isForAll: false,
            }));
            return
        }
        if (value === 'true') {
            setPostInformation((prev) => ({
                ...prev,
                isForAll: true,
            }));
            return
        }
        if (value === 'null') {
            setPostInformation((prev) => ({
                ...prev,
                isForAll: true,
            }));
            return
        }
    };

    const handleScheduleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        const usersSelectedate = new Date(inputValue.replace("T", " ") + ":00");
        if (isNaN(usersSelectedate.getTime())) {
            console.error("Invalid date parsed from input value:", inputValue);
            return;
        }

        const difference = calculateDateDifference(usersSelectedate);
        const formattedDifference = formatDateDifference(difference);
        setPostInformation((prev) => ({
            ...prev,
            scheduleDateTime: formattedDifference,
            usersSelectedate: usersSelectedate,
        }));
    };

    const calculateDateDifference = (selectedDate: Date) => {
        const now = new Date();
        const diffInMilliseconds = selectedDate.getTime() - now.getTime();

        const diffInSeconds = Math.max(diffInMilliseconds / 1000, 0);
        const days = Math.floor(diffInSeconds / (3600 * 24));
        const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);

        return { days, hours, minutes };
    };

    const formatDateDifference = (difference: { days: number, hours: number, minutes: number }) => {
        return `${difference.days} days ${difference.hours} hours ${difference.minutes} minutes`;
    };

    const handleSubmit = () => {
        onSubmit();
    };

    const closeCollaborators = () => {
        setIsCollaboratorsOpen(false);
    }
    const closeLocations = () => {
        setIsLocationsOpen(false);
    }

    const searchHashtags = async (query: string) => {
        setCaptionSuggestionsLoading(true);
        const response = await hashtagSearch({ text: query });
        const list = Array.isArray(response.data) ? response.data : [];
        setCaptionSuggestions(list);
        setCaptionSuggestionsLoading(false);
    }

    const searchTaggedUsers = async (query: string) => {
        setCaptionSuggestionsLoading(true);
        let data = {
            friendName: query,
            userId: Number(userId),
            isCreatePost: 0,
            page: 1,
            pageSize: 20,
            username: query ? query : null,
        };
        const response = await getFollowerList(data);
        const list = Array.isArray(response.data) ? response.data : [];
        setCaptionSuggestions(list);
        setCaptionSuggestionsLoading(false);
    }

    //highlight hashtags and tagged users in caption
    const highlightHashtags = (text: string) => {
        const escaped = text
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n$/g, "\n")

        return escaped
            .replace(/#\w+/g, (tag) => `<span class="text-blue-500">${tag}</span>`)
            .replace(/@\w+/g, (tag) => `<span class="text-blue-500">${tag}</span>`);
    }

    //fetch list of hashtags/users
    useEffect(() => {
        if (captionSuggestionsFilter !== null) {
            const type = captionSuggestionsFilter.charAt(0);
            const query = captionSuggestionsFilter.substring(1);
            if (type === '#' && query) {
                searchHashtagsCallback(query);
            } else if (type === '@' && query) {
                searchTaggedUsersCallback(query);
            }
        }
    }, [captionSuggestionsFilter, searchHashtagsCallback, searchTaggedUsersCallback]);

    // Always update isAllowComment when initialValues.isAllowComment changes
    useEffect(() => {
        setIsAllowComment(initialValues?.isAllowComment ?? true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues?.isAllowComment]);

    return (
        <div className={`overflow-y-scroll flex flex-col w-full ${bgColor} justify-between rounded-md`}>
            {finalSubmitLoading ? (
                <div className="flex justify-center items-center h-80">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className='h-full p-3 flex justify-center flex-col gap-2'>
                    {!isEditing && (
                        <div className="flex gap-2 items-center justify-between">
                            <label htmlFor="scheduleDateTime" className="text-sm text-text-color">Set Date & Time :</label>

                            <Input
                                type="datetime-local"
                                onChange={handleScheduleDateChange}
                                min={currentDateTime}
                                placeholder="Click here"
                                defaultValue={currentDateTime}
                                className="w-[50%]"
                            />
                        </div>
                    )}
                    <div className="flex gap-2 h-44 md:h-52">
                        <div
                            className="aspect-[9/16] w-1/2 rounded-lg overflow-hidden relative border-2 border-dashed border-border-color/30 hover:border-border-color/70"
                            onClick={() => setIsThumbnailPickerOpen(true)}
                        >
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="absolute inset-0">
                                    <SafeImage
                                        src={coverFileImage || ""}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                        width={300}
                                        height={200}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-bg-color/0 hover:bg-bg-color/50 hover:cursor-pointer transition-all rounded-md opacity-0 hover:opacity-100 flex flex-col items-center justify-center z-10">
                                    <BiImageAdd size={50} className="text-primary-text-color mb-2" />
                                    <p className="text-primary-text-color text-sm font-medium">Choose Thumbnail</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-1/2 flex flex-col gap-2 relative">
                            <div className="relative w-full h-64">
                                <textarea
                                    ref={captionRef}
                                    value={caption}
                                    onChange={handleCaptionChange}
                                    className="absolute top-0 left-0 w-full h-full p-2 text-transparent caret-text-color bg-transparent border border-border-color rounded-sm focus:outline-none resize-none text-sm leading-5 font-normal overflow-hidden"
                                    placeholder="Write a caption..."
                                    spellCheck="false"
                                    style={{
                                        fontFamily: 'inherit',
                                        letterSpacing: 'normal',
                                        wordSpacing: 'normal'
                                    }}
                                />
                                <div
                                    className="absolute top-0 left-0 w-full h-full p-2 whitespace-pre-wrap break-words text-sm text-text-color text-start pointer-events-none leading-5 font-normal overflow-hidden"
                                    dangerouslySetInnerHTML={{ __html: highlightHashtags(caption) }}
                                    style={{
                                        fontFamily: 'inherit',
                                        letterSpacing: 'normal',
                                        wordSpacing: 'normal'
                                    }}
                                />

                            </div>
                            {captionSuggestions.length > 0 && renderCaptionSuggestions()}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1 mt-3">

                            {/* collaborators */}
                            <div className="flex items-center justify-between px-2 py-1 linearInput border border-border-color rounded-md text-text-color cursor-pointer" onClick={() => setIsCollaboratorsOpen(true)}>
                                <div className='flex items-center gap-4'>
                                    <TbUsersPlus size={20} />
                                    <div className='flex flex-col'>
                                        <p className='font-semibold'>Collaborate with you friends</p>
                                        <p className='text-xs'>Collaborate with upto 9 friends</p>
                                    </div>
                                </div>
                                <FaChevronRight />
                            </div>

                            {/* isAllowComment Toggles */}
                            <div className="flex items-center justify-between px-2 py-1 linearInput border border-border-color rounded-md text-text-color cursor-pointer min-h-12">
                                <div className='flex items-center gap-4'>
                                    <FaRegCommentAlt size={20} />
                                    <p className='font-semibold'>Allow Comments</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsAllowComment(!isAllowComment)}
                                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isAllowComment ? 'linearBtn' : 'bg-secondary-bg-color'
                                            }`}
                                    >
                                        <div
                                            className={`bg-primary-bg-color w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isAllowComment ? 'translate-x-4' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>


                            <div className="flex items-center gap-4 justify-between">
                                <select onChange={handleIsForAllChange} className="rounded-sm linearInput w-full border px-2 py-3 text-text-color border-border-color bg-transparent text-sm focus:outline-none">
                                    <option className='bg-primary-bg-color text-text-color' value="">Who can watch this post?</option>
                                    <option className='bg-primary-bg-color text-text-color' defaultChecked value="true">Everyone</option>
                                    <option className='bg-primary-bg-color text-text-color' value="false">My Followers</option>
                                </select>
                            </div>

                            {/* location picker */}
                            <div className="flex items-center justify-between px-2 py-1 linearInput border border-border-color rounded-md text-text-color cursor-pointer" onClick={() => setIsLocationsOpen(true)}>
                                <div className='flex items-center gap-4'>
                                    <FaLocationDot size={20} />
                                    <div className='flex flex-col'>
                                        <p className='font-semibold'>Location</p>
                                        <p className='text-xs'>{location ? location : "Nearby Places"}</p>
                                    </div>
                                </div>
                                <FaChevronRight />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isCollaboratorsOpen && <Collaborators onClose={closeCollaborators} setCollaborators={setCollaborators} collaborators={collaborators}/>}
            {isLocationsOpen && <LocationPicker onClose={closeLocations} setLocation={setLocation} />}
            {isThumbnailPickerOpen && setCoverFileImage && videoUrl &&
                <ThumbnailPicker
                    setThumbnail={setCoverFileImage}
                    onClose={() => setIsThumbnailPickerOpen(false)}
                    videoUrl={videoUrl}
                    isFor="snip"
                    defaultThumbnail={coverFileImage || undefined}
                />
            }
            <div className="flex justify-end gap-4 p-2">
                {!isEditing && (
                    <Button
                        isLinearBorder={true}
                        onClick={handleSubmit}
                    >
                        Save to Draft
                    </Button>
                )}
                <Button
                    isLinearBtn={true}
                    onClick={handleSubmit}
                    className={isEditing ? 'w-full' : 'w-max'}
                >
                    <>
                        {finalSubmitLoading ? <ModerSpinner /> : (
                            <>
                                {isEditing ? "Update Post" : "Post"}
                            </>
                        )}
                    </>
                </Button>
            </div>
        </div>
    );
};

export default PostDetails;
