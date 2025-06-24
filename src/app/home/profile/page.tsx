"use client";
import plogo from '@/assets/user.png';
import CreateUserPlaylistModal from '@/components/CreatePLaylist/CreateUserPlaylistModal';
import PlaylistDetailOverlay from '@/components/Playlist/playlist';
import MiniListModal from '@/components/ProfileMiniList/MiniList';
import { ProfileContentSkeleton, ProfileHighlightsSkeleton, ProfilePageSkeleton } from '@/components/Skeletons/Skeletons';
import CreateSeriesModal from '@/components/createSeries/createSeries';
import SeriesDetails from '@/components/flix/SeriesDetails';
import AccountOverviewModal from '@/components/modal/AccountOverviewModal';
import FollowerModal from '@/components/modal/FollowerModal';
import FollowingModal from '@/components/modal/FollowingModal';
import EditProfileForm from '@/components/profile/EditProfileForm';
import Highlights from '@/components/profile/Highlights';
import PostListCard from '@/components/profile/PostListCard';
import ProfileHeader, { ProfileHeaderDataType } from '@/components/profile/ProfileHeader';
import SuggestedProfiles from '@/components/profile/SuggestedProfiles';
import Button from '@/components/shared/Button';
import StoryModal from '@/components/story/StoryModal';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { useCreationOption } from '@/context/useCreationOption';
import useLocalStorage from '@/hooks/useLocalStorage';
import { PostlistItem } from '@/models/postlistResponse';
import { PostProfileData } from '@/models/profileResponse';
import { deleteFlix } from '@/services/deleteflix';
import { deleteHighlight } from '@/services/deletehighlight';
import { getFanList } from '@/services/fanlistforuser';
import { Playlist } from '@/services/getplaylistslist';
import { getStoryProfile } from '@/services/getstoriesprofilepage';
import { getUserHighlights, HighlightsList } from '@/services/getuserhighlights';
import { getUserPlaylists, GetUserPlaylistsRequest, UserPlaylist } from '@/services/getuserplaylists';
import { getUserSeries, Series } from '@/services/getuserseries';
import { getFollowerList } from '@/services/userfriendlist';
import { getUserProfile } from '@/services/userprofile';
import { getUserProfileFlixLists } from '@/services/userprofileflixlist';
import { getUserProfilePostLists } from '@/services/userprofilepostlist';
import { StoryData } from '@/types/storyTypes';
import { FollowerModalData, FollowingModalData, ProfileData } from '@/types/usersTypes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiFillPicture } from "react-icons/ai";
import { BiSolidVideos } from 'react-icons/bi';
import { CgPlayList } from 'react-icons/cg';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { IoDocumentsSharp } from 'react-icons/io5';
import { MdGridOn, MdOutlineAccountBalanceWallet, MdOutlineFileCopy, MdOutlineMovie, MdOutlinePlayArrow, MdStarOutline } from 'react-icons/md';
import { SlPicture } from "react-icons/sl";
import { TbAt } from 'react-icons/tb';
import { useMobileDetection } from '@/hooks/useMobileDetection'; // Adjust import path as needed
import MobileAppModal from '@/components/modal/MobileAppModal';
import SafeImage from '@/components/shared/SafeImage';

type Tab = {
    name: string;
    icon: JSX.Element;
    text: string;
    largeIcon: JSX.Element;
};

