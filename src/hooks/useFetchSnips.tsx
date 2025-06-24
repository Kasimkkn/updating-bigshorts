import { PostlistItem, PostlistResponse } from "@/models/postlistResponse";
import { getPostDetails } from "@/services/getpostdetails";
import { snipSearch, SnipSearchRequest } from "@/services/snipsearch";
import useUserRedirection from "@/utils/userRedirection";
import { useCallback, useEffect, useRef, useState } from "react";

const useFetchSnips = (
    initialPage: number = 1,
    snipId?: number | null,
    usersPost?: PostlistItem[],
    postIndex?: number,
) => {
    const redirectUser = useUserRedirection();
    const [posts, setPosts] = useState<PostlistItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const pageRef = useRef<number>(initialPage);
    const isFetchingRef = useRef<boolean>(false);

    const fetchPostList = useCallback(async () => {
        if (!snipId) return;
        setLoading(true);
        try {
            const response: PostlistResponse = await getPostDetails(snipId.toString());
            if (response.isSuccess && response.data) {
                setPosts((prevPosts) => [...prevPosts, ...response.data]);
            }
            else {
                let message = response.message;
                if (message.includes("userid:")) {
                    let userId = message.split(":")[1];
                    let id = userId.split(" ")[0];
                    redirectUser(Number(id), `/home/users/${id}`);
                }
            }
        } catch (error) {
            console.error("Failed to fetch post list:", error);
            setError("Failed to fetch post list");
        } finally {
            setLoading(false);
        }
    }, [snipId, redirectUser]);

    const fetchPosts = useCallback(async () => {
        if (isFetchingRef.current) return;

        setLoading(true);
        isFetchingRef.current = true;

        const requestData: SnipSearchRequest = {
            query: "g",
            limit: 10,

        };

        try {
            const response: PostlistResponse = await snipSearch(requestData);
            if (response.isSuccess && response.data) {
                setPosts((prevPosts) => [...prevPosts, ...response.data]);
                pageRef.current += 1;
            } else {
setError(response.message || "Failed to load posts");
            }
        } catch (error) {
            console.error("Failed to fetch post list:", error);
            setError("Failed to fetch post list");
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        if (usersPost) {
            setPosts(usersPost);
            return
        }
        if (snipId == null) {
            fetchPostList();
        }
        else {
            fetchPostList()
        }
    }, [usersPost, snipId, fetchPostList]);


    return { posts, setPosts, fetchPosts, fetchPostList, loading, error };
};

export default useFetchSnips;
