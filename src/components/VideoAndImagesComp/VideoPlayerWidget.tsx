import { canvasHeight, canvasWidth } from "@/constants/interactivityConstants";
import useLocalStorage from "@/hooks/useLocalStorage";
import { PostlistItem } from "@/models/postlistResponse";
import { VideoList } from "@/models/videolist";
import { getAudioNameForSubtitle } from "@/utils/features";
import useUserRedirection from "@/utils/userRedirection";
import React, { MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaMusic } from "react-icons/fa";
import ReactPlayer from "react-player";
import Avatar from "../Avatar/Avatar";
import FollowButton from "../FollowButton/FollowButton";
import ButtonWidget from "../Interactive/buttons";
import ImageWidget from "../Interactive/ImageWidget";
import LinkWidget from "../Interactive/LinkWidget";
import TextWidget from "../Interactive/TextWidget";
import PostTitle from "../PostTitle";
import SafeImage from "../shared/SafeImage";

interface VideoPlayerWidgetProps {
  videoRef: MutableRefObject<ReactPlayer | null>;
  videoUrl: string;
  isMuted: boolean;
  handleNext: () => void;
  handleMute: () => void;
  setCurrentTime: (time: number) => void;
  jumpDuration: number;
  currentTime: number;
  allCurrentVideos: VideoList[];
  currentVideoIndex: number;
  currentPost: PostlistItem;
  updateCurrentIndex: (
    index: number,
    indexOfButton: number,
    type: number
  ) => void;
  currentIndex: number;
  displayType?: number;
  onHomeScreen?: boolean;
  isPlaying?: boolean;
  showInteractiveElements?: boolean;
  navigateToLinkedContent?: (contentType: 'post' | 'flix', contentId: number) => void;
}