const tabs: Tab[] = [
    { name: 'Mini', icon: <MdOutlineMovie className='text-2xl max-md:text-lg' />, text: "Upload your first Mini", largeIcon: <SlPicture size={70} /> },
    { name: 'Grid', icon: <MdGridOn className='text-2xl max-md:text-lg' />, text: "Upload your first Post", largeIcon: <SlPicture size={70} /> },
    { name: 'Snips', icon: <MdOutlinePlayArrow className='text-2xl max-md:text-lg' />, text: "Upload your first Snip", largeIcon: <SlPicture size={70} /> },
    { name: 'Mini Drama', icon: <BiSolidVideos className='text-2xl max-md:text-lg' />, text: "No Mini Drama Series Available", largeIcon: <CgPlayList size={70} /> },
    { name: 'Series', icon: <BiSolidVideos className='text-2xl max-md:text-lg' />, text: "No series available", largeIcon: <AiFillPicture size={70} /> },
    { name: 'Tagged', icon: <TbAt className='text-2xl max-md:text-lg' />, text: "Get tagged by your friends to fill this space with shared moments", largeIcon: <SlPicture size={70} /> },
    { name: 'Star', icon: <MdStarOutline className='text-2xl max-md:text-lg' />, text: "No data to show", largeIcon: <SlPicture size={70} /> },
    { name: 'Draft', icon: <MdOutlineFileCopy className='text-2xl max-md:text-lg' />, text: "No drafts yet!", largeIcon: <IoDocumentsSharp size={70} /> },
];


