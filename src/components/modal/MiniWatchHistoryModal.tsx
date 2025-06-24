import React, { useState } from 'react';
import { WatchHistoryItem } from '@/services/getminiwatchhistory';
import { IoIosArrowBack } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaTrashAlt } from 'react-icons/fa';
import { BiPlay } from 'react-icons/bi';
import { deleteVideoHistory } from '@/services/deletevideowatchhistory';
import { clearWatchHistory } from '@/services/clearwatchhistory';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PostlistItem } from '@/models/postlistResponse';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { flixSearch, SearchResultItem as FlixSearchResultItem } from "@/services/flixsearch";
import CommonModalLayer from './CommonModalLayer';
import SafeImage from '../shared/SafeImage';

interface MiniWatchHistoryModalProps {
  watchHistory: WatchHistoryItem[];
  setWatchHistoryModal: (isOpen: boolean) => void;
  refreshWatchHistory?: () => void; // Optional callback to refresh the list after deletion
  toggleSettings: () => void; // Optional callback to toggle settings
}

const MiniWatchHistoryModal: React.FC<MiniWatchHistoryModalProps> = ({
  watchHistory: initialWatchHistory,
  setWatchHistoryModal,
  refreshWatchHistory,
  toggleSettings
}) => {
  const [showClearHistoryDropdown, setShowClearHistoryDropdown] = useState(false);
  const [activeItemDropdown, setActiveItemDropdown] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const { setInAppFlixData, clearFlixData } = useInAppRedirection();
  // Local state to manage the watch history items
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(initialWatchHistory);
  const router = useRouter();
  // Function to format the date to "X days ago"
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const handleRemoveFromHistory = async (flixId: number) => {
    try {
      setIsDeleting(flixId);
      const response = await deleteVideoHistory(flixId);

      if (response.isSuccess) {
        // Remove the item from the local state
        setWatchHistory(prevHistory => prevHistory.filter(item => item.flix_id !== flixId));

        toast.success('Video removed from history');
        // Refresh the watch history list if callback provided
        if (refreshWatchHistory) {
          refreshWatchHistory();
        }
      } else {
        toast.error(response.message || 'Failed to remove video');
      }
    } catch (error) {
      console.error('Error removing video from history:', error);
      toast.error('Failed to remove video from history');
    } finally {
      setIsDeleting(null);
      setActiveItemDropdown(null);
    }
  };

  const handleClearHistory = async () => {
    try {
      setIsClearingHistory(true);
      const response = await clearWatchHistory();

      if (response.isSuccess) {
        // Clear the local watch history
        setWatchHistory([]);

        toast.success('Watch history cleared');
        // Refresh the watch history list if callback provided
        if (refreshWatchHistory) {
          refreshWatchHistory();
        }
      } else {
        toast.error(response.message || 'Failed to clear watch history');
      }
    } catch (error) {
      console.error('Error clearing watch history:', error);
      toast.error('Failed to clear watch history');
    } finally {
      setIsClearingHistory(false);
      setShowClearHistoryDropdown(false);
    }
  };

  const toggleItemDropdown = (itemId: number) => {
    if (activeItemDropdown === itemId) {
      setActiveItemDropdown(null);
    } else {
      setActiveItemDropdown(itemId);
      setShowClearHistoryDropdown(false);
    }
  };

  const toggleClearHistoryDropdown = () => {
    setShowClearHistoryDropdown(!showClearHistoryDropdown);
    setActiveItemDropdown(null);
  };

  // Handler for playing a mini (redirecting to its page)
  const handlePlayMini = (flixData: PostlistItem | FlixSearchResultItem) => {
    clearFlixData();
    const formattedData = 'id' in flixData ? {
      postId: flixData.id,
      postTitle: flixData.title,
      userFullName: flixData.username,
      coverFile: flixData.coverFile,
      userProfileImage: flixData.userProfileImage,
      userId: flixData.userid,
      viewCounts: 0,
      scheduleTime: new Date().toISOString(),
      isLiked: 0,
      likeCount: 0,
      isSaved: 0,
      saveCount: 0,
    } : flixData;

    setInAppFlixData(formattedData);
    const postId = 'id' in flixData ? flixData.id : flixData.postId;
    toggleSettings();
    setWatchHistoryModal(false);
    router.push(`/home/flix/${postId}`);
  };

  return (
    <CommonModalLayer width='max-w-md' height='h-max'
      hideCloseButtonOnMobile={true}
      onClose={() => setWatchHistoryModal(false)}
      isModal={false}
    >
      <div className="bg-bg-color w-full max-w-md max-h-[80vh] h-full flex flex-col rounded-lg overflow-hidden">
        {/* Header */}
        <div className="py-4 px-4 flex justify-between items-center bg-secondary-bg-color relative">
          <button
            onClick={() => setWatchHistoryModal(false)}
            className="text-primary-text-color p-2"
          >
            <IoIosArrowBack size={24} />
          </button>
          <h1 className="text-primary-text-color text-xl font-medium">Watch History</h1>
          <div className="relative">
            <button
              className="text-primary-text-color p-2"
              onClick={toggleClearHistoryDropdown}
              disabled={isClearingHistory}
            >
              <FaTrashAlt size={20} />
            </button>
            {/* Clear History Dropdown */}
            {showClearHistoryDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-secondary-bg-color rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleClearHistory}
                  className="block w-full text-left px-4 py-2 text-primary-text-color hover:bg-secondary-bg-color disabled:opacity-50"
                  disabled={isClearingHistory}
                >
                  {isClearingHistory ? 'Clearing...' : 'Clear watch history'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-bg-color">
          {watchHistory.length === 0 ? (
            <div className="text-center py-4 text-primary-text-color">No watch history found</div>
          ) : (
            <div className="pb-16">
              {watchHistory.map((item) => (
                <div key={item.flix_id} className="relative mb-4">
                  <div className="w-full aspect-video relative">
                    <SafeImage
                      src={item.coverFile}
                      alt={item.title || "Video"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        className="rounded-full p-4 hover:bg-opacity-80 transition"
                        onClick={() => handlePlayMini({
                          id: item.flix_id,
                          title: item.title || "Untitled Video",
                          username: item.userName,
                          coverFile: item.coverFile,
                          userProfileImage: "",
                          userid: 0,
                          type: "post"
                        })}
                        aria-label={`Play ${item.title || 'video'}`}
                      >
                        <BiPlay size={40} color="white" />
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary-bg-color">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${parseFloat(item.watch_percentage)}%` }}
                      />
                    </div>

                    {/* Overlay text */}
                    <div className="absolute bottom-0 left-0 p-4 text-primary-text-color">
                      <h2 className="text-xl text-white font-medium mb-1">{item.title || "Untitled Video"}</h2>
                      <p className="text-sm text-gray-300">@{item.userName}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-400">{formatDate(item.last_watched)}</span>
                      </div>
                    </div>

                    {/* Three dots menu */}
                    <div className="absolute top-3 right-3">
                      <button
                        className="rounded-full p-2"
                        onClick={() => toggleItemDropdown(item.flix_id)}
                        disabled={isDeleting === item.flix_id || isClearingHistory}
                      >
                        <BsThreeDotsVertical color="white" size={18} />
                      </button>

                      {/* Item dropdown menu */}
                      {activeItemDropdown === item.flix_id && (
                        <div className="absolute right-0 mt-2 w-48 bg-secondary-bg-color rounded-md shadow-lg py-1 z-10">
                          <button
                            onClick={() => handleRemoveFromHistory(item.flix_id)}
                            className="block w-full text-left px-4 py-2 text-primary-text-color hover:bg-secondary-bg-color disabled:opacity-50"
                            disabled={isDeleting === item.flix_id || isClearingHistory}
                          >
                            {isDeleting === item.flix_id ? 'Removing...' : 'Remove from history'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default MiniWatchHistoryModal;