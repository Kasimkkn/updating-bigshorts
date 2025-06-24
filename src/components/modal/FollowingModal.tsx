import { addFriend } from "@/services/addfriend";
import { friendRequest } from "@/services/followrequest";
import { getFollowerList } from "@/services/userfriendlist";
import { FollowingModalData } from "@/types/usersTypes";
import useUserRedirection from "@/utils/userRedirection";
import { useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import Input from "../shared/Input";
import { FollowModalSkeleton } from "../Skeletons/Skeletons";
import CommonModalLayer from "./CommonModalLayer";
import useLocalStorage from "@/hooks/useLocalStorage";

type FollowingModalProps = {
    userId: string | number;
    closeModal: () => void;
    followingData: FollowingModalData[];
    isFromProfile?: boolean;
    fetchProfile: (userId: any) => void;
};

const FollowingModal = ({
    userId,
    closeModal,
    followingData,
    isFromProfile = true,
    fetchProfile,
}: FollowingModalProps) => {
    const [localFollowingData, setLocalFollowingData] =
        useState<FollowingModalData[]>(followingData);
    const [hasMore, setHasMore] = useState(true);
    const redirectUser = useUserRedirection();

    const [searchUsername, setSearchUsername] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const [id] = useLocalStorage<string>('userId', '');

    // Refs for infinite scroll
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    // Fetch more data function for infinite scroll
    const fetchMoreData = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        const data = {
            friendName: searchUsername,
            userId: Number(id),
            isCreatePost: 0,
            page: page + 1,
            pageSize: 20,
            username: searchUsername ? searchUsername : null,
        };

        try {
            const response = await getFollowerList(data);
            const newFollowing = Array.isArray(response.data) ? response.data : [];

            if (newFollowing.length === 0) {
                setHasMore(false);
            } else {
                // Check for duplicates using friendId
                const filteredNewFollowing = newFollowing.filter(newFollower =>
                    !localFollowingData.some(existingFollower =>
                        existingFollower.friendId === newFollower.friendId
                    )
                );

                if (filteredNewFollowing.length === 0) {
                    setHasMore(false);
                } else {
                    setLocalFollowingData((prev) => [...prev, ...filteredNewFollowing]);
                    setPage((prev) => prev + 1);
                }
            }
        } catch (error) {
            console.error("Error fetching more data:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Infinite scroll observer setup
    useEffect(() => {
        const currentLoadingTrigger = loadingTriggerRef.current;

        if (!currentLoadingTrigger) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !isLoading) {
                    fetchMoreData();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '20px'
            }
        );

        observerRef.current.observe(currentLoadingTrigger);

        return () => {
            if (observerRef.current && currentLoadingTrigger) {
                observerRef.current.unobserve(currentLoadingTrigger);
            }
        };
    }, [hasMore, isLoading, page, searchUsername]);

    useEffect(() => {
        const fetchFollowingDataWhenSearch = async () => {
            setIsLoading(true);
            let data = {
                friendName: searchUsername,
                userId: Number(id),
                isCreatePost: 0,
                page: 1,
                pageSize: 20,
                username: searchUsername ? searchUsername : null,
            };
            const response = await getFollowerList(data);
            const profilePost = Array.isArray(response.data) ? response.data : [];
            setLocalFollowingData(profilePost);
            setPage(1);
            setHasMore(profilePost.length === 20); // Assume more data if we got full page
            setIsLoading(false);
        };

        if (searchUsername.length > 0) {
            fetchFollowingDataWhenSearch();
        } else {
            setLocalFollowingData(followingData);
            setPage(1);
            setHasMore(true);
        }
    }, [searchUsername, followingData, id]);

    const handleButtonClick = async (
        userId: number,
        isFollow: number,
        isPrivate: number,
        isRequested: number
    ) => {
        if (isFollow) {
            try {
                await addFriend({ friendId: userId, isFollow: 0 });
                const updatedData = localFollowingData.map((user) =>
                    user.userId === userId ? { ...user, isFollow: 0 } : user
                );
                setLocalFollowingData(updatedData);
                fetchProfile(id)
            } catch (error) {
            }
        } else {
            if (isPrivate === 1) {
                if (isRequested === 0) {
                    try {
                        await friendRequest({ requestedId: userId, userId: Number(id) });
                        const updatedData = localFollowingData.map((user) =>
                            user.userId === userId ? { ...user, isRequested: 1 } : user
                        );
                        setLocalFollowingData(updatedData);
                        fetchProfile(id);
                    } catch (error) { }
                }
            } else {
                try {
                    await addFriend({ friendId: userId, isFollow: 1 });
                    const updatedData = localFollowingData.map((user) =>
                        user.userId === userId ? { ...user, isFollow: 1 } : user
                    );
                    setLocalFollowingData(updatedData);
                    fetchProfile(id);
                } catch (error) {
                }
            }
        }
    };

    return (
        <CommonModalLayer isModal={false} height={"h-max"} hideCloseButtonOnMobile={true} onClose={closeModal}>
            <div className="bg-primary-bg-color md:rounded-xl w-full max-w-4xl relative">
                <div className="w-full" ref={modalRef}>
                    <div className="flex items-center justify-start p-4 border-b border-border-color">
                        <h2 className="text-lg font-semibold">Following</h2>
                    </div>

                    <div className="px-3 pb-2 pt-4">
                        <Input
                            type="text"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            placeholder="Search"
                            className="w-full p-2 bg-secondary-bg-color focus:outline-none focus:ring-1 focus:ring-border-color"
                        />
                    </div>

                    <div
                        className="px-3 max-md:pb-14"
                        style={{ maxHeight: "65vh", overflowY: "auto" }}
                    >
                        {localFollowingData.length > 0 ? (
                            <>
                                {localFollowingData.map((user, index) => (
                                    <div
                                        key={user.friendId || index}
                                        className="flex items-center justify-between py-2 border-b border-border-color last:border-b-0"
                                    >
                                        <button
                                            onClick={() => {
                                                redirectUser(user.userId, `/home/users/${user.userId}`)
                                            }}
                                            className="flex items-center space-x-2"
                                        >
                                            <Avatar
                                                src={user.userProfileImage}
                                                name={user.friendName}
                                                width="w-10"
                                                height="h-10"
                                                isMoreBorder={false}
                                            />
                                            <div className="flex flex-col items-start">
                                                <p className="font-medium">@{user.friendUserName}</p>
                                                <p className="text-sm text-text-color">{user.friendName}</p>
                                            </div>
                                        </button>
                                        {Number(userId) === Number(id) && isFromProfile && (
                                            <button
                                                onClick={() =>
                                                    handleButtonClick(
                                                        user.userId,
                                                        user.isFollow,
                                                        user.isPrivate,
                                                        user.isRequested
                                                    )
                                                }
                                                className="px-2 py-1 border text-sm border-purple-600 linearText rounded-md"
                                            >
                                                {user.isFollow ? 'UnFollow' : (user.isRequested ? 'Requested' : 'Follow')}
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Infinite scroll trigger */}
                                {hasMore && (
                                    <div ref={loadingTriggerRef} className="py-4">
                                        {isLoading && (
                                            <div className="text-center py-4">
                                                <div className="inline-block w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!hasMore && localFollowingData.length > 0 && (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">You&apos;ve reached the end</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center">
                                <p>No following found.</p>
                            </div>
                        )}

                        {isLoading && localFollowingData.length === 0 && (
                            <FollowModalSkeleton title="Following" />
                        )}
                    </div>
                </div>
            </div>
        </CommonModalLayer>
    );
};

export default FollowingModal;