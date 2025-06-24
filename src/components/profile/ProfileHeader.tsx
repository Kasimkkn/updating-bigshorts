import dummyUser from '@/assets/user.png';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { getMutualFriends, MutualFriend } from '@/services/getcommonfriends';
import { saveUserBlock } from '@/services/saveuserblock';
import { Stories, StoryData } from "@/types/storyTypes";
import { StaticImageData } from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEllipsisH, FaLink, FaPlus, FaRegFlag, FaUserCircle } from 'react-icons/fa';
import { ImBlocked } from 'react-icons/im';
import AboutAccountModal from '../modal/AboutAccountModal';
import MobileAppModal from '../modal/MobileAppModal';
import ReportModal from '../modal/ReportModal';
import Button from '../shared/Button';
import MutualsModal from './MutualsModal';
import SafeImage from '../shared/SafeImage';

interface ProfileHeaderDataType {
  profileImage: string;
  hasStories: boolean | null;
  userFullName: string;
  userName: string;
  totalUserPostCount: number;
  totalFan: number;
  totalFollowing: number;
  userProfileBio: string;
  userWebsiteLink: string;
  userId: number;
  stories?: Stories[];
}

interface ProfileHeaderProps {
  storyData?: StoryData[] | null;
  openStoryModal: () => void;
  toggleSsupCreate?: () => void
  handleFollowerModalOpen: () => Promise<void>
  handleFollowingModalOpen: () => Promise<void>
  profileHeaderData: ProfileHeaderDataType;
  isLoggedInUser: boolean;
}

const ensureHttps = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

