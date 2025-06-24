import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import CommonModalLayer from '../modal/CommonModalLayer';
import Avatar from '../Avatar/Avatar';
import { MessageUserListData } from '@/types/messageTypes';
import { HiArrowLeft } from 'react-icons/hi2';
import { SocketEncryptionService } from '@/services/socketEncryptionService';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getAuthToken } from '@/utils/getAuthtoken';

interface ChatRequestsModalProps {
    isOpen: boolean;
    onClose: () => void;
    handleUserSelect: (chatId: number | null, userId: number) => void;
    setPendingChat: React.Dispatch<React.SetStateAction<boolean>>
    setDeniedChat: React.Dispatch<React.SetStateAction<boolean>>
}

interface DeniedChatUser {
    userId: number;
    userName: string;
    userFullName: string;
    userProfileImage: string;
    lastMessage: string;
    chatId: number;
}

const ChatRequestsModal = ({ isOpen, onClose, handleUserSelect, setPendingChat, setDeniedChat }: ChatRequestsModalProps) => {
    const router = useRouter();
    const [pendingChats, setPendingChats] = useState<MessageUserListData[]>([]);
    const [deniedChats, setDeniedChats] = useState<MessageUserListData[]>([]);
    const [showDeniedChats, setShowDeniedChats] = useState(false);
    const [showPendingChats, setShowPendingChats] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const encryption = useRef(new SocketEncryptionService()).current;
    const [userId] = useLocalStorage<string>('userId', '');
    const loggedInuser = userId ? parseInt(userId) : 0;
    const loggedInUser = parseInt(userId!);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchAuthToken = async () => {
            const token = await getAuthToken();
            setAuthToken(token);
        };
        fetchAuthToken();
    }, []);

    useEffect(() => {
        if (isOpen && authToken) {
            initSocket();
        }

        return () => {
            if (!isOpen && socketRef.current) {
                disconnectSocket();
            }
        };
    }, [isOpen, authToken]);

    const disconnectSocket = () => {
        if (socketRef.current) {
            socketRef.current.off('connect');
            socketRef.current.off('connect_error');
            socketRef.current.off('disconnect');
            socketRef.current.off('get_non_approved_chats');
            socketRef.current.off('get_denied_chats');
            socketRef.current.off('new_message_arrived');
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    const initSocket = () => {
        if (!authToken) return;

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
        socket.on('connect_error', (error) => {
            console.error('Socket connection error for chat requests:', error);
        });

        socket.on('disconnect', (reason) => {
        });

        socket.on('ecdh_key_exchange', (data) => {
            encryption.handleServerKeyExchange(data);
            const clientPubHex = encryption.getClientPublicKeyHex();
            socket.emit('ecdh_client_key', { clientPublicKey: clientPubHex });
        });

        socket.on('ecdh_complete', () => {
            getPendingChats(true);
            getDeniedChats(true);
        });

        socket.on('get_non_approved_chats', (data: any) => {
            handleEncryptedResponse('get_non_approved_chats', data, (response) => {
                try {
                    if (response.isSuccess && response.data) {
                        const newItems = response.data as MessageUserListData[];
                        if (newItems.length > 0) {
                            setPendingChats(prev => {
                                if (page === 1) {
                                    return newItems;
                                }
                                return [...prev, ...newItems];
                            });
                            setPage(prev => prev + 1);
                        } else {
                            setHasNextPage(false);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing get_non_approved_chats response:', error);
                }

                setIsLoadingMore(false);
                setIsLoading(false);
            });

        });

        socket.on('get_denied_chats', (data: any) => {
            handleEncryptedResponse('get_denied_chats', data, (response) => {
                try {
                    if (response.isSuccess && response.data) {
                        const newItems = response.data as MessageUserListData[];

                        if (newItems.length > 0) {
                            setDeniedChats(newItems);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing get_denied_chats response:', error);
                }
            });
        });

        socket.on('new_message_arrived', (data: any) => {
            handleEncryptedResponse('new_message_arrived', data, (response) => {
                getPendingChats(true);
                getDeniedChats(true);
            });
        });
    };

    const getPendingChats = (isRefresh: boolean = false) => {
        if (!socketRef.current || !authToken) return;

        if (isRefresh) {
            setPage(1);
            setHasNextPage(true);
            setPendingChats([]);
            setIsLoading(true);
        }

        const pendingChatsRequest = {
            userId: loggedInUser.toString(),
            userToken: `Bearer ${authToken}`,
            pageNo: 1
        };
        emitEncrypted('get_non_approved_chats', pendingChatsRequest);
    };

    const getDeniedChats = (isRefresh: boolean = false) => {
        if (!socketRef.current || !authToken) return;

        if (isRefresh) {
            setDeniedChats([]);
        }

        const deniedChatsRequest = {
            userId: loggedInUser,
            userToken: `Bearer ${authToken}`
        };
        emitEncrypted('get_denied_chats', deniedChatsRequest);
    };

    const handleToggleView = () => {
        setShowDeniedChats(!showDeniedChats);
        if (!showDeniedChats) {
            getDeniedChats(true);
        }
    };

    const handleChatTap = (item: MessageUserListData | DeniedChatUser, isDenied: boolean = false) => {
        if (!isDenied) {
            readMessage(item as MessageUserListData);
        }

        const chatScreenArgs = {
            messagesUserInfoModel: item,
            isDenied: isDenied,
            isForApproval: !isDenied
        };

        router.push(`/chat-screen?chatId=${item.chatId}&userId=${item.userId}`);
        onClose();
    };

    const readMessage = (item: MessageUserListData) => {
        if (!socketRef.current || !authToken) return;

        const userMessageReadStatusMap = {
            userId: loggedInUser,
            userToken: `Bearer ${authToken}`,
            chatId: item.chatId
        };
        emitEncrypted('update_message_read_status', userMessageReadStatusMap);
    };

    const loadMoreItems = () => {
        if (!isLoadingMore && hasNextPage && !showDeniedChats) {
            setIsLoadingMore(true);
            getPendingChats();
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

    if (!isOpen) return null;

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center py-6 md:py-8">
            <div className="relative">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-2 md:border-3 border-border-color border-t-blue-500"></div>
                <div className="absolute inset-0 rounded-full h-6 w-6 md:h-8 md:w-8 border-2 md:border-3 border-transparent border-t-blue-300 animate-spin animate-reverse"></div>
            </div>
        </div>
    );

    const EmptyState = ({ title, subtitle, icon }: { title: string; subtitle: string; icon: string }) => (
        <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4 opacity-50">{icon}</div>
            <h3 className="text-base md:text-lg font-medium text-text-color mb-2">{title}</h3>
            <p className="text-sm text-text-color/60 text-center max-w-sm">{subtitle}</p>
        </div>
    );

    const ChatItem = ({ item, isDenied = false }: { item: MessageUserListData | DeniedChatUser; isDenied?: boolean }) => (
        <div
            className="group relative flex items-center p-3 md:p-4 border border-border-color rounded-lg md:rounded-xl hover:bg-secondary-bg-color hover:border-blue-200/50 cursor-pointer transition-all duration-300 hover:shadow-md"
            onClick={() => {
                if (isDenied) {
                    setPendingChat(false);
                    setDeniedChat(true);
                } else {
                    setDeniedChat(false);
                    setPendingChat(true);
                }
                handleUserSelect(item.chatId, item.userId);
            }}
        >
            {/* Status Indicator */}
            <div className={`absolute top-2 md:top-3 right-2 md:right-3 w-2 h-2 rounded-full ${isDenied ? 'bg-red-400' : 'bg-amber-400'} opacity-70`}></div>

            {/* Avatar with Online Status */}
            <div className="relative shrink-0">
                <Avatar
                    src={item.userProfileImage}
                    name={item.userFullName || item.userName}
                    width="w-10 md:w-12"
                    height="h-10 md:h-12"
                />
                {!isDenied && (
                    <div className="absolute -bottom-0.5 md:-bottom-1 -right-0.5 md:-right-1 w-3 md:w-4 h-3 md:h-4 bg-green-500 border-2 border-primary-bg-color rounded-full"></div>
                )}
            </div>

            {/* Content */}
            <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm md:text-base text-text-color group-hover:text-blue-700 transition-colors duration-300 truncate">
                        {item.userFullName || item.userName}
                    </p>
                    <span className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium ${isDenied
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                        {isDenied ? 'Denied' : 'Pending'}
                    </span>
                </div>
                <p className="text-xs md:text-sm text-text-color/70 truncate group-hover:text-text-color/80 transition-colors duration-300">
                    {item.lastMessage}
                </p>
            </div>

            {/* Hover Arrow */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );

    return (
        <CommonModalLayer onClose={onClose} width='w-max' height='h-max'
            isModal={false}
            hideCloseButtonOnMobile={true}
        >
            <div className="bg-primary-bg-color md:rounded-2xl w-full max-w-screen md:w-[600px] max-h-[90vh] md:max-h-[85vh] overflow-hidden">
                {/* Mobile Header with Back Button */}
                <div className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-primary-text-color">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-primary-bg-color/20 rounded-full transition-colors duration-200"
                        >
                            <HiArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold">Chat Requests</h2>
                            <p className="text-blue-100 text-xs">
                                {showDeniedChats ? 'Previously denied' : 'Waiting for approval'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:block bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-primary-text-color">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-1 text-white">Chat Requests</h2>
                            <p className="text-blue-100 text-sm">
                                {showDeniedChats ? 'Previously denied conversations' : 'Waiting for your approval'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-primary-bg-color/20 rounded-full transition-colors duration-200"
                        >
                            {/* <HiX className="w-6 h-6" /> */}
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-border-color bg-secondary-bg-color">
                    <div className="flex">
                        <button
                            onClick={() => setShowDeniedChats(false)}
                            className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-all duration-300 relative ${!showDeniedChats
                                ? 'text-blue-600 bg-primary-bg-color'
                                : 'text-text-color/60 hover:text-text-color'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-1 md:gap-2">
                                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${!showDeniedChats ? 'bg-amber-400' : 'bg-border-color'}`}></div>
                                <span className="hidden sm:inline">Pending Chats</span>
                                <span className="sm:hidden">Pending</span>
                                {pendingChats.length > 0 && (
                                    <span className="bg-amber-100 text-amber-800 text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ml-1">
                                        {pendingChats.length}
                                    </span>
                                )}
                            </div>
                            {!showDeniedChats && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setShowDeniedChats(true)}
                            className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-all duration-300 relative ${showDeniedChats
                                ? 'text-blue-600 bg-primary-bg-color'
                                : 'text-text-color/60 hover:text-text-color'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-1 md:gap-2">
                                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${showDeniedChats ? 'bg-red-400' : 'bg-border-color'}`}></div>
                                <span className="hidden sm:inline">Denied Chats</span>
                                <span className="sm:hidden">Denied</span>
                                {deniedChats.length > 0 && (
                                    <span className="bg-red-100 text-red-800 text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ml-1">
                                        {deniedChats.length}
                                    </span>
                                )}
                            </div>
                            {showDeniedChats && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 md:p-6 max-h-[calc(90vh-200px)] md:max-h-[60vh] overflow-y-auto custom-scrollbar bg-primary-bg-color">
                    {showDeniedChats ? (
                        // Denied Chats List
                        <div className="space-y-2 md:space-y-3">
                            {deniedChats.length === 0 ? (
                                <EmptyState
                                    title="No Denied Chats"
                                    subtitle="You haven't denied any chat requests yet. Denied conversations will appear here."
                                    icon="🚫"
                                />
                            ) : (
                                deniedChats.map((item) => (
                                    <ChatItem key={item.userId} item={item} isDenied={true} />
                                ))
                            )}
                        </div>
                    ) : (
                        // Pending Chats List
                        <div className="space-y-2 md:space-y-3">
                            {pendingChats.length === 0 ? (
                                <EmptyState
                                    title="No Pending Requests"
                                    subtitle="All caught up! New chat requests will appear here when they arrive."
                                    icon="✅"
                                />
                            ) : (
                                <>
                                    {pendingChats.map((item) => (
                                        <ChatItem key={item.userId} item={item} isDenied={false} />
                                    ))}

                                    {hasNextPage && (
                                        <div className="flex justify-center pt-3 md:pt-4">
                                            <button
                                                onClick={loadMoreItems}
                                                disabled={isLoadingMore}
                                                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-primary-text-color rounded-lg md:rounded-xl font-medium hover:shadow-lg hover:shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 text-sm md:text-base"
                                            >
                                                {isLoadingMore ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent"></div>
                                                        <span className="text-sm md:text-base">Loading...</span>
                                                    </div>
                                                ) : (
                                                    'Load More'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                @media (min-width: 768px) {
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: var(--border-color, #e5e7eb);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(45deg, #2563eb, #7c3aed);
                }
                .animate-reverse {
                    animation-direction: reverse;
                }
            `}</style>
        </CommonModalLayer>
    );
};

export default ChatRequestsModal;