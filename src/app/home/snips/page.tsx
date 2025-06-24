"use client";
import CommentsSection from "@/components/CommentUi/CommentUi";
import ReportModal from "@/components/modal/ReportModal";
import SharePostModal from "@/components/modal/SharePostModal";
import MoreOptions from "@/components/MoreOptions";
import PostActivity from "@/components/posts/shared/PostActivity";
import LikeButton from "@/components/shared/LikeButton";
import { SnipsPageSkeleton } from "@/components/Skeletons/Skeletons";
import VideoPlayerWidget from "@/components/VideoAndImagesComp/VideoPlayerWidget";
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import useFetchPosts from "@/hooks/useFetchPost";
import useLocalStorage from "@/hooks/useLocalStorage";
import { PostlistItem, PostlistResponse } from "@/models/postlistResponse";
import { VideoList } from "@/models/videolist";
import { SearchResultItem as FlixSearchResultItem } from "@/services/flixsearch";
import { getFlixDetails } from "@/services/getflixdetails";
import { getLikeCount, LikeCountData } from "@/services/getlikecount";
import { getPostDetails } from "@/services/getpostdetails";
import { saveVideoLike } from "@/services/savevideolike";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from 'react-hot-toast';
import { HiOutlinePause, HiOutlinePlay, HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoChevronBackSharp } from "react-icons/io5";
import { MdMoreVert, MdOutlineComment, MdShare, MdVolumeOff, MdVolumeUp } from "react-icons/md";
import ReactPlayer from "react-player";

const buttonClasses = "pointer-events-auto p-1 md:p-2 md:bg-primary-bg-color rounded-full flex items-center justify-center";

const SnipsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { inAppSnipsData, snipIndex, snipId } = useInAppRedirection()
  const { posts, fetchPosts, loading, error, setPosts } = useFetchPosts(1, snipId, inAppSnipsData);
  const [currentIndex, setCurrentIndex] = useState<number>(snipIndex || 0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [jumpDuration, setJumpDuration] = useState<number>(0);
  const [opentheComment, setOpentheComment] = useState<boolean>(false);
  const [opentheLike, setOpentheLike] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [allCurrentVideos, setAllCurrentVideos] = useState<VideoList[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const videoRef = useRef<ReactPlayer | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showMuteOverlay, setShowMuteOverlay] = useState<boolean>(false);
  const [openMoreOptions, setOpenMoreOptions] = useState<number | null>(null)
  const [openShareModal, setOpenShareModal] = useState<number | null>(null)
  const [openReportModal, setOpenReportModal] = useState<number | null>(null)
  const [currentVideoLikeDetails, setCurrentVideoLikeDetails] = useState<LikeCountData | null>(null)
  const [linkedPost, setLinkedPost] = useState<PostlistItem | null>(null);
  const [showLinkedContent, setShowLinkedContent] = useState(false);
  const [originalPost, setOriginalPost] = useState<PostlistItem | null>(null);
  const [postHistory, setPostHistory] = useState<number[]>([]);
  const { setInAppFlixData, clearFlixData } = useInAppRedirection();
  const [showPlayPauseOverlay, setShowPlayPauseOverlay] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userId, , isHydrated] = useLocalStorage<string>("userId", "");

  // Play/Pause overlay logic
  const showPlayPause = useRef<NodeJS.Timeout | null>(null);

  // Handler for play/pause toggle from VideoPlayerWidget
  const handlePlayPauseToggle = (playing: boolean) => {
    setIsPlaying(playing);
    setShowPlayPauseOverlay(true);
    if (showPlayPause.current) clearTimeout(showPlayPause.current);
    showPlayPause.current = setTimeout(() => {
      setShowPlayPauseOverlay(false);
    }, 1500);
  };

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
        const response = await getFlixDetails(contentId, Number(userId));

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
    } finally {

    }
  };

  const handleFetchLinkedMini = async (postId: number) => {
    try {
      const response: PostlistResponse = await getFlixDetails(postId, Number(userId));

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
    } finally {

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
        } finally {
        }
      }
    }
  };

  const currentPost = useMemo(() => {
    return posts[currentIndex];
  }, [posts, currentIndex]);


  useEffect(() => {
    // If we have data from context, use it first
    if (inAppSnipsData && inAppSnipsData.length > 0) {
      // Set the posts directly from context data
      setPosts(inAppSnipsData);
      // Set the current index from snipIndex
      if (snipIndex !== undefined && snipIndex !== null) {
        setCurrentIndex(snipIndex);
      }
      // Initialize video URL with a short delay to ensure posts are loaded
      setTimeout(() => {
        const currentPost = inAppSnipsData[snipIndex || 0];
        if (currentPost?.interactiveVideo) {
          const interactiveVideos = JSON.parse(currentPost.interactiveVideo.toString());
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
  }, [inAppSnipsData, snipIndex]); // Only depend on the context variables

  useEffect(() => {
    // Get the post ID from the URL if it exists
    const urlPostId = searchParams?.get('id');

    // Only process URL parameters if we don't have valid context data
    if (urlPostId && (!inAppSnipsData || inAppSnipsData.length === 0)) {
      const postId = parseInt(urlPostId);

      // First check if the post is already in our array
      const existingIndex = posts.findIndex(post => post.postId === postId);

      if (existingIndex >= 0) {
        // If it's already in our array, just update the index
        setCurrentIndex(existingIndex);
      } else if (!snipId || postId !== snipId) {
        // If it's not in our array and it's a new request, fetch it
        // handleFetchLinkedPost(postId);
      }
    }
  }, [searchParams, inAppSnipsData]);


  useEffect(() => {
    if (posts.length > 0 && currentIndex >= 0 && currentIndex < posts.length) {
      const currentPost = posts[currentIndex];
      // Update URL without triggering a page reload
      router.replace(`/home/snips?id=${currentPost.postId}`, { scroll: false });
    }
  }, [currentIndex, posts, router]);

  useEffect(() => {
    if (!isHydrated) return;
    if (currentIndex >= posts.length - 1 && !inAppSnipsData) {
      fetchPosts(userId);
    }
  }, [currentIndex, fetchPosts, isHydrated]);

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
    console
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





  const handleUpArrow = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setCurrentTime(0);
      setCurrentVideoIndex(0)
    }
  }, [currentIndex]);

  const handleDownArrow = useCallback(() => {

    if (currentIndex < posts.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setCurrentTime(0);
      setCurrentVideoIndex(0)
    }
  }, [currentIndex, posts.length]);


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
    return <SnipsPageSkeleton />;
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
    if (!userId) {
      router.push('/auth/login');
      return;
    };
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

  const toggleLike = () => {
    if (currentPost.likeCount > 0) {
      setOpentheLike(!opentheLike);
    } else toast.error('No likes to display');
  }

  const closeTheCommentModal = () => {
    setOpentheComment(false);
  }


  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex md:items-center md:justify-center w-full min-h-screen md:px-4">
      {currentPost && (
        <div className="flex flex-col md:items-center md:justify-center relative md:rounded-lg w-full md:w-auto">
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
              showInteractiveElements={false}
              onHomeScreen={false}
              navigateToLinkedContent={handleLinkedContentNavigation}
              onPlayPauseToggle={handlePlayPauseToggle}
            />
          )}
          {currentVideoIndex > 0 && (
            <div className="absolute top-14 left-3 max-lg:left-0">
              <button
                onClick={previousVideo}
                className="hover:cursor-pointer p-1 rounded-full bg-primary-bg-color"
              >
                <IoChevronBackSharp className="text-xl text-text-color" />
              </button>
            </div>
          )}
          {postHistory.length > 0 && currentVideoIndex === 0 && (
            <div className="absolute top-14 left-3 max-lg:left-0 z-20">
              <button
                onClick={handleNavigateBack}
                className="hover:cursor-pointer p-1 rounded-full bg-primary-bg-color"
              >
                <IoChevronBackSharp className="text-xl text-text-color" />
              </button>
            </div>
          )}

          <div className="absolute rounded-r-md h-full flex flex-col items-center right-0 md:text-text-color text-white max-sm:bg-gradient-to-l from-black/50 to-transparent sm:translate-x-full z-10">
            <div className="flex flex-col items-center justify-center md:justify-end h-full pb-6 pl-4">
              {/* Navigation arrows group */}
              <button className={`mb-6 ${buttonClasses}`} onClick={handleMute}>
                {isMuted ? (
                  <MdVolumeOff
                    className="text-3xl md:text-4xl"
                  />
                ) : (
                  <MdVolumeUp
                    className="text-3xl md:text-4xl"
                  />
                )}
              </button>
              <button
                onClick={handleUpArrow}
                disabled={currentIndex === 0}
                className={`disabled:opacity-50 mb-2 ${buttonClasses}`}
              >
                <IoIosArrowUp className="text-3xl md:text-4xl" />
              </button>
              <button
                onClick={handleDownArrow}
                className={`disabled:opacity-50 mb-6 ${buttonClasses}`}
              >
                <IoIosArrowDown className="text-3xl md:text-4xl" />
              </button>
              {/* Like button group */}
              <div className="flex flex-col items-center mb-6">
                <LikeButton className={buttonClasses} size="text-3xl md:text-4xl" isLiked={currentVideoLikeDetails?.isLiked || currentPost.isLiked} onClick={() => handleLikeToVideo(currentPost.postId, allCurrentVideos[currentVideoIndex].video_id!)} />
                <button onClick={toggleLike}>
                  {currentVideoLikeDetails &&
                    <span className="ml-1 text-sm">
                      {currentVideoLikeDetails.likeCount}
                    </span>
                  }
                </button>
              </div>
              {/* Comment button group */}
              {currentPost.isAllowComment === 1 && (
                <div className="flex flex-col items-center mb-6">
                  <button
                    onClick={() => {
                      if (!userId) {
                        router.push('/auth/login');
                      } else {
                        toggleComment();
                      }
                    }}
                    className={buttonClasses}
                  >
                    <MdOutlineComment className="text-3xl md:text-4xl " />
                  </button>
                  <span className="ml-1 text-sm">{currentPost.commentCount}</span>
                </div>
              )}
              {/* Share button group */}
              <div className="flex flex-col items-center mb-6">
                <button
                  className={buttonClasses}
                  onClick={() => {
                    if (!userId) {
                      router.push('/auth/login');
                    } else {
                      setOpenShareModal(currentPost.postId)
                    }
                  }}
                >
                  <MdShare className="text-3xl md:text-4xl" />
                </button>
                <span className="ml-1 text-sm">Share</span>
              </div>
              {/* More options button group */}
              <div className="flex flex-col items-center">
                <button
                  className={buttonClasses}
                  onClick={() => {
                    if (!userId) {
                      router.push('/auth/login');
                    } else {
                      setOpenMoreOptions(currentPost.postId)
                    }
                  }}
                >
                  <MdMoreVert className="text-3xl md:text-4xl" />
                </button>
                <span className="ml-1 text-sm">More</span>
                {openMoreOptions && (
                  <div className="relative right-4 bottom-10">
                    <MoreOptions
                      post={currentPost}
                      setIsOpen={setOpenMoreOptions}
                      isSnipsPage={true}
                      openReport={setOpenReportModal}
                      updatePost={updatePost}
                      page="snips"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {opentheComment && (
            <div
              className="absolute bottom-0 left-0 w-full h-96"
            >
              <CommentsSection
                closeModal={closeTheCommentModal}
                width="w-full"
                height="h-96"
                commentsHeight='h-[calc(100%-6rem)]'
                postId={currentPost.postId}
                postOwner={currentPost.userFullName ? currentPost.userFullName : currentPost.userName}
                isLoggedInPostOwner={currentPost.userId === Number(userId)}
                updatePost={updatePost}
              />
            </div>
          )}
          {opentheLike && (
            <div
              className="absolute bottom-0 left-0 w-full h-96 z-30"
            >
              <PostActivity
                postId={currentPost.postId}
                closeModal={toggleLike}
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
                <HiOutlineSpeakerXMark className="text-primary-text-color text-3xl md:text-5xl" />
              ) : (
                <HiOutlineSpeakerWave className="text-primary-text-color text-3xl md:text-5xl" />
              )}
            </div>
          )}
          {/* Play/Pause Overlay Icon */}
          {currentPost.videoFile && currentPost.videoFile.length > 0 && showPlayPauseOverlay && (
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-bg-color/60 rounded-full p-6 animate-fade-in-out"
              style={{
                animation: "fadeInOut 1.5s ease-in-out"
              }}
            >
              {isPlaying ? (
                <HiOutlinePause className="text-primary-text-color text-3xl md:text-5xl" />
              ) : (
                <HiOutlinePlay className="text-primary-text-color text-3xl md:text-5xl" />
              )}
            </div>
          )}
          {openShareModal && <SharePostModal data={currentPost} type={4} onClose={() => { setOpenShareModal(null) }} postId={currentPost.postId} updatePost={updatePost} />}
          {openReportModal && <ReportModal postId={currentPost.postId} onClose={() => { setOpenReportModal(null) }} />}
        </div>
      )}
    </div>
  );
};

export default React.memo(SnipsPage);