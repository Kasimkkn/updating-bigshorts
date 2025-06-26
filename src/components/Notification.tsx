"use client";
import {
    FollowRequestLoadingSkeleton,
    NotificationLoadingSkeleton
} from '@/components/Skeletons/Skeletons';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { FollowRequestData } from "@/models/notficationResponse";
import { acceptcollaborationinvite } from '@/services/acceptcollaborationinvite';
import { acceptFriend } from "@/services/acceptrequest";
import { addFriend } from "@/services/addfriend";
import { friendRequest } from "@/services/followrequest";
import { groupNotification, parseRelativeDate } from "@/utils/features";
import useUserRedirection from '@/utils/userRedirection';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdCheck, MdOutlineClose } from "react-icons/md";
import { IoNotificationsOutline, IoPersonAddOutline } from "react-icons/io5";
import Avatar from './Avatar/Avatar';
import CommonModalLayer from './modal/CommonModalLayer';
import SafeImage from './shared/SafeImage';

type NotificationData = {
    userId: number;
    userName: string;
    userImage: string;
    postId: number;
    postTitle: string;
    coverFileName: string;
    isForInteractiveImage: string;
    isForInteractiveVideo: string;
    notificationType: string;
    notificationDetail: string;
    notificationTime: string;
    isFriend: number;
    isUserFriend:number;
    isPrivateAccount: number;
    isRequested: number;
    isAccepted: number;
};

interface NotificationProps {
    followRequestData?: FollowRequestData[];
    notificatioData?: NotificationData[];
    toggleNotification: () => void;
    isNotificationOpen: boolean;
    isPrivateAccount: string | number;
    isFollowerLoading: boolean;
    isLoading: boolean;
}

