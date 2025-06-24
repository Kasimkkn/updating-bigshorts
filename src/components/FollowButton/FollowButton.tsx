import { acceptFriend } from '@/services/acceptrequest';
import { addFriend } from '@/services/addfriend';
import { friendRequest } from '@/services/followrequest';
import React from 'react';
import toast from 'react-hot-toast';
import Button from '../shared/Button';
import { MdPersonAddAlt } from "react-icons/md";
import { TiTickOutline } from "react-icons/ti";
import useLocalStorage from '@/hooks/useLocalStorage';

interface FollowButtonProps {
    requestId: number;
    isFollowing?: number | boolean;
    isPrivate?: number | boolean;
    isRequested?: number | boolean;
    isIconButton?: boolean;
    updateIsFriend?: (userId: number, isFriend: number) => void;
    isForInteractiveImage?: boolean
}

const FollowButton = ({
    requestId,
    isFollowing,
    isPrivate,
    isRequested,
    isIconButton = false,
    updateIsFriend,
    isForInteractiveImage
}: FollowButtonProps) => {
    const [isFollowed, setIsFollowed] = React.useState(isFollowing);
    const [id] = useLocalStorage<string>('userId', '');
    const userId = id ? parseInt(id) : 0;
    const handleAcceptFriend = async () => {
        try {
            const response = await acceptFriend({ requestorId: requestId });
            if (response.isSuccess) {
                setIsFollowed(true);
                toast.success("Request accepted");
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            return false;
        }
    };
    const handleAddFriend = async () => {
        try {
            const response = await addFriend({ friendId: requestId, isFollow: 1 });
            if (response.isSuccess) {
                setIsFollowed(true);
                toast.success("Added friend");
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding friend:', error);
            return false;
        }
    };

    const handleRemoveFriend = async () => {
        try {
            const response = await addFriend({ friendId: requestId, isFollow: 0 });
            if (response.isSuccess) {
                setIsFollowed(false);
                toast.success("Removed friend");
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing friend:', error);
            return false;
        }
    };

    const handleSendRequest = async () => {
        try {
            const response = await friendRequest({
                requestedId: requestId,
                userId: Number(userId)
            });
            if (response.isSuccess) {
                setIsFollowed(true);
                toast.success("Request sent successfully");
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error sending friend request:', error);
            return false;
        }
    };

    const handleButtonClick = async () => {
        if (isRequested) {
            await handleAcceptFriend();
            return;
        }

        if (isPrivate) {
            if (!isFollowed && !isRequested) {
                await handleSendRequest();
            } else {
                await handleAcceptFriend();
            }
            return;
        }

        if (!isFollowed) {
            await handleAddFriend();
        }

        if (isFollowed) {
            await handleRemoveFriend();
        }

        updateIsFriend && updateIsFriend(requestId, isFollowed ? 0 : 1);
    };

    const buttonContent = isIconButton ? (
        <button
            onClick={(e) => { e.stopPropagation(); handleButtonClick() }}
            className={`bg-[#8969ea] text-white w-7 h-7 flex items-center justify-center rounded-full ${requestId === Number(userId) && 'hidden'}`}
        >
            {isFollowed ? (
                <TiTickOutline className="text-sm font-semibold max-md:text-xs" />
            ) : (
                <MdPersonAddAlt className="text-sm font-semibold max-md:text-xs" />
            )}
        </button>
    ) : (
        <Button
            isLinearBorder={false}
            isLinearBtn={false}
            className={`ml-2 text-sm font-bold ${isForInteractiveImage ? "text-white" : "text-primary-text-color"} ${!isFollowed ? 'border-[1px] border-border-color' : ''} px-2 py-1 ${requestId === Number(userId) && 'hidden'}`}
            isPadding={false}
            onClick={handleButtonClick}
        >
            {isFollowed ? "" : "Follow"}
        </Button>
    );

    return buttonContent;
};

export default React.memo(FollowButton);