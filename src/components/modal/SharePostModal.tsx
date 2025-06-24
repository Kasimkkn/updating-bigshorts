import dummyUser from '@/assets/user.png';
import { useCreationOption } from '@/context/useCreationOption';
import useLocalStorage from '@/hooks/useLocalStorage';
import { savePostShare } from '@/services/savepostshare';
import { SocketEncryptionService } from '@/services/socketEncryptionService';
import { MessageUserListData, MessageUserListResponse } from '@/types/messageTypes';
import { getAuthToken } from '@/utils/getAuthtoken';
import { generateLongFormShareLink, generatePostShareLink } from '@/utils/secureLinkHandler';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoSendSharp } from 'react-icons/io5';
import { MdContentCopy } from "react-icons/md";
import { RiRadioButtonLine } from "react-icons/ri";
import { TbBrandStorybook } from "react-icons/tb";
import io, { Socket } from 'socket.io-client';
import { ModerSpinner } from '../LoadingSpinner';
import Button from '../shared/Button';
import Input from '../shared/Input';
import { SharePostModalSkeleton } from '../Skeletons/Skeletons';
import CommonModalLayer from './CommonModalLayer';
import SafeImage from '../shared/SafeImage';

const SOCKET_URL = "https://api.bigshorts.social/v1";


interface ShareModalProps {
    postId: number;
    onClose: () => void;
    type?: number;
    data?: any;
    userInfo?: any;
    updatePost?: (postId: number, property: string, isBeforeUpdate: number) => void
    isModal?: boolean
}

