"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaShare } from "react-icons/fa";
import { FaEllipsisVertical } from "react-icons/fa6";
import { GoComment } from "react-icons/go";
import { IoChevronBackSharp, IoChevronDownSharp, IoChevronUpSharp, IoStarOutline, IoStarSharp } from "react-icons/io5";
import ReactPlayer from "react-player";

import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import useFetchPosts from "@/hooks/useFetchPost";
import { VideoList } from "@/models/videolist";
import { saveVideoLike } from "@/services/savevideolike";

import CommentsSection from "@/components/CommentUi/CommentUi";
import SharePostModal from "@/components/modal/SharePostModal";
import MoreOptions from "@/components/MoreOptions";
import { SnipsPageSkeleton } from "@/components/Skeletons/Skeletons";
import VideoPlayerWidget from "@/components/VideoAndImagesComp/VideoPlayerWidget";
import { PostlistItem, PostlistResponse } from "@/models/postlistResponse";
import { SearchResultItem as FlixSearchResultItem } from "@/services/flixsearch";
import { getFlixDetails } from "@/services/getflixdetails";
import { getLikeCount, LikeCountData } from "@/services/getlikecount";
import { getPostDetails } from "@/services/getpostdetails";
import { useRouter } from "next/navigation";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import useLocalStorage from "@/hooks/useLocalStorage";


