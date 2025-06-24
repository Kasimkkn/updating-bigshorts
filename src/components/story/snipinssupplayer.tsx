import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import ReactPlayer from "react-player";
import ButtonWidget from "../Interactive/buttons";
import ImageWidget from "../Interactive/ImageWidget";
import LinkWidget from "../Interactive/LinkWidget";
import TextWidget from "../Interactive/TextWidget";
import { canvasWidth, canvasHeight } from "@/constants/interactivityConstants";
import { default as NextImage } from 'next/image';
import SafeImage from "../shared/SafeImage";

interface SnippageSnupProps {
  postShare: any;
  isTimerPaused: boolean;
  isMuted?: boolean;
  toggleMute?: () => void;
}

const SnippageSnup: React.FC<SnippageSnupProps> = ({ postShare, isTimerPaused, isMuted, toggleMute }) => {
  //const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [parentSize, setParentSize] = useState({ width: canvasWidth, height: canvasHeight });
  const videoRef = useRef<ReactPlayer | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [allInteractiveVideos, setAllInteractiveVideos] = useState<any[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [jumpDuration, setJumpDuration] = useState<number>(0);
  const [videoLoading, setVideoLoading] = useState(false);

  // Define currentVideoData at the top of the component
  const currentVideoData = allInteractiveVideos[currentVideoIndex] || {};

  useEffect(() => {
    // Extract video URL from the shared post data
    if (postShare && postShare.interactiveVideo) {
      try {
        const interactiveVideos = JSON.parse(postShare.interactiveVideo.toString());
        setAllInteractiveVideos(interactiveVideos);
        if (interactiveVideos && interactiveVideos[0]?.path) {
          const rawVideoPath = interactiveVideos[0]?.path || "";
          // Extract just the MP4 file path by replacing the domain and keeping only up to .mp4
          let newVideoUrl = rawVideoPath.replace(
            "https://d1332u4stxguh3.cloudfront.net/",
            "/video/"
          );
          // Trim URL to end at .mp4
          if (newVideoUrl.includes('.mp4')) {
            const mp4EndIndex = newVideoUrl.indexOf('.mp4') + 4;
            newVideoUrl = newVideoUrl.substring(0, mp4EndIndex);
          }
          setVideoUrl(newVideoUrl);
        }
      } catch (error) {
        console.error("Error parsing interactiveVideo:", error);
      }
    }
  }, [postShare]);

  useLayoutEffect(() => {
    if (parentRef.current) {
      setParentSize({
        width: parentRef.current.clientWidth,
        height: parentRef.current.clientHeight,
      });
    }
  }, []); // Add empty dependency array to run only once after mount// Remove the empty dependency array completely // Remove parentRef.current from dependency array

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    setCurrentTime(playedSeconds);
  };

  // Using the more robust updateCurrentIndex from SnipsPage
  const updateCurrentIndex = useCallback((index: number, indexOfButton: number, type: number) => {
    setCurrentVideoIndex(index);
    if (allInteractiveVideos[currentVideoIndex]) {
      allInteractiveVideos[currentVideoIndex].currentTime = currentTime;
      setJumpDuration(allInteractiveVideos[currentVideoIndex]?.currentTime ?? 0);
    }
    let rawVideoPath = "";
    if (type === 1 && allInteractiveVideos[currentVideoIndex]?.functionality_datas?.list_of_buttons) {
      rawVideoPath = allInteractiveVideos[currentVideoIndex]?.functionality_datas?.list_of_buttons[indexOfButton]?.on_action?.video_path || "";
    } else if (type === 2 && allInteractiveVideos[currentVideoIndex]?.functionality_datas?.list_of_images) {
      rawVideoPath = allInteractiveVideos[currentVideoIndex]?.functionality_datas?.list_of_images[indexOfButton]?.on_action?.video_path || "";
    }
    if (rawVideoPath) {
      const newVideoUrl = rawVideoPath.replace("https://d1332u4stxguh3.cloudfront.net/", "/video/");
      if (newVideoUrl !== videoUrl) {
        setVideoUrl(newVideoUrl);
      }
    }
  }, [currentTime, currentVideoIndex, allInteractiveVideos, videoUrl]);

  // Position adjustment for navigation
  const goToPosition = useCallback(() => {
    if (videoRef.current && jumpDuration) {
      videoRef.current.seekTo(jumpDuration);
    }
  }, [jumpDuration]);

  // Play/pause controller
  const playPauseController = useCallback(() => {
    // Implementation for play/pause toggle
  }, []);
  useEffect(() => {
    if (audioRef.current) {
      if (isTimerPaused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isTimerPaused]);
  // Don't show any UI if post data is missing
  if (!postShare) return null;

  // Check if this is an interactive video (type 1) or not
  const isInteractiveVideo = postShare.isForInteractiveVideo === 1;

  return (
    <div
      ref={parentRef}
      className="flex items-center justify-center w-full h-full relative"
    >
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {/* Keep original size - this preserves the original dimensions */}
        <div className="w-[75%] h-[80%] relative rounded-lg overflow-hidden">
          {/* Check if there's a video file and render based on interactive type */}
          {postShare.videoFile && postShare.videoFile.length > 0 ? (
            <div className="relative w-full h-full bg-bg-color">
              {isInteractiveVideo ? (
                <>
                  {videoLoading && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                      <SafeImage
                        videoUrl={videoUrl}
                        src={postShare.coverFile}
                        alt="Loading"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <ReactPlayer
                    ref={videoRef}
                    url={videoUrl || postShare.videoFile}
                    playing={!isTimerPaused}
                    muted={isMuted}
                    controls={false}
                    loop
                    width="100%"
                    height="100%"
                    onProgress={handleProgress}
                    onClick={toggleMute}
                    onSeek={() =>
                      jumpDuration
                        ? videoRef.current?.seekTo(jumpDuration - 2, "seconds")
                        : null
                    }
                    playsinline
                    className="hover:cursor-pointer flex items-center justify-center"
                    config={{
                      file: {
                        attributes: {
                          crossOrigin: 'anonymous',
                          preload: 'auto',
                          controlsList: 'nodownload',
                          disablePictureInPicture: true,
                          style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          },
                        },
                        forceVideo: true,
                      },
                    }}
                    onReady={() => setVideoLoading(false)}
                    onBuffer={() => setVideoLoading(true)}
                    onBufferEnd={() => setVideoLoading(false)}
                    onStart={() => setVideoLoading(false)}
                    onPlay={() => setVideoLoading(false)}
                    onPause={() => setVideoLoading(false)}
                    onError={() => setVideoLoading(false)}
                    onClickPreview={() => setVideoLoading(true)}
                    onLoad={() => setVideoLoading(true)}
                  />
                </>
              ) : (
                <>
                  <SafeImage
                    src={postShare.videoFile}
                    alt="Video thumbnail"
                    className="w-full h-full object-contain"
                  />
                  {postShare.audioFile && (
                    <audio
                      src={postShare.audioFile}
                      autoPlay
                      controls={false}
                      style={{ display: 'none' }}
                      muted={isMuted}
                      ref={audioRef}
                    />
                  )}
                </>
              )}

              {/* Username overlay - bottom right but moved slightly up */}
              <div className="absolute bottom-6 right-2 bg-bg-color bg-opacity-50 px-2 py-1 rounded">
                <p className="text-primary-text-color text-xs">@{postShare.userName}</p>
              </div>

              {/* Only show interactive elements if this is an interactive video */}
              {isInteractiveVideo && (
                <>
                  {/* Interactive elements - Buttons */}
                  {currentVideoData?.functionality_datas?.list_of_buttons?.map((button: any, i: number) => {
                    const startTime = parseFloat(button?.starting_time) || 0;
                    const endTime = parseFloat(button?.ending_time) || 100000;
                    const width = parseFloat(button?.width) || 20;
                    const height = parseFloat(button?.height) || 20;
                    if (currentTime >= startTime && currentTime <= endTime) {
                      return (
                        <div
                          className="absolute z-10"
                          style={{
                            top: `${button.top}%`,
                            left: `${button.left}%`,
                            width: `${button.width}%`,
                            height: `${button.height}%`,
                            overflow: 'hidden'
                          }}
                          key={`button-container-${i}`}
                        >
                          <ButtonWidget
                            key={`button-${i}`}
                            i={i}
                            currentTime={currentTime}
                            updateCurrentIndex={updateCurrentIndex}
                            videoDuration={parseFloat(currentVideoData.duration)}
                            currentIndex={0}
                            currentVideoIndex={currentVideoIndex}
                            forHomeTrendingList={false}
                            postListDataModel={postShare}
                            allButtons={currentVideoData.functionality_datas?.list_of_buttons || []}
                            listOfVideosData={allInteractiveVideos}
                            playPauseController={playPauseController}
                            goToPosition={goToPosition}
                            parentWidth={parentSize.width}
                            containerWidth={width}
                            containerHeight={height}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Interactive elements - Text */}
                  {currentVideoData?.functionality_datas?.list_of_container_text?.map((text: any, i: number) => {
                    const startTime = parseFloat(text?.starting_time) || 0;
                    const endTime = parseFloat(text?.ending_time) || 100000;
                    const width = parseFloat(text?.width) || 20;
                    const height = parseFloat(text?.height) || 20;
                    if (currentTime >= startTime && currentTime <= endTime) {
                      return (
                        <div
                          className="absolute z-10"
                          style={{
                            top: `${text.top}%`,
                            left: `${text.left}%`,
                            width: `${text.width}%`,
                            height: `${text.height}%`,
                            overflow: 'hidden'
                          }}
                          key={`text-container-${i}`}
                        >
                          <TextWidget
                            key={`text-${i}`}
                            index={i}
                            videoDuration={parseFloat(currentVideoData.duration)}
                            currentIndex={0}
                            currentVideoIndex={currentVideoIndex}
                            forHomeTrendingList={false}
                            allText={currentVideoData.functionality_datas?.list_of_container_text || []}
                            postListDataModel={postShare}
                            listOfVideosData={allInteractiveVideos}
                            parentWidth={parentSize.width}
                            containerWidth={width}
                            containerHeight={height}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Interactive elements - Images */}
                  {currentVideoData?.functionality_datas?.list_of_images?.map((image: any, i: number) => {
                    // Parse values safely
                    const startTime = parseFloat(image?.starting_time) || 0;
                    const endTime = parseFloat(image?.ending_time) || 100000;
                    const top = parseFloat(image?.top) || 10;
                    const left = parseFloat(image?.left) || 10;
                    const width = parseFloat(image?.width) || 20;
                    const height = parseFloat(image?.height) || 20;
                    // Check if image should be visible
                    const isVisible = currentTime >= startTime && currentTime <= endTime;
                    if (isVisible) {
                      return (
                        <div
                          key={`image-container-${i}`}
                          className="absolute z-10"
                          style={{
                            top: `${top}%`,
                            left: `${left}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                            overflow: 'hidden'
                          }}
                        >
                          <ImageWidget
                            key={`image-widget-${i}`}
                            currentTime={currentTime}
                            goToPosition={goToPosition}
                            i={i}
                            playPauseController={playPauseController}
                            updateCurrentIndex={updateCurrentIndex}
                            videoDuration={parseFloat(currentVideoData.duration || "60")}
                            currentIndex={0}
                            currentVideoIndex={currentVideoIndex}
                            forHomeTrendingList={false}
                            allImages={currentVideoData.functionality_datas?.list_of_images || []}
                            postListDataModel={postShare}
                            listOfVideosData={allInteractiveVideos}
                            parentWidth={parentSize.width}
                            containerWidth={width}
                            containerHeight={height}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Interactive elements - Links */}
                  {videoReady && currentVideoData?.functionality_datas?.list_of_links?.map((link: any, i: number) => {
                    const startTime = parseFloat(link?.starting_time) || 0;
                    const endTime = parseFloat(link?.ending_time) || 100000;
                    if (currentTime >= startTime && currentTime <= endTime) {
                      return (
                        <LinkWidget
                          key={`link-${i}`}
                          currentTime={currentTime}
                          goToPosition={goToPosition}
                          i={i}
                          playPauseController={playPauseController}
                          updateCurrentIndex={updateCurrentIndex}
                          videoDuration={parseFloat(currentVideoData.duration)}
                          currentIndex={0}
                          currentVideoIndex={currentVideoIndex}
                          forHomeTrendingList={false}
                          allLinks={currentVideoData.functionality_datas?.list_of_links || []}
                          postListDataModel={postShare}
                          listOfVideosData={allInteractiveVideos}
                        />
                      );
                    }
                    return null;
                  })}
                </>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full bg-bg-color">
              <NextImage
                src={postShare.coverFile}
                alt="Post content"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 75vw"
              />
              {/* Username overlay - bottom right but moved slightly up */}
              <div className="absolute bottom-6 right-2 bg-bg-color bg-opacity-50 px-2 py-1 rounded">
                <p className="text-primary-text-color text-xs">@{postShare.userName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippageSnup;