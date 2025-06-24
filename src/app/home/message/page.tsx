"use client";
import ChatUI from '@/components/messageComponents/ChatUI';
import MessageList from '@/components/messageComponents/MessageList';
import NoMessage from '@/components/messageComponents/NoMessage';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getSelectedUserInChatList } from '@/services/getSelectedUserChat';
import { SocketEncryptionService } from '@/services/socketEncryptionService';
import { GetUserMessage, MessageUserListData, MessageUserListResponse } from '@/types/messageTypes';
import { getAuthToken } from '@/utils/getAuthtoken';
import { useCallback, useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface MediaFileDetails{
    filePath: string;
    postDetails: string | null;
    audioDuration: string | null;
    type: number | null;
}

const MessagePage = () => {
    const { messageUserId, setMessageUserId, isChatOpen, setIsChatOpen } = useInAppRedirection();
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [listOfUser, setListOfUser] = useState<MessageUserListData[]>([]);
    const [userMessage, setUserMessage] = useState<GetUserMessage | null>(null);
    const [inputMessage, setInputMessage] = useState<string>("");
    const [chatUserId, setChatUserId] = useState<number | null>(null);
    const [reaction, setReaction] = useState<{ messageId: number, reaction: string } | null>(null);
    const [showReplyInput, setShowReplyInput] = useState<boolean>(false)
    const [deleteMessageId, setDeleteMessageId] = useState<number | null>(null)
    const [replyMessageDetails, setReplyMessageDetails] = useState<any | null>(null)
    const [userId] = useLocalStorage<string>('userId', '');
    const loggedInUser = parseInt(userId!);
    const [pendingChat, setPendingChat] = useState<boolean>(false)
    const [deniedChat, setDeniedChat] = useState<boolean>(false)
    const [renderPendingChat, setRenderPendingChat] = useState<boolean>(false)
    const [renderDeniedChat, setRenderDeniedChat] = useState<boolean>(false)
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);
    const [mediaFileDetails, setMediaFileDetails] = useState<MediaFileDetails>({filePath: '', postDetails: null, audioDuration: null, type: null}); 

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

    useEffect(() => {
        setIsChatOpen(selectedUser !== null);
        return () => setIsChatOpen(false);
    }, [selectedUser, setIsChatOpen]);

    const handleUserSelect = useCallback((chatId: number | null, userId: number) => {
        setSelectedUser(chatId);
        setMessageUserId(userId);
        setChatUserId(userId);
    }, [setMessageUserId]);

    const handleBack = useCallback(() => {
        setSelectedUser(null);
        setMessageUserId(null);
        setChatUserId(null);
        setUserMessage(null);
    }, [setMessageUserId]);

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

    const getJoinChatParams = () => {
        const userToken = `Bearer ${authToken}`;
        const chatId = selectedUser || null;
        return {
            'userToken': userToken,
            'chatId': chatId,
        };
    }

    useEffect(() => {
        if (messageUserId && listOfUser.length > 0) {
            const chatId = listOfUser.find((user) => user.userId === messageUserId)?.chatId;
            const pendingDeniedChatId = selectedUser;
            if (chatId) {
                setRenderPendingChat(false)
                setPendingChat(false)
                setRenderDeniedChat(false)
                setDeniedChat(false)
                handleUserSelect(chatId, messageUserId);
            }

            else if (pendingChat) {
                setRenderDeniedChat(false)
                setRenderPendingChat(true)
                setPendingChat(false)
                handleUserSelect(pendingDeniedChatId, messageUserId);
            }
            else if (deniedChat) {
                setRenderPendingChat(false)
                setRenderDeniedChat(true)
                setDeniedChat(false)
                handleUserSelect(pendingDeniedChatId, messageUserId);
            }
            else if (!pendingDeniedChatId && !chatId) {
                setRenderPendingChat(false)
                const fetchUserData = async () => {
                    try {
                        const userData = await getSelectedUserInChatList(messageUserId);
                        setUserMessage({
                            chatData: [],
                            userData: {
                                chatId: 0,
                                userId: loggedInUser,
                                userFullName: userData.userFullName,
                                userName: userData.userName,
                                userProfileImage: userData.userProfileImage,
                                chatUserId: messageUserId,
                                chatUserFullName: userData.userFullName,
                                chatUserName: userData.userName,
                                chatUserProfileImage: userData.userProfileImage
                            }
                        });

                        handleUserSelect(userData.chatId, messageUserId);
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                };
                fetchUserData();
            }
        }
    }, [selectedUser, messageUserId, listOfUser, pendingChat, deniedChat, handleUserSelect, loggedInUser]);
    const handleApproveChat = useCallback(() => {
        const socket = socketRef.current;
        if (!socket || !authToken || !selectedUser) {
            console.error('Unable to approve chat request - missing socket, token, or selectedUser');
            return;
        }

        const approveRequest = {
            userId: loggedInUser,
            chatId: selectedUser,
            userToken: `Bearer ${authToken}`,
            action: 'approve'
        };
        emitEncrypted('approve_chat', approveRequest);

        // Reset states
        setRenderPendingChat(false);
        setPendingChat(false);
    }, [loggedInUser, authToken, selectedUser]);

    const handleDenyChat = useCallback(() => {
        const socket = socketRef.current;
        if (!socket || !authToken || !selectedUser) {
            console.error('Unable to deny chat request - missing socket, token, or selectedUser');
            return;
        }

        const denyRequest = {
            userId: loggedInUser,
            chatId: selectedUser,
            userToken: `Bearer ${authToken}`,
            action: 'deny'
        };
        emitEncrypted('deny_chat', denyRequest);

        // Reset states and go back
        setRenderPendingChat(false);
        setPendingChat(false);
        handleBack(); // Go back to chat list
    }, [loggedInUser, authToken, selectedUser, handleBack]);


    useEffect(() => {
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
            console.error('Socket connection error:', error);
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

            if (selectedUser) {
                emitEncrypted('join_chat', getJoinChatParams());
                emitEncrypted('get_chat_messages', {
                    userId: loggedInUser,
                    userToken: `Bearer ${authToken}`,
                    pageNo: 1,
                    chatId: selectedUser,
                });
            }

        });


        socket.on('user_chat_list', (data: MessageUserListResponse) => {
            handleEncryptedResponse('user_chat_list', data, (decrypted) => {
                setListOfUser(decrypted.data || []);
            })
        });

        socket.on('get_chat_messages', (data: any) => {
            handleEncryptedResponse('get_chat_messages', data, (decrypted) => {
                if (decrypted.isSuccess) {
                    if (decrypted.data.userData.chatId === selectedUser) {
                        setUserMessage(decrypted.data);
                    }
                } else {
                    console.error('Error in get_chat_messages', decrypted);
                }
            });
        });

        socket.on("new_message_arrived", (data: any) => {
            handleEncryptedResponse('new_message_arrived', data, (decrypted) => {
                if (decrypted) {
                    if (decrypted.chatId === selectedUser) {
                        setUserMessage((prev) => {
                            if (!prev) return prev;
                            return {
                                ...prev,
                                chatData: [...prev.chatData, decrypted.data]
                            };
                        });
                    } else {
                        emitEncrypted('user_chat_list', {
                            userId: loggedInUser,
                            userToken: `Bearer ${authToken}`,
                            pageNo: 1,
                        });
                    }
                }
            });
        });

        socket.on('latest_message', (data: any) => {
            handleEncryptedResponse('latest_message', data, (decrypted) => {
                if (selectedUser !== null) {
                    emitEncrypted('get_chat_messages', {
                        userId: loggedInUser,
                        userToken: `Bearer ${authToken}`,
                        pageNo: 1,
                        chatId: selectedUser,
                    });
                }
                emitEncrypted('user_chat_list', {
                    userId: loggedInUser,
                    userToken: `Bearer ${authToken}`,
                    pageNo: 1,
                });
            });
        });

        socket.on('send_chat_message_updated', (data: any) => {
            handleEncryptedResponse('send_chat_message_updated', data, (decrypted) => {
                if (decrypted.isSuccess) {
                    setInputMessage("");
                    if (selectedUser !== null) {
                        emitEncrypted('get_chat_messages', {
                            userId: loggedInUser,
                            userToken: `Bearer ${authToken}`,
                            pageNo: 1,
                            chatId: selectedUser,
                        });
                    }
                } else {
                    console.error('Error sending message:', decrypted);
                }
            });
        });


        socket.on('approve_chat', (data: any) => {
            handleEncryptedResponse('approve_chat', data, (decrypted) => {
                if (decrypted.isSuccess) {
                    // Refresh chat list
                    emitEncrypted('user_chat_list', {
                        userId: loggedInUser,
                        userToken: `Bearer ${authToken}`,
                        pageNo: 1,
                    });
                } else {
                    console.error('Error approving chat:', decrypted);
                }
            });
        });

        socket.on('deny_chat', (data: any) => {
            handleEncryptedResponse('deny_chat', data, (decrypted) => {
                if (decrypted.isSuccess) {
                    // Refresh chat list
                    emitEncrypted('user_chat_list', {
                        userId: loggedInUser,
                        userToken: `Bearer ${authToken}`,
                        pageNo: 1,
                    });
                }
            });
        });

        socket.on('message_reaction_notify', (data: any) => {
            handleEncryptedResponse('message_reaction_notify', data, (decrypted) => {
                setUserMessage((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        chatData: prev.chatData.map((msg) =>
                            msg.messageId === decrypted.messageId ? { ...msg, reaction: decrypted.reaction } : msg
                        ),
                    };
                });
            });
        });

        socket.on('delete_chat_message_updated', (data: any) => {
            handleEncryptedResponse('delete_chat_message_updated', data, (decrypted) => {
                if (selectedUser !== null) {
                    emitEncrypted('get_chat_messages', {
                        userId: loggedInUser,
                        userToken: `Bearer ${authToken}`,
                        pageNo: 1,
                        chatId: selectedUser,
                    });
                }
            });
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.off('user_chat_list');
            socket.off('get_chat_messages');
            socket.off('send_chat_message_updated');
            socket.off('approve_chat');      // Add this
            socket.off('deny_chat');
            socket.off('new_message_arrived');
            socket.off('ecdh_key_exchange');
            socket.off('ecdh_complete');
            socket.off('message_reaction_notify');
            socket.off('delete_chat_message_updated');
            socket.off('latest_message');
            socket.disconnect();
        };
    }, [selectedUser, loggedInUser, authToken]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        if (!selectedUser) return;
        if (!mediaFileDetails.filePath || !mediaFileDetails.type) return;
        if (!chatUserId) return;


        emitEncrypted("send_chat_message_updated", {
            userId: loggedInUser,
            userToken: `Bearer ${authToken}`,
            pageNo: 1,
            replyId: 0,
            chatId: selectedUser,
            chatUserId: chatUserId,
            filePath: mediaFileDetails.filePath,
            type: mediaFileDetails.type,
            message: null,
            ...(mediaFileDetails.postDetails && { postDetails: mediaFileDetails.postDetails }),
            ...(mediaFileDetails.audioDuration && { audioDuration: mediaFileDetails.audioDuration }),
        });

        setMediaFileDetails({ filePath: '', postDetails: null, audioDuration: null, type: null }); // Reset media file after sending

    }, [mediaFileDetails, loggedInUser, authToken, selectedUser, chatUserId, replyMessageDetails]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        if (!selectedUser) return;
        if (!inputMessage) return;
        if (!chatUserId) return;

        emitEncrypted("send_chat_message_updated", {
            userId: loggedInUser,
            userToken: `Bearer ${authToken}`,
            pageNo: 1,
            replyId: replyMessageDetails?.messageId || 0,
            chatId: selectedUser,
            chatUserId: chatUserId,
            type: 0,
            message: inputMessage,
        });

        setInputMessage("");

    }, [inputMessage, loggedInUser, authToken, selectedUser, chatUserId, replyMessageDetails]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        if (!reaction) return;
        if (!selectedUser) return;
        if (!chatUserId) return;

        emitEncrypted("send_message_reaction_updated", {
            userId: loggedInUser,
            userToken: `Bearer ${authToken}`,
            chatId: selectedUser,
            messageId: reaction.messageId,
            reaction: reaction.reaction,
            chatUserId: chatUserId.toString(),
        });

        setReaction(null);
    }, [reaction, loggedInUser, authToken, selectedUser, chatUserId]);

    useEffect(() => {
        if (!deleteMessageId) return;
        const socket = socketRef.current;
        if (!socket) return;

        emitEncrypted("delete_chat_message_updated", {
            userId: loggedInUser,
            userToken: `Bearer ${authToken}`,
            messageId: deleteMessageId
        })

    }, [deleteMessageId, loggedInUser, authToken])

    return (
        <div className={`flex ${isChatOpen ? 'h-[calc(100vh)]' : 'h-[calc(100vh)]'} md:px-4`}>
            <div className={`w-full md:w-1/4  py-2 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <MessageList listOfUser={listOfUser} onSelectUser={handleUserSelect} chatUserId={chatUserId} setPendingChat={setPendingChat} setDeniedChat={setDeniedChat} />
            </div>
            {listOfUser.length >= 0 ? (
                <div className={`w-full md:w-3/4 bg-bg-color flex flex-col ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
                    {selectedUser !== null ? (
                        <ChatUI
                            onApproveChat={handleApproveChat}
                            onDenyChat={handleDenyChat}
                            setPendingChat={setPendingChat}
                            isDeniedChat={renderDeniedChat}
                            isPendingChat={renderPendingChat}
                            setDeleteMessageId={setDeleteMessageId}
                            showReplyInput={showReplyInput}
                            setShowReplyInput={setShowReplyInput}
                            replyMessageDetails={replyMessageDetails}
                            setReplyMessageDetails={setReplyMessageDetails}
                            onBack={handleBack}
                            userMessage={userMessage || {
                                chatData: [],
                                userData: {
                                    chatId: 0,
                                    userId: loggedInUser,
                                    userFullName: "",
                                    userName: "",
                                    userProfileImage: "",
                                    chatUserId: 0,
                                    chatUserFullName: "",
                                    chatUserName: "",
                                    chatUserProfileImage: ""
                                }
                            }}
                            setInputMessage={setInputMessage}
                            setReaction={setReaction}
                            selectedUser={selectedUser}
                            setMediaFileDetails={setMediaFileDetails}
                        />
                    ) : listOfUser.length > 0 ? (
                        <NoMessage
                            onSelectUser={handleUserSelect}
                            heading="Select a user"
                            description="To start a conversation"
                        />
                    ) : (
                        <NoMessage
                            onSelectUser={handleUserSelect}
                            isEmpty={true}
                            heading="No Messages Yet"
                            description="Get or Send Messages and it shows up here!"
                            listOfUser={listOfUser}
                        />
                    )}
                </div>
            ) : (
                <div className={`w-full ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
                    <NoMessage
                        onSelectUser={handleUserSelect}
                        heading="Fetching Your Conversations..."
                        description="Almost there! Your messages will be here in no time."
                    />
                </div>
            )}
        </div>
    );
};

export default MessagePage;