const SnipsPage = () => {
  const router = useRouter();
  const { inAppSnipsData, snipIndex, snipId } = useInAppRedirection()
  const { posts, fetchPosts, loading, error, setPosts } = useFetchPosts(1, snipId, inAppSnipsData);
  const [currentIndex, setCurrentIndex] = useState<number>(snipIndex || 0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [jumpDuration, setJumpDuration] = useState<number>(0);
  const [opentheComment, setOpentheComment] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [allCurrentVideos, setAllCurrentVideos] = useState<VideoList[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const videoRef = useRef<ReactPlayer | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showMuteOverlay, setShowMuteOverlay] = useState<boolean>(false);
  const [openMoreOptions, setOpenMoreOptions] = useState<number | null>(null)
  const [openShareModal, setOpenShareModal] = useState<number | null>(null)
  const [currentVideoLikeDetails, setCurrentVideoLikeDetails] = useState<LikeCountData | null>(null)
  const [linkedPost, setLinkedPost] = useState<PostlistItem | null>(null);
  const [showLinkedContent, setShowLinkedContent] = useState(false);
  const [originalPost, setOriginalPost] = useState<PostlistItem | null>(null);
  const [postHistory, setPostHistory] = useState<number[]>([]);
  const { setInAppFlixData, clearFlixData } = useInAppRedirection();

  // Modified function to handle linked content navigation
  const handleLinkedContentNavigation = async (contentType: 'post' | 'flix', contentId: number) => {
    if (contentType === 'post') {
      // Save the current post as the original post if we don't have one yet
      if (!originalPost) {
        setOriginalPost(currentPost);
      }

      // Save the current post ID to history
      setPostHistory(prev => [...prev, currentPost.postId]);

      // Call function to fetch and display the linked post
      handleFetchLinkedPost(contentId);
    } else if (contentType === 'flix') {
      try {
        // First get the flix details
        const response = await getFlixDetails(contentId, userId);

        if (response.isSuccess && response.data && response.data.length > 0) {
          const flixData = response.data[0];

          // Now use redirectToFlix with the retrieved data
          redirectToFlix(flixData);
        } else {
          console.error("Failed to fetch flix details:", response.message);
          // Fallback: Try to navigate directly if data fetch fails
          router.push(`/home/flix/${contentId}`);
        }
      } catch (error) {
        console.error("Error fetching flix details:", error);
        // Fallback: Try to navigate directly if data fetch fails
        router.push(`/home/flix/${contentId}`);
      }
    }
  };


  const redirectToFlix = (flixData: PostlistItem | FlixSearchResultItem) => {
    clearFlixData();

    // Convert SearchResultItem to PostlistItem
    const formattedData = 'id' in flixData ? {
      postId: flixData.id,
      postTitle: flixData.title,
      userFullName: flixData.username,
      coverFile: flixData.coverFile,
      userProfileImage: flixData.userProfileImage,
      userId: flixData.userid,
      // Add other required PostlistItem fields with defaults
      viewCounts: 0,
      scheduleTime: new Date().toISOString(),
      isLiked: 0,
      likeCount: 0,
      isSaved: 0,
      saveCount: 0,
    } : flixData;

    setInAppFlixData(formattedData);

    // Use the correct postId for navigation
    const postId = 'id' in flixData ? flixData.id : flixData.postId;
    router.push(`/home/flix/${postId}`);
  };
  // Function to fetch and display the linked post
  const handleFetchLinkedPost = async (postId: number) => {
    try {
      const response: PostlistResponse = await getPostDetails(postId.toString());

      if (response.isSuccess && response.data?.length > 0) {
        // Replace the current posts array with the new post
        setPosts([response.data[0]]);

        // Set the current index to 0 to display the new post
        setCurrentIndex(0);

        // Reset video state
        setCurrentTime(0);
        setCurrentVideoIndex(0);

        // Add a small delay to allow the new post to be properly loaded
        setTimeout(() => {
          if (response.data[0]?.interactiveVideo) {
            const interactiveVideos = JSON.parse(response.data[0].interactiveVideo.toString());
            setAllCurrentVideos(interactiveVideos);

            const rawVideoPath = interactiveVideos[0]?.path || "";
            const newVideoUrl = rawVideoPath.replace(
              "https://d1332u4stxguh3.cloudfront.net/",
              "/video/"
            );

            setVideoUrl(newVideoUrl);
          }
        }, 100);
      } else {
        let message = response.message;
        if (message.includes("userid:")) {
          let userId = message.split(":")[1];
          let id = userId.split(" ")[0];
          // Handle redirection if needed
        }
      }
    } catch (error) {
      console.error("Failed to fetch linked post details:", error);
    }
  };

  const handleFetchLinkedMini = async (postId: number) => {
    try {
      const response: PostlistResponse = await getFlixDetails(postId, userId);

      if (response.isSuccess && response.data && response.data.length > 0) {
        // Replace the current posts array with the new post
        setPosts([response.data[0]]);

        // Set the current index to 0 to display the new post
        setCurrentIndex(0);

        // Reset video state
        setCurrentTime(0);
        setCurrentVideoIndex(0);

        // Add a small delay to allow the new post to be properly loaded
        setTimeout(() => {
          if (response.data[0]?.interactiveVideo) {
            const interactiveVideos = JSON.parse(response.data[0].interactiveVideo.toString());
            setAllCurrentVideos(interactiveVideos);

            const rawVideoPath = interactiveVideos[0]?.path || "";
            const newVideoUrl = rawVideoPath.replace(
              "https://d1332u4stxguh3.cloudfront.net/",
              "/video/"
            );

            setVideoUrl(newVideoUrl);
          }
        }, 100);
      } else {
        let message = response.message;
        if (message.includes("userid:")) {
          let userId = message.split(":")[1];
          let id = userId.split(" ")[0];
          // Handle redirection if needed
        }
      }
    } catch (error) {
      console.error("Failed to fetch linked post details:", error);
    }
  };

  // Function to navigate back to the previous post
  const handleNavigateBack = async () => {
    if (postHistory.length > 0) {
      // Get the last post ID from history
      const prevPostId = postHistory[postHistory.length - 1];

      // Remove the last post ID from history
      setPostHistory(prev => prev.slice(0, -1));

      // If we're returning to the original post
      if (postHistory.length === 1 && originalPost) {
        // Restore the original post
        setPosts([originalPost]);
        setCurrentIndex(0);
        setCurrentTime(0);
        setCurrentVideoIndex(0);

        // Reset the original post if we're at the beginning of history
        setOriginalPost(null);

        // Update video URL
        setTimeout(() => {
          if (originalPost?.interactiveVideo) {
            const interactiveVideos = JSON.parse(originalPost.interactiveVideo.toString());
            setAllCurrentVideos(interactiveVideos);

            const rawVideoPath = interactiveVideos[0]?.path || "";
            const newVideoUrl = rawVideoPath.replace(
              "https://d1332u4stxguh3.cloudfront.net/",
              "/video/"
            );

            setVideoUrl(newVideoUrl);
          }
        }, 100);
      } else {
        // Fetch the previous post
        try {

          const response: PostlistResponse = await getPostDetails(prevPostId.toString());

          if (response.isSuccess && response.data && response.data.length > 0) {
            // Replace the current posts array with the previous post
            setPosts([response.data[0]]);

            // Set the current index to 0 to display the previous post
            setCurrentIndex(0);

            // Reset video state
            setCurrentTime(0);
            setCurrentVideoIndex(0);

            // Update video URL
            setTimeout(() => {
              if (response.data[0]?.interactiveVideo) {
                const interactiveVideos = JSON.parse(response.data[0].interactiveVideo.toString());
                setAllCurrentVideos(interactiveVideos);

                const rawVideoPath = interactiveVideos[0]?.path || "";
                const newVideoUrl = rawVideoPath.replace(
                  "https://d1332u4stxguh3.cloudfront.net/",
                  "/video/"
                );

                setVideoUrl(newVideoUrl);
              }
            }, 100);
          }
        } catch (error) {
          console.error("Failed to fetch previous post:", error);
        }
      }
    }
  };

  const [id, , isHydrated] = useLocalStorage<string>('userId', '');
  const userId = id ? parseInt(id) : 0;
  const currentPost = useMemo(() => {
    return posts[currentIndex];
  }, [posts, currentIndex]);

  useEffect(() => {
    if (!isHydrated) return;
    if (currentIndex >= posts.length - 1 && !loading) {
      fetchPosts(id);
    }
  }, [currentIndex, fetchPosts, loading, isHydrated]);

  useEffect(() => {
    if (currentPost?.interactiveVideo && currentVideoIndex >= 0) {
      const interactiveVideos = JSON.parse(currentPost.interactiveVideo.toString());
      setAllCurrentVideos(interactiveVideos);

      const rawVideoPath = interactiveVideos[currentVideoIndex]?.path || "";
      const newVideoUrl = rawVideoPath.replace(
        "https://d1332u4stxguh3.cloudfront.net/",
        "/video/"
      );

      if (newVideoUrl !== videoUrl) {
        setVideoUrl(newVideoUrl);
      }
    }
  }, [currentPost, currentVideoIndex, videoUrl]);
  useEffect(() => {
    if (currentPost?.postId) {
      // Update URL with postId or a unique slug
      router.push(`/home/snips/${currentPost.postId}`, { scroll: false });
    }
  }, [currentPost]);

  useEffect(() => {
    const fetchLikeCounts = async (videoId: number) => {
      const res = await getLikeCount(videoId);
      if (res.isSuccess) {
        setCurrentVideoLikeDetails(res.data);
      } else {
        console.error("Error fetching like counts:", res.message);
        setCurrentVideoLikeDetails(null); //set to null, display data from postdetails as fallback
      }
    }

    const videoId = allCurrentVideos[currentVideoIndex]?.video_id;
    if (videoId) {
      fetchLikeCounts(videoId);
    } else {
      setCurrentVideoLikeDetails(null); //set to null, display data from postdetails as fallback
    }

  }, [videoUrl])

  const updateCurrentIndex = useCallback((index: number, indexOfButton: number, type: number) => {
    setCurrentVideoIndex(index);
    allCurrentVideos[currentVideoIndex].currentTime = currentTime;
    setJumpDuration(allCurrentVideos[currentVideoIndex]?.currentTime ?? 0);
    let rawVideoPath = "";
    if (type === 1) {
      rawVideoPath = allCurrentVideos[currentVideoIndex]?.functionality_datas?.list_of_buttons[indexOfButton]?.on_action?.video_path || "";
    } else if (type === 2) {
      rawVideoPath = allCurrentVideos[currentVideoIndex]?.functionality_datas?.list_of_images[indexOfButton]?.on_action?.video_path || "";
    }
    const newVideoUrl = rawVideoPath.replace("https://d1332u4stxguh3.cloudfront.net/", "/video/");
    if (newVideoUrl !== videoUrl) {
      setVideoUrl(newVideoUrl);
    }
  },
    [currentTime, currentVideoIndex, allCurrentVideos, videoUrl]
  );


  const handleDownArrow = useCallback(() => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setCurrentTime(0);
    }
  }, [currentIndex, posts.length]);


  const handleUpArrow = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setCurrentTime(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleUpArrow();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleDownArrow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUpArrow, handleDownArrow]);


  const handleMute = useCallback(() => {
    setIsMuted((prev) => !prev);

    setShowMuteOverlay(true);
    setTimeout(() => {
      setShowMuteOverlay(false);
    }, 500);
  }, []);

  const previousVideo = useCallback(() => {
    const parentId = allCurrentVideos[currentVideoIndex]?.parent_id;
    if (parentId !== undefined && parentId !== currentVideoIndex) {
      setCurrentVideoIndex(parentId);
      const newVideoUrl = allCurrentVideos[parentId].path?.replace(
        "https://d1332u4stxguh3.cloudfront.net/",
        "/video/"
      );
      setVideoUrl(newVideoUrl);
    }
  }, [allCurrentVideos, currentVideoIndex]);

  if (loading && posts.length === 0) {
    return <SnipsPageSkeleton />
  }

  const updatePost = (id: number, property: string, isBeforeUpdate: number) => {
    if (property === 'like') {
      isBeforeUpdate ? setCurrentVideoLikeDetails(prev => ({ ...prev!, isLiked: 0, likeCount: prev!.likeCount - 1 })) : setCurrentVideoLikeDetails(prev => ({ ...prev!, isLiked: 1, likeCount: prev!.likeCount + 1 }))
    } else if (property === 'save') {
      isBeforeUpdate ? setPosts(prev => prev.map(post => post.postId === id ? { ...post, isSaved: 0, saveCount: post.saveCount - 1 } : post)) : setPosts(prev => prev.map(post => post.postId === id ? { ...post, isSaved: 1, saveCount: post.saveCount + 1 } : post))
    } else if (property === 'delete') {
      setPosts((prev) => prev.filter(post => post.postId !== id));
    } else if (property === 'block' || property === 'hide') {
      // Logic for refreshing feed
      setPosts((prev) => prev.filter(post => post.userId !== id));
    } else if (property === 'comment') {
      setPosts(prev => prev.map(post => post.postId === id ? { ...post, commentCount: post.commentCount + isBeforeUpdate } : post)); // isBeforeUpdate = -1 for deleting and 1 for sending comment
    }
  }

  const handleLikeToVideo = async (postId: number, videoId: number) => {
    if (currentVideoLikeDetails?.videoId === videoId) {
      const isLiked = currentVideoLikeDetails.isLiked;
      const updatedIsLiked = isLiked === 1 ? 0 : 1;

      updatePost(postId, 'like', isLiked)

      try {

        const response = await saveVideoLike({ postId, videoId, isLike: updatedIsLiked });
        if (response.isSuccess) {

        } else {
          posts[currentIndex] = {
            ...currentPost,
            isLiked: updatedIsLiked === 1 ? 0 : 1,
            likeCount: updatedIsLiked ? currentPost.likeCount : currentPost.likeCount + 1,
          };
        }
      } catch (error) {
        console.error('Error liking the video:', error);
        posts[currentIndex] = {
          ...currentPost,
          isLiked: updatedIsLiked === 1 ? 0 : 1,
          likeCount: updatedIsLiked ? currentPost.likeCount : currentPost.likeCount + 1,
        };
      }
    }
  };

  const closeLinkedContent = () => {
    setShowLinkedContent(false);
    setLinkedPost(null);
  };

  const toggleComment = () => {
    setOpentheComment(!opentheComment);
  }

  const closeTheCommentModal = () => {
    setOpentheComment(false);
  }


  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex items-center justify-center w-full max-md:h-[calc(100vh-4.2rem)] h-screen sm:px-4 max-md:pb-20">
      {currentPost && (
        <div className="flex flex-col items-center justify-center relative rounded-lg">

          {currentPost.videoFile && currentPost.videoFile.length > 0 && (
            <VideoPlayerWidget
              videoRef={videoRef}
              videoUrl={videoUrl}
              isMuted={isMuted}
              handleNext={handleDownArrow}
              handleMute={handleMute}
              setCurrentTime={setCurrentTime}
              jumpDuration={jumpDuration}
              currentTime={currentTime}
              allCurrentVideos={allCurrentVideos}
              currentVideoIndex={currentVideoIndex}
              currentPost={currentPost}
              updateCurrentIndex={updateCurrentIndex}
              currentIndex={currentIndex}
              navigateToLinkedContent={handleLinkedContentNavigation}
            />
          )}
          {currentVideoIndex > 0 && (
            <div className="absolute top-4 left-3 max-lg:left-40">
              <button
                onClick={previousVideo}
                className="hover:cursor-pointer p-1 rounded-full bg-primary-bg-color"
              >
                <IoChevronBackSharp className="text-xl text-text-color" />
              </button>
            </div>
          )}
          {postHistory.length > 0 && currentVideoIndex === 0 && (
            <div className="absolute top-4 left-3 max-lg:left-40 z-20">
              <button
                onClick={handleNavigateBack}
                className="hover:cursor-pointer p-1 rounded-full bg-primary-bg-color"
              >
                <IoChevronBackSharp className="text-xl text-text-color" />
              </button>
            </div>
          )}
          <div className="absolute rounded-r-md h-full flex flex-col items-center justify-center right-0 sm:text-text-color text-primary-text-color max-sm:bg-gradient-to-l from-black/50 to-transparent sm:translate-x-full z-10">
            <button
              onClick={() =>
                handleLikeToVideo(
                  currentPost.postId,
                  allCurrentVideos[currentVideoIndex].video_id!
                )
              }
              className="flex items-center justify-center flex-col gap-2 pointer-events-auto"
            >
              {currentVideoLikeDetails &&
                currentVideoLikeDetails.isLiked ? (
                <IoStarSharp className="text-4xl p-1 text-yellow-500" />
              ) : (
                <IoStarOutline className="text-4xl p-2 hover:text-yellow-500" />
              )
              }
              {currentVideoLikeDetails &&
                <span className="ml-1 text-sm">
                  {currentVideoLikeDetails.likeCount}
                </span>
              }
            </button>

            <button
              onClick={toggleComment}
              className="flex items-center justify-center flex-col gap-2 pointer-events-auto"
            >
              <GoComment className="text-4xl p-2" />
              <span className="ml-1 text-sm">{currentPost.commentCount}</span>
            </button>

            <button
              className="flex items-center justify-center flex-col gap-2 pointer-events-auto"
              onClick={() => setOpenShareModal(currentPost.postId)}
            >
              <FaShare className="text-4xl p-2" />
              <span className="ml-1 text-sm">Share</span>
            </button>

            <button
              className="relative flex items-center justify-center flex-col gap-2 pointer-events-auto mb-10"
              onClick={() => setOpenMoreOptions(currentPost.postId)}
            >
              <FaEllipsisVertical className="text-4xl p-2" />
              <span className="ml-1 text-sm">More</span>
              {openMoreOptions && (
                <MoreOptions
                  post={currentPost}
                  setIsOpen={setOpenMoreOptions}
                  isSnipsPage={true}
                  updatePost={updatePost}
                  page="snips"
                />
              )}
            </button>

            <button
              onClick={handleUpArrow}
              disabled={currentIndex === 0}
              className="focus:outline-none disabled:opacity-50 pointer-events-auto mb-2"
            >
              <IoChevronUpSharp className="text-3xl p-1 rounded-full border border-border-color cursor-pointer" />
            </button>

            <button
              onClick={handleDownArrow}
              className="focus:outline-none disabled:opacity-50 pointer-events-auto"
            >
              <IoChevronDownSharp className="text-3xl p-1 rounded-full border border-border-color cursor-pointer" />
            </button>

          </div>

          {opentheComment && (
            <div
              className="absolute bottom-0 left-0 w-full h-96"
            >
              <CommentsSection
                closeModal={closeTheCommentModal}
                width="w-full"
                height="h-full"
                commentsHeight='h-[calc(100%-6rem)]'
                postId={currentPost.postId}
                postOwner={currentPost.userFullName ? currentPost.userFullName : currentPost.userName}
                isLoggedInPostOwner={currentPost.userId === userId}
                updatePost={updatePost}
              />
            </div>
          )}

          {showMuteOverlay && (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-bg-color/60 rounded-full p-6 z-50 animate-fade-in-out"
              style={{
                animation: "fadeInOut 1.5s ease-in-out"
              }}
            >
              {isMuted ? (
                <HiOutlineSpeakerXMark className="text-primary-text-color text-5xl" />
              ) : (
                <HiOutlineSpeakerWave className="text-primary-text-color text-5xl" />
              )}
            </div>
          )}
          {openShareModal && <SharePostModal data={currentPost} type={4} onClose={() => { setOpenShareModal(null) }} postId={currentPost.postId} updatePost={updatePost} />}
        </div>
      )}
    </div>
  );
};
export default React.memo(SnipsPage);
