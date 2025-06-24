import { getMutualFriends, MutualFriend } from '@/services/getcommonfriends';
import useUserRedirection from '@/utils/userRedirection';
import { useEffect, useState } from 'react';
import Avatar from '../Avatar/Avatar';
import FollowButton from '../FollowButton/FollowButton';
import CommonModalLayer from '../modal/CommonModalLayer';
import { MutualsModalSkeleton } from '../Skeletons/Skeletons';

interface PostUsersModalProps {
    onClose: () => void;
    userId: number;
}

const MutualsModal = ({ onClose, userId }: PostUsersModalProps) => {
    const [mutualUsers, setMutualUsers] = useState<MutualFriend[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const redirectUser = useUserRedirection();

    useEffect(() => {
        const fetchMutuals = async () => {
            try {
                setIsLoading(true);
                const res = await getMutualFriends({ userId: userId, firstThree: 0, page: page });
                if (res.isSuccess) {
                    const data = res.data
                    setMutualUsers(data.mutualFriends)
                }

            } catch (error) {
                console.error('Error fetching common friends:', error);
            }
            finally {
                setIsLoading(false);
            }
        }

        fetchMutuals()
    }, [])

    return (
        <CommonModalLayer
            width='w-max'
            height='h-max'
            onClose={onClose}
            isModal={true}
            hideCloseButtonOnMobile={true}
        >
            <div className="flex bg-primary-bg-color flex-col gap-3 text-text-color w-80 md:w-96 p-4 h-[50vh] shadow-md shadow-shadow-color">
                <h2 className="text-xl text-center font-semibold">Mutuals</h2>

                <div className='w-full h-full overflow-y-auto'>
                    {isLoading ?
                        <MutualsModalSkeleton />
                        : mutualUsers.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <p className="text-text-color">No mutual friends found</p>
                            </div>
                        ) : (
                            mutualUsers.map((user) => {
                                return (
                                    <div key={`user-${user.userId}`} className="flex justify-between mb-4 w-full">
                                        <div className='flex items-center gap-2'>
                                            <button
                                                onClick={() => {
                                                    redirectUser(user.userId, `/home/users/${user.userId}`)
                                                }}
                                                className='flex items-center'>
                                                <Avatar src={user.userProfileImage} name={user.userFullName || user.userName} />
                                                <div className="ml-2 flex flex-col">
                                                    <p className="font-bold text-text-color">{user.userFullName || user.userName}</p>
                                                    <p className="text-start text-sm text-text-color">@{user.userName}</p>
                                                </div>
                                            </button>
                                        </div>
                                        {userId !== user.userId && (
                                            <FollowButton requestId={user.userId} isFollowing={user.isFollow} />
                                        )}
                                    </div>
                                )
                            }
                            )
                        )}
                </div>
            </div>
        </CommonModalLayer>
    )
}

export default MutualsModal