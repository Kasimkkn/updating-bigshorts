import CommonModalLayer from '@/components/modal/CommonModalLayer';
import { CollaboratorsSkeleton } from '@/components/Skeletons/Skeletons';
import { getFollowerList } from '@/services/userfriendlist';
import { FollowingModalData } from '@/types/usersTypes';
import React, { useEffect, useRef, useState } from 'react';
import Input from '../Input';
import dummyUser from '@/assets/user.png';

import Avatar from '@/components/Avatar/Avatar';
import useLocalStorage from '@/hooks/useLocalStorage';
import { MdCheck, MdCheckCircle } from 'react-icons/md';
import Image from 'next/image';
import SafeImage from '../SafeImage';

interface CollaboratorProps {
    onClose: () => void;
    setCollaborators: React.Dispatch<React.SetStateAction<{userId: number;profileImage: string;}[]>>;
    collaborators: {userId: number;profileImage: string;}[];
}
const Collaborators = ({ onClose, setCollaborators, collaborators }: CollaboratorProps) => {
    const [followingData, setFollowingData] = useState<FollowingModalData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [input, setInput] = useState<string>("")
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const selected = collaborators.length;
    const [userId] = useLocalStorage<string>('userId', '');

    const handleSelectCollaborator = (userId: number, profileImage: string) => {
        const exists = collaborators.some((item) => item.userId === userId);
    
        if (exists) {
            setCollaborators((prev) =>
                prev.filter((item) => item.userId !== userId)
            );
        } else if (collaborators.length < 9) {
            setCollaborators((prev) => [
                ...prev,
                { userId, profileImage }
            ]);
        }
    };

    useEffect(() => {
        const fetchFollowingSearch = async () => {
            try {
                setIsLoading(true);
                let data = {
                    friendName: input,
                    userId: Number(userId),
                    isCreatePost: 0,
                    page: page,
                    pageSize: 10,
                    username: input || null,
                };
                const response = await getFollowerList(data);
                const list = Array.isArray(response.data) ? response.data : [];
                
                if (page === 1) {
                    setFollowingData(list);
                } else {
                    setFollowingData((prev) => [...prev, ...list]);
                }

                if (list.length < 10) {
                    setHasMore(false); // No more data to fetch
                } else {
                    setHasMore(true);
                }
            } catch (e) {
            } finally {
                setIsLoading(false);
            }
        };

        fetchFollowingSearch();
    }, [input, userId, page]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop === clientHeight && hasMore && !isLoading) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setPage(1);
    };

    return (
        <CommonModalLayer width='max-w-md' height='h-max' onClose={onClose}
            isModal={true}
            hideCloseButtonOnMobile={true}
        >
            <div className='w-full bg-primary-bg-color max-w-4xl flex flex-col h-[50vh] p-3 pt-4 shadow-md'>
                <Input
                    className="w-full mb-2"
                    placeholder="Search collaborators"
                    value={input}
                    onChange={handleSearch}
                />
                <div className="flex -space-x-3 m-2 mb-4">
                    {collaborators.map((collaborator, index) => (
                        <div key={index} className="w-10 h-10 rounded-full border border-primary-bg-color overflow-hidden">
                            <SafeImage
                                src={collaborator.profileImage || dummyUser.src}
                                alt={`Collaborator ${index + 1}`}
                                width={60}
                                height={60}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                <div onScroll={handleScroll} ref={scrollContainerRef} className="w-full flex-1 flex flex-col gap-2 overflow-y-auto">
                    {followingData.map((user, index) => {
                        return (
                            <div
                                key={index}
                                className = "w-full flex items-center gap-2 p-2 rounded-md cursor-pointer bg-secondary-bg-color hover:bg-bg-color-70"
                                onClick={() => handleSelectCollaborator(user.userId, user.userProfileImage)}
                            >
                                <div className='relative'>
                                    <Avatar
                                        src={user.userProfileImage}
                                        name={user.friendName}
                                        width="w-12"
                                        height="h-12"
                                    />
                                    {collaborators.some((item) => item.userId === user.userId) && (
                                        <MdCheck className='absolute bottom-0 right-0 text-white translate-x-1/4 translate-y-1/4 bg-purple-500 rounded-full' size={18}/>
                                    )}
                                </div>
                                <div className="flex flex-col ">
                                    <p className="text-text-color truncate font-semibold">{user.friendName}</p>
                                    <p className="text-text-color truncate text-sm">@{user.friendUserName}</p>
                                </div>
                            </div>
                        )
                    })}
                    {isLoading && <CollaboratorsSkeleton />}
                    {!isLoading && followingData.length === 0 && (
                        <p className="text-center text-text-color">No collaborators found</p>
                    )}   
                </div>
            </div>
        </CommonModalLayer>
    )
}

export default Collaborators