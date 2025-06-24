"use client";
import CommentsSection from "@/components/CommentUi/CommentUi";
import ReportModal from "@/components/modal/ReportModal";
import SharePostModal from "@/components/modal/SharePostModal";
import MoreOptions from "@/components/MoreOptions";
import VideoPlayerWidget from "@/components/VideoAndImagesComp/VideoPlayerWidget";
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { PostlistItem, PostlistResponse } from "@/models/postlistResponse";
import { VideoList } from "@/models/videolist";
import { SearchResultItem as FlixSearchResultItem } from "@/services/flixsearch";
import { getFlixDetails } from "@/services/getflixdetails";
import { getLikeCount, LikeCountData } from "@/services/getlikecount";
import { getPostDetails } from "@/services/getpostdetails";
import { saveVideoLike } from "@/services/savevideolike";
import { snipSearch } from "@/services/snipsearch";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CiShare2 } from "react-icons/ci";
import { FaEllipsisVertical } from "react-icons/fa6";
import { GoComment } from "react-icons/go";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import { IoChevronBackSharp, IoChevronDownSharp, IoChevronUpSharp, IoClose, IoStarOutline, IoStarSharp } from "react-icons/io5";
import ReactPlayer from "react-player";
import PostActivity from "../posts/shared/PostActivity";
import { SnipsPageSkeleton } from "../Skeletons/Skeletons";


interface SnipsModalProps {
  snips: PostlistItem[]; // The list of all Snips
  selectedSnip: PostlistItem | null; // The selected Snip
  onClose?: () => void; // Function to close the modal
  searchterm: string | null; // The search term used to filter Snips
  searchPage?: number; // The page number for pagination (optional)
}

