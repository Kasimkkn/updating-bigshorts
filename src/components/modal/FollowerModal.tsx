import { addFriend } from "@/services/addfriend";
import { getFanList } from "@/services/fanlistforuser";
import { friendRequest } from "@/services/followrequest";
import { removeFollower } from "@/services/removefollower";
import { FollowerModalData } from "@/types/usersTypes";
import useUserRedirection from "@/utils/userRedirection";
import { useEffect, useRef, useState } from "react";
import { CiSquareRemove } from "react-icons/ci";
import Avatar from "../Avatar/Avatar";
import Input from "../shared/Input";
import { FollowModalSkeleton } from "../Skeletons/Skeletons";
import CommonModalLayer from "./CommonModalLayer";
import useLocalStorage from "@/hooks/useLocalStorage";

type FollowersModalProps = {
    userId: number | string;
    closeModal: () => void;
    followerData: FollowerModalData[];
    fetchProfile: (userId: any) => void;
    isFromProfile?: boolean;
};

const FollowerModal = ({
    userId,
    closeModal,
    followerData,
    fetchProfile,
    isFromProfile = true,
}: FollowersModalProps) => {
    const [localFollowerData, setLocalFollowerData] =
        useState<FollowerModalData[]>(followerData);
    const [hasMore, setHasMore] = useState(true);
    const [searchUsername, setSearchUsername] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const redirectUser = useUserRedirection();
    const [id] = useLocalStorage<string>('userId', '');

    // Refs for infinite scroll
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    const handleButtonClick = async (
        userId: number,
        isFollow: number,
        isPrivate: number,
        isRequested: number
    ) => {
        if (isPrivate === 1) {
            if (isFollow === 0 && isRequested === 0) {
                try {
                    await friendRequest({ requestedId: userId, userId: Number(id) });
                    const updatedData = localFollowerData.map((user) =>
                        user.userId === userId ? { ...user, isRequested: 1 } : user
                    );
                    setLocalFollowerData(updatedData);
                    fetchProfile(id);
                } catch (error) { }
            }
        } else {
            if (isFollow === 0) {
                try {
                    await addFriend({ friendId: userId, isFollow: 1 });
                    const updatedData = localFollowerData.map((user) =>
                        user.userId === userId ? { ...user, isFollow: 1 } : user
                    );
                    setLocalFollowerData(updatedData);
                    fetchProfile(id);
                } catch (error) {
                    console.error("Error adding friend:", error);
                }
            }
        }
    };

    const handleRemoveFollower = async (userId: number) => {
        try {
            await removeFollower({ userId: userId });
            const updatedData = localFollowerData.filter((user) =>
                user.userId !== userId
            );
            setLocalFollowerData(updatedData);
            fetchProfile(id);
        } catch (error) {
        }
    }

    // Fetch more data function for infinite scroll
    const fetchMoreData = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        const data = {
            friendName: searchUsername,
            userId: id!,
            isCreatePost: 0,
            page: page + 1,
            pageSize: 20,
            username: searchUsername ? searchUsername : null,
        };

        try {
            const response = await getFanList(data);
            const newFollowers = Array.isArray(response.data) ? response.data : [];

            if (newFollowers.length === 0) {
                setHasMore(false);
            } else {
                // Check for duplicates
                const filteredNewFollowers = newFollowers.filter(newFollower =>
                    !localFollowerData.some(existingFollower =>
                        existingFollower.userId === newFollower.userId
                    )
                );

                if (filteredNewFollowers.length === 0) {
                    setHasMore(false);
                } else {
                    setLocalFollowerData((prev) => [...prev, ...filteredNewFollowers]);
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
        const fetchFollowerDataOnSearch = async () => {
            setIsLoading(true);
            let data = {
                friendName: searchUsername,
                userId: id,
                isCreatePost: 0,
                page: 1,
                pageSize: 20,
                username: searchUsername || null,
            };
            const response = await getFanList(data);
            const profilePost = Array.isArray(response.data) ? response.data : [];
            setLocalFollowerData(profilePost);
            setPage(1);
            setHasMore(profilePost.length === 20); // Assume more data if we got full page
            setIsLoading(false);
        };

        if (searchUsername.length > 0) {
            fetchFollowerDataOnSearch();
        } else {
            setLocalFollowerData(followerData);
            setPage(1);
            setHasMore(true);
        }
    }, [searchUsername, followerData, id]);

    return (
        <CommonModalLayer isModal={false} height={"h-max"} hideCloseButtonOnMobile={true} onClose={closeModal}>
            <div className="bg-primary-bg-color md:rounded-xl w-full max-w-4xl relative">
                <div className="w-full" ref={modalRef}>
                    <div className="flex items-center justify-start p-4 border-b border-border-color">
                        <h2 className="text-lg font-semibold">Followers</h2>
                    </div>

                    <div className="px-3 pb-2 pt-4">
                        <Input
                            type="text"
                            placeholder="Search"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            className="w-full p-2 bg-secondary-bg-color focus:outline-none focus:ring-1 focus:ring-border-color"
                        />
                    </div>

                    <div
                        className="px-3 max-md:pb-14"
                        style={{ maxHeight: "65vh", overflowY: "auto" }}
                    >
                        {localFollowerData.length > 0 ? (
                            <>
                                {localFollowerData.map((user) => (
                                    <div
                                        key={user.userId}
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
                                                name={user.userFullName}
                                                width="w-10"
                                                height="h-10"
                                                isMoreBorder={false}
                                            />
                                            <div className="flex flex-col items-start">
                                                <p className="font-medium text-left">@{user.userName}</p>
                                                <p className="text-sm text-text-color text-left">{user.userFullName}</p>
                                            </div>
                                        </button>

                                        <div className="flex ites-center gap-2">
                                            {Number(userId) === Number(id) && isFromProfile && (
                                                <>
                                                    {user.isFollow === 1 ? (
                                                        <button className="px-2 py-1 border text-sm border-purple-600 linearText rounded-md">
                                                            Following
                                                        </button>
                                                    ) : user.isRequested === 1 ? (
                                                        <button className="px-2 py-1 border text-sm border-purple-600 linearText rounded-md">
                                                            Requested
                                                        </button>
                                                    ) : user.isPrivate === 1 ? (
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
                                                            Follow
                                                        </button>
                                                    ) : (
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
                                                            Follow
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveFollower(user.userId)
                                                        }
                                                        className=""
                                                    >
                                                        <CiSquareRemove size={30} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
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

                                {!hasMore && localFollowerData.length > 0 && (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">You&apos;ve reached the end</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center">
                                <p>No followers found.</p>
                            </div>
                        )}

                        {isLoading && localFollowerData.length === 0 && (
                            <FollowModalSkeleton title="Follower" />
                        )}
                    </div>
                </div>
            </div>
        </CommonModalLayer>
    );
};

export default FollowerModal;