import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { HiOutlineReply } from "react-icons/hi";
import { LuMinus, LuPlus } from 'react-icons/lu';
import { IoAttach, IoChevronBackSharp, IoClose, IoSendSharp } from 'react-icons/io5';
import { MdMic, MdOutlineEmojiEmotions, MdStop } from 'react-icons/md';
import { FiPlusCircle } from 'react-icons/fi';
import { BsChatDotsFill } from 'react-icons/bs';
import toast from 'react-hot-toast';

import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { Stories, StoryData, emojiList } from '@/types/storyTypes';
import { formatTime, getDateHeader, getBlobDuration } from '@/utils/features';
import Avatar from '../Avatar/Avatar';
import CommonModalLayer from '../modal/CommonModalLayer';
import ImagePost from '../posts/ImagePost';
import SingleStoryModal from '../story/SingleStoryModal';
import { ChatUIProps, MessageState } from './chatsTypes';
import SharedVideoModal from './SharedVideoModal';
import { processStoryData } from './utils';
import { FaPlay } from "react-icons/fa";
import { useCreationOption } from '@/context/useCreationOption';
import { VideoList } from '@/models/videolist';
import useLocalStorage from '@/hooks/useLocalStorage';
import Button from '../shared/Button';
import useUserRedirection from '@/utils/userRedirection';
import { base64ToUint8Array, generateUUID, processVideo, uploadImage } from '@/utils/fileupload';
import { ModerSpinner } from '../LoadingSpinner';
import AudioMessage from './AudioMessage';
import SafeImage from '../shared/SafeImage';