const ProfilePage = () => {
    const {
        setInAppSnipsData,
        setSnipIndex,
        setProfilePostData,
        setProfilePostId,
        setInAppFlixData,
        clearFlixData,
        shouldRefreshProfileStory,
        setShouldRefreshProfileStory,
    } = useInAppRedirection()
    const { toggleSsupCreate } = useCreationOption()
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Mini');
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [tabData, setTabData] = useState<PostlistItem[] | UserPlaylist[] | Series[] | PostProfileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowerOpen, setIsFollowerOpen] = useState(false);
    const [followerData, setFollowerData] = useState<FollowerModalData[]>([]);
    const [isFollowingOpen, setIsFollowingOpen] = useState(false);
    const [followingData, setFollowingData] = useState<FollowingModalData[]>([]);
    const [openSuggestions, setOpenSuggestions] = useState(false);
    const [openEditForm, setOpenEditForm] = useState(false);
    const [storyData, setStoryData] = useState<StoryData[] | null>(null);
    const [openStoryModal, setOpenStoryModal] = useState(false);
    const [openAccountOverviewModal, setOpenAccountOverviewModal] = useState(false);
    const [highlightsList, setHighlightsList] = useState<HighlightsList[]>([]);
    const [highlightsLoading, sethighlightsLoading] = useState(false);
    const [isCreateUserPlaylistOpen, setIsCreateUserPlaylistOpen] = useState(false);
    const [isCreateSeriesOpen, setIsCreateSeriesOpen] = useState(false);
    const [openPlaylist, setOpenPlaylist] = useState<Playlist | null>(null);
    const [openSeries, setOpenSeries] = useState<number | null>(null);
    const [openMiniListModal, setOpenMiniListModal] = useState(false);
    const [selectedMiniIndex, setSelectedMiniIndex] = useState(0);
    const [userData, setUserData] = useLocalStorage<any>('userData', {});
    const [userId, setUserId, userIdHydrated] = useLocalStorage<string>('userId', '');
    const { isMobile, deviceType } = useMobileDetection();
    const [showMobileModal, setShowMobileModal] = useState(false);
    const [selectedContentType, setSelectedContentType] = useState<string>('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const handleOpenPlaylist = (item: UserPlaylist) => {
        if (isUserPlaylist(item)) {
            const adaptedPlaylist: Playlist = {
                ...item,
                userData: profileData ? {
                    id: profileData.userId,
                    username: profileData.userName,
                    profileImage: profileData.userProfileImage,
                    name: profileData.userFullName
                } : {
                    id: 0,
                    username: '',
                    profileImage: '',
                    name: ''
                }
            };
            setOpenPlaylist(adaptedPlaylist);
        }
    };


    const isUserPlaylist = (item: PostlistItem | UserPlaylist | Series | PostProfileData): item is UserPlaylist => {
        return 'playlist_name' in item;
    }


    const isPostListItem = (item: PostlistItem | UserPlaylist | Series | PostProfileData): item is PostlistItem => {
        return 'postTitle' in item;
    }

    const isSeries = (item: PostlistItem | UserPlaylist | Series | PostProfileData): item is Series => {
        return 'series_name' in item;
    }

    const isPostProfileData = (item: PostlistItem | UserPlaylist | Series | PostProfileData): item is PostProfileData => {
        return 'coverFile' in item && !('postTitle' in item);
    }


    const profileHeaderData: ProfileHeaderDataType = {
        profileImage: profileData?.userProfileImage || "",
        hasStories: storyData && storyData[0]?.stories?.length > 0,
        userFullName: profileData?.userFullName || '',
        userName: profileData?.userName || '',
        totalUserPostCount: profileData?.totalUserPostCount || 0,
        totalFan: profileData?.totalFan || 0,
        totalFollowing: profileData?.totalFollowing || 0,
        userProfileBio: profileData?.userProfileBio || '',
        userWebsiteLink: profileData?.userWebsiteLink || '',
        userId: profileData?.userId || parseInt(userId),
    }
    const updateTabData = () => {
        fetchTabData();
    }
    const getTabParameters = () => {
        switch (activeTab) {
            case 'Grid':
                return {
                    ownerId: Number(userId),
                    isPosted: 1,
                    isTrending: 0,
                    isTaged: 0,
                    isLiked: 0,
                    isSaved: 0,
                    isSavedVideo: 0,
                    isOnlyVideo: 0,
                    isSuperLike: 0,
                };
            case 'Snips':
                return {
                    ownerId: Number(userId),
                    isPosted: 0,
                    isTrending: 0,
                    isTaged: 0,
                    isLiked: 0,
                    isSaved: 0,
                    isSavedVideo: 0,
                    isOnlyVideo: 1,
                    isSuperLike: 0,
                };
            case 'Tagged':
                return {
                    ownerId: Number(userId),
                    isPosted: 0,
                    isTrending: 0,
                    isTaged: 1,
                    isLiked: 0,
                    isSaved: 0,
                    isSavedVideo: 0,
                    isOnlyVideo: 0,
                    isSuperLike: 0,
                };
            case 'Star':
                return {
                    ownerId: Number(userId),
                    isPosted: 0,
                    isTrending: 0,
                    isTaged: 0,
                    isLiked: 0,
                    isSaved: 0,
                    isSavedVideo: 0,
                    isOnlyVideo: 0,
                    isSuperLike: 1,
                };
            case 'Draft':
                return {
                    ownerId: Number(userId),
                    isPosted: 0,
                    isTrending: 0,
                    isTaged: 0,
                    isLiked: 0,
                    isSaved: 0,
                    isSavedVideo: 0,
                    isOnlyVideo: 0,
                    isSuperLike: 0,
                };
            case 'Mini':
                return {
                    ownerId: Number(userId),
                    isPosted: 1,
                    isTrending: 0,
                    isTaged: 0,
                    isLiked: 0,
                    isSaved: 0,
                    isSavedVideo: 0,
                    isOnlyVideo: 0,
                    isSuperLike: 0,
                };
            case 'Mini Drama':
                return {
                    userId: Number(userId),
                };
            case 'Series':
                return {
                    userId: Number(userId),
                };
            default:
                return {
                    ownerId: Number(userId),
                };
        }
    };


    async function fetchProfile(userId: any) {
        try {
            const response = await getUserProfile({ userId: userId });
            if (response.isSuccess) {
                const profile = Array.isArray(response.data) ? response.data[0] : null;
                setUserData(profile);
                setProfileData(profile);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    }

    async function fetchTabData() {
        try {
            setLoading(true);
            const params = getTabParameters();

            if (activeTab === 'Mini') {
                const response = await getUserProfileFlixLists(params);
                const profilePost = Array.isArray(response.data) ? response.data : [];
                setTabData(profilePost as PostProfileData[]);
            }
            else if (activeTab === 'Mini Drama' && profileData) {
                if (profileData.isBigshortsOriginal === 0) {
                    const response = await getUserPlaylists(params as GetUserPlaylistsRequest);
                    const profilePost = Array.isArray(response.data) ? response.data : [];
                    setTabData(profilePost);
                }
            } else if (activeTab === 'Series' && profileData?.isBigshortsOriginal === 1) {
                const response = await getUserSeries(params as GetUserPlaylistsRequest);
                const profilePost = Array.isArray(response.data?.series) ? response.data.series : [];
                setTabData(profilePost);
            }
            else {
                const response = await getUserProfilePostLists(params);
                const profilePost = Array.isArray(response.data) ? response.data : [];

                setTabData(profilePost as unknown as PostlistItem[]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch tab data:', error);
        } finally {
            setLoading(false);
        }
    }
    const handleEditMini = (mini: PostProfileData) => {
        // Close the modal first
        setOpenMiniListModal(false);

        // Implement your edit logic here
        // You might want to open an edit modal or navigate to an edit page
        // Example: Navigate to edit page
        // router.push(`/edit-mini/${mini.postId}`);

        // Or: Open an edit modal
        // setEditMiniData(mini);
        // setOpenEditMiniModal(true);
    };

    const handleDeleteMini = async (mini: PostProfileData) => {
        // Close the modal first
        setOpenMiniListModal(false);

        // Show confirmation dialog
        const confirmed = window.confirm(`Are you sure you want to delete "${mini.postTitle || 'this mini'}"?`);

        if (confirmed) {
            try {
                // Call the deleteFlix API
                const response = await deleteFlix({
                    postId: mini.postId.toString(),
                });

                if (response.isSuccess) {
                    // Refresh the tab data to remove the deleted mini
                    updateTabData();
                    // Show success message (optional - you can remove this if you don't want the alert)
                    alert('Mini deleted successfully!');
                } else {
                    // Handle API error response
                    alert(response.message || 'Failed to delete mini. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting mini:', error);
                alert('An error occurred while deleting the mini. Please try again.');
            }
        }
    };
    async function fetchStoryProfilePage() {
        try {
            const response = await getStoryProfile({ userId: parseInt(userId!) });
            if (response.isSuccess) {
                const data = Array.isArray(response.data) ? response.data : [];
                setStoryData(data);
            } else {
            }
        } catch (error) {
        }
    }

    async function fetchHighlights() {
        try {
            sethighlightsLoading(true);
            const response = await getUserHighlights({ userId: parseInt(userId!) });
            if (response.isSuccess) {
                const data = Array.isArray(response.data) ? response.data : [];
                setHighlightsList(data);
            }
            sethighlightsLoading(false);
        } catch (error) {
            sethighlightsLoading(false);
        }
    }

    const handleHighlightDelete = async (highlightId: number) => {
        try {
            const response = await deleteHighlight({ highlightId });
            if (response.isSuccess) {
                setHighlightsList(prev => prev.filter(h => h.highlightId !== highlightId));

                await fetchHighlights();
            } else {
                console.error('Failed to delete highlight:', response.message);
            }
        } catch (error) {
            console.error('Failed to delete highlight:', error);
        }
    };

    useEffect(() => {
        if (!userIdHydrated) return; // wait for localStorage hydration

        if (userId) {
            fetchProfile(userId);
            fetchStoryProfilePage();
            fetchHighlights();
        } else {
            console.error('User ID is not available.');
            router.push('/auth/login');
        }
    }, [userId, userIdHydrated]);


    useEffect(() => {
        if (shouldRefreshProfileStory) {
            fetchStoryProfilePage();
            setShouldRefreshProfileStory(false);
        }
    }, [shouldRefreshProfileStory])

    useEffect(() => {
        fetchTabData();
    }, [activeTab]);

    if (!profileData) {
        return <ProfilePageSkeleton />;
    }
    const handleEditProfile = () => {
        setOpenEditForm(!openEditForm);
    }
    const handleFollowerModalOpen = async () => {
        try {
            let data = { "friendName": '', "userId": userId!, "isCreatePost": 0, "page": 1, "pageSize": 20, username: '' };
            const response = await getFanList(data);
            const profilePost = Array.isArray(response.data) ? response.data : [];
            setFollowerData(profilePost);
            setIsFollowerOpen(!isFollowerOpen);
        } catch (error) {
        }
    };

    const handleFollowingModalOpen = async () => {
        try {
            let data = { friendName: '', userId: Number(userId), isCreatePost: 0, page: 1, pageSize: 20, username: '' };
            const response = await getFollowerList(data);
            const profilePost = Array.isArray(response.data) ? response.data : [];
            setFollowingData(profilePost);
            setIsFollowingOpen(!isFollowingOpen);
        } catch (error) {
        }
    };

    const handleFollowerCLoseModal = () => {
        setIsFollowerOpen(!isFollowerOpen);
    };

    const handleFollowingCLoseModal = () => {
        setIsFollowingOpen(!isFollowingOpen);
    };

    const openMyStories = () => {
        if (storyData && storyData[0]?.stories?.length > 0) {
            setOpenStoryModal(!openStoryModal);
        }
    }

    const handleRedirect = (type: string, data: any, index: number) => {
        //Redirect based on active tab, if activeTab not in [Mini, Grid, Snips] then redirect based on post type
        if (activeTab === "Snips") {
            type = 'snips';
        } else if (activeTab === "Grid") {
            type = 'posts';
        } else if (activeTab === "Snips") {
            type = 'flix';
        }

        if (type == "snips") {
            const snips = data.filter((item: PostlistItem) => item.isForInteractiveVideo === 1);
            if (activeTab !== 'Snips') {
                //calculating number of snips before current snip
                index = data.slice(0, index).filter((item: PostlistItem) => item.isForInteractiveVideo === 1).length;
            }
            setInAppSnipsData(snips);
            setSnipIndex(index);
            router.push('/home/snips')
        }
        if (type == "posts") {
            setProfilePostData(data);
            setProfilePostId(data[index].postId);
            router.push('/home/posts')
        }
        if (type == "flix") {
            setSelectedMiniIndex(index);
            setOpenMiniListModal(true);
        }
    }

    const handleAccountOverviewModal = () => {
        setOpenAccountOverviewModal(!openAccountOverviewModal);
    }
    function isPostlistItemWithIsInteractive(item: any): item is PostlistItem {
        return typeof item.isInteractive === 'number';
    }

    const handleSelection = (optionName: string,) => {
        setSelectedOption(optionName);
        if (isMobile) {
            setSelectedContentType(optionName);
            setShowMobileModal(true);
        } else if (optionName == 'Series') {
            setIsCreateSeriesOpen(true)
        } else if (optionName == 'Mini Drama') {
            setIsCreateUserPlaylistOpen(true)
        }
    };

    const handleMobileModalClose = () => {
        setShowMobileModal(false);
        setSelectedOption(null);
        setSelectedContentType('');
    };

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
        <>
            {openEditForm ? (
                <EditProfileForm closeForm={handleEditProfile} profileData={profileData} fetchProfile={fetchProfile} />
            ) : (
                <div className='flex flex-col justify-center md:items-center w-full overflow-hidden px-4'>
                    <div className='py-2 flex flex-col gap-3 w-[90%] max-md:w-[100%] px-36 max-xl:px-20 max-lg:px-14 max-md:px-0'>
                        <ProfileHeader
                            storyData={storyData}
                            profileHeaderData={profileHeaderData}
                            openStoryModal={openMyStories}
                            toggleSsupCreate={toggleSsupCreate}
                            handleFollowerModalOpen={handleFollowerModalOpen}
                            handleFollowingModalOpen={handleFollowingModalOpen}
                            isLoggedInUser={true}
                        />
                        <div className="flex flex-wrap gap-2 max-md:justify-between">
                            {/* Edit Profile */}
                            <Button
                                className="flex-1 min-w-[100px] py-2.5 border-2 border-border-color text-2xl font-bold"
                                onClick={handleEditProfile}
                            >
                                <p className='linearText'>Edit Profile</p>
                            </Button>

                            {/* Saved */}
                            <Button
                                className="flex-1 min-w-[100px] py-2.5 border-2 border-border-color text-2xl font-bold"
                                onClick={() => router.push('/home/saved')}
                            >
                                <p className='linearText'>Saved</p>
                            </Button>

                            {/* Icons */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleAccountOverviewModal} // fixed typo
                                    className="max-md:hidden border-2 border-border-color"
                                >
                                    <MdOutlineAccountBalanceWallet className="text-2xl text-text-color max-md:text-sm flex-shrink-0" />
                                </Button>
                                <Button
                                    onClick={() => setOpenSuggestions(!openSuggestions)}
                                    className="p-2 border-2 border-border-color"
                                >
                                    <FaChevronDown className="text-2xl text-text-color max-md:text-sm" />
                                </Button>
                            </div>
                        </div>

                        {openSuggestions && <SuggestedProfiles userId={profileData.userId} />}

                        {highlightsLoading ? (
                            <ProfileHighlightsSkeleton />
                        ) : highlightsList.length > 0 && (
                            <Highlights
                                highlightsList={highlightsList}
                                profileImage={profileData.userProfileImage}
                                userName={profileData.userName}
                                userFullName={profileData.userFullName}
                                onDelete={handleHighlightDelete}
                            />
                        )}

                        <div className='space-y-2'>
                            {profileData?.isBigshortsOriginal === 1 ? (
                                <button
                                    className='w-full py-3 rounded-md border-2 border-border-color text-text-color text-center'
                                    onClick={() =>
                                        handleSelection('Series')}
                                >
                                    Create Series
                                </button>
                            ) : (
                                <button
                                    className='w-full py-3 rounded-md border-2 border-border-color text-text-color text-center'
                                    onClick={() => {
                                        handleSelection('Mini Drama');
                                    }}
                                >
                                    Create Mini Drama Series
                                </button>
                            )}
                        </div>

                        <div className='w-full flex border-t border-b border-border-color p-2'>
                            {tabs
                                .filter(tab => {
                                    // Show UserPlaylists if isBigshortsOriginal is 0
                                    if (tab.name === 'Mini Drama') return profileData?.isBigshortsOriginal === 0;
                                    // Show Series if isBigshortsOriginal is 1
                                    if (tab.name === 'Series') return profileData?.isBigshortsOriginal === 1;
                                    // Show all other tabs
                                    return true;
                                })
                                .map((tab) => (
                                    <button
                                        key={tab.name}
                                        className={`flex-1 text-center p-2 flex gap-2 items-center justify-center ${activeTab === tab.name ? ' text-text-color' : 'text-primary-text-color'}`}
                                        onClick={() => setActiveTab(tab.name)}
                                    >
                                        {tab.icon} <span className='text-sm max-md:hidden'>{tab.name}</span>
                                    </button>
                                ))}
                        </div>
                        <div className='md:mt-4'>
                            {loading ? (
                                <ProfileContentSkeleton />
                            ) : tabData.length === 0 ? (
                                <div className='flex flex-col text-text-color0 items-center justify-center h-[350px] gap-4'>
                                    {tabs.find((tab) => tab.name === activeTab)?.largeIcon}
                                    <p>{tabs.find((tab) => tab.name === activeTab)?.text ? tabs.find((tab) => tab.name === activeTab)?.text : "No data to show"}</p>
                                </div>
                            ) : (
                                activeTab === 'Mini Drama' || activeTab === 'Series' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {tabData.map((item, index) => (
                                            isUserPlaylist(item) ? (
                                                <div key={index} className='flex items-center justify-between cursor-pointer rounded-md shadow-md p-2'>
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
                                                            <p className="text-lg font-semibold">{item.playlist_name}</p>
                                                            <div className='flex items-center'>
                                                                <BiSolidVideos />
                                                                <p className="text-sm ml-1">{item.episodeCount} Episodes</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <FaChevronRight />
                                                </div>
                                            ) : isSeries(item) && (
                                                <div
                                                    key={index}
                                                    className='flex items-center justify-between cursor-pointer rounded-md shadow-md p-2'
                                                    onClick={() => setOpenSeries(item.id)}
                                                >
                                                    <div className="flex items-center w-full gap-2">
                                                        <div className="relative w-1/3 rounded-sm overflow-hidden flex-shrink-0 aspect-video">
                                                            <SafeImage
                                                                src={item.coverfile}
                                                                alt={`series-${index}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col text-text-color">
                                                            <p className="text-lg font-semibold">{item.series_name}</p>
                                                            <div className='flex items-center'>
                                                                <BiSolidVideos />
                                                                <p className="text-sm ml-1">{item.seasons.length} Seasons</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <FaChevronRight />
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {tabData.map((item, index) => {
                                            if (isPostListItem(item)) {
                                                return (
                                                    <div onClick={() => handleRedirect(item.isForInteractiveVideo ? 'snips' : item.isForInteractiveImage ? 'posts' : 'flix', tabData, index)} key={index}>
                                                        <PostListCard
                                                            coverfile={item.coverFile}
                                                            isVideo={item.isForInteractiveVideo}
                                                            index={index}
                                                            activeTab={activeTab}
                                                            postTitle={item.postTitle}
                                                            post={item}
                                                            updateTabData={updateTabData}
                                                        />
                                                    </div>
                                                );
                                            } else if (isPostProfileData(item)) {
                                                return (
                                                    <div onClick={() => handleRedirect(item.isForInteractiveVideo ? 'snips' : item.isForInteractiveImage ? 'posts' : 'flix', tabData, index)} key={index}>
                                                        <PostListCard
                                                            coverfile={item.coverFile}
                                                            isVideo={item.isForInteractiveVideo ? 1 : 0}
                                                            index={index}
                                                            activeTab={activeTab}
                                                            postTitle={item.postTitle || ''}
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {openAccountOverviewModal && (
                <AccountOverviewModal onClose={handleAccountOverviewModal} userId={profileData.userId} />
            )}

            {isFollowerOpen && (
                <FollowerModal
                    followerData={followerData}
                    closeModal={handleFollowerCLoseModal}
                    fetchProfile={fetchProfile}
                    userId={profileData.userId}
                />
            )}

            {isFollowingOpen && (
                <FollowingModal
                    followingData={followingData}
                    closeModal={handleFollowingCLoseModal}
                    fetchProfile={fetchProfile}
                    userId={profileData.userId}
                />
            )}

            {openStoryModal && storyData && storyData.length > 0 && (
                <StoryModal
                    storyData={storyData} // Pass the story data for the user's stories
                    initialUserIndex={0} // This is the user's own stories, so index is 0
                    initialStoryIndex={0} // Start from the first story
                    onClose={() => setOpenStoryModal(false)} // Close the modal
                    removeStory={(storyId, userId) => {
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

            {isCreateUserPlaylistOpen && (
                <CreateUserPlaylistModal
                    onClose={() => setIsCreateUserPlaylistOpen(false)}
                    onCreatePlaylist={updateTabData}
                />
            )}

            {isCreateSeriesOpen && (
                <CreateSeriesModal
                    onClose={() => setIsCreateSeriesOpen(false)}
                    onCreateSeries={updateTabData}
                />
            )}

            {openPlaylist && (
                <PlaylistDetailOverlay
                    isFromProfile={true}
                    playlist={openPlaylist}
                    onClose={() => setOpenPlaylist(null)}
                    updateUpstream={updateTabData}
                />
            )}

            {tabData.map((item) => (
                isSeries(item) && openSeries === item.id && (
                    <SeriesDetails
                        key={item.id}
                        onClose={() => setOpenSeries(null)}
                        series={item as Series}
                        isFromProfile={true}
                        updateUpstream={updateTabData}
                    />
                )
            ))}

            {openMiniListModal && (
                <MiniListModal
                    minis={tabData as PostProfileData[]}
                    selectedMiniIndex={selectedMiniIndex}
                    onClose={() => setOpenMiniListModal(false)}
                    setInAppFlixData={setInAppFlixData}
                    clearFlixData={clearFlixData}
                    onEditMini={handleEditMini}
                    onDeleteMini={handleDeleteMini}
                />
            )}
        </>
    );
};

export default ProfilePage;