const Notification = ({
    followRequestData,
    notificatioData,
    toggleNotification,
    isNotificationOpen,
    isPrivateAccount,
    isLoading,
    isFollowerLoading,
}: NotificationProps) => {

    const { setSnipId } = useInAppRedirection()
    const router = useRouter()
    const redirectUser = useUserRedirection();
    const [isFollowRequestOpen, setIsFollowRequestOpen] = useState(false);
    const [localNotificationData, setLocalNotificationData] = useState<NotificationData[]>([]);
    const [userId] = useLocalStorage<string>('userId', '');
    const id = userId ? parseInt(userId) : 0;
    const loggedInUserName = useLocalStorage<string>('username', '');
    const toggleFollowRequest = () => {
        setIsFollowRequestOpen(!isFollowRequestOpen);
    };

    let lastDateHeader = '';

    const handleButtonClick = async (userId: number, isFollow: number, isPrivate: number, isRequested: number) => {
        if (isPrivate === 1) {
            if (isFollow === 0 && isRequested === 0) {
                try {
                    await friendRequest({ requestedId: userId, userId: Number(id) });
                    toast.success("Request sent successfully");
                    const updatedData = localNotificationData.map(user =>
                        user.userId === userId ? { ...user, isRequested: 1 } : user
                    );
                    setLocalNotificationData(updatedData);
                } catch (error) {

                }
            }
        } else {
            try {
                await addFriend({ friendId: userId, isFollow: 1 });
                toast.success("Request sent successfully");
                const updatedData = localNotificationData.map(user =>
                    user.userId === userId ? { ...user, isFriend: 1 } : user
                );
                setLocalNotificationData(updatedData);
            } catch (error) {
            }
        }
    };
    const handleAddFriend = async (userId: number) => {
        try {
            const respone = await acceptFriend({ requestorId: userId });
            if (respone.isSuccess) {
                toast.success("Request sent successfully");
            }
        } catch (error) {
        }
    }

    const handleRedirect = async (type: string, postId: number) => {
        if (type == "snips") {
            setSnipId(postId);
            toggleNotification();
            router.push('/home/snips')
        }
    }

    const handleCollaborationInvite = async (post_id: number, is_accepted: boolean) => {
        try {
            const res = await acceptcollaborationinvite({ post_id, is_accepted });
            if (res.isSuccess) {
                toast.success("Collaboration invite accepted successfully");
                const updatedData = localNotificationData.map(notification =>
                    notification.postId === post_id && notification.notificationType === "COLLABORATION_INVITATION" ? { ...notification, isAccepted: 1 } : notification
                );
                setLocalNotificationData(updatedData);
            } else {
                toast.error("Failed to accept collaboration invite");
            }
        } catch (error) {
            console.error("Error accepting collaboration invite:", error);
        }
    }

    // Empty state component for follow requests
    const EmptyFollowRequestState = () => (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <IoPersonAddOutline className="text-6xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-text-color mb-2">No Follow Requests</h3>
            <p className="text-sm text-gray-500 max-w-xs">
                When someone requests to follow you, their request will appear here.
            </p>
        </div>
    );

    // Empty state component for notifications
    const EmptyNotificationState = () => (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <IoNotificationsOutline className="text-6xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-text-color mb-2">No Notifications Yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">
                Activity like likes, comments, and follows will show up here.
            </p>
        </div>
    );

    const renderFollowRequestData = () => {
        // Show loading skeleton while loading
        if (isFollowerLoading) {
            return <FollowRequestLoadingSkeleton count={5} />;
        }

        // Show empty state if no follow requests
        if (!followRequestData || followRequestData.length === 0) {
            return <EmptyFollowRequestState />;
        }

        return (
            <>
                {followRequestData?.map((item: FollowRequestData, index: number) => {
                    const requestDateHeader = groupNotification(item.createdAt);
                    const shouldShowDateHeader = requestDateHeader && requestDateHeader !== lastDateHeader;

                    if (shouldShowDateHeader) {
                        lastDateHeader = requestDateHeader;
                    }
                    return (
                        <div key={`follow-${index}`}>
                            {shouldShowDateHeader && (
                                <span className="block text-start font-semibold leading-6 text-base text-text-color  my-1 pl-2">
                                    {requestDateHeader}
                                </span>
                            )}
                            <div className="flex justify-between p-2 border-b border-border-color">
                                <button
                                    onClick={() => {
                                        redirectUser(item.user_id, `/home/users/${item.user_id}`)
                                    }}
                                    className="p-2 flex justify-between items-center">
                                    <div className="w-12 h-12 flex-shrink-0 max-md:w-8 max-md:h-8">
                                        <Avatar src={item.profileimage} name={item.username} />
                                    </div>
                                    <div className="ml-4 flex flex-col">
                                        <p className="text-sm text-left font-medium flex flex-col text-text-color ">
                                            <span className="cursor-pointer">
                                                @{item.username}
                                            </span>
                                        </p>
                                        <div className="text-text-color text-left  text-xs">{parseRelativeDate(item.createdAt)}</div>
                                    </div>
                                </button>
                                <div className="flex gap-2 items-center justify-center">
                                    <button onClick={() => handleAddFriend(item.user_id)} className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-bg-color z-20 relative">
                                        <MdCheck className="linearText" />
                                    </button>
                                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-bg-color z-20 relative">
                                        <MdOutlineClose className="linearText" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </>
        );
    };

    const renderNotificationData = () => {
        // Show loading skeleton while loading
        if (isLoading) {
            return <NotificationLoadingSkeleton count={5} />;
        }

        // Show empty state if no notifications
        if (!localNotificationData || localNotificationData.length === 0) {
            return <EmptyNotificationState />;
        }

        return (
            <>
                {localNotificationData?.map((item: NotificationData, index: number) => {
                    const detail = JSON.parse(item.notificationDetail);
                    const notificationDateHeader = groupNotification(item.notificationTime);
                    const shouldShowDateHeader = notificationDateHeader && notificationDateHeader !== lastDateHeader;

                    if (detail.notificationType === "POST_LIKE" || "POST_COMMENT") {
                        if (item.isForInteractiveImage === "1") {
                            detail.description = detail.description.replace("post", "shot")
                        }
                        if (item.isForInteractiveVideo === "1") {
                            detail.description = detail.description.replace("post", "snip")
                        }
                    }

                    if (shouldShowDateHeader) {
                        lastDateHeader = notificationDateHeader;
                    }

                    return (
                        <div key={`notification-${index}`}>
                            {shouldShowDateHeader && (
                                <span className="block text-start font-semibold leading-6 text-base text-text-color  my-1 pl-2">
                                    {notificationDateHeader}
                                </span>
                            )}
                            <div className="flex justify-between p-2 border-b border-border-color">
                                <div className="flex items-center cursor-pointer group">
                                    <span
                                        onClick={(e) => { e.stopPropagation(); redirectUser(item.userId, `/home/users/${item.userId}`); }}
                                        className="flex items-center cursor-pointer mr-2"
                                        style={{ lineHeight: 0 }}
                                    >
                                        <Avatar src={item.userImage} name={item.userName} />
                                    </span>
                                    <div className="ml-4 flex flex-col">
                                        <div className="text-sm text-left font-medium text-text-color line-clamp-2 flex flex-wrap items-center">

                                            <button
                                                onClick={(e) => { e.stopPropagation(); redirectUser(item.userId, `/home/users/${item.userId}`); }}
                                                className="font-bold text-text-color focus:outline-none mr-1 inline-block"
                                                style={{ background: 'none', border: 'none', padding: 0 }}
                                            >
                                                {item.userName}
                                            </button>
                                            {(() => {
                                                const desc = detail.description || '';
                                                // Remove logged-in user's username if present at start
                                                const myUsername = loggedInUserName[0];
                                                let rest = desc;
                                                if (myUsername && rest.startsWith(myUsername)) {
                                                    rest = rest.replace(new RegExp(`^${myUsername}\\s*`), '').trim();
                                                }
                                                // Also remove the other user's username if present at start (to avoid double username)
                                                const otherUsername = `${item.userName}`;
                                                if (rest.startsWith(otherUsername)) {
                                                    rest = rest.replace(new RegExp(`^${otherUsername}\\s*`), '').trim();
                                                }
                                                return rest ? (
                                                    <button
                                                    onClick={() => handleRedirect('snips', item.postId)}
                                                    className="font-normal text-text-color focus:outline-none inline-block text-left truncate max-w-[120px]"
                                                    style={{ background: 'none', border: 'none', padding: 0 }}
                                                    title={rest}
                                                >
                                                    {rest}
                                                </button>
                                                ) : null;
                                            })()}
                                        </div>
                                        <div className="text-text-color text-left text-xs">{parseRelativeDate(item.notificationTime)}</div>
                                    </div>
                                </div>
                                {/* Rest of notification: redirect to post */}
                                <div className="flex-1 flex items-center justify-end cursor-pointer" onClick={(e) => { e.stopPropagation(); redirectUser(item.userId, `/home/users/${item.userId}`); }}>
                                    {/* Only render action buttons, images, etc. here, and make sure their onClick is not overridden */}
                                    <div className="hover:cursor-pointer">

                                        {item.notificationType === "NEW_FOLLOWER" || item.notificationType === "REQUEST_ACCEPT" ? (
                                            item.isFriend === 1 ? (
                                                <button className="linearBorder p-2 text-xs linearText rounded-sm max-md:text-xs">
                                                    Following
                                                </button>
                                            ) : item.isRequested === 1 ? (
                                                <button className="linearBorder p-2 text-xs linearText rounded-sm max-md:text-xs">
                                                    Requested
                                                </button>
                                           ) : item.isPrivateAccount === 1 ? (
                                            <button
                                            onClick={() => handleButtonClick(item.userId, item.isFriend, item.isPrivateAccount, item.isRequested)}
                                            className="linearBorder p-1 px-2 text-xs linearText rounded-sm max-md:text-xs min-w-[70px] flex-shrink-0"
                                            >
                                             {item.isUserFriend === 1 ? 'Follow Back' : 'Follow'}
                                            </button>
                                            ) : (
                                            <button
                                            onClick={() => handleButtonClick(item.userId, item.isFriend, item.isPrivateAccount, item.isRequested)}
                                            className="linearBorder p-1 px-2 text-xs linearText rounded-sm max-md:text-xs min-w-[70px] flex-shrink-0"
                                            >
                                             {item.isUserFriend === 1 ? 'Follow Back' : 'Follow'}
                                            </button>
                                            )
                                        ) : item.notificationType === "POST_COMMENT" || item.notificationType === "POST_LIKE" ? (
                                            <>
                                                {item.isForInteractiveVideo ? (
                                                    <button onClick={() => handleRedirect("snips", item.postId)} className="flex-shrink-0 w-12 h-12">
                                                        <SafeImage
                                                            src={item.coverFileName}
                                                            alt="Snip Cover file"
                                                            className="object-cover rounded-full w-full h-full"
                                                            height={500}
                                                            width={500}
                                                        />
                                                    </button>
                                                ) : item.coverFileName && (
                                                    <SafeImage
                                                        src={item.coverFileName}
                                                        alt="Post Cover file"
                                                        className="w-full h-full object-cover rounded-full"
                                                        height={500}
                                                        width={500}
                                                    />
                                                )}
                                            </>
                                        ) : item.notificationType === "COLLABORATION_INVITATION" && item.isAccepted === 0 && (
                                            <button
                                                className="linearBorder p-2 text-xs linearText rounded-sm max-md:text-xs"
                                                onClick={() => handleCollaborationInvite(item.postId, true)}
                                            >
                                                Accept
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </>
        );
    };

    useEffect(() => {
        setLocalNotificationData(notificatioData || []);
    }, [notificatioData]);

    return (
        <>
            {isNotificationOpen && (
                <CommonModalLayer isModal={false} onClose={toggleNotification}>
                    <div className="w-[28%] fixed max-lg:w-2/4 max-md:w-[90%] bg-bg-color h-full overflow-y-auto pt-4 px-5 right-0">
                        <div className="flex items-center justify-start">
                            <p className="text-2xl font-semibold leading-6 text-text-color  max-md:text-lg">
                                Notifications
                            </p>
                        </div>
                        {isPrivateAccount === 1 && (
                            <div className="flex items-center justify-between mt-3">
                                <button onClick={toggleFollowRequest} className={`flex-1 text-text-color  ${isFollowRequestOpen ? '' : 'linearText border-b border-b-primary-border-color pb-2'}`}>Activity</button>
                                <button onClick={toggleFollowRequest} className={`flex-1 text-text-color  ${isFollowRequestOpen ? 'linearText border-b border-b-primary-border-color pb-2' : ''}`}>Follow Request {"(" + followRequestData?.length + ")"}</button>
                            </div>
                        )}
                        <div className="w-full p-1 mt-2 flex flex-col gap-2 max-md:pb-14 max-h-[85vh] overflow-y-auto bg-bg-color rounded notification-scroll-container follower-scroll-container">
                            {isFollowRequestOpen ? renderFollowRequestData() : renderNotificationData()}
                        </div>
                    </div>
                </CommonModalLayer>
            )}
        </>
    );
};

export default Notification;