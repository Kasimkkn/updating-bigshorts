"use client";
import { default as dummyUser, default as userLogo } from '@/assets/user.png';
import { useCreationOption } from "@/context/useCreationOption";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { getStoriesList } from "@/services/getStories";
import { StoryData } from "@/types/storyTypes";
import useUserRedirection from "@/utils/userRedirection";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import FollowButton from "../FollowButton/FollowButton";
import MobileAppModal from '../modal/MobileAppModal';
import StoryModal from "./StoryModal";
import SafeImage from '../shared/SafeImage';

const Story = () => {
  const { setStoryViewOpen } = useCreationOption();
  const { toggleSsupCreate } = useCreationOption();
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(
    null
  );
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(
    null
  );
  const [stories, setStories] = useState<StoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId] = useLocalStorage<string>('userId', '');
  const loggedInuserId = userId ? parseInt(userId) : 0;
  const [userData] = useLocalStorage<any>('userData', {});
  const userProfileImage = userData?.userProfileImage;
  const redirectUser = useUserRedirection();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const { isMobile, deviceType } = useMobileDetection();

  const handleSelection = (optionName: string, callback: () => void) => {

    if (isMobile) {
      setSelectedContentType(optionName);
      setShowMobileModal(true);
    } else if (optionName === 'Ssup') {
      toggleSsupCreate();
    }
  };

  const handleMobileModalClose = () => {
    setShowMobileModal(false);
    setSelectedContentType('');
  };

  const handleStoryClick = (userIndex: number, storyIndex: number) => {
    setStoryViewOpen(true);
    setSelectedUserIndex(userIndex);
    setSelectedStoryIndex(storyIndex);
  };

  const handleCloseModal = () => {
    setStoryViewOpen(false);
    setSelectedUserIndex(null);
    setSelectedStoryIndex(null);
  };

  const handleMuteUpdate = (userId: number, isMuted: number) => {
    setStories((prevStories) =>
      prevStories.map((story) =>
        story.userId === userId ? { ...story, isMuted } : story
      )
    );
  };

  // Wrap fetchStories with useCallback
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getStoriesList();
      if (response.isSuccess) {
        let stories = Array.isArray(response.data) ? response.data : [];

        const loggedInUserStories = stories.filter(
          (story) => story.userId === loggedInuserId
        );
        const otherStories = stories.filter(
          (story) => story.userId !== loggedInuserId
        );

        const sortedStories = otherStories.sort((a, b) => {
          if (a.stories[0].isRead === 0 && b.stories[0].isRead === 1) return -1;
          if (a.stories[0].isRead === 1 && b.stories[0].isRead === 0) return 1;
          if (a.isMuted === 1 && b.isMuted === 0) return 1;
          if (a.isMuted === 0 && b.isMuted === 1) return -1;
          return 0;
        });
        setStories([...loggedInUserStories, ...sortedStories]);
      } else {
        console.error("Failed to fetch stories:", response.message);
      }
    } catch (error) {
      console.error("Server Error:", error);
    } finally {
      setLoading(false);
    }
  }, [userData, loggedInuserId]);

  useEffect(() => {
    if (userId) {
      fetchStories();
    }
  }, [userId, fetchStories]);

  const removeStory = (storyId: number, userId: number) => {
    const story = stories.find((story) => story.userId === userId);
    const length = story ? story.stories.length : 0;
    if (length > 1) {
      setStories((prevState) =>
        prevState.map((story) =>
          story.userId === userId
            ? {
              ...story,
              stories: story.stories.filter(
                (subStory) => subStory.postId !== storyId
              ),
            }
            : story
        )
      );
    } else {
      setStories((prevState) =>
        prevState.filter((story) => story.userId !== userId)
      );
    }
  };

  const readStory = (storyId: number, userId: number) => {
    setStories((prev) => {
      return prev.map((story) => {
        if (story.userId === userId) {
          return {
            ...story,
            stories: story.stories.map((substory) => {
              if (substory.postId === storyId) {
                return {
                  ...substory,
                  isRead: 1,
                };
              } else {
                return substory;
              }
            }),
          };
        } else {
          return story;
        }
      });
    });
  };

  const updateIsFriend = (userId: number, isFriend: number) => {
    setStories((prevStories) =>
      prevStories.map((story) =>
        story.userId === userId
          ? { ...story, isFriend: isFriend }
          : story
      )
    );
  }

  const handleReactionUpdate = (storyId: number, reaction: string) => {
    setStories(prevStories =>
      prevStories.map(story => ({
        ...story,
        stories: story.stories.map(s =>
          s.postId === storyId
            ? { ...s, ssupreaction: reaction }
            : s
        )
      }))
    );
  };

  // If mobile modal is open, show it instead
  if (showMobileModal) {
    return (
      <MobileAppModal
        onClose={handleMobileModalClose}
        deviceType={deviceType}
        contentType={selectedContentType}
      />
    );
  }
  return (
    <div className="pt-0 pb-2 py-4">
      <div className="overflow-x-auto whitespace-nowrap">
        <div className="flex space-x-4 pr-4">
          {loading && !userData?.userId ? (
            <div className="max-w-4xl ml-0 mr-auto mb-4">
              <div className="flex space-x-2 overflow-x-auto py-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex-shrink-0">
                    <div className="rounded-lg bg-secondary-bg-color animate-pulse p-[4px] flex items-center justify-center w-[4.5rem] h-24 relative"></div>
                    <div className="w-12 h-3 mx-auto mt-2 bg-secondary-bg-color animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            <>
              {!stories.some((story) => story.userId === loggedInuserId) && (
                <div
                  className={`flex flex-col items-center relative w-[4.5rem] hover:cursor-pointer`}
                >
                  <div
                    className={`rounded-lg bg-bg-color p-[4px] flex items-center justify-center w-[4.5rem] h-24 relative`}
                  >
                    <Image
                      onContextMenu={(e) => e.preventDefault()}
                      src={userProfileImage || userLogo}
                      alt={"Logged In user Story Image"}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = userLogo.src;
                      }}
                      width={64}
                      height={64}
                    />
                    <div
                      className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 z-20 w-7 h-7 bg-slate-300 border-[3px] border-white rounded-full"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelection('Ssup', toggleSsupCreate) }}
                        className="flex items-center justify-center w-full h-full rounded-full linearBtn"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs mt-4">{"Your Ssup"}</p>
                </div>
              )}

              {stories.length > 0 &&
                stories.map((story, userIndex) => {
                  let borderColor = "border-border-color";
                  let indexOfSubStory = story.stories.findIndex(
                    (subStory) => subStory.isRead === 0
                  );
                  if (indexOfSubStory !== -1) {
                    borderColor = "linearBorder";
                  } else if (story.isMuted === 1) {
                    borderColor = "border-border-color";
                  }
                  let coverFileOfUnreadStory =
                    story.stories.find((subStory) => subStory.isRead === 0)
                      ?.coverFile || story.stories[0].coverFile;

                  let unreadStoryIndex = story.stories.findIndex(
                    (subStory) => subStory.isRead === 0
                  );
                  return (
                    <div
                      key={story.stories[0].postId}
                      onClick={() => handleStoryClick(userIndex, unreadStoryIndex)}
                      className={`flex flex-col items-center w-[4.5rem] hover:cursor-pointer`}
                    >
                      <div
                        className={`rounded-lg ${borderColor !== "linearBorder" && "border-2"} ${borderColor} p-[4px] flex items-center justify-center w-[4.5rem] h-24 relative`}
                      >
                        <Image
                          width={200}
                          height={500}
                          onContextMenu={(e) => e.preventDefault()}
                          src={
                            loggedInuserId === story.userId
                              ? userProfileImage || userLogo
                              : coverFileOfUnreadStory
                          }
                          alt={story.stories[0].postTitle || "Story Image"}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div
                          className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 z-20 w-7 h-7 bg-primary-bg-color border-[3px] border-white rounded-full"
                          onClick={(e) => { e.stopPropagation(); redirectUser(story.userId, `/home/users/${story.userId}`) }}
                        >
                          {loggedInuserId === story.userId ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSsupCreate() }}
                              className="flex items-center justify-center w-full h-full rounded-full linearBtn"
                            >
                              <FaPlus className="text-sm" />
                            </button>
                          ) : (
                            story.isFriend ? (
                              <SafeImage
                                src={story.userProfileImage || (typeof dummyUser === 'string' ? dummyUser : dummyUser.src)}
                                className="w-full h-full object-cover rounded-full text-sm"
                                alt="profile image"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                <FollowButton
                                  isPrivate={false}
                                  isIconButton={true}
                                  requestId={story.userId}
                                  isFollowing={story.isFriend}
                                  updateIsFriend={updateIsFriend}
                                />
                              </div>
                            )
                          )}
                        </div>
                        {story.isMuted === 1 && <div className="absolute inset-0 bg-secondary-bg-color/30" />}
                      </div>
                      <p className="text-xs mt-4">
                        {loggedInuserId === story.userId
                          ? "Your Ssup"
                          : `${story.userName.length > 10
                            ? `${story.userName.substring(0, 8)}...`
                            : story.userName}`}
                      </p>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      </div>
      {selectedUserIndex !== null && selectedStoryIndex !== null && (
        <StoryModal
          storyData={stories}
          initialUserIndex={selectedUserIndex}
          initialStoryIndex={selectedStoryIndex}
          onClose={handleCloseModal}
          removeStory={removeStory}
          readStory={readStory}
          onReactionUpdate={handleReactionUpdate}
          onMuteUpdate={handleMuteUpdate}
        />
      )}
    </div>
  );
};

export default Story;