const VideoPlayerWidget: React.FC<VideoPlayerWidgetProps & { onPlayPauseToggle?: (isPlaying: boolean) => void }> = ({
  videoRef,
  videoUrl,
  isMuted,
  handleNext,
  handleMute,
  setCurrentTime,
  jumpDuration,
  currentTime,
  allCurrentVideos,
  currentVideoIndex,
  currentPost,
  updateCurrentIndex,
  currentIndex,
  displayType = 0,
  onHomeScreen = false,
  isPlaying = true,
  showInteractiveElements = true,
  navigateToLinkedContent,
  onPlayPauseToggle,
}) => {

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [internalUrl, setInternalUrl] = useState(videoUrl);
  const [internalPlaying, setInternalPlaying] = useState(false);
  const [parentSize, setParentSize] = useState({ width: canvasWidth, height: canvasHeight })
  const [backDropForDescription, setBackDropForDescription] = useState(false);

  const parentRef = useRef<HTMLImageElement>(null);

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 5;

  const [loggedInuser] = useLocalStorage<string>('userId', '');
  const redirectUser = useUserRedirection();

  const getDimensionClasses = () => {
    if (onHomeScreen) {
      return "w-full aspect-[2/3]";
    }

    // For snips page - use full viewport minus bottom nav on mobile
    return `
      w-full 
      h-[calc(100vh-4rem)] md:h-[90vh] 
      md:w-[25rem] 
      md:aspect-[9/16] 
      md:max-h-[90vh]
    `;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setInternalPlaying(isPlaying);
    }, 300);
    return () => clearTimeout(timer);
  }, [isPlaying]);

  useEffect(() => {
    setInternalUrl(videoUrl);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (parentRef.current) {
      setParentSize({
        width: parentRef.current.clientWidth,
        height: parentRef.current.clientHeight,
      });
    }
  }, [parentRef.current]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);

    const reloadUrl = `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}retry=${Date.now()}`;
    setInternalUrl(reloadUrl);
  }, [videoUrl]);

  const setBackDrop = (value: boolean) => {
    setBackDropForDescription(value);
  };

  const handleVideoLoadingState = useCallback((state: 'ready' | 'error' | 'buffer' | 'bufferEnd', data?: any) => {
    switch (state) {
      case 'ready':
        setIsLoading(false);
        setHasError(false);
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
        parentRef.current && setParentSize({
          width: parentRef.current.clientWidth,
          height: parentRef.current.clientHeight,
        });
        break;
      case 'error':
        setIsLoading(false);
        setHasError(true);

        if (retryCount < maxRetries) {
          retryTimeoutRef.current = setTimeout(() => {
            handleRetry();
          }, 1000);
        }
        break;
      case 'buffer':
        setIsLoading(true);
        break;
      case 'bufferEnd':
        setIsLoading(false);
        break;
      default:
        break;
    }
  }, [handleRetry, retryCount]);

  const handleProgress = useCallback(({ playedSeconds, loaded }: { playedSeconds: number; loaded: number }) => {
    setCurrentTime(playedSeconds);
    setLoadingProgress(loaded * 100);
  }, [setCurrentTime]);

  // Play/pause overlay callback logic
  const handlePlayerClick = () => {
    setInternalPlaying((prev) => {
      const newPlaying = !prev;
      if (onPlayPauseToggle) onPlayPauseToggle(newPlaying);
      return newPlaying;
    });
  };

  return (
    <div
      ref={parentRef}
      className={`${getDimensionClasses()} relative md:rounded-lg flex justify-center items-center overflow-hidden`}
      style={{
        isolation: 'isolate',
        position: 'relative',
        zIndex: 0
      }}
    >

      {/* Add "Snips" text overlay in the top right corner */}
      {!onHomeScreen && (
        <div className="absolute top-4 left-4 z-20 text-white font-bold text-3xl">
          Snips
        </div>
      )}
      {currentPost?.isInteractive === "1" && !onHomeScreen && (
        <div className="absolute linearText top-4 right-4 z-20 font-bold text-2xl bg-bg-color bg-opacity-70 px-3 py-1 rounded-md">
          {'{'}I{'}'}nteractive
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={videoUrl.replaceAll('/hls/master.m3u8', '/Thumbnail.jpg.webp')}
          alt="Loading"
          className={`w-full aspect-9/16 object-cover transition-opacity duration-300 pointer-events-none ${!hasError && isLoading ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        />
      </div>

      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${backDropForDescription ? "opacity-50" : "opacity-0"}`} onClick={()=>setBackDrop(false)}/>
      
      {/* <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          isolation: 'isolate'
        }}
      ></div> */}
      <ReactPlayer
        ref={videoRef}
        url={internalUrl}
        playing={internalPlaying && !hasError}
        muted={isMuted}
        controls={false}
        loop={true}
        width="100%"
        height="100%"
        // onEnded={handleNext}
        className="hover:cursor-pointer flex items-center justify-center bg-black"
        onClick={handlePlayerClick}
        onProgress={handleProgress}
        onSeek={() =>
          jumpDuration
            ? videoRef.current?.seekTo(jumpDuration - 2, "seconds")
            : null
        }
        onReady={() => handleVideoLoadingState('ready')}
        onError={(e) => handleVideoLoadingState('error', e)}
        onBuffer={() => handleVideoLoadingState('buffer')}
        onBufferEnd={() => handleVideoLoadingState('bufferEnd')}
        playsinline
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous',
              preload: 'auto',
              style: {
                width: !hasError && isLoading ? '25rem' : '100%',
                height: 'auto',
                objectFit: 'cover',
              },
            },
            forceVideo: true,
          }
        }}
      />

      {displayType === 0 && (
        <div className="absolute bottom-0 left-0 p-3 w-full text-primary-text-color">
          <div className="absolute bottom-0 z[2] left-0 pointer-events-none p-3 bg-gradient-to-t from-[#101012] to-transparent w-full h-full" />
          <div className="flex flex-col relative z-[15]">
            <button
              onClick={() => {
                redirectUser(currentPost.userId, `/home/users/${currentPost.userId}`)
              }}
              className="user-details flex gap-1 items-center"
            >
              <Avatar isMoreBorder={true} src={currentPost?.userProfileImage} name={currentPost.userName} />
              <p className="text-sm text-white font-semibold">@{currentPost.userName}</p>
              {loggedInuser != currentPost.userId.toString() && (
                <FollowButton
                  requestId={currentPost.userId}
                  isFollowing={currentPost.isFriend}
                  isForInteractiveImage={true}
                />
              )}

            </button>
            <div className="text-sm text-white">
              <PostTitle description={currentPost.postTitle} taggedUsers={currentPost.postTagUser} setBackDrop={setBackDrop}/>
            </div>
            <div className="flex gap-2 items-center text-white">
              <FaMusic className="text-xs " />
              <p className="text-xs ">{getAudioNameForSubtitle(allCurrentVideos[currentVideoIndex]?.audioName, currentPost.userName)}</p>
            </div>
          </div>
        </div>
      )}
      {!isLoading && (
        <>

          {!showInteractiveElements && allCurrentVideos[currentVideoIndex]?.functionality_datas?.list_of_buttons.map((button, i) => {
            if (
              currentTime >= button?.starting_time &&
              currentTime <= button?.ending_time
            ) {
              // Calculate remaining time for the button visibility
              const remainingTime = button?.ending_time - currentTime;
              const shouldShowProgress = remainingTime <= 5;
              const progressWidth = shouldShowProgress ? (remainingTime / 5) * 100 : 0;

              // Get button position information from the button data
              const buttonTop = parseFloat(button?.top?.toString() || "0");
              const buttonLeft = parseFloat(button?.left?.toString() || "0");
              const buttonWidth = parseFloat(button?.width?.toString() || "0");
              const buttonHeight = parseFloat(button?.height?.toString() || "0");

              const correspondingButton = allCurrentVideos[currentVideoIndex]?.functionality_datas?.list_of_buttons?.[i];

              // Check if any of the action properties are not null
              const hasActionLink = correspondingButton?.on_action?.linked_post_id ||
                correspondingButton?.on_action?.video_path ||
                correspondingButton?.on_action?.linked_flix_id ||
                correspondingButton?.on_action?.link_url;
              return (
                <>
                  <ButtonWidget
                    key={`${currentVideoIndex}-button-${i}`}
                    i={i}
                    currentTime={currentTime}
                    updateCurrentIndex={updateCurrentIndex}
                    videoDuration={parseFloat(
                      allCurrentVideos[currentVideoIndex].duration
                    )}
                    currentIndex={currentIndex}
                    currentVideoIndex={currentVideoIndex}
                    forHomeTrendingList={false}
                    postListDataModel={currentPost}
                    allButtons={
                      allCurrentVideos[currentVideoIndex].functionality_datas
                        ?.list_of_buttons || []
                    }
                    listOfVideosData={allCurrentVideos}
                    playPauseController={() => { }}
                    goToPosition={() => { }}
                    parentWidth={parentSize.width}
                    navigateToLinkedContent={navigateToLinkedContent!}
                  />
                  {/* Countdown progress bar with correct positioning based on the screenshot */}
                  {shouldShowProgress && hasActionLink && (
                    <div
                      style={{
                        position: 'absolute',
                        top: `${buttonTop + buttonHeight + buttonHeight + buttonHeight / 2}%`,
                        left: `${buttonLeft + 11}%`,
                        width: `${buttonWidth}%`,
                        height: '2px', // Fixed height for a thin bar
                        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Light background
                        overflow: 'hidden',
                        zIndex: 10,
                        borderRadius: '0 0 4px 4px' // Rounded bottom corners
                      }}
                    >
                      <div
                        style={{
                          width: `${progressWidth}%`,
                          height: '100%',
                          backgroundColor: 'white',
                          transition: 'width 300ms linear'
                        }}
                      />
                    </div>
                  )}
                </>
              );
            }
            return null;
          })}

          {!showInteractiveElements && allCurrentVideos[currentVideoIndex]?.functionality_datas?.list_of_images?.map((image, i) => {
            if (
              currentTime >= image?.starting_time! &&
              currentTime <= image?.ending_time!
            ) {


              // Calculate remaining time for the button visibility
              const remainingTime = image?.ending_time! - currentTime;
              const shouldShowProgress = remainingTime <= 5;
              const progressWidth = shouldShowProgress ? (remainingTime / 5) * 100 : 0;

              // Get button position information from the button data
              const imageTop = parseFloat(image?.top?.toString() || "0");
              const imageLeft = parseFloat(image?.left?.toString() || "0");
              const imageWidth = parseFloat(image?.width?.toString() || "0");
              const imageHeight = parseFloat(image?.height?.toString() || "0");

              // Parse values safely
              const top = parseFloat(image?.top?.toString() || "10");
              const left = parseFloat(image?.left?.toString() || "10");
              const width = parseFloat(image?.width?.toString() || "20");
              const height = parseFloat(image?.height?.toString() || "20");

              const correspondingImage = allCurrentVideos[currentVideoIndex]?.functionality_datas?.list_of_images?.[i];

              // Check if any of the action properties are not null
              const hasActionLink = correspondingImage?.on_action?.linked_post_id ||
                correspondingImage?.on_action?.video_path ||
                correspondingImage?.on_action?.linked_flix_id ||
                correspondingImage?.on_action?.link_url;

              return (
                <div
                  key={`image-container-${i + 1}`}
                  className="absolute z-10" // Using higher z-index for overlay elements
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    overflow: 'hidden' // Ensure content stays within boundaries
                  }}
                >
                  <ImageWidget
                    key={`${currentVideoIndex}-image-${i + 1}`}
                    currentTime={currentTime}
                    goToPosition={() => { }}
                    i={i}
                    playPauseController={() => { }}
                    updateCurrentIndex={updateCurrentIndex}
                    videoDuration={parseFloat(
                      allCurrentVideos[currentVideoIndex].duration
                    )}
                    currentIndex={currentIndex}
                    currentVideoIndex={currentVideoIndex}
                    forHomeTrendingList={false}
                    allImages={
                      allCurrentVideos[currentVideoIndex].functionality_datas
                        ?.list_of_images || []
                    }
                    postListDataModel={currentPost}
                    listOfVideosData={allCurrentVideos}
                    parentWidth={parentSize.width}
                    containerWidth={width}
                    containerHeight={height}
                  />
                  {/* Countdown progress bar with correct positioning based on the screenshot */}

                  {shouldShowProgress && hasActionLink && (
                    <div
                      style={{
                        position: 'absolute',
                        top: `${imageTop + imageHeight + imageHeight + imageHeight / 2}%`,
                        left: `${imageLeft + 11}%`,
                        width: `${imageWidth}%`,
                        height: '2px', // Fixed height for a thin bar
                        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Light background
                        overflow: 'hidden',
                        zIndex: 10,
                        borderRadius: '0 0 4px 4px' // Rounded bottom corners
                      }}
                    >
                      <div
                        style={{
                          width: `${progressWidth}%`,
                          height: '100%',
                          backgroundColor: 'white',
                          transition: 'width 300ms linear'
                        }}
                      />
                    </div>
                  )}

                </div>
              );
            }
            return null;
          })}
          {!showInteractiveElements && allCurrentVideos[currentVideoIndex]?.functionality_datas?.list_of_links?.map((link, i) => {
            if (
              currentTime >= link?.starting_time &&
              currentTime <= link?.ending_time
            ) {
              return (
                <LinkWidget
                  key={`${currentVideoIndex}-link-${i + 1}`}
                  currentTime={currentTime}
                  goToPosition={() => { }}
                  i={i}
                  playPauseController={() => { }}
                  updateCurrentIndex={updateCurrentIndex}
                  videoDuration={parseFloat(
                    allCurrentVideos[currentVideoIndex].duration
                  )}
                  currentIndex={currentIndex}
                  currentVideoIndex={currentVideoIndex}
                  forHomeTrendingList={false}
                  allLinks={
                    allCurrentVideos[currentVideoIndex].functionality_datas
                      ?.list_of_links || []
                  }
                  postListDataModel={currentPost}
                  listOfVideosData={allCurrentVideos}
                />
              );
            }
            return null;
          })}

          {!showInteractiveElements && allCurrentVideos[currentVideoIndex]?.functionality_datas?.list_of_container_text?.map((text, i) => {
            if (
              currentTime >= text?.starting_time &&
              currentTime <= text?.ending_time
            ) {
              return (
                <>
                  <TextWidget
                    key={`${currentVideoIndex}-text-${i}`}
                    index={i}
                    videoDuration={parseFloat(
                      allCurrentVideos[currentVideoIndex].duration
                    )}
                    currentIndex={currentIndex}
                    currentVideoIndex={currentVideoIndex}
                    forHomeTrendingList={false}
                    postListDataModel={currentPost}
                    allText={
                      allCurrentVideos[currentVideoIndex].functionality_datas
                        ?.list_of_container_text || []
                    }
                    listOfVideosData={allCurrentVideos}
                    parentWidth={parentSize.width}
                  />
                </>
              );
            }
            return null;
          })}
        </>
      )}
    </div>
  );
};

export default React.memo(VideoPlayerWidget);