const SharePostModal = ({ onClose, postId, type = 2, data, updatePost, userInfo, isModal = true }: ShareModalProps) => {
    const { toggleSsupCreate, setSharedPostData } = useCreationOption();
    const [selectedUsers, setSelectedUsers] = useState<MessageUserListData[]>([]);
    const [searchUser, setSearchUser] = useState('');
    const [listOfUser, setListOfUser] = useState<MessageUserListData[]>([]);
    const [isSharing, setIsSharing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userId] = useLocalStorage<string>('userId', '');
    const loggedInUser = parseInt(userId!);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);

    const socketRef = useRef<Socket | null>(null);
    const encryption = useRef(new SocketEncryptionService()).current;

    // Add useEffect to get auth token
    useEffect(() => {
        const fetchAuthToken = async () => {
            const token = await getAuthToken();
            setAuthToken(token);
        };
        fetchAuthToken();
    }, []);

    const isFlix = !!data?.genreId;
    const shareOptions = [
        { text: "Copy", icon: <MdContentCopy size={30} /> },
        ...(!isFlix ? [{ text: "Ssup", icon: <TbBrandStorybook size={30} className="rounded" /> }] : []), //Hinding ssup option for flix
    ];

    const shareStoryPayload = `${JSON.stringify(data)}_USERINFO_${JSON.stringify(userInfo)}`

    const filteredUser = listOfUser?.filter(user =>
        !searchUser || user?.userName.toLowerCase().includes(searchUser.toLowerCase())
    );

    useEffect(() => {
        if (!authToken) return;

        if (!isSharing) {
            setIsLoading(true);  //set isLoading true only when isSharing is not true to avoid flickering after clicking share
        }
        const socket = io(process.env.NEXT_PUBLIC_API_SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: false,
            extraHeaders: {
                'foo': 'bar'
            },
            query: {
                userToken: `Bearer ${authToken}`
            }
        });

        socketRef.current = socket;
        socket.connect();
        encryption.generateKeypair();

        socket.on('connect', () => {
        })
        socket.on('connect_error', () => {
            toast.error("Connection error occurred");
        });
        socket.on('disconnect', (reason) => {
        });

        socket.on('ecdh_key_exchange', (data) => {
            encryption.handleServerKeyExchange(data);
            const clientPubHex = encryption.getClientPublicKeyHex();
            socket.emit('ecdh_client_key', { clientPublicKey: clientPubHex });
        });

        socket.on('ecdh_complete', () => {
            emitEncrypted('user_chat_list', {
                userId: loggedInUser,
                userToken: `Bearer ${authToken}`,
                pageNo: 1,
            });
        });

        socket.on('user_chat_list', (data: MessageUserListResponse) => {
            handleEncryptedResponse('user_chat_list', data, (response: MessageUserListResponse) => {
                setListOfUser(response.data || []);
                setIsLoading(false);
            });
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('ecdh_key_exchange');
            socket.off('ecdh_complete');
            socket.off('user_chat_list');
            socket.off('connect_error');
            if (!isSharing) {
                socket.disconnect();
                socketRef.current = null;
            }
        };
    }, [authToken, loggedInUser, isSharing]);


    const handleAddToSsup = () => {
        // Store the entire post data in context
        setSharedPostData(data);
        // Open Ssup creation
        toggleSsupCreate();
    };


    const toggleUser = (user: MessageUserListData) => {
        setSelectedUsers(prev =>
            prev.some(u => u.userId === user.userId)
                ? prev?.filter(u => u.userId !== user.userId)
                : [...prev, user]
        );
    };

    const downloadMedia = () => {
        const link = document.createElement('a');
        link.href = data?.videoFile[0];
        if (!link.href) {
            toast.error("This media is not available for download")
            return
        };
        link.download = "bigshorts-post"; // Filename to be changed if known
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyLink = (postId: string): void => {
        if (typeof window === 'undefined') {
            toast.error("Unable to copy link");
            return;
        }

        try {
            let linkType = data.isForInteractiveVideo === 1 ? 'flix' : 'snip';

            // Check if isFlix variable exists and is true, then set linkType to longform
            if (typeof isFlix !== 'undefined' && isFlix === true) {
                linkType = 'longform';
            }

            const url = linkType === 'longform'
                ? generateLongFormShareLink(postId)
                : generatePostShareLink(postId);

            if (url) {
                navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard");
            } else {
                toast.error("Unable to generate share link");
            }
        } catch (error) {
            console.error('Error generating share link:', error);
            toast.error("Unable to copy link");
        }
    };

    const handleOptionClick = (optionName: string) => {
        switch (optionName) {
            case 'Ssup':
                handleAddToSsup();
                break;
            case 'Copy':
                handleCopyLink(postId.toString());
                break;
            /*case 'Save':
                downloadMedia();
                break;*/
        }
        onClose();
    }

    const saveShare = async (postId: number, platform: string) => {
        try {
            await savePostShare({
                postId,
                platform,
                isNormalShare: 1,
                isWhatsappShare: 0
            });
        } catch (error) {
            throw new Error("Failed to save share");
        }
    };

    const handleShare = async () => {
        if (!socketRef.current || selectedUsers.length === 0) {
            toast.error("Unable to share at this moment");
            return;
        }

        setIsSharing(true);

        try {
            await Promise.all(
                selectedUsers.map(async (user) => {
                    await saveShare(postId, "bigshorts");

                    return new Promise<void>((resolve, reject) => {
                        if (!socketRef.current) {
                            reject(new Error("Socket not connected"));
                            return;
                        }

                        // Define handlers so we can remove them after resolving
                        const handleLatestMessage = (data: any) => {
                            cleanup();
                            resolve();
                        };
                        const handleSendChatMessage = (data: any) => {
                            cleanup();
                            resolve();
                        };
                        // Remove listeners after one is called
                        const cleanup = () => {
                            socketRef.current?.off('latest_message', handleLatestMessage);
                            socketRef.current?.off('send_chat_message_updated', handleSendChatMessage);
                        };

                        socketRef.current.on('latest_message', handleLatestMessage);
                        socketRef.current.on('send_chat_message', handleSendChatMessage);

                        (async () => {
                            try {
                                await emitEncrypted('join_chat', getJoinChatParams(user.chatId));
                                await emitEncrypted("send_chat_message_updated", {
                                    userId: loggedInUser,
                                    userToken: `Bearer ${authToken}`,
                                    pageNo: 1,
                                    chatId: user.chatId,
                                    chatUserId: user.userId,
                                    filePath: data.coverFile,
                                    type: type,
                                    message: '',
                                    postDetails: type === 5 ? shareStoryPayload : JSON.stringify(data),
                                });
                            } catch (error) {
                                cleanup();
                                reject(new Error(error instanceof Error ? error.message : 'An unknown error occurred'));
                            }
                        })();
                        setTimeout(() => {
                            cleanup();
                            reject(new Error("No response from server"));
                        }, 10000); // 10 seconds
                    });
                })
            );

            //updatePost && updatePost(postId, 'share', selectedUsers.length)   Not showing share count anymore

            toast.success("Shared successfully");
            setSelectedUsers([]);
            socketRef.current?.disconnect();
            socketRef.current = null;
            setIsSharing(false);
            onClose();
        } catch (error) {
            console.error('Share operation failed:', error);
            toast.error("Failed to share");
            setIsSharing(false);
        }
    };
    //helper function to emit encrypted data
    async function emitEncrypted(eventName: string, payload: Record<string, any>) {
        if (!encryption.isHandshakeComplete || !socketRef.current) return;
        try {
            const encryptedPayload = await encryption.encrypt(payload);
            if (encryptedPayload.data) {
                socketRef.current.emit(eventName, encryptedPayload);
            }
        } catch (e) {
            console.error(`Failed to encrypt/emit ${eventName}:`, e);
        }
    }

    // Helper function to handle encrypted responses
    async function handleEncryptedResponse(
        eventName: string,
        socketResponse: any,
        onSuccess: (data: any) => void
    ) {
        if (!encryption.isHandshakeComplete) return;

        try {
            let decrypted;
            if (socketResponse?.isEncrypted) {
                decrypted = await encryption.decrypt(socketResponse);
                onSuccess(decrypted);
            } else if (typeof socketResponse === 'string') {
                decrypted = JSON.parse(socketResponse);
                onSuccess(decrypted);
            } else {
                decrypted = socketResponse;
                onSuccess(decrypted);
            }
        } catch (e) {
            console.error(`Error handling ${eventName}:`, e);
        }
    }

    const getJoinChatParams = (chatId: number | null) => {
        const userToken = `Bearer ${authToken}`;
        return {
            'userToken': userToken,
            'chatId': chatId,
        };
    }

    return (
        <CommonModalLayer width={isModal ? 'max-w-md' : 'xl:w-full max-xl:max-w-md'} height={isModal ? 'h-[70vh]' : 'h-[70vh] xl:h-full'} onClose={onClose}
            isModal={false}
            hideCloseButtonOnMobile={true}
        >
            <div className="bg-primary-bg-color h-full max-w-4xl md:p-4 md:rounded-md w-full flex flex-col">
                <span className="font-semibold p-2">{selectedUsers.length} Selected</span>

                <div className="m-2">
                    <Input
                        type="text"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        placeholder="Search"
                        className="w-full p-2 bg-primary-bg-color outline-none"
                    />
                </div>

                <div className='flex-1 flex flex-col justify-between overflow-hidden'>
                    {isLoading ? (
                        <SharePostModalSkeleton />
                    ) : (
                        <div className='grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto relative h-full p-2'>
                            {filteredUser?.map((user) => (
                                <div
                                    key={user.userId}
                                    className={`relative cursor-pointer flex flex-col gap-1 p-2 overflow-hidden h-max w-full items-center justify-center 
                                    ${selectedUsers.some((u) => u.userId === user.userId) ? 'border-solid border-red border-2' : ''}`}
                                    onClick={() => toggleUser(user)}
                                >
                                    <div className="w-full relative">
                                        <SafeImage
                                            onContextMenu={(e) => e.preventDefault()}
                                            src={user.userProfileImage || (typeof dummyUser === 'string' ? dummyUser : dummyUser.src)}
                                            alt={`cover-${user.userName}`}
                                            className="w-full aspect-[3/4] object-cover rounded-md"
                                        />
                                    </div>
                                    {/* <Avatar src={user.userProfileImage} name={user.userFullName || user.userName} /> */}
                                    <p className='text-sm text-center w-full max-w-full truncate'>{user.userFullName || user.userName}</p>
                                    {user.isOnline ? <RiRadioButtonLine color='green' className='absolute left-0 top-0' /> : null}
                                </div>
                            ))}
                        </div>)}

                    <div className='flex w-full gap-2 bg-primary-bg-color rounded-b-md justify-around relative'>
                        {selectedUsers.length > 0 && (
                            <div className="absolute top-0 right-0 p-4 -translate-y-full">
                                <Button
                                    isLinearBtn={true}
                                    className='p-2 rounded-full'
                                    onCLick={handleShare}
                                    disabled={isSharing}
                                >
                                    {isSharing ? <ModerSpinner /> : <IoSendSharp />}
                                </Button>
                            </div>
                        )}
                        {shareOptions.map((option, index) => (
                            <div
                                key={index}
                                className='flex flex-col gap-1 p-2 items-center hover:cursor-pointer'
                                onClick={() => handleOptionClick(option.text)}
                            >
                                {option.icon}
                                <p className='text-sm text-center'>{option.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </CommonModalLayer>
    );
};

export default SharePostModal;