const ChatUI: React.FC<ChatUIProps> = ({ setDeleteMessageId, onBack, userMessage, setInputMessage, setReaction, replyMessageDetails, setReplyMessageDetails, setShowReplyInput, showReplyInput, selectedUser, isPendingChat, setPendingChat, isDeniedChat, onApproveChat, onDenyChat, setMediaFileDetails }) => {
    const { setInAppSnipsData, setInAppFlixData, clearFlixData } = useInAppRedirection();
    const router = useRouter();
    const messageReactionsRef = useRef<HTMLDivElement>(null);
    const attachmentsRef = useRef<HTMLDivElement>(null);
    const inputMessage = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showFileShareModal, setShowFileShareModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openMessageAttachements, setOpenMessageAttachements] = useState<boolean>(false);
    const [isImagePostExpanded, setIsImagePostExpanded] = useState(false);
    const [isMediaUploading, setIsMediaUploading] = useState(false);

    //Audio recording and playing states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    const [state, setState] = useState<MessageState>({
        openImage: false,
        imagePost: null,
        openFullImage: false,
        fullImagePath: '',
        openSsupModal: false,
        isSharedVideoModal: false,
        sharedVideoSrc: '',
        ssupData: null,
        scale: 1,
        showEmoji: null,
        isHovered: false,
        hoveredMessageId: null,
        isScrolled: false,
    });
    const { toggleSsupCreate } = useCreationOption()
    const { sharedSsupData, setSharedSsupData } = useCreationOption();
    const redirectUser = useUserRedirection();
    
    const [userId] = useLocalStorage<string>('userId', '');
    const loggedInUser = parseInt(userId!);
    const messages = userMessage?.chatData || [];
    let lastDateHeader = '';
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    
    useEffect(() => {
        if (!state.isScrolled && messages.length > 0) {
            scrollToBottom()
            setState((prev) => ({ ...prev, isScrolled: true }))
        }
    }, [messages]);
    //set isScrolled false when selected user changes
    useEffect(() => {
        setState((prev) => ({ ...prev, isScrolled: false }))
    }, [selectedUser])

    // Close the options menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (messageReactionsRef.current && !messageReactionsRef.current.contains(e.target as Node)) {
                setState(prev => ({ ...prev, showEmoji: null }));
            }
            if (attachmentsRef.current && !attachmentsRef.current.contains(e.target as Node)) {
                setOpenMessageAttachements(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleZoom = {
        in: () => setState(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 3) })),
        out: () => setState(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 1) }))
    };

    const handleMessageSubmit = () => {
        if (inputMessage.current) {
            setInputMessage(inputMessage.current.value);
            inputMessage.current.value = '';
            setInputValue('');
            setShowReplyInput(false);
        }
    };

    const handleSharePost = (postDetails: any) => {
        setState(prev => ({
            ...prev,
            openImage: !prev.openImage,
            imagePost: JSON.parse(postDetails)
        }));
    };

    const handleMediaInteractions = {
        openUploadedPhoto: (imagePath: string) => {
            setState(prev => ({
                ...prev,
                fullImagePath: imagePath,
                openFullImage: !prev.openFullImage
            }));
        },
        openSharedVideoModal: (src: string) => {
            setState(prev => ({
                ...prev,
                sharedVideoSrc: src,
                isSharedVideoModal: true
            }));
        },
        openSsup: (storyData: any) => {
            setState(prev => ({
                ...prev,
                ssupData: storyData,
                openSsupModal: true
            }));
        },
        playAudio: (audioSrc: string | null, messageId: number | null) => {
            setState(prev => ({
                ...prev,
                audioSrc: audioSrc,
                isAudioPlaying: messageId,
            }));
        }
    };

    const handleRedirect = (type: string, data: any) => {
        if (type === "snips") {
            const snipsData = [JSON.parse(data)];
            setInAppSnipsData(snipsData);
            router.push('/home/snips');
        }
        if (type === "flix") {
            const flixData = JSON.parse(data);
            clearFlixData();
            setInAppFlixData(flixData);
            router.push(`/home/flix/${flixData.postId}`);
        }
    };

    const updatePost = (postId: number, property: string, isBeforeUpdate: number) => {
    };

    const handleStartVoiceRecording = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];
            recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingTime(0);
            // Start timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            recorder.start();
        }
    }

    const handleSendVoiceRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const duration = await getBlobDuration(blob);
                const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
                handleFileShare(file, duration);
                if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
                if (audioStreamRef.current) {
                    audioStreamRef.current.getTracks().forEach(track => track.stop());
                    audioStreamRef.current = null;
                }
                
            };
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleCancelVoiceRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => {
                setSelectedFile(null);
                if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
                if (audioStreamRef.current) {
                    audioStreamRef.current.getTracks().forEach(track => track.stop());
                    audioStreamRef.current = null;
                }
            };
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }

    const renderHeader = () => (
        <div className="sticky top-0 z-10 bg-bg-color border-b border-border-color">
            <div className="flex items-center h-[63px] px-4">
                <button
                    onClick={onBack}
                    className="md:hidden mr-3 text-text-color hover:opacity-80"
                >
                    <IoChevronBackSharp className="text-2xl" />
                </button>

                <div className="flex items-center space-x-3">
                    <div className="relative cursor-pointer" onClick={()=>redirectUser(userMessage.userData.chatUserId, `/home/users/${userMessage.userData.chatUserId}`)}>
                        <Avatar
                            src={userMessage?.userData?.chatUserProfileImage}
                            name={userMessage?.userData?.chatUserFullName || userMessage?.userData?.chatUserName}
                        />
                    </div>

                    <div>
                        <h3 className="font-medium text-text-color">
                            {userMessage?.userData?.chatUserFullName || userMessage?.userData?.chatUserName}
                        </h3>
                        {isPendingChat == true && (
                            <p className="text-xs text-text-color/60">Chat Request</p>
                        )}
                        {isDeniedChat == true && (
                            <p className="text-xs text-text-color/60">Denied Request</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPendingChatApproval = () => (
        <div className="flex flex-col h-full">
            {/* Messages area - show existing messages if any */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="flex flex-col">
                    {messages.slice().reverse().map((message, index) => {
                        const messageDateHeader = getDateHeader(message.messageTime);
                        let postDetails = null;

                        try {
                            const postDetailsString = message.postDetails ? JSON.stringify(message.postDetails) : null;
                            postDetails = postDetailsString ? JSON.parse(postDetailsString) : null;
                            postDetails = processStoryData(postDetails);
                        } catch (error) {
                            console.error("Error parsing JSON:", error);
                        }

                        const shouldShowDateHeader = messageDateHeader && messageDateHeader !== lastDateHeader;
                        if (shouldShowDateHeader) lastDateHeader = messageDateHeader;

                        return (
                            <div className='relative flex flex-col' key={index}>
                                {shouldShowDateHeader && (
                                    <div className='flex justify-center'>
                                        <span className="block text-center rounded-sm p-2 text-xs w-max text-text-color my-2">
                                            {messageDateHeader}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`flex flex-col my-3 relative w-full ${loggedInUser === message.userId ? 'justify-end items-end text-primary-text-color' : 'items-start text-text-color'}`}
                                >
                                    {message.replyId > 0 &&
                                        <div className='relative rounded-md max-w-[66%] mb-[-6px]'>
                                            {renderRepliedMessage(message?.repliedMessage, message.userId)}
                                        </div>}
                                    {renderMessageContent(message, postDetails, "basic")}
                                </div>
                                {state.showEmoji === message.messageId && (
                                    <div ref={messageReactionsRef}>
                                        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[300px] w-1/2 max-sm:w-64 grid grid-cols-6 gap-2 p-2 bg-bg-color border border-border-color shadow-md rounded-md overflow-y-auto'>
                                            {emojiList.map((emoji, index) => (
                                                <span
                                                    key={index}
                                                    className="text-lg text-center cursor-pointer rounded-md p-1"
                                                    onClick={() => {
                                                        setReaction({ messageId: message.messageId, reaction: emoji });
                                                        setState(prev => ({ ...prev, showEmoji: null }));
                                                    }}
                                                >
                                                    {emoji}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Bottom approval section */}
            <div className="border-t border-border-color bg-bg-color p-4">
                <div className="text-center space-y-4 max-w-md mx-auto">
                    <div className="flex justify-center mb-4">
                        <Avatar
                            src={userMessage?.userData?.chatUserProfileImage}
                            width="w-16"
                            height="h-16"
                        />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-text-color">
                            {userMessage?.userData?.chatUserFullName || userMessage?.userData?.chatUserName}
                        </h3>
                        <p className="text-text-color/80">
                            This person wants to text you. Would you like to start a conversation?
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={onDenyChat}
                            className="px-6 py-2 bg-secondary-bg-color text-primary-text-color rounded-md hover:bg-secondary-bg-color transition-colors"
                        >
                            Deny
                        </button>
                        <button
                            onClick={onApproveChat}
                            className="px-6 py-2 bg-blue-500 text-primary-text-color rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDeniedChatApproval = () => (
        <div className="flex flex-col h-full">
            {/* Messages area - show existing messages if any */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="flex flex-col">
                    {messages.slice().reverse().map((message, index) => {
                        const messageDateHeader = getDateHeader(message.messageTime);
                        let postDetails = null;

                        try {
                            const postDetailsString = message.postDetails ? JSON.stringify(message.postDetails) : null;
                            postDetails = postDetailsString ? JSON.parse(postDetailsString) : null;
                            postDetails = processStoryData(postDetails);
                        } catch (error) {
                            console.error("Error parsing JSON:", error);
                        }

                        const shouldShowDateHeader = messageDateHeader && messageDateHeader !== lastDateHeader;
                        if (shouldShowDateHeader) lastDateHeader = messageDateHeader;

                        return (
                            <div className='relative flex flex-col' key={index}>
                                {shouldShowDateHeader && (
                                    <div className='flex justify-center'>
                                        <span className="block text-center rounded-sm p-2 text-xs w-max text-text-color my-2">
                                            {messageDateHeader}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`flex flex-col my-3 relative w-full ${loggedInUser === message.userId ? 'justify-end items-end text-primary-text-color' : 'items-start text-text-color'}`}
                                >
                                    {message.replyId > 0 &&
                                        <div className='relative rounded-md max-w-[66%] mb-[-6px]'>
                                            {renderRepliedMessage(message?.repliedMessage, message.userId)}
                                        </div>}
                                    {renderMessageContent(message, postDetails, "basic")}

                                </div>
                                {state.showEmoji === message.messageId && (
                                    <div ref={messageReactionsRef}>
                                        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[300px] w-1/2 max-sm:w-64 grid grid-cols-6 gap-2 p-2 bg-bg-color border border-border-color shadow-md rounded-md overflow-y-auto'>
                                            {emojiList.map((emoji, index) => (
                                                <span
                                                    key={index}
                                                    className="text-lg text-center cursor-pointer rounded-md p-1"
                                                    onClick={() => {
                                                        setReaction({ messageId: message.messageId, reaction: emoji });
                                                        setState(prev => ({ ...prev, showEmoji: null }));
                                                    }}
                                                >
                                                    {emoji}
                                                </span>
                                            ))}
                                        </div>

                                    </div>
                                )}
                            </div>

                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Bottom approval section for denied chat */}
            <div className="border-t border-border-color bg-bg-color p-4">
                <div className="text-center space-y-4 max-w-md mx-auto">
                    <div className="flex justify-center mb-4">
                        <Avatar
                            src={userMessage?.userData?.chatUserProfileImage}
                            width="w-16"
                            height="h-16"
                        />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-text-color">
                            {userMessage?.userData?.chatUserFullName || userMessage?.userData?.chatUserName}
                        </h3>
                        <p className="text-text-color/80">
                            You have denied this person&apos;s chat request. Would you like to approve it now?
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={onApproveChat}
                            className="px-6 py-2 bg-blue-500 text-primary-text-color rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Approve Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );


    const handleHovermessage = (hovered: boolean, messageId?: string) => {
        if (hovered) {
            setState((prev) => ({ ...prev, hoveredMessageId: parseInt(messageId!) }))
        } else {
            setState((prev) => ({ ...prev, hoveredMessageId: null }))
        }
    }
    const renderMessageContent = (message: any, postDetails: any, isFor: "reply" | "showReply" | "basic") => { //"reply" for replied message "basic" for normal message "showReply" to show user which message they are replying to
        //calculate reaction position based on type = 6 (Ssup reaction) and if the message is sent by the logged in user or not
        const reactionPosition = message.type === "6" ? loggedInUser === message.userId ? "-bottom-5 -left-3" : "-bottom-5 -right-3" : loggedInUser === message.userId ? "bottom-0 left-0" : "bottom-0 right-0";
        return (
            <div className={`relative flex flex-col gap-10 ${isFor === "basic" && "max-w-[66%]"}`}>
                {message.type === "2" || message.type === "5" || message.type === "6" ? (
                    renderImageMessage(message, postDetails, isFor)
                ) : message.message == null && postDetails ? (
                    renderPostDetails(message, postDetails, isFor)
                ) : message.message == null && postDetails == null ? (
                    renderAudioMessage(message, isFor)
                ) : (
                    renderTextMessage(message, isFor)
                )}
                {isFor === "basic" && message.reaction && (
                    <div className={`p-1 pb-[2px] rounded-md absolute ${reactionPosition} translate-y-1/2 flex justify-center items-center z-20 ${loggedInUser === message.userId ? 'bg-onTertiary' : 'bg-tertiary'}`}>
                        {message.reaction}
                    </div>
                )}
            </div>
        );
    };

    const renderAudioMessage = (message: any, isFor: "reply" | "showReply" | "basic") => {
        const time = formatTime(message.messageTime)
        const dimensions = isFor === "basic" ? "w-[170px]" : isFor === "reply" ? "w-[150px]" : "w-full md:w-[150px]"

        return (
            <div 
                id={`message-${message.messageId}`}
                className={`py-1 ${loggedInUser === message.userId ? 'justify-end' : 'justify-start'} ${isFor === "basic" && "mb-2"}`} //extra margin
                onMouseEnter={() => isFor == "basic" && handleHovermessage(true, message.messageId)}
                onMouseLeave={() => isFor == "basic" && handleHovermessage(false)}
            >
                {isFor === "basic" && renderEmojiOption(message)}
                <div className={`rounded-md p-1 pr-2 ${loggedInUser === message.userId ? 'bg-tertiary' : 'bg-onTertiary'} ${dimensions}`}>
                    <AudioMessage
                        isLoggedInUser={loggedInUser === message.userId}
                        audioUrl={message.filePath}
                        duration={message.duration}
                        time={time}
                        isFor={isFor}
                    />
                </div>
            </div>
        )
    }
    const renderImageMessage = (message: any, postDetails: any, isFor: "reply" | "showReply" | "basic") => {
        const LineClamp = isFor === "basic" ? "" : isFor === "reply" ? "line-clamp-2" : "line-clamp-1"
        if ((message.type === "5" || message.type === "6") && postDetails) {
            const isStoryProcessed = Array.isArray(postDetails)
            if (!isStoryProcessed) { postDetails = JSON.parse(postDetails) }
            const dimensions = isFor === "basic" ? "w-[140px] h-[190px]" : isFor === "reply" ? "w-[80px] h-[100px]" : "w-[50px] h-[50px]"
            const isSsupMessage = message.message && isFor === "basic" && message.type === "5"
            const isSsupReaction = message.message && isFor === "basic" && message.type === "6"

            return (
                <div className={`flex flex-col ${loggedInUser === message.userId ? 'items-end' : 'items-start'} ${isSsupReaction && "mb-2"}`} //extra margin
                    onMouseEnter={() => isFor == "basic" && handleHovermessage(true, message.messageId)}
                    onMouseLeave={() => isFor == "basic" && handleHovermessage(false)}
                    id={`message-${message.messageId}`}
                >
                    {isFor === "basic" && renderEmojiOption(message)}

                    <div className={`relative p-1 border-2 border-border-color rounded-md w-max ${message.message && isFor === "basic" && 'mb-[-15px]'}`}>
                        {isStoryProcessed ? (
                            postDetails[0]?.stories[0]?.coverFile ? (
                                <div className={`relative ${dimensions}`}>
                                    <SafeImage
                                        onClick={() => handleMediaInteractions.openSsup(postDetails)}
                                        src={postDetails[0].stories[0].coverFile}
                                        alt="ssup cover"
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                            ) : (
                                <div className='flex items-center justify-center bg-primary-bg-color h-[150px] rounded-md w-[100px]'>
                                    <p className='text-text-color text-xs'>No Image </p>
                                </div>
                            )
                        ) : (
                            postDetails?.coverFile ? (
                                <SafeImage 
                                onClick={() => toast.error("Could not process Ssup data")}
                                src={postDetails.coverFile}
                                alt="ssup cover"
                                className='w-[100px] h-[150px] rounded-md my-3 cursor-pointer'
                               />
                            ) : (
                                <div className='flex items-center justify-center bg-primary-bg-color h-[150px] rounded-md w-[100px]'>
                                    <p className='text-text-color text-xs'>No Image </p>
                                </div>
                            )
                        )}
                        {isSsupReaction &&
                            //ssup reaction
                            <p className={`absolute bottom-0 translate-y-1/3 text-5xl break-words text-start ${LineClamp} ${loggedInUser === message.userId ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}>
                                {message.message.replace("snip", "ssup")}
                            </p>
                        }
                    </div>

                    {isSsupMessage && (
                        //ssup message (Text, mention)
                        <div className={`flex items-center justify-between min-w-[170px] gap-2 px-2 py-1 rounded-md z-10 ${loggedInUser === message.userId ? 'bg-tertiary' : 'bg-onTertiary'}`}>
                            <div className="flex flex-col flex-grow">
                                <p className={`text-sm break-words text-start ${LineClamp}`}>
                                    {message.message.replace("snip", "ssup")}
                                </p>
                                <p className="text-[10px] text-right">
                                    {formatTime(message.messageTime)}
                                </p>
                            </div>

                            {/* Only show Add to Ssup button if message text exactly matches the specified string */}
                            {message.userId !== loggedInUser && message.message === "Mentioned you in their snip" && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        // Parse the post details which is the Stories model
                                        let storiesData: Stories;
                                        let storiesDataInteractiveJson: VideoList[];

                                        try {
                                            // Split the string by *USERINFO* and take the first part
                                            const storiesDataStr = message.postDetails.split('_USERINFO_')[0];
                                            // Parse the JSON
                                            storiesData = JSON.parse(storiesDataStr);
                                            storiesDataInteractiveJson = JSON.parse(storiesData.interactiveVideo);
                                        } catch (error) {
                                            console.error("Error parsing stories data:", error);
                                            toast.error("Could not process the story");
                                            return;
                                        }

                                        // Null check before proceeding
                                        if (!storiesData) {
                                            toast.error("No story data available");
                                            return;
                                        }

                                        // Check if story has expired by comparing storyEndTime with current time
                                        if (storiesData.storyEndTime) {
                                            const storyEndTime = new Date(storiesData.storyEndTime);
                                            const currentTime = new Date();

                                            if (currentTime > storyEndTime) {
                                                // Story has expired
                                                toast.error("This Ssup is no longer available");
                                                return;
                                            }
                                        }

                                        // Extract user info
                                        const userInfoStr = message.postDetails.split('_USERINFO_')[1];
                                        let userInfo: any = null;
                                        try {
                                            userInfo = JSON.parse(userInfoStr);
} catch (error) {
                                            console.error("Error parsing user info:", error);
                                        }

                                        // Create StoryData from Stories and userInfo
                                        const createStoryData = () => {
                                            // Create a valid Stories array
                                            // If storiesData is already a Stories object, put it in an array
                                            const storiesArray: Stories[] = [{
                                                postId: storiesData.postId || 0,
                                                postTitle: storiesData.postTitle || '',
                                                languageId: storiesData.languageId || 0,
                                                coverFile: storiesData.coverFile || '',
                                                isAllowComment: storiesData.isAllowComment || 0,
                                                isPosted: storiesData.isPosted || 0,
                                                scheduleTime: storiesData.scheduleTime || '',
                                                isInteractive: storiesData.isInteractive || '',
                                                interactiveVideo: storiesData.interactiveVideo || '',
                                                isForInteractiveImage: (storiesDataInteractiveJson[0].path.toString().endsWith(".mp4") || storiesDataInteractiveJson![0].path.toString().endsWith("m3u8")) ? 0 : 1,
                                                isForInteractiveVideo: (storiesDataInteractiveJson[0].path.toString().endsWith(".mp4") || storiesDataInteractiveJson![0].path.toString().endsWith("m3u8")) ? 1 : 0,
                                                audioId: storiesData.audioId || 0,
                                                audioName: storiesData.audioName || '',
                                                audioDuration: storiesData.audioDuration || '15', // Default if not provided
                                                audioOwnerName: storiesData.audioOwnerName || '',
                                                audioCoverImage: storiesData.audioCoverImage || '',
                                                audioFile: storiesData.audioFile || '',
                                                viewCounts: storiesData.viewCounts || 0,
                                                isRead: storiesData.isRead || 0,
                                                storyEndTime: storiesData.storyEndTime || '',
                                                taggedUser: Array.isArray(storiesData.taggedUser) ? storiesData.taggedUser : [],
                                                ssupreaction: storiesData.ssupreaction || ''
                                            }];

                                            // Create a complete StoryData object
                                            const storyData: StoryData = {
                                                userId: userInfo?.userId || 0,
                                                userProfileImage: userInfo?.userProfileImage || '',
                                                userFullName: userInfo?.userFullName || '',
                                                userName: userInfo?.userName || '',
                                                userMobileNo: userInfo?.userMobileNo || '',
                                                userEmail: userInfo?.userEmail || '',
                                                isVerified: userInfo?.isVerified || 0,
                                                isMuted: userInfo?.isMuted || 0,
                                                stories: storiesArray,
                                                isFriend: userInfo?.isFriend || 0
                                            };
return storyData;
                                        };

                                        // Add the story data to ssup
                                        const handleAddToSsup = () => {
                                            const storyData = createStoryData();
                                            // Store in context
                                            setSharedSsupData(storyData);
                                            // Open Ssup creation
                                            toggleSsupCreate();
                                        };

                                        handleAddToSsup();
                                    }}
                                    className="bg-primary-bg-color text-text-color text-xs px-2 py-1 rounded-md hover:bg-hover-bg-color transition-colors"
                                >
                                    Add to Ssup
                                </button>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        const dimensions = isFor === "basic" ? "w-[140px] h-[140px]" : isFor === "reply" ? "w-[80px] h-[80px]" : "w-[50px] h-[50px]"
        return (
            <div className='relative w-full'
                onMouseEnter={() => isFor == "basic" && handleHovermessage(true, message.messageId)}
                onMouseLeave={() => isFor == "basic" && handleHovermessage(false)}
                id={`message-${message.messageId}`}
            >
                {isFor === "basic" && renderEmojiOption(message)}
                <div className={`relative ${dimensions} overflow-hidden rounded-md`}>
                <SafeImage 
                    onClick={() => handleMediaInteractions.openUploadedPhoto(
                    message.filePath ? message.filePath : postDetails[0].stories[0].coverFile
                    )}
                    src={message.filePath ? message.filePath : postDetails[0].stories[0].coverFile}
                    alt="Message image"
                    className="w-full h-full object-cover"
                />
                </div>
                {isFor === "basic" && <p className="text-[10px] absolute bottom-2 right-2 w-max">
                    {formatTime(message.messageTime)}
                </p>}
            </div>
        );
    };
    const renderPostDetails = (message: any, postDetails: any, isFor: "reply" | "showReply" | "basic") => {
        if (message.type === "4" && JSON.parse(postDetails).isForInteractiveImage === 1) {
            return renderInteractiveImage(message, isFor);
        }
        if (message.type === "7") {
            return renderFlixMessage(message, postDetails, isFor);
        }
        return message.type === "3" ?
            renderVideoMessage(message, postDetails, isFor) :
            renderSnipMessage(message, postDetails, isFor);
    };

    const renderFlixMessage = (message: any, postDetails: any, isFor: "reply" | "showReply" | "basic") => {
        const dimensions = isFor === "basic" ? "w-[210px] h-[112px]" : isFor === "reply" ? "w-[150px] h-[85px]" : "w-[89px] h-[50px]"
        const parsedPostDetails = postDetails ? JSON.parse(postDetails) : null;
        return (
            <div
                id={`message-${message.messageId}`}
                onMouseEnter={() => isFor == "basic" && handleHovermessage(true, message.messageId)}
                onMouseLeave={() => isFor == "basic" && handleHovermessage(false)}
                className='relative'
            >
                {isFor === "basic" && renderEmojiOption(message)}
                <div
                    onClick={() => handleRedirect("flix", postDetails)}
                    className="w-full"
                >
                    {message.filePath || postDetails?.coverFile ? (
                        <div className={`relative ${dimensions} aspect-video overflow-hidden rounded-md`}>
                            <SafeImage 
                                videoUrl={parsedPostDetails?.videoFile[0]}
                                src={message.filePath || parsedPostDetails?.coverFile}
                                alt="snip cover"
                                className='w-full h-full object-cover'
                            />
                        </div>
                    ) : (
                        <div className='flex items-center justify-center bg-primary-bg-color h-[150px] rounded-md w-[140px]'>
                            <p className='text-text-color text-xs'>No Image </p>
                        </div>
                    )}
                    {isFor === "basic" && <p className="text-[10px] absolute bottom-2 right-2 w-max">
                        {formatTime(message.messageTime)}
                    </p>}

                    <FaPlay className={`absolute top-0 right-0 w-[15%] ${isFor === "showReply" ? "m-1" : "m-2"}`} />
                </div>
            </div>
        )
    };

    const renderInteractiveImage = (message: any, isFor: "reply" | "showReply" | "basic") => {
        const dimensions = isFor === "basic" ? "w-[140px] h-[210px]" : isFor === "reply" ? "w-[80px] h-[100px]" : "w-[50px] h-[50px]"
        return (
            <div className='relative'
                onMouseEnter={() => isFor == "basic" && handleHovermessage(true, message.messageId)}
                onMouseLeave={() => isFor == "basic" && handleHovermessage(false)}
                id={`message-${message.messageId}`}
            >
                {isFor === "basic" && renderEmojiOption(message)}
                <div className={`relative ${dimensions} overflow-hidden rounded-md`}>
                <SafeImage
                onClick={() => handleSharePost(message.postDetails)}
                src={message.filePath}
                alt="share post cover"
                className='w-full h-full object-cover'
                />
                </div>
                {isFor === "basic" && <p className="text-[10px] absolute bottom-2 right-2 w-max">
                    {formatTime(message.messageTime)}
                </p>}
            </div>
        )
    };

    const renderVideoMessage = (message: any, postDetails: any, isFor: "reply" | "showReply" | "basic") => {
        const dimensions = isFor === "basic" ? "w-[140px] h-[140px]" : isFor === "reply" ? "w-[80px] h-[80px]" : "w-[50px] h-[50px]"
        return (
            <div
                id={`message-${message.messageId}`}
                onMouseEnter={() => isFor == "basic" && handleHovermessage(true, message.messageId)}
                onMouseLeave={() => isFor == "basic" && handleHovermessage(false)}
                className='relative'>
                {isFor === "basic" && renderEmojiOption(message)}
                <button onClick={() => handleMediaInteractions.openSharedVideoModal(message.filePath)} className="block leading-none align-top">
                    <div className={`relative ${dimensions} overflow-hidden rounded-md`}>
                    <SafeImage 
                        src={postDetails}
                        videoUrl={message.filePath}
                        alt="uploaded media cover"
                        className='w-full h-full object-cover'
                    />
                    </div>

                    <FaPlay className={`absolute top-0 right-0 w-[15%] ${isFor === "showReply" ? "m-1" : "m-2"}`} />

                    {isFor === "basic" && <p className="text-[10px] absolute bottom-2 right-2 w-max">
                        {formatTime(message.messageTime)}
                    </p>}
                </button>
            </div>
        )
    };

    const renderSnipMessage = (message: any, postDetails: any, isFor: "reply" | "showReply" | "basic") => {
        const dimensions = isFor === "basic" ? "w-[140px] h-[210px]" : isFor === "reply" ? "w-[80px] h-[100px]" : "w-[50px] h-[50px]"
        return (
            <div
                id={`message-${message.messageId}`}
                onMouseEnter={() => isFor == "basic" && handleHovermessage(true, message.messageId)}
                onMouseLeave={() => isFor == "basic" && handleHovermessage(false)}
                className='relative'
            >
                {isFor === "basic" && renderEmojiOption(message)}
                <div
                    onClick={() => handleRedirect("snips", postDetails)}
                    className="w-full"
                >
                    {message.filePath || postDetails?.coverFile ? (
                        <div className={`relative ${dimensions} overflow-hidden rounded-md`}>
                           <SafeImage 
                            src={message.filePath || postDetails?.coverFile}
                            alt="snip cover"
                            className='w-full h-full object-cover'
                            />
                        </div>
                    ) : (
                        <div className='flex items-center justify-center bg-primary-bg-color h-[150px] rounded-md w-[140px]'>
                            <p className='text-text-color text-xs'>No Image </p>
                        </div>
                    )}
                    {isFor === "basic" && <p className="text-[10px] absolute bottom-2 right-2 w-max">
                        {formatTime(message.messageTime)}
                    </p>}

                    <FaPlay className={`absolute top-0 right-0 w-[15%] ${isFor === "showReply" ? "m-1" : "m-2"}`} />
                </div>
            </div>
        )
    };
    const renderEmojiOption = (message: any) => {
        return (
            <>
                {state.hoveredMessageId === parseInt(message.messageId) && (
                    <div
                        className={`absolute -top-9 z-30 ${message.userId === loggedInUser ? "right-2" : "left-0"} flex gap-2 bg-secondary-bg-color p-1 rounded-sm`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {emojiList.slice(0, 4).map((emoji, index) => (
                            <button
                                key={index + 1}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setReaction({ messageId: message.messageId, reaction: emoji });
                                }}
                            >
                                <span>{emoji}</span>
                            </button>
                        ))}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShowReactions(message.messageId);
                            }}
                        >
                            <MdOutlineEmojiEmotions className='text-lg text-text-color' />
                        </button>
                        <button
                            className="border-l border-l-border-color pl-2 text-text-color text-lg p-1 rounded-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowReplyInput(true);
                                setReplyMessageDetails(message);
                            }}
                        >
                            <HiOutlineReply />
                        </button>
                        {message.userId === loggedInUser && (
                            <button
                                className="text-red-500 text-sm p-1 rounded-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteMessageId(message.messageId)
                                }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </>
        );
    };

    const renderRepliedMessage = (repliedMessage: any, messageUserId: any) => {
        if (!repliedMessage) return null;

        const scrollToMessage = () => {
            const element = document.getElementById(`message-${repliedMessage.messageId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };
        let postDetails = null;

        try {
            const postDetailsString = repliedMessage.postDetails ? JSON.stringify(repliedMessage.postDetails) : null;
            postDetails = postDetailsString ? JSON.parse(postDetailsString) : null;
            postDetails = processStoryData(postDetails);
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }

        return (
            <button
                onClick={scrollToMessage}
                className={`w-full flex flex-col gap-1 ${loggedInUser === messageUserId ? 'items-end' : 'items-start'}`}>
                <p
                    className="text-[10px] font-medium text-text-color"
                >
                    {repliedMessage.message ? "Replied to this message" : "Replied to this post"}
                </p>

                {repliedMessage.type === "5" && repliedMessage.message ? (
                    <div className="overflow-hidden min-w-0 p-2 max-w-full bg-secondary-bg-color rounded-md text-xs text-text-color">
                        <p className='break-words text-start line-clamp-2'>{repliedMessage.message.replace("snip", "ssup")}</p>
                    </div>
                ) : (
                    <div className="relative">
                        {renderMessageContent(repliedMessage, postDetails, "reply")}
                        <div className="absolute inset-0 bg-bg-color opacity-25 rounded-md" />
                    </div>
                )}
            </button>
        );
    };

    const renderTextMessage = (message: any, isFor: "reply" | "showReply" | "basic") => {
        const LineClamp = isFor === "basic" ? "" : isFor === "reply" ? "line-clamp-2" : "line-clamp-1"
        return (
            <div
                id={`message-${message.messageId}`}
                onMouseEnter={() => isFor == "basic" && handleHovermessage(true, message.messageId)}
                onMouseLeave={() => isFor == "basic" && handleHovermessage(false)}
                className='flex flex-col relative gap-1 min-w-[120px]'>
                {isFor === "basic" && renderEmojiOption(message)}
                {/* <div className={`flex gap-1 items-end ${message.userId === loggedInUser ? 'flex-row-reverse' : ''}`}>
                <Avatar
                    width='w-7'
                    height='h-7'
                    src={loggedInUser === message.userId ?
                        userMessage.userData?.userProfileImage :
                        userMessage.userData?.chatUserProfileImage
                    }
                    name={loggedInUser === message.userId ?
                        userMessage.userData?.userFullName :
                        userMessage.userData?.chatUserFullName
                    }
                />
                <p className='text-text-color text-[10px]'>
                    {loggedInUser === message.userId ?
                        userMessage.userData?.userFullName :
                        userMessage.userData?.chatUserFullName
                    }
                </p>
            </div> */}
                <div className={`flex flex-col gap-2 px-2 py-1 rounded-md ${loggedInUser === message.userId ? 'bg-tertiary' : 'bg-onTertiary'}`}>
                    <p className={`text-sm break-words text-start ${LineClamp}`}>
                        {message.message}
                    </p>
                    <p className="text-[10px] text-right">
                        {formatTime(message.messageTime)}
                    </p>
                </div>
            </div>
        )
    };

    const renderModals = () => (
        <div>
            {(state.openImage || state.openFullImage) && (
                <>
                    {state.openImage && (
                        <CommonModalLayer
                            width='w-max'
                            height='h-max'
                            onClose={() => setState(prev => ({ ...prev, openImage: false }))}
                            hideCloseButton={isImagePostExpanded}
                            bgColor=""
                        >
                            <div>
                                <ImagePost
                                    updatePost={updatePost}
                                    post={state.imagePost}
                                    containerWidth='w-max'
                                    imageheight='h-[300px]'
                                    imageWidth='w-[300px]'
                                    onExpandChange={setIsImagePostExpanded}
                                />
                            </div>
                        </CommonModalLayer>
                    )}
                    {state.openFullImage && state.fullImagePath && (
                        <CommonModalLayer
                            width='w-max'
                            height='h-max'
                            onClose={() => setState(prev => ({ ...prev, openFullImage: false }))}
                        >
                            <div className='relative overflow-hidden flex items-center justify-center rounded-md z-50 w-max'>
                            <SafeImage 
                                style={{ transform: `scale(${state.scale})` }}
                                src={state.fullImagePath}
                                alt="Message image"
                                className="h-96 md:h-[28rem] rounded-md object-cover"
                            />
                                <div className='absolute left-2 top-6 flex flex-col gap-2'>
                                    <button
                                        onClick={handleZoom.in}
                                        className='p-1 flex items-center justify-center rounded-full bg-bg-color cursor-pointer'
                                    >
                                        <LuPlus className="text-text-color0 text-text-color text-xl" />
                                    </button>
                                    <button
                                        onClick={handleZoom.out}
                                        className='p-1 flex items-center justify-center rounded-full bg-bg-color cursor-pointer'
                                    >
                                        <LuMinus className="text-text-color0 text-text-color text-xl" />
                                    </button>
                                </div>
                            </div>
                        </CommonModalLayer>
                    )}
                </>
            )}
            {state.openSsupModal && state.ssupData && (
                <SingleStoryModal
                    storyData={state.ssupData}
                    closeModal={() => setState(prev => ({ ...prev, openSsupModal: false }))}
                    isFromMessage={true}
                />
            )}
            {state.isSharedVideoModal && state.sharedVideoSrc && (
                <SharedVideoModal
                    src={state.sharedVideoSrc}
                    onClose={() => setState(prev => ({ ...prev, isSharedVideoModal: false }))}
                />
            )}
        </div>
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setShowFileShareModal(true);
            setOpenMessageAttachements(false); // Close attachments menu
        }
    };
    const handleFileShare = async (file: File, audioDuration = 0) => {
        setIsMediaUploading(true);
        try{
            if (file) {
                const isImage = file.type.startsWith('image/')
                const isVideo = file.type.startsWith('video/');
                const isAudio = file.type.startsWith('audio/');
                if(isImage){
                    const url = `Bigshorts/ChatMedia/${generateUUID()}_${file.name}`;
                    const uploadedMediaUrl = await uploadImage(file, "InteractiveImages", false, url)
                    if(!uploadedMediaUrl) {
                        toast.error("Failed to upload image. Please try again.");
                        return;
                    }
                    setMediaFileDetails({filePath: uploadedMediaUrl, postDetails: null, audioDuration: null, type: 2});
                }
    
                if(isVideo){
                    let videoUrl;
                    let coverUrl;
                    let duration;
                    const url = `Bigshorts/ChatMedia/${generateUUID()}_${file.name}`;
                    const res = await processVideo(file, "InteractiveVideos", false, url);
                    if(!res || !res.videoUrl || !res.coverImageBuffer || !res.coverImageFileName) {
                        toast.error("Failed to upload video. Please try again.");
                        return;
                    }

                    const imageBytes = base64ToUint8Array(res.coverImageBuffer);
                    const imageFile = new File([imageBytes], res.coverImageFileName, { type: 'image/jpeg' });
                    const imageUrl = await uploadImage(imageFile, "coverFiles", true);
                    if(!imageUrl) {
                        toast.error("Failed to upload cover image. Please try again.");
                        return;
                    }
                    coverUrl = imageUrl;

                    duration = res.audioDuration || null;
                    videoUrl = res.videoUrl;

                    setMediaFileDetails({filePath: videoUrl, postDetails: coverUrl, audioDuration: duration, type: 3});
                }
                if(isAudio){
                    const url = `Bigshorts/ChatMedia/${generateUUID()}_${file.name}`;
                    const audioUrl = await uploadImage(file, "InteractiveVideos", false, url)
                    if(!audioUrl) {
                        toast.error("Failed to upload audio. Please try again.");
                        return;
                    }
                    const durationString = audioDuration!==0 ? audioDuration.toString() : recordingTime.toString();
                    setMediaFileDetails({filePath: audioUrl, postDetails: null, audioDuration: durationString, type: 1});
                }

            } else {
                toast.error("No file selected. Please choose a file to share.");
                return;
            }
        }catch (error) {
            toast.error("Failed to share file. Please try again.");
        }finally{
            setIsMediaUploading(false);
            // Reset state
            setSelectedFile(null);
            setShowFileShareModal(false);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    const handleCancelFileShare = () => {
        setSelectedFile(null);
        setShowFileShareModal(false);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const renderFileShareModal = () => {
        if (!showFileShareModal || !selectedFile) return null;

        const isImage = selectedFile.type.startsWith('image/');
        const isVideo = selectedFile.type.startsWith('video/');
        const fileUrl = URL.createObjectURL(selectedFile);

        return (
            <CommonModalLayer
                width='w-max'
                height='h-max'
                onClose={handleCancelFileShare}
            >
                <div className="bg-bg-color rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-text-color mb-4">Share File</h3>

                    {/* File Preview */}
                    <div className="mb-4 flex justify-center">
                        {isImage && (
                            <SafeImage
                                src={fileUrl}
                                alt="Preview"
                                className="max-w-full max-h-64 rounded-md object-contain"
                            />
                        )}
                        {isVideo && (
                            <video
                                src={fileUrl}
                                className="max-w-full max-h-64 rounded-md"
                                controls
                            />
                        )}
                        {!isImage && !isVideo && (
                            <div className="bg-secondary-bg-color p-8 rounded-md text-center">
                                <IoAttach className="w-12 h-12 mx-auto mb-2 text-text-color" />
                                <p className="text-text-color">{selectedFile.name}</p>
                                <p className="text-sm text-primary-text-color">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        )}
                    </div>

                    {/* File Info */}
                    <div className="mb-4 text-center">
                        <p className="text-sm text-text-color truncate">{selectedFile.name}</p>
                        <p className="text-xs text-primary-text-color">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            isLinearBorder={true}
                            onClick={handleCancelFileShare}
                            className="px-4 py-2 bg-secondary-bg-color text-text-color rounded-md hover:bg-hover-bg-color transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            isLinearBtn={true}
                            onClick={()=>handleFileShare(selectedFile)}
                        >
                            {isMediaUploading ? 
                            <ModerSpinner/> : 
                            <div className='flex items-center gap-2'>
                                <IoSendSharp className="w-4 h-4" />
                                Share
                            </div>
                            }
                        </Button>
                    </div>
                </div>
            </CommonModalLayer>
        );
    };
    const renderInputArea = () => {
        let postDetails = null;
        if (isPendingChat == true) {
            return null;
        }
        if (showReplyInput) {
            try {
                const postDetailsString = replyMessageDetails.postDetails ? JSON.stringify(replyMessageDetails.postDetails) : null;
                postDetails = postDetailsString ? JSON.parse(postDetailsString) : null;
                postDetails = processStoryData(postDetails);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        }
        return (
            <div className='flex flex-col items-center relative justify-center m-2 rounded-md p-1 bg-bg-color'>
                {showReplyInput && (
                    <div className="flex w-full gap-2">
                        <div className='rounded-tl-md rounded-tr-md w-full relative p-2 flex bg-secondary-bg-color mb-[-4px] pb-[4px] items-center'>
                            <div className={`max-w-[50%] mr-2 ${loggedInUser === replyMessageDetails.userId ? 'text-text-color' : 'text-primary-text-color'}`}>
                                {renderMessageContent(replyMessageDetails, postDetails, "showReply")}
                            </div>
                            <button
                                className='absolute top-1 right-1 text-text-color text-sm'
                                onClick={() => {
                                    setShowReplyInput(false)
                                    setReplyMessageDetails(null)
                                }}>
                                <IoClose />
                            </button>

                            <p className='text-xs'>Replying to this message</p>
                        </div>
                        <div
                            className="flex-shrink-0 w-[50px] h-[50px]"
                        >
                        </div>
                    </div>
                )}
                <div className='flex w-full gap-2'>
                    <div className='flex w-full bg-onTertiary  rounded-md justify-between'>
                        {/* Timer and mic icon overlay when recording */}
                        {isRecording ?(
                            <span className="flex items-center gap-2 z-10 pointer-events-none ml-2 text-message-primary-text-color">
                                <MdMic className='animate-pulse text-red-500' size={20} />
                                {`${String(Math.floor(recordingTime / 60)).padStart(2, '0')}:${String(recordingTime % 60).padStart(2, '0')}`}
                            </span>
                        ):(
                            <input
                                type="text"
                                ref={inputMessage}
                                value={inputValue}
                                onChange={() => setInputValue(inputMessage.current?.value || "")}
                                placeholder="Type a message..."
                                className="flex-1 py-2 pl-2 rounded-md border-none bg-onTertiary text-message-primary-text-color placeholder:text-message-primary-text-color focus:outline-none focus:border-primary-border-color"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleMessageSubmit();
                                    }
                                }}
                            />
                        )}
                        {!isRecording && 
                        <div className={`flex justify-between items-center gap-4 border-l border-border-color relative text-message-primary-text-color`} ref={attachmentsRef}>
                            <button
                                className={`hover:text-message-text-color p-2 sm:hidden`}
                                onClick={(e) => {
                                    const icon = e.currentTarget.querySelector('svg');
                                    icon?.classList.add('animate-spin');
                                    setOpenMessageAttachements((prev) => !prev);

                                    setTimeout(() => {
                                        icon?.classList.remove('animate-spin');
                                    }, 500);

                                }}
                            >
                                <FiPlusCircle className="w-5 h-5 transition-transform duration-500" />
                            </button>
                            <div className={`flex gap-2 flex-col sm:flex-row max-sm:absolute right-0 bottom-[3rem] bg-onTertiary overflow-hidden transition-all duration-500 ease-in-out ${openMessageAttachements ? 'max-h-[200px] opacity-100' : 'max-sm:max-h-0 max-sm:opacity-0'}`}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="hover:text-message-text-color p-2 relative"
                                >
                                    <IoAttach className="w-5 h-5" />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*,video/*"
                                        onChange={handleFileSelect}
                                    />
                                </button>
                            </div>
                        </div>}
                        {isRecording && (
                            <button
                                onClick={handleCancelVoiceRecording}
                                className="text-message-primary-text-color mr-5"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    {/* Comment this button and Uncomment the below code to enable voice recording feature */}

                    <button
                        onClick={handleMessageSubmit}
                        className="flex-shrink-0 w-[50px] h-[50px] flex justify-center items-center rounded-full bg-onTertiary hover:bg-hover-bg-color text-message-primary-text-color hover:text-message-text-color transition-colors"
                    >
                        <IoSendSharp className="w-5 h-5" />
                    </button>

                    {/* {inputValue.trim() ? (
                        <button
                            onClick={handleMessageSubmit}
                            className="flex-shrink-0 w-[50px] h-[50px] flex justify-center items-center rounded-full bg-onTertiary hover:bg-hover-bg-color text-message-primary-text-color hover:text-message-text-color transition-colors"
                        >
                            <IoSendSharp className="w-5 h-5" />
                        </button>
                    ) : isRecording ? (
                        <button
                            onClick={handleSendVoiceRecording}
                            className="flex-shrink-0 w-[50px] h-[50px] flex justify-center items-center rounded-full bg-onTertiary hover:bg-hover-bg-color text-message-primary-text-color hover:text-message-text-color transition-colors"
                        >
                            <IoSendSharp className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleStartVoiceRecording}
                            className="flex-shrink-0 w-[50px] h-[50px] flex justify-center items-center rounded-full bg-onTertiary hover:bg-hover-bg-color text-message-primary-text-color hover:text-message-text-color transition-colors"
                        >
                            <MdMic className="w-5 h-5" />
                        </button>
                    )} */}
                </div>
            </div>
        )
    };

    const NoMessagesScreen = () => {
        return (
            <div className="flex flex-col justify-center items-center text-text-color h-full">
                <BsChatDotsFill size={50} />
                <p className='text-lg'>No Messages Yet</p>
                <p className='text-sm'>Recieve or Send message, and it will appear here</p>
            </div>
        )
    }

    const handleShowReactions = (messageId: number) => {
        setState((prev) => ({ ...prev, showEmoji: messageId }))
    }
    return (
        <div className="flex flex-col h-full md:h-screen bg-bg-color md:border-l border-border-color">
            {renderHeader()}

            {isPendingChat == true ? (
                renderPendingChatApproval()
            ) : isDeniedChat == true ? (
                renderDeniedChatApproval()
            ) : messages.length === 0 ? (
                <NoMessagesScreen />
            ) : (
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="flex flex-col">
                        {messages.slice().reverse().map((message, index) => {
                            const messageDateHeader = getDateHeader(message.messageTime);
                            let postDetails = null;

                            try {
                                const postDetailsString = message.postDetails ? JSON.stringify(message.postDetails) : null;
                                postDetails = postDetailsString ? JSON.parse(postDetailsString) : null;
                                postDetails = processStoryData(postDetails);
                            } catch (error) {
                                console.error("Error parsing JSON:", error);
                            }

                            const shouldShowDateHeader = messageDateHeader && messageDateHeader !== lastDateHeader;
                            if (shouldShowDateHeader) lastDateHeader = messageDateHeader;

                            return (
                                <div className='relative flex flex-col' key={index}>
                                    {shouldShowDateHeader && (
                                        <div className='flex justify-center'>
                                            <span className="block text-center rounded-sm p-2 text-xs w-max text-text-color my-2">
                                                {messageDateHeader}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={`flex flex-col my-3 relative w-full ${loggedInUser === message.userId ? 'justify-end items-end text-message-text-color' : 'items-start text-message-primary-text-color'}`}
                                    >
                                        {message.replyId > 0 &&
                                            <div className='relative rounded-md max-w-[66%] mb-[-6px]'>
                                                {renderRepliedMessage(message?.repliedMessage, message.userId)}
                                            </div>}
                                        {renderMessageContent(message, postDetails, "basic")}

                                    </div>
                                    {state.showEmoji === message.messageId && (
                                        <div ref={messageReactionsRef}>
                                            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[300px] w-1/2 max-sm:w-64 grid grid-cols-6 gap-2 p-2 bg-bg-color border border-border-color shadow-md rounded-md overflow-y-auto'>
                                                {emojiList.map((emoji, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-lg text-center cursor-pointer rounded-md p-1"
                                                        onClick={() => {
                                                            setReaction({ messageId: message.messageId, reaction: emoji });
                                                            setState(prev => ({ ...prev, showEmoji: null }));
                                                        }}
                                                    >
                                                        {emoji}
                                                    </span>
                                                ))}
                                            </div>

                                        </div>
                                    )}
                                </div>

                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            {renderFileShareModal()}
            {renderModals()}
            {renderInputArea()}
        </div>
    );
};

export default ChatUI;