const SnipsModal: React.FC<SnipsModalProps> = ({ snips, selectedSnip, onClose, searchterm, searchPage }) => {
  const router = useRouter();
  const snipIndex = snips.findIndex(snip => snip.postId === selectedSnip?.postId);
  const { inAppSnipsData, snipId } = useInAppRedirection()
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
  const [openReportModal, setOpenReportModal] = useState<number | null>(null)
  const [currentVideoLikeDetails, setCurrentVideoLikeDetails] = useState<LikeCountData | null>(null)
  const [opentheLike, setOpentheLike] = useState<boolean>(false);

  const [id] = useLocalStorage<string>('userId', '');
  const userId = id ? parseInt(id) : 0;
  const [posts, setPosts] = useState<PostlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [originalPost, setOriginalPost] = useState<PostlistItem | null>(null);
  const [postHistory, setPostHistory] = useState<number[]>([]);
  const { setInAppFlixData, clearFlixData } = useInAppRedirection();
  const pageRef = useRef<number>(searchPage || 1);
  const searchTerm = searchterm;


  useEffect(() => {
    if (snips && snips.length > 0) {
      setPosts(snips);
    }
  }, [snips]);

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

  const fetchPosts = useCallback(async (term: string | null = searchTerm) => {
    if (!term) {
      console.error("Error: searchTerm is empty or undefined", { searchTerm: term });
      return;
    }
    setLoading(true);

    try {
      const limit = 12;
      const offset = (pageRef.current - 1) * limit; // Calculate offset based on current page

      // Call snipSearch specifically for "snips"
      const responseSnips = await snipSearch({
        query: term,
        limit: limit,
        offset: offset,
      });
      if (responseSnips?.isSuccess && responseSnips.data) {
        if (responseSnips.data.length > 0) {
          // Update results using a callback to ensure the latest state
          setPosts((prevPosts) => {
            return [...prevPosts, ...responseSnips.data];
          });

          // Increment the page counter for the next request
          const nextPage = pageRef.current + 1;
          pageRef.current = nextPage;
        }
      } else {
        console.error("API returned unsuccessful response for snips:", responseSnips);
        setError(responseSnips.message || "Failed to load snips");
      }
    } catch (error) {
      console.error("Error fetching more snips results:", error);
      setError("Failed to fetch snips");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, setPosts, setError]);

  useEffect(() => {
    if (currentIndex >= posts.length - 1 && !loading) {
      fetchPosts();
    }
  }, [currentIndex, posts.length, fetchPosts, loading]);

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

  const toggleLike = () => {
    if (currentPost.likeCount > 0) {
      setOpentheLike(!opentheLike);
    } else toast.error('No likes to display');
  }

  const toggleComment = () => {
    setOpentheComment(!opentheComment);
  }

  const closeTheCommentModal = () => {
    setOpentheComment(false);
  }


  if (error) return <div>Error: {error}</div>;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-bg-color/30 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="bg-transparent text-text-color p-6 w-3/4 max-h-[100%] overflow-y-auto"
      >


        <div className="flex items-center justify-center w-full max-md:h-[calc(100vh-4.2rem)] h-screen sm:px-4 max-md:pb-20">

          <button
            onClick={onClose}
            className='absolute top-8 right-[35%] bg-bg-color text-primary-text-color hover:text-primary rounded-full'
          >
            <IoClose size={24} />
          </button>
          {currentPost && (
            <div className="flex flex-col items-center justify-center relative rounded-lg"
              onClick={(e) => e.stopPropagation()}>
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

              <div className="absolute rounded-r-md h-full flex flex-col items-center right-0 sm:text-text-color text-primary-text-color max-sm:bg-gradient-to-l from-black/50 to-transparent sm:translate-x-full z-10">
                <div className="flex flex-col items-center justify-end h-full pb-6 pl-4">
                  {/* Navigation arrows group */}
                  <div className="flex flex-col items-center mb-6">
                    <button
                      onClick={handleUpArrow}
                      disabled={currentIndex === 0}
                      className="focus:outline-none disabled:opacity-50 pointer-events-auto mb-2"
                    >
                      <IoChevronUpSharp className="text-5xl p-1 rounded-full border border-border-color cursor-pointer" />
                    </button>
                    <button
                      onClick={handleDownArrow}
                      className="focus:outline-none disabled:opacity-50 pointer-events-auto"
                    >
                      <IoChevronDownSharp className="text-5xl p-1 rounded-full border border-border-color cursor-pointer" />
                    </button>
                  </div>
                  {/* Like button group */}
                  <div className="flex flex-col items-center mb-6">
                    <button
                      onClick={() =>
                        handleLikeToVideo(
                          currentPost.postId,
                          allCurrentVideos[currentVideoIndex].video_id!
                        )
                      }
                      className="flex items-center justify-center pointer-events-auto"
                    >
                      {currentVideoLikeDetails &&
                        currentVideoLikeDetails.isLiked ? (
                        <IoStarSharp className="text-5xl p-1 text-yellow-500" />
                      ) : (
                        <IoStarOutline className="text-5xl p-2 hover:text-yellow-500" />
                      )
                      }
                    </button>
                    <button onClick={toggleLike}>
                      {currentVideoLikeDetails &&
                        <span className="ml-1 text-sm">
                          {currentVideoLikeDetails.likeCount}
                        </span>
                      }
                    </button>
                  </div>
                  {/* Comment button group */}
                  <div className="flex flex-col items-center mb-6">
                    <button
                      onClick={toggleComment}
                      className="flex items-center justify-center pointer-events-auto"
                    >
                      <GoComment className="text-5xl p-2" />
                    </button>
                    <span className="ml-1 text-sm">{currentPost.commentCount}</span>
                  </div>
                  {/* Share button group */}
                  <div className="flex flex-col items-center mb-6">
                    <button
                      className="flex items-center justify-center pointer-events-auto"
                      onClick={() => setOpenShareModal(currentPost.postId)}
                    >
                      <CiShare2 className="text-5xl p-2" />
                    </button>
                    <span className="ml-1 text-sm">Share</span>
                  </div>
                  {/* More options button group */}
                  <div className="flex flex-col items-center">
                    <button
                      className="relative flex items-center justify-center pointer-events-auto"
                      onClick={() => setOpenMoreOptions(currentPost.postId)}
                    >
                      <FaEllipsisVertical className="text-5xl p-2" />
                    </button>
                    <span className="ml-1 text-sm">More</span>
                    {openMoreOptions && (
                      <MoreOptions
                        post={currentPost}
                        setIsOpen={setOpenMoreOptions}
                        isSnipsPage={true}
                        openReport={setOpenReportModal}
                        updatePost={updatePost}
                        page="snips"
                      />
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
                    height="h-full"
                    commentsHeight='h-[calc(100%-6rem)]'
                    postId={currentPost.postId}
                    postOwner={currentPost.userFullName ? currentPost.userFullName : currentPost.userName}
                    isLoggedInPostOwner={currentPost.userId === userId}
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
                    closeModal={closeTheCommentModal}
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
              {openReportModal && <ReportModal postId={currentPost.postId} onClose={() => { setOpenReportModal(null) }} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SnipsModal);