const ProfileHeader = ({ profileHeaderData, openStoryModal, toggleSsupCreate, isLoggedInUser, handleFollowerModalOpen, handleFollowingModalOpen, storyData }: ProfileHeaderProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [openMoreOptions, setOpenMoreOptions] = useState(false);
  const [isAboutAccountModalOpen, setIsAboutAccountModalOpen] = useState<boolean>(false);
  const [firstThreeMutuals, setFirstThreeMutuals] = useState<MutualFriend[]>([]);
  const [otherMutualsCount, setOtherMutualsCount] = useState<number>(0)
  const [openMutuals, setOpenMutuals] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const { isMobile, deviceType } = useMobileDetection();

  const handleSelection = (optionName: string, callback?: () => void) => {

    // Check if user is on mobile
    if (isMobile) {
      setSelectedContentType(optionName);
      setShowMobileModal(true);
    } else {
      toggleSsupCreate?.();
    }
  };

  const handleMobileModalClose = () => {
    setShowMobileModal(false);
    setSelectedContentType('');
  };
  const options = [
    { name: 'Report', icon: <FaRegFlag /> },
    { name: isBlocked ? 'Unblock' : 'Block', icon: <ImBlocked style={{ color: isBlocked ? 'gray' : 'red' }} /> },
    { name: 'About this Account', icon: <FaUserCircle /> },
  ]
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMoreOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMutuals = async () => {
      try {
        const res = await getMutualFriends({ userId: profileHeaderData.userId, firstThree: 1, page: 0 });
        if (res.isSuccess) {
          const data = res.data
          setFirstThreeMutuals(data.mutualFriends)
          setOtherMutualsCount(data.othersCount - data.mutualFriends.length)
        }

      } catch (error) {
        console.error('Error fetching common friends:', error);
      }
    }

    fetchMutuals()
  }, [])
  const areAllStoriesRead = () => {
    if (!storyData || !storyData[0]?.stories || storyData[0].stories.length === 0) {
      return false; // No stories means no border
    }

    return storyData[0].stories.every(story => story.isRead === 1);
  };
  const getBorderClass = () => {
    if (!profileHeaderData.hasStories || !storyData || !storyData[0]?.stories || storyData[0].stories.length === 0) {
      return ''; // No border if no stories
    }

    const allRead = areAllStoriesRead();
    return allRead ? 'border-2 border-gray-400 p-[3px]' : 'linearBorder p-[3px]';
  };


  const handleBlock = async (userId: number) => {
    try {
      const res = await saveUserBlock({ blockuserId: userId, isBlock: isBlocked ? 0 : 1 });
      if (res.isSuccess) {
        setIsBlocked(!isBlocked);
        toast.success(isBlocked ? "User unblocked" : "User blocked");
      }
    } catch (error) {
    }
  };

  const handleOptionClick = (optionName: string) => {
    switch (optionName) {
      case 'Report':
        setOpenReportModal(true);
        break;
      case 'Block':
      case 'Unblock':
        handleBlock(profileHeaderData.userId)
        break;
      case 'About this Account':
        setIsAboutAccountModalOpen(true)
        break;
      default:
        break;
    }
    setOpenMoreOptions(false)
  }

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
    <div className='flex flex-col gap-3 mt-2'>
      <div className="flex gap-2 items-center">
        <div
          className={`flex-shrink-0 relative rounded-md aspect-[3/4] h-28 hover:cursor-pointer ${getBorderClass()} mr-2 md:mr-12`}
          onClick={(e) => {
            e.stopPropagation();
            openStoryModal();
          }}
        >
          <SafeImage
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openStoryModal();
            }}
            src={profileHeaderData.profileImage}
            type='dummyUser'
            alt='profile'
            className="rounded-md w-full h-full object-cover"
            onContextMenu={(e) => e.preventDefault()}
          />
          {isLoggedInUser &&
            <button
              onClick={() => { handleSelection('Ssup') }} className="absolute bottom-[0] translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center w-7 h-7 rounded-full linearBtn">
              <FaPlus className="text-sm" />
            </button>
          }
        </div>
        <div className='flex justify-start flex-col gap-3 px-2 w-full max-md:px-0'>
          <div className='flex flex-col mt-2'>
            <h3 className='text-lg max-md:text-lg'>{profileHeaderData.userFullName || ''}</h3>
            <h6 className='text-sm  text-text-color max-md:text-xs'>@{profileHeaderData.userName}</h6>
          </div>
          <div className='flex gap-10 w-full'>
            <span className='flex flex-col'>
              <h6 className='text-md max-md:text-lg'>{profileHeaderData.totalUserPostCount}</h6>
              <p className='text-sm font-normal max-md:text-xs '>posts</p>
            </span>
            <span className='flex flex-col'
              onClick={handleFollowerModalOpen}
            >
              <h6 className='text-md max-md:text-lg'>{profileHeaderData.totalFan}</h6>
              <p className='text-sm font-normal max-md:text-xs hover:cursor-pointer'>followers</p>
            </span>
            <span className='flex flex-col'
              onClick={handleFollowingModalOpen}
            >
              <h6 className='text-md max-md:text-lg'>{profileHeaderData.totalFollowing}</h6>
              <p className='text-sm font-normal max-md:text-xs hover:cursor-pointer'>following</p>
            </span>
          </div>
        </div>

        {!isLoggedInUser && (
          <div className='relative mb-auto'>
            <Button
              className='mb-auto'
              onClick={() => setOpenMoreOptions(true)}
            >
              <FaEllipsisH />
            </Button>
            {openMoreOptions && <div className={`absolute right-0 w-max bg-primary-bg-color z-30 rounded-sm shadow-sm`} ref={menuRef}>
              <ul className="text-sm">
                {options.map((option, i) => {
                  return (
                    <li key={i}>
                      <button className="w-full text-left hover:bg-bg-color rounded-sm flex gap-3 items-center p-2" onMouseDown={() => { handleOptionClick(option.name) }}>
                        {option.icon}
                        <p className="text-text-color">{option.name}</p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>}
          </div>
        )}
      </div>
      <div className='flex flex-col'>
        <h3 className='text-base text-text-color  max-md:text-sm'>{profileHeaderData.userProfileBio || ''}</h3>
        <div className='flex gap-1 items-center'>
          {profileHeaderData.userWebsiteLink && (
            <>
              <FaLink className='text-blue-400' />
              <a
                target="_blank"
                href={ensureHttps(profileHeaderData.userWebsiteLink)}
                className="text-base text-blue-600 max-md:text-xs"
                rel="noopener noreferrer"
              >
                {profileHeaderData.userWebsiteLink
                  ? profileHeaderData.userWebsiteLink
                  : ""}
              </a>
            </>
          )}
        </div>
      </div>

      {!isLoggedInUser && firstThreeMutuals.length > 0 && (
        <div
          className="flex items-center mt-2 w-max cursor-pointer"
          onClick={() => setOpenMutuals(true)}
        >
          <div className="flex -space-x-2 mr-2">
            {firstThreeMutuals.map((mutual, index) => (
              <div key={index} className="w-8 h-8 rounded-full border border-primary-bg-color overflow-hidden">
                <SafeImage
                  src={mutual.userProfileImage || (typeof dummyUser === 'string' ? dummyUser : dummyUser.src)}
                  alt={mutual.userName}
                  className="w-full h-full object-cover"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            ))}
          </div>
          <span className="text-xs text-text-color">
            Followed by{' '}
            {firstThreeMutuals.map((mutual, index) => (
              <React.Fragment key={index}>
                {index > 0 && index < firstThreeMutuals.length - 1 && ', '}
                {index > 0 && index === firstThreeMutuals.length - 1 && (otherMutualsCount <= 0 ? ' and ' : ', ')}
                <span className="font-medium">{mutual.userName}</span>
              </React.Fragment>
            ))}
            {otherMutualsCount > 0 && ` and ${otherMutualsCount} other${otherMutualsCount > 1 ? 's' : ''}`}
          </span>
        </div>
      )}
      {isAboutAccountModalOpen && <AboutAccountModal userId={profileHeaderData.userId} onClose={() => { setIsAboutAccountModalOpen(false) }} />}
      {openMutuals && <MutualsModal userId={profileHeaderData.userId} onClose={() => setOpenMutuals(false)} />}
      {openReportModal && <ReportModal userId={profileHeaderData.userId} onClose={() => setOpenReportModal(false)} />}
    </div>
  )
}

export default ProfileHeader
export type { ProfileHeaderDataType };
