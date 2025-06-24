import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationData, FollowRequestData } from "@/models/notficationResponse";
import { getNotificationList } from "@/services/getpushnotification";
import { getFollowRequestList } from "@/services/getrequests";
import { getMessageCount } from "@/services/getmessagecount";
import { getNotificationAlert } from "@/services/notificationalert";

export const useLayoutApi = (isNotificationOpen: boolean, isPrivateAccount: number) => {
    const [notificationData, setNotificationData] = useState<NotificationData[]>([]);
    const [followRequestData, setFollowRequestData] = useState<FollowRequestData[]>([]);
    const [page, setPage] = useState(1);
    const [followerPage, setFollowerPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFollowerLoading, setIsFollowerLoading] = useState(false);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
    const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
    const [messageCount, setMessageCount] = useState<string | null>(null);
    const [notificationAlert, setNotificationAlert] = useState<boolean>(false);

    const initialNotificationLoadRef = useRef(false);
    const initialFollowRequestLoadRef = useRef(false);

    // Wrap fetchNotifications with useCallback
    const fetchNotifications = useCallback(async (isInitialLoad = false) => {
        if (isLoading || (!hasMoreNotifications && !isInitialLoad)) return;

        if(isInitialLoad){
            setNotificationData([]);
            setPage(1);
            setHasMoreNotifications(true);
            initialNotificationLoadRef.current = true;
        }

        setIsLoading(true);
        try {
            const currentPage = isInitialLoad ? 1 : page;

            const response = await getNotificationList({ page });

            if (response.isSuccess && response.data) {
                const dataNotified = Array.isArray(response.data) ? response.data : [];

                setNotificationData((prevData) => {
                    const newNotifications = dataNotified.filter(
                        (newItem) => !prevData.some(
                            (prevItem) => prevItem.userId === newItem.userId &&
                                prevItem.notificationTime === newItem.notificationTime
                        )
                    );
                    return [...prevData, ...newNotifications];
                });

                if(!isInitialLoad){
                    setPage((prevPage) => prevPage + 1);
                }
            } else {
                setHasMoreNotifications(false);
            }
        } catch (error) {
} finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMoreNotifications, page]);

    // Wrap fetchFollowRequests with useCallback
    const fetchFollowRequests = useCallback(async (isInitialLoad = false) => {
        if (isFollowerLoading || (!hasMoreFollowers && !isInitialLoad)) return;

        if (isInitialLoad) {
            setFollowRequestData([]);
            setFollowerPage(1);
            setHasMoreFollowers(true);
            initialFollowRequestLoadRef.current = true;
        }

        setIsFollowerLoading(true);
        try {
            const currentPage = isInitialLoad ? 1 : followerPage;

            const response = await getFollowRequestList({ page: followerPage });

            if (response.isSuccess && response.data) {
                const dataNotified = Array.isArray(response.data) ? response.data : [];

                setFollowRequestData((prevData) => {
                    const newFollowRequests = dataNotified.filter(
                        (newItem) => !prevData.some(
                            (prevItem) => prevItem.user_id === newItem.user_id &&
                                prevItem.createdAt === newItem.createdAt
                        )
                    );
                    return [...prevData, ...newFollowRequests];
                });

                if (!isInitialLoad) {
                    setFollowerPage(prevPage => prevPage + 1);
                }
            } else {
setHasMoreFollowers(false);
            }
        } catch (error) {
} finally {
            setIsFollowerLoading(false);
        }
    }, [isFollowerLoading, hasMoreFollowers, followerPage]);

    // Set up scroll listeners - add fetchNotifications and fetchFollowRequests to dependencies
    useEffect(() => {
        if(!isNotificationOpen) return;

        const handleScroll = () => {
            const scrollableElement = document.querySelector('.notification-scroll-container');

            if (scrollableElement) {
                const { scrollTop, scrollHeight, clientHeight } = scrollableElement;

                if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading && hasMoreNotifications) {
                    fetchNotifications(false);
                }
            }
        };

        const handleFollowerScroll = () => {
            const scrollableElement = document.querySelector('.follower-scroll-container');

            if (scrollableElement) {
                const { scrollTop, scrollHeight, clientHeight } = scrollableElement;

                if (scrollTop + clientHeight >= scrollHeight - 5 && !isFollowerLoading && hasMoreFollowers) {
                    fetchFollowRequests(false);
                }
            }
        };

        const timer = setTimeout(() => {
            const notificationElement = document.querySelector('.notification-scroll-container');
            const followerElement = document.querySelector('.follower-scroll-container');
    
            notificationElement?.addEventListener('scroll', handleScroll);
            followerElement?.addEventListener('scroll', handleFollowerScroll);
        },500);

        return () => {
            clearTimeout(timer);
            const notificationElement = document.querySelector('.notification-scroll-container');
            const followerElement = document.querySelector('.follower-scroll-container');
            notificationElement?.removeEventListener('scroll', handleScroll);
            followerElement?.removeEventListener('scroll', handleFollowerScroll);
        };
    }, [isNotificationOpen, isLoading, isFollowerLoading, hasMoreNotifications, hasMoreFollowers, fetchNotifications, fetchFollowRequests]);

    useEffect(() => {
        if (isNotificationOpen) {
            // Only fetch initial data once when panel opens
            if (!initialNotificationLoadRef.current) {
                fetchNotifications(true); // true = initial load
            }
            
            if (isPrivateAccount === 1 && !initialFollowRequestLoadRef.current) {
                fetchFollowRequests(true); // true = initial load
            }
        } else {
            initialNotificationLoadRef.current = false;
            initialFollowRequestLoadRef.current = false;
        }
    }, [isNotificationOpen, isPrivateAccount, fetchNotifications, fetchFollowRequests]);

    const fetchMessageCount = async () => {
        try {
            const response = await getMessageCount();
            if (response.isSuccess && response.data && response.data.length > 0) {
                setMessageCount(response.data[0]?.count);
            }
        } catch (error) {
}
    };

    const fetchNotificationAlert = async () => {
        try {
            const response = await getNotificationAlert();
            if (response.isSuccess && response.data && response.data.length > 0) {
                setNotificationAlert(response.data[0].hasUnread);
            }
        } catch (error) {
}
    };

    return {
        notificationData,
        followRequestData,
        messageCount,
        notificationAlert,
        isLoading,
        isFollowerLoading,
        fetchNotifications,
        fetchFollowRequests,
        fetchMessageCount,
        fetchNotificationAlert
    };
};