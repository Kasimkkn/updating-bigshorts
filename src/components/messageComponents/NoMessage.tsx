import React, { useEffect, useState } from 'react';
import Button from '../shared/Button';
import CommonModalLayer from '../modal/CommonModalLayer';
import { AllUsersInfo, AllUsersResponse } from '@/models/allUsersResponse';
import Avatar from '../Avatar/Avatar';
import { MessageUserListData, getSelectedUserInChatList } from '@/services/getSelectedUserChat';
import { ChatUserListRequest, getChatUserList } from '@/services/userchatlist';

const NoMessage = ({ heading, description,isEmpty,onSelectUser,listOfUser }: { heading: string; description: string;isEmpty?:boolean;onSelectUser: (chatId: number | null, userId: number) => void,listOfUser?: MessageUserListData[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalUsers, setModalUsers] = useState<AllUsersInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    

    const handleModalUserSelect = async (userId: number) => {
        try {
            const existingChat = listOfUser?.find(user => user.userId === userId);

            if (existingChat) {
                onSelectUser(existingChat.chatId, userId);
            } else {
                const userData = await getSelectedUserInChatList(userId);
                onSelectUser(userData.chatId, userId);
            }
        } catch (error) {
            console.error('Error handling user selection:', error);
        } finally {
            setIsModalOpen(false);
        }
    };
    useEffect(() => {
        if (isModalOpen) {
            fetchModalUsers();
        }
    }, [isModalOpen]);

    const fetchModalUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const chatUserRequest: ChatUserListRequest = {
                pageNo: 1,
                limit: 20,
            };

            const data: AllUsersResponse = await getChatUserList(chatUserRequest);
            setModalUsers(data.data);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching users:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-center justify-center h-full bg-bg-color">
            <h1 className="text-2xl font-bold text-text-color mb-4 text-center">{heading}</h1>
            <p className="text-text-color text-center mb-4">
                {description}
            </p>
            <Button isLinearBtn={true} onClick={() => {setIsModalOpen(true)}}>
                    Send a Message
                </Button>
                {isModalOpen && (
                <CommonModalLayer onClose={() => setIsModalOpen(false)} width='w-max' height='h-max'>
                    <div className="p-4 rounded-lg w-96 max-h-[65vh] md:max-h-[80vh] overflow-y-auto text-text-color z-50">
                        <div className="flex justify-between items-center mb-4 border-b border-border-color">
                            <h2 className="text-xl font-semibold text-text-color">New Message</h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center text-text-color">
                                <span>Loading...</span>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center text-red-500">
                                <span>{error}</span>
                            </div>
                        ) : modalUsers.length > 0 ? (
                            modalUsers.map((user) => {
                                return (
                                    <div
                                        key={user.userId}
                                        className="flex items-center p-2 border-b border-border-color hover:bg-primary-bg-color"
                                    >
                                        <div className="flex items-center flex-1">
                                            <Avatar src={user.userProfileImage} name={user.userName} />
                                            <p className="ml-3 font-semibold ">{user.userName}</p>
                                        </div>
                                        <Button
                                            isLinearBorder={true}
                                            onClick={() => handleModalUserSelect(Number(user.userId))}
                                        >
                                            {'New Message'}
                                        </Button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-text-color">No users found</p>
                        )}
                    </div>
                </CommonModalLayer>
            )}
        </div>
    );
};

export default NoMessage;
