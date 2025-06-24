import { TaggedUsers } from "@/models/postlistResponse";
import { discoverhashtag } from "@/services/discoverhashtag";
import { getHashtagList } from "@/services/hashtaglist";
import useUserRedirection from "@/utils/userRedirection";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface PostTitleProps {
    description: string;
    taggedUsers: TaggedUsers[];
    setBackDrop?: (value: boolean) => void;
    userName?: string;
    userId?: number;
}

const PostTitle = ({ description, taggedUsers, setBackDrop, userName, userId }: PostTitleProps) => {
    const redirectUser = useUserRedirection();
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();
    
    useEffect(()=>{
        setIsExpanded(false);  //reset state when snip changes
    },[description])

    const handleHashtagClick = async (tag: string) => {
        const data = await getHashtagList({ hashtag: tag });
        const matchingHashtag = data?.find(item => item.name === tag);

        const id = data[0].id;
        if (!id) return;
        const numericId = parseInt(id);
        try {
            const response = await discoverhashtag({ hashTagId: numericId });
            if (response) {
                router.push(`/home/hashtags/${id}`);
            } else {
                toast("No more posts found for " + tag);
            }
        } catch (error) {
            console.error("API call failed:", error);
            toast("No more posts found for " + tag);
        }
}

    const handleMentionClick = (mention: string) => {

        if (!taggedUsers) return;
        const username = mention.replace("@", "");
        const matchedUser = taggedUsers.find(
            (user) => user.userName.toLowerCase() === username.toLowerCase()
        );

        if (matchedUser) {
            redirectUser(matchedUser.userId, `/home/users/${matchedUser.userId}`)
        }
    }

    const renderTextWithTags = (text: string) => {
        const parts = text.split(/(\s+)/);

        return parts.map((part, i) => {
            if (/^#\w+/.test(part)) {
                return (
                    <span
                        key={i}
                        className="linearText cursor-pointer"
                        onClick={(e) => {e.stopPropagation(); handleHashtagClick(part)}}
                    >
                        {part}
                    </span>
                );
            } else if (/^@\w+/.test(part)) {
                return (
                    <span
                        key={i}
                        className="linearText cursor-pointer"
                        onClick={(e) => {e.stopPropagation(); handleMentionClick(part)}}
                    >
                        {part}
                    </span>
                );
            } else {
                return <span key={i}>{part}</span>;
            }
        });
    };

    const handleExpansion = ()=>{
        setIsExpanded(!isExpanded);
        if (setBackDrop) setBackDrop(!isExpanded);
    }

    const handleUserRedirectiion = () => {
        if(!userId) return;
        redirectUser(userId, `/home/users/${userId}`);
    }

    return (
        <div 
            className="w-full transition-all duration-300 ease-out text-start my-1 leading-relaxed break-words whitespace-pre-wrap overflow-y-scroll"
            style={{
                maxHeight: isExpanded ? "200px" : "60px",
            }}
            onClick={handleExpansion}>
            <p className={`${isExpanded ? "" : "line-clamp-2"}`}>
                <span className="font-semibold cursor-pointer" onClick={handleUserRedirectiion}>{userName ? userName+" " : ""}</span>{renderTextWithTags(description)}
            </p>
        </div>
    );
}

export default PostTitle;