"use client";
import plogo from "@/assets/user.png";
import PlaylistDetailOverlay from "@/components/Playlist/playlist";
import { ProfileContentSkeleton, ProfileHighlightsSkeleton, ProfilePageSkeleton } from "@/components/Skeletons/Skeletons";
import SeriesDetails from "@/components/flix/SeriesDetails";
import FollowerModal from "@/components/modal/FollowerModal";
import FollowingModal from "@/components/modal/FollowingModal";
import Highlights from "@/components/profile/Highlights";
import PostListCard from "@/components/profile/PostListCard";
import ProfileHeader, {
  ProfileHeaderDataType,
} from "@/components/profile/ProfileHeader";
import SuggestedProfiles from "@/components/profile/SuggestedProfiles";
import SafeImage from "@/components/shared/SafeImage";
import StoryModal from '@/components/story/StoryModal';
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { PostlistItem } from "@/models/postlistResponse";
import { PostProfileData } from "@/models/profileResponse";
import { addFriend } from "@/services/addfriend";
import { getFanList } from "@/services/fanlistforuser";
import { friendRequest } from "@/services/followrequest";
import { Playlist } from "@/services/getplaylistslist";
import { getStoryProfile } from "@/services/getstoriesprofilepage";
import {
  getUserHighlights,
  HighlightsList,
} from "@/services/getuserhighlights";
import { getUserPlaylists, UserPlaylist } from "@/services/getuserplaylists";
import { getUserSeries, Series } from "@/services/getuserseries";
import { getFollowerList } from "@/services/userfriendlist";
import { getUserProfile } from "@/services/userprofile";
import { getUserProfileFlixLists } from "@/services/userprofileflixlist";
import { getUserProfilePostLists } from "@/services/userprofilepostlist";
import { StoryData } from "@/types/storyTypes";
import {
  FollowerModalData,
  FollowingModalData,
  ProfileData,
} from "@/types/usersTypes";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiSolidVideos } from "react-icons/bi";
import { CgPlayList } from "react-icons/cg";
import { CiLock } from "react-icons/ci";
import {
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";
import { IoAtSharp } from "react-icons/io5";
import { MdGridOn, MdOutlineMovie, MdOutlinePlayArrow } from "react-icons/md";

type Tab = {
  name: string;
  icon: JSX.Element;
};

const tabs: Tab[] = [
  { name: "Mini", icon: <MdOutlineMovie className="text-2xl max-md:text-lg" />, },
  { name: "Grid", icon: <MdGridOn className="text-2xl max-md:text-lg" /> },
  { name: "Snips", icon: <MdOutlinePlayArrow className="text-2xl max-md:text-lg" /> },
  // {
  //   name: "Mini",
  //   icon: <MdOutlineMovie className="text-2xl max-md:text-lg" />,
  // },
  { name: "Playlists", icon: <CgPlayList className="text-2xl max-md:text-lg" />, },
  { name: "Tagged", icon: <IoAtSharp className="text-2xl max-md:text-lg" /> },
];

const UserPage = () => {
  const {
    setInAppSnipsData,
    setSnipIndex,
    setMessageUserId,
    setProfilePostData,
    setProfilePostId,
    setInAppFlixData,
    clearFlixData,
  } = useInAppRedirection();
  const router = useRouter();
  const params = useParams();
  let id = params?.id;
  const [userId] = useLocalStorage<string>('userId', '');
  const [activeTab, setActiveTab] = useState("Mini");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [tabData, setTabData] = useState<
    PostlistItem[] | UserPlaylist[] | Series[] | PostProfileData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [isFollowerOpen, setIsFollowerOpen] = useState(false);
  const [followerData, setFollowerData] = useState<FollowerModalData[]>([]);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);
  const [followingData, setFollowingData] = useState<FollowingModalData[]>([]);
  const [storyData, setStoryData] = useState<StoryData[]>([]);
  const [openStoryModal, setOpenStoryModal] = useState(false);
  const [isAllPostModalOpen, setIsAllPostModalOpen] = useState(false);
  const [highlightsList, setHighlightsList] = useState<HighlightsList[]>([]);
  const [highlightsLoading, sethighlightsLoading] = useState(false);
  const [openSeries, setOpenSeries] = useState<number | null>(null);
  const [openPlaylist, setOpenPlaylist] = useState<Playlist | null>(null);

  const profileHeaderData: ProfileHeaderDataType = {
    userId: profileData?.userId || 0,
    profileImage: profileData?.userProfileImage || "",
    hasStories: storyData && storyData[0]?.stories?.length > 0,
    userFullName: profileData?.userFullName || "",
    userName: profileData?.userName || "",
    totalUserPostCount: profileData?.totalUserPostCount || 0,
    totalFan: profileData?.totalFan || 0,
    totalFollowing: profileData?.totalFollowing || 0,
    userProfileBio: profileData?.userProfileBio || "",
    userWebsiteLink: profileData?.userWebsiteLink || "",
  };
  const isPlaylist = (
    item: PostlistItem | UserPlaylist | Series | PostProfileData
  ): item is UserPlaylist => {
    return "playlist_name" in item;
  };

  const isPostListItem = (
    item: PostlistItem | UserPlaylist | Series | PostProfileData
  ): item is PostlistItem => {
    return "postTitle" in item;
  };

  const isSeries = (
    item: PostlistItem | UserPlaylist | Series | PostProfileData
  ): item is Series => {
    return "series_name" in item;
  };
  const getTabParameters = () => {
    switch (activeTab) {
      case "Grid":
        return {
          ownerId: Number(id),
          isPosted: 1,
          isTrending: 0,
          isTaged: 0,
          isLiked: 0,
          isSaved: 0,
          isSavedVideo: 0,
          isOnlyVideo: 0,
          isSuperLike: 0,
        };
      case "Snips":
        return {
          ownerId: Number(id),
          isPosted: 0,
          isTrending: 0,
          isTaged: 0,
          isLiked: 0,
          isSaved: 0,
          isSavedVideo: 0,
          isOnlyVideo: 1,
          isSuperLike: 0,
        };
      case "Tagged":
        return {
          ownerId: Number(id),
          isPosted: 0,
          isTrending: 0,
          isTaged: 1,
          isLiked: 0,
          isSaved: 0,
          isSavedVideo: 0,
          isOnlyVideo: 0,
          isSuperLike: 0,
        };
      case "Mini":
        return {
          ownerId: Number(id),
          isPosted: 1,
          isTrending: 0,
          isTaged: 0,
          isLiked: 0,
          isSaved: 0,
          isSavedVideo: 0,
          isOnlyVideo: 0,
          isSuperLike: 0,
        };
      default:
        return {}; // Default case to handle unexpected values
    }
  };

  const handleOpenPlaylist = (item: UserPlaylist) => {
    if (isPlaylist(item)) {
      const adaptedPlaylist: Playlist = {
        ...item,
        userData: profileData
          ? {
            id: profileData.userId,
            username: profileData.userName,
            profileImage: profileData.userProfileImage,
            name: profileData.userFullName,
          }
          : {
            id: 0,
            username: "",
            profileImage: "",
            name: "",
          },
      };
      setOpenPlaylist(adaptedPlaylist);
    }
  };

  async function fetchProfile(userId: any) {
    try {
      const response = await getUserProfile({ userId });
      const profile = Array.isArray(response.data) ? response.data[0] : null;
      setProfileData(profile);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHighlights() {
    try {
      sethighlightsLoading(true);
      const response = await getUserHighlights({ userId: Number(id) });
      if (response.isSuccess) {
        const data = Array.isArray(response.data) ? response.data : [];
        setHighlightsList(data);
      }
      sethighlightsLoading(false);
    } catch (error) {
      console.error('Failed to fetch highlights:', error);
      sethighlightsLoading(false);
    }
  }
  async function fetchStoryProfilePage() {
    try {
      const response = await getStoryProfile({
        userId: parseInt(id as string),
      });
      if (response.isSuccess) {
        const data = Array.isArray(response.data) ? response.data : [];
        setStoryData(data);
      }
    } catch (error) {
      console.error("Failed to fetch story profile:", error);
    }
  }


  useEffect(() => {
    fetchProfile(id);
    fetchStoryProfilePage();
    fetchHighlights();
  }, [id]);

  async function fetchTabData() {
    try {
      setLoading(true);
      const params = getTabParameters();

      if (activeTab === "Mini") {
        const response = await getUserProfileFlixLists(params);
        const profilePost = Array.isArray(response.data) ? response.data : [];
        setTabData(profilePost as unknown as PostlistItem[]);
      } else if (activeTab === "Playlists" && profileData && id) {
        if (profileData.isBigshortsOriginal === 0) {
          const response = await getUserPlaylists({ userId: Number(id) });
          const profilePost = Array.isArray(response.data) ? response.data : [];
          setTabData(profilePost);
        } else {
          const response = await getUserSeries({ userId: Number(id) });
          const profilePost = Array.isArray(response.data.series)
            ? response.data.series
            : [];
          setTabData(profilePost);
        }
      } else {
        const response = await getUserProfilePostLists(params);
        const profilePost = Array.isArray(response.data) ? response.data : [];
        setTabData(profilePost as unknown as PostlistItem[]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tab data:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  if (!profileData) {
    return <ProfilePageSkeleton />;
  }

  const handleButtonClick = async (
    requestedId: number,
    isFollow: number,
    isPrivate: number,
    isRequested: number
  ) => {
    if (isPrivate === 1) {
      if (isFollow === 0) {
        try {
          const response = await friendRequest({
            requestedId: requestedId,
            userId: Number(userId),
          });
          fetchProfile(id);
        } catch (error) {
          console.error('Error sending friend request:', error);
        }
      } else {
        try {
          await addFriend({ friendId: requestedId, isFollow: 0 });
          fetchProfile(id);
        } catch (error) {
          console.error('Error removing friend:', error);
        }
      }
    } else {
      if (isFollow === 0) {
        try {
          await addFriend({ friendId: requestedId, isFollow: 1 });
          fetchProfile(id);
        } catch (error) {
          console.error('Error adding friend:', error);
        }
      } else {
        try {
          await addFriend({ friendId: requestedId, isFollow: 0 });
          fetchProfile(id);
        } catch (error) {
          console.error('Error unfollowing friend:', error);
        }
      }
    }
  };
  const handleFollowerModalOpen = async () => {
    try {
      if (
        profileData &&
        (profileData.isPrivateAccount === 0 || profileData.isFriend === 1)
      ) {
        let data = {
          friendName: "",
          userId: profileData.userId,
          isCreatePost: 0,
          page: 1,
          pageSize: 20,
          username: "",
        };
        const response = await getFanList(data);
        const profilePost = Array.isArray(response.data) ? response.data : [];
        setFollowerData(profilePost);
        setIsFollowerOpen(!isFollowerOpen);
      }
    } catch (error) {
      console.error('Error fetching follower list:', error);
    }
  };
  const handleFollowingModalOpen = async () => {
    try {
      if (
        profileData &&
        (profileData.isPrivateAccount === 0 || profileData.isFriend === 1)
      ) {
        let data = {
          friendName: "",
          userId: profileData.userId,
          isCreatePost: 0,
          page: 1,
          pageSize: 20,
          username: "",
        };
        const response = await getFollowerList(data);
        const profilePost = Array.isArray(response.data) ? response.data : [];
        setFollowingData(profilePost);
        setIsFollowingOpen(!isFollowingOpen);
      }
    } catch (error) {
      console.error('Error fetching following list:', error);
    }
  };
  const handleFollowerCLoseModal = () => {
    setIsFollowerOpen(!isFollowerOpen);
  };

  const handleFollowingCLoseModal = () => {
    setIsFollowingOpen(!isFollowingOpen);
  };

  const openUserStories = () => {
    if (storyData && storyData[0]?.stories?.length > 0) {
      setOpenStoryModal(!openStoryModal);
    }
  };

  const handleRedirect = (type: string, data: any, index: number) => {
    //Redirect based on active tab, if activeTab not in [Mini, Grid, Snips] then redirect based on post type
    if (activeTab === "Snips") {
      type = 'snips';
    } else if (activeTab === "Grid") {
      type = 'posts';
    }
    if (type == "snips") {
      const snips = data.filter(
        (item: PostlistItem) => item.isForInteractiveVideo === 1
      );
      if (activeTab !== "Snips") {
        //calculating number of snips before current snip
        index = data
          .slice(0, index)
          .filter(
            (item: PostlistItem) => item.isForInteractiveVideo === 1
          ).length;
      }
      setInAppSnipsData(snips);
      setSnipIndex(index);
      router.push("/home/snips");
    }
    if (type == "posts") {
      setProfilePostData(data);
      setProfilePostId(data[index].postId);
      router.push("/home/posts");
    }
    if (type == "flix") {
      clearFlixData();
      setInAppFlixData(data[index]);
      router.push(`/home/flix/${data[index].postId}`);
    }
  };
  const handleIsAllPostModalOpen = () => {
    setIsAllPostModalOpen(!isAllPostModalOpen);
  };

  const handleMessageScreenRedirection = (userId: number) => {
    setMessageUserId(userId);
    router.push("/home/message");
  };

  return (
    <>
      <div className="flex justify-center items-center px-4">
        <div className="py-2 flex flex-col gap-2 w-[90%] max-md:w-[100%] px-36 max-xl:px-20 max-lg:px-14 max-md:px-0">
          <ProfileHeader
            storyData={storyData}
            profileHeaderData={profileHeaderData}
            openStoryModal={openUserStories}
            handleFollowerModalOpen={handleFollowerModalOpen}
            handleFollowingModalOpen={handleFollowingModalOpen}
            isLoggedInUser={false}
          />
          <div className="grid grid-cols-12 gap-2">
            <div
              className={`${profileData.isFriend === 1 || profileData.isPrivateAccount == 0
                ? "col-span-5"
                : "col-span-10"
                } flex gap-2`}
            >
              {profileData.isFriend === 1 ? (
                <button
                  onClick={() =>
                    handleButtonClick(
                      profileData.userId,
                      profileData.isFriend,
                      profileData.isPrivateAccount,
                      profileData.isRequested
                    )
                  }
                  className="max-md:text-sm border-2 border-border-color  font-bold flex justify-center items-center p-2 rounded-md w-full"
                >
                  <p className='linearText'>Following</p>
                </button>
              ) : profileData.isRequested === 1 ? (
                <button
                  onClick={() =>
                    handleButtonClick(
                      profileData.userId,
                      profileData.isFriend,
                      profileData.isPrivateAccount,
                      profileData.isRequested
                    )
                  }
                  className="max-md:text-sm border-2 border-border-color  font-bold flex justify-center items-center p-2 rounded-md w-full"
                >
                  <p className='linearText'>Requested</p>
                </button>
              ) : profileData.isPrivateAccount === 1 ? (
                <button
                  onClick={() =>
                    handleButtonClick(
                      profileData.userId,
                      profileData.isFriend,
                      profileData.isPrivateAccount,
                      profileData.isRequested
                    )
                  }
                  className="max-md:text-sm border-2 border-border-color  font-bold flex justify-center items-center p-2 rounded-md w-full"
                >
                  <p className='linearText'>Follow</p>
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleButtonClick(
                      profileData.userId,
                      profileData.isFriend,
                      profileData.isPrivateAccount,
                      profileData.isRequested
                    )
                  }
                  className="max-md:text-sm border-2 border-border-color  font-bold flex justify-center items-center p-2 rounded-md w-full"
                >
                  <p className='linearText'>Follow</p>
                </button>
              )}
            </div>

            {(profileData.isPrivateAccount == 0 ||
              profileData.isFriend === 1) && (
                <button
                  onClick={() =>
                    handleMessageScreenRedirection(profileData.userId)
                  }
                  className="col-span-5 max-md:text-sm border-2 border-border-color font-bold flex justify-center items-center p-2 rounded-md w-full"
                >
                  <p className='linearText'>Message</p>
                </button>
              )}
            <div className={`col-span-2 flex justify-end`}>
              <button
                onClick={() => {
                  setOpenSuggestions(!openSuggestions)
                }}
                className="border-border-color border-2 p-2 rounded-md w-full flex justify-center items-center"
              >
                <FaChevronDown className="text-2xl font-light text-text-color  max-md:text-sm" />
              </button>
            </div>
          </div>

          {openSuggestions && (
            <SuggestedProfiles userId={profileData.userId} />
          )}

          {highlightsLoading ? (
            <ProfileHighlightsSkeleton />
          ) : highlightsList.length > 0 && (
            // Show highlights if account is public OR if private account and user is friend
            (profileData.isPrivateAccount === 0 ||
              (profileData.isPrivateAccount === 1 &&
                profileData.isFriend === 1)) && (
              <Highlights
                highlightsList={highlightsList}
                profileImage={profileData.userProfileImage}
                userName={profileData.userName}
                userFullName={profileData.userFullName}
              />
            )
          )}

          {profileData.isPrivateAccount === 1 && profileData.isFriend === 0 ? (
            <div className="w-full h-[45vh] flex flex-col gap-4 items-center justify-center">
              <span>
                <CiLock size={40} />
              </span>
              <h3 className="text-3xl ">This Account is Private</h3>
            </div>
          ) : (
            <>
              <div className="w-full flex border-b border-border-color mt-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    className={`flex-1 text-center text-text-color p-2 flex items-center justify-center ${activeTab === tab.name
                      ? "border-b-2 border-border-color"
                      : "border-none"
                      } `}
                    onClick={() => setActiveTab(tab.name)}
                  >
                    {tab.icon}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                {loading ? (
                  <ProfileContentSkeleton />
                ) : tabData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="mb-6 flex items-center justify-center">
                      <svg width="120" height="120" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="125" cy="75" r="30" fill="#E0E0E0" />
                        <path d="M75 125L125 180L175 125" stroke="#E0E0E0" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="text-2xl text-gray-500 font-medium">No Content Uploaded Yet.</h3>
                  </div>
                ) : activeTab === "Playlists" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tabData.map((item, index) =>
                      isPlaylist(item) ? (
                        <div
                          key={index}
                          className="flex items-center justify-between cursor-pointer rounded-md shadow-md p-2"
                        >
                          <div className="flex items-center w-full gap-2">
                            <div className="relative w-1/3 rounded-sm overflow-hidden flex-shrink-0 aspect-video">
                              <SafeImage
                                src={item.coverfile}
                                alt={`playlist-${index}`}
                                className="w-full h-full object-cover"
                                onClick={() => handleOpenPlaylist(item)}
                              />
                            </div>
                            <div className="flex flex-col text-text-color">
                              <p className="text-lg font-semibold">
                                {item.playlist_name}
                              </p>
                              <div className="flex items-center">
                                <BiSolidVideos />
                                <p className="text-sm ml-1">
                                  {item.episodeCount} Episodes
                                </p>
                              </div>
                            </div>
                          </div>
                          <FaChevronRight />
                        </div>
                      ) : (
                        isSeries(item) && (
                          <div
                            key={index}
                            className="flex items-center justify-between cursor-pointer rounded-md shadow-md p-2"
                            onClick={() => setOpenSeries(item.id)}
                          >
                            <div className="flex items-center w-full gap-2">
                              <div className="relative w-1/3 rounded-sm overflow-hidden flex-shrink-0 aspect-video">
                                <SafeImage
                                  src={item.coverfile}
                                  alt={`playlist-${index}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col text-text-color">
                                <p className="text-lg font-semibold">
                                  {item.series_name}
                                </p>
                                <div className="flex items-center">
                                  <BiSolidVideos />
                                  <p className="text-sm ml-1">
                                    {item.seasons.length} Seasons
                                  </p>
                                </div>
                              </div>
                            </div>
                            <FaChevronRight />
                          </div>
                        )
                      )
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {tabData.map(
                      (item, index) =>
                        isPostListItem(item) && (
                          <div
                            onClick={() =>
                              handleRedirect(
                                item.isForInteractiveVideo
                                  ? "snips"
                                  : item.isForInteractiveImage
                                    ? "posts"
                                    : "flix",
                                tabData,
                                index
                              )
                            }
                            key={index}
                          >
                            <PostListCard
                              coverfile={item.coverFile}
                              isVideo={item.isForInteractiveVideo}
                              index={index}
                              activeTab={activeTab}
                              postTitle={item.postTitle}
                              post={item}
                            />
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {(profileData.isPrivateAccount === 0 || profileData.isFriend === 1) &&
        isFollowerOpen && (
          <FollowerModal
            userId={profileData.userId}
            followerData={followerData}
            closeModal={handleFollowerCLoseModal}
            fetchProfile={fetchProfile}
            isFromProfile={false}
          />
        )}
      {(profileData.isPrivateAccount === 0 || profileData.isFriend === 1) &&
        isFollowingOpen && (
          <FollowingModal
            fetchProfile={fetchProfile}
            userId={profileData.userId}
            followingData={followingData}
            closeModal={handleFollowingCLoseModal}
            isFromProfile={false}
          />
        )}
      {openStoryModal && storyData.length > 0 && (
        <StoryModal
          storyData={storyData} // Pass the story data for the user's stories
          initialUserIndex={0} // This is the user's own stories, so index is 0
          initialStoryIndex={0} // Start from the first story
          onClose={() => setOpenStoryModal(false)} // Close the modal
          removeStory={(storyId) => {
            storyData[0].stories = storyData[0].stories.filter((story) => story.postId !== storyId);
          }}
          readStory={(storyId) => {
            storyData[0].stories.forEach((story) => {
              if (story.postId === storyId) {
                story.isRead = 1;
              }
            })
          }}
          onReactionUpdate={(storyId, reaction) => {
            // Logic to handle reaction updates
          }}
          onMuteUpdate={(userId, isMuted) => {
            // Logic to handle mute updates
          }}
        />
      )}
      {openPlaylist && (
        <PlaylistDetailOverlay
          isFromProfile={false}
          playlist={openPlaylist}
          onClose={() => setOpenPlaylist(null)}
        />
      )}
      {tabData.map(
        (item) =>
          isSeries(item) &&
          openSeries === item.id && (
            <SeriesDetails
              key={item.id}
              onClose={() => setOpenSeries(null)}
              series={item as Series}
            />
          )
      )}
    </>
  );
};

export default UserPage;
