import { AllUsersInfo } from '@/models/allUsersResponse';
import { MessageUserListData } from '@/types/messageTypes';
import { getTimeDifference } from '@/utils/features';
import { useEffect, useState } from 'react';
import { HiArrowLeft, HiEllipsisVertical } from 'react-icons/hi2';
import { MdImage, MdMic, MdVideocam } from 'react-icons/md';
import Avatar from '../Avatar/Avatar';
import Button from '../shared/Button';
import Input from '../shared/Input';
import ChatRequestsModal from './chatRequests';
import NewMessageUsersModal from './NewMessageUsersModal';

const MessageList = ({
    listOfUser,
    onSelectUser,
    chatUserId,
    setPendingChat,
    setDeniedChat,
    onBack // Add this prop for back navigation
}: {
    listOfUser: MessageUserListData[],
    onSelectUser: (chatId: number | null, userId: number) => void,
    chatUserId: number | null
    setPendingChat: React.Dispatch<React.SetStateAction<boolean>>
    setDeniedChat: React.Dispatch<React.SetStateAction<boolean>>
    onBack?: () => void // Optional back handler
}) => {
    const [searchUser, setSearchUser] = useState('');
    const [filteredUser, setFilteredUser] = useState<MessageUserListData[]>(listOfUser);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalUsers, setModalUsers] = useState<AllUsersInfo[]>([]);
    const [isChatRequestModalOpen, setIsChatRequestModalOpen] = useState(false);

    useEffect(() => {
        if (searchUser) {
            const filtered = listOfUser?.filter(user =>
                user?.userName.toLowerCase().includes(searchUser.toLowerCase())
            );
            setFilteredUser(filtered);
        } else {
            setFilteredUser(listOfUser);
        }
    }, [searchUser, listOfUser]);

    const handleChatRequestsClick = () => {
        setIsChatRequestModalOpen(true);
    };

    const renderLastMessage = (message: string, type: string) => {
        if (type === "0") {
            return (
                <p className="text-xs truncate">{message}</p>
            )
        } else if (type === "1") {
            return (
                <MdMic className='text-gray-400' />
            )
        } else if (type === "2") {
            return (
                <span className='flex items-center text-xs'>
                    <MdImage className='text-gray-400 mr-1 text-sm' />
                    Sent
                </span>
            )
        } else if (type === "3") {
            return (
                <span className='flex items-center text-xs'>
                    <MdVideocam className='text-gray-400 mr-1 text-sm' />
                    Sent
                </span>
            )
        } else if (type === "4") {
            return (
                <p className="text-xs truncate">Sent</p>
            )
        } else if (type === "5") {
            return (
                <p className="text-xs truncate">Shared a Ssup</p>
            )
        }
    }
    return (
        <div className="flex flex-col px-2 md:px-4 h-full">
            {/* Header with back button on mobile */}
            <div className="flex items-center gap-3 mb-3 pt-2 flex-shrink-0">
                {/* Back button - only visible on mobile */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Go back"
                    >
                        <HiArrowLeft className="text-text-color" size={20} />
                    </button>
                )}

                {/* Search and menu */}
                <div className="flex-1 flex items-center gap-2">
                    <Input
                        type="text"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        placeholder="Search Messages"
                        className="flex-1"
                    />
                    <HiEllipsisVertical
                        className="text-text-color cursor-pointer hover:bg-gray-100 rounded p-1"
                        size={30}
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            </div>

            {/* Chat Requests Button */}
            <div className="flex justify-end mb-3 flex-shrink-0">
                <Button
                    onClick={handleChatRequestsClick}
                    isLinearBorder={true}
                >
                    <span className="flex items-center gap-2">
                        <svg
                            className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:rotate-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <span className="hidden sm:inline">Chat Requests</span>
                        <span className="sm:hidden">Requests</span>
                    </span>
                </Button>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                {filteredUser?.length > 0 ? (
                    <>
                        {filteredUser.map(user => (
                            <div
                                key={user?.chatId}
                                className={`
                                    flex items-center justify-between cursor-pointer 
                                    p-3 rounded-lg transition-colors mb-1 last:mb-0
                                    hover:bg-tertiary hover:text-message-text-color
                                    ${chatUserId === user?.userId ? 'bg-tertiary text-message-text-color' : ''}
                                `}
                                onClick={() => onSelectUser(user?.chatId, user?.userId)}
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="relative flex-shrink-0">
                                        <Avatar src={user?.userProfileImage} name={user?.userName} />
                                        <div
                                            className={`
                                                ${user?.isOnline ? 'bg-green-500' : 'bg-red-500'} 
                                                border-2 border-white w-3 h-3 rounded-full 
                                                absolute -bottom-1 -right-1
                                            `}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {user?.userName}
                                        </p>
                                        {renderLastMessage(user?.lastMessage, user?.type)}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 text-right ml-2">
                                    <span className="text-xs">
                                        {getTimeDifference(user?.messageTime)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-text-color text-center">No Users Found</p>
                    </div>
                )}
            </div>

            {/* Chat Requests Modal */}
            <ChatRequestsModal
                setDeniedChat={setDeniedChat}
                setPendingChat={setPendingChat}
                handleUserSelect={onSelectUser}
                isOpen={isChatRequestModalOpen}
                onClose={() => setIsChatRequestModalOpen(false)}
            />

            {/* New Message Modal */}
            {isModalOpen && (
                <NewMessageUsersModal onClose={() => setIsModalOpen(false)} onSelectUser={onSelectUser}/>
            )}
        </div>
    );
};

export default MessageList;