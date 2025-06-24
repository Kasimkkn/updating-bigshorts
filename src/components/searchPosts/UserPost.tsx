import { UserData } from '@/models/searchResponse';
import useUserRedirection from '@/utils/userRedirection';
import React from 'react';
import Image from "next/image";
import FollowButton from "@/components/FollowButton/FollowButton";
import Avatar from '../Avatar/Avatar';
import SafeImage from '../shared/SafeImage';
interface UserPostProps {
    data: UserData[];
}

const UserPost: React.FC<UserPostProps> = ({ data }) => {
    const redirectUser = useUserRedirection();

    return (
        <div className="grid grid-cols-1">
    {data.map((user) => (
        <div
            key={user.userId}
            className="flex items-center justify-between p-4 bg-primary-bg-color border-b border-border-color rounded-md"
        >
            {/* User Info Section */}
            <div className="flex items-center gap-4cursor-pointer"
                        onClick={() => redirectUser(user.userId, `/home/users/${user.userId}`)}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-sm overflow-hidden bg-secondary-bg-color">
                    {user.userProfileImage ? (
                       <SafeImage
                       src={user.userProfileImage}
                       alt={user.userName}
                       className="w-full h-full object-cover"
                      />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-text-light">
                                {user.userName?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* User Details */}
                <div className="flex flex-col">
                    {user.userFullName && (

                        <h4 className="text-sm text-text-color">{user.userFullName}</h4>
                    )}
                    {user.userName && (
                        <span className="text-xs text-text-light">@{user.userName}</span>

                    )}
                </div>
            </div>
            <FollowButton
                        requestId={user.userId}
                        isFollowing={user.isFollow === 1} // Convert numerical `isFollow` to boolean
                        isPrivate={user.isPrivateAccount === 1} // Convert numerical `isPrivateAccount` to boolean
                        isRequested={user.isRequested === 1} // Convert numerical `isRequested` to boolean
                        isIconButton={false} // Set true if you want the button to be an icon button
                        updateIsFriend={(userId, isFriend) => {
}}
                    />
        </div>
    ))}
</div>
    )
}

export default UserPost;
