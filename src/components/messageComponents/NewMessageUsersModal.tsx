import { useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import CommonModalLayer from "../modal/CommonModalLayer";
import Button from "../shared/Button";
import { AllUsersInfo, AllUsersResponse } from "@/models/allUsersResponse";
import { ChatUserListRequest, getChatUserList } from "@/services/userchatlist";
import { MdSearch } from "react-icons/md";
import { SearchUsersSkeleton } from "../Skeletons/Skeletons";

interface NewMessageUsersModalProps {
    onClose: () => void;
    onSelectUser: (chatId: number | null, userId: number) => void;
}

const NewMessageUsersModal = ({onClose, onSelectUser}: NewMessageUsersModalProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [suggestedUsers, setSuggestedUsers] = useState<AllUsersInfo[]>([]);
    const [followingUsers, setFollowingUsers] = useState<AllUsersInfo[]>([]);
    const [input, setInput] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState(true);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const LIMIT = 10;

    useEffect(() => {
        fetchModalUsers();
    }, [page]);

    const fetchModalUsers = async () => {
        setLoading(true);
        try {
            const chatUserRequest: ChatUserListRequest = {
                pageNo: page,
                limit: LIMIT,
            };
            
            const data: AllUsersResponse = await getChatUserList(chatUserRequest);
            if (page === 1) {
                setFollowingUsers(data.data);
            } else {
                setFollowingUsers((prev) => [...prev, ...data.data]);
            }

            if (data.data.length < 10) {
                setHasMore(false); // No more data to fetch
            } else {
                setHasMore(true);
            }
        } catch (err: any) {
            console.error('Error fetching users:', err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSelectUser = (userId: number) => {
        onSelectUser(null, userId);
        onClose();
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setPage(1);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    return (
        <CommonModalLayer onClose={onClose} width='w-max' height='h-max'
            isModal={false}
            hideCloseButtonOnMobile={true}
        >
            <div className="p-4 flex flex-col rounded-lg w-full md:w-96 h-[65vh] md:h-[80vh] bg-primary-bg-color text-text-color z-50">
                <div className="flex justify-between items-center mb-4 border-b border-border-color pb-2">
                    <h2 className="text-lg md:text-xl font-semibold text-text-color">New Message</h2>
                </div>
                <div className="relative">
                    <input
                    type="text"
                    value={input}
                    onChange={handleSearch}
                    className="w-full mb-2 px-4 py-2 pl-10 rounded-lg bg-bg-color border border-border-color"
                    placeholder="Search"
                    />
                    <MdSearch className='p-1 w-8 h-8 rounded-full hover:bg-secondary-bg-color absolute left-1 top-1/2 transform -translate-y-1/2 text-text-color text-lg'/>
                </div>
                <div className="space-y-2 h-full overflow-y-auto" onScroll={handleScroll} ref={scrollContainerRef}>
                    {followingUsers.map((user) => (
                        <div
                            key={user.userId}
                            className="flex items-center p-3 border-b border-border-color hover:bg-primary-bg-color rounded-lg transition-colors"
                        >
                            <div className="flex items-center flex-1 min-w-0">
                                <Avatar src={user.userProfileImage} name={user.userName} />
                                <div className="flex flex-col justify-center ml-3 flex-1 min-w-0">
                                    <p className="font-semibold">{user.userFullName ? user.userFullName : user.userName}</p>
                                    {user.userFullName && <p className="text-sm">@{user.userName}</p>}
                                </div>
                            </div>
                            <Button
                                isLinearBorder={true}
                                onClick={() => {
                                    handleSelectUser(Number(user.userId));
                                }}
                                className="text-xs md:text-sm px-2 py-1 md:px-3 md:py-2"
                            >
                                Message
                            </Button>
                        </div>
                    ))}
                    {loading && (
                        <div className="w-full">
                            <SearchUsersSkeleton />
                        </div>
                    )}
                    {!loading && followingUsers.length === 0 && (
                        <p className="text-center text-text-color">No Users Found</p>
                    )} 
                </div>
            </div>
        </CommonModalLayer>
    );
}

export default NewMessageUsersModal;