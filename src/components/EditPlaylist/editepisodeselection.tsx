import React, { useState, useEffect } from 'react';
import CommonModalLayer from '../modal/CommonModalLayer';
import Button from '../shared/Button';
import Image from 'next/image';
import { FaChevronLeft, FaPlus } from 'react-icons/fa';
import { getUserProfileFlixLists, ProfileRequest } from '@/services/userprofileflixlist';
import { getPlaylistVideos } from '@/services/getplaylistflixdetails';
import { createPlaylistWithEpisodes, CreatePlaylistData } from '@/services/createplaylist';
import { ModerSpinner } from '../LoadingSpinner';
import { PostProfileData, PostProfileResponse } from '@/models/profileResponse';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '../shared/SafeImage';

interface Episode {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string;
  postId?: number;
  playlistOrder?: number;
}

interface EditEpisodeSelectionModalProps {
  onClose: () => void;
  onBack: () => void;
  playlistData: {
    id: number;
    playlist_name: string;
    description: string;
    coverfile: string;
  };
}

const EditEpisodeSelectionModal = ({
  onClose,
  onBack,
  playlistData
}: EditEpisodeSelectionModalProps) => {
  const [allVideos, setAllVideos] = useState<Episode[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [id] = useLocalStorage<string>('userId', '');
  const userId = id ? parseInt(id) : 0;

  // Fetch user profile flix list and playlist videos
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setLoadingError(null);

      try {

        // 2. Prepare request parameters for user profile flix list
        const requestParams: ProfileRequest = {
          ownerId: Number(userId),
          isPosted: 1, // Only show posted content
          isTrending: 0,
          isTaged: 0,
          isLiked: 0,
          isSaved: 0,
          isSavedVideo: 0,
          isOnlyVideo: 0,
          isSuperLike: 0
        };

        // 3. Fetch all videos from user profile
        const userVideosResponse: PostProfileResponse = await getUserProfileFlixLists(requestParams);

        // 4. Fetch current playlist videos
        const playlistResponse = await getPlaylistVideos({ playlistId: playlistData.id });

        if (userVideosResponse.isSuccess && userVideosResponse.data) {
          // Ensure data is an array, even if it might not be
          const dataArray = Array.isArray(userVideosResponse.data)
            ? userVideosResponse.data
            : [userVideosResponse.data];
          // Transform response data to Episode interface
          const userVideos = dataArray.map((flix: PostProfileData) => ({
            id: flix.postId,
            title: flix.postTitle || 'Untitled',
            subtitle: flix.postTitle || flix.isInteractive || '',
            imageUrl: flix.coverFile || "/api/placeholder/400/320",
            description: `${flix.userFullName}'s Post`,
            postId: flix.postId
          }));

          // If playlist videos exist, mark their order
          if (playlistResponse.isSuccess && playlistResponse.data) {
            const playlistVideos = playlistResponse.data;

            // Create a map of playlist videos for easy lookup
            const playlistVideoMap = new Map(
              playlistVideos.map((video, index) => [video.postId, index + 1])
            );
            // Enhance user videos with playlist order if they're in the playlist
            const enhancedVideos = userVideos.map(video => ({
              ...video,
              playlistOrder: playlistVideoMap.get(video.id)
            }));

            setAllVideos(enhancedVideos);

            // Pre-select videos in their current playlist order
            const selectedVideoIds = playlistVideos.map(video => video.postId);
            setSelectedEpisodes(selectedVideoIds);
          } else {
            setAllVideos(userVideos);
          }
        } else {
          setLoadingError(userVideosResponse.message || "Failed to load user videos");
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setLoadingError("Failed to fetch videos. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [playlistData.id, userId]);

  const toggleEpisodeSelection = (episodeId: number) => {
    setSelectedEpisodes(prev => {
      if (prev.includes(episodeId)) {
        return prev.filter(id => id !== episodeId);
      } else {
        return [...prev, episodeId];
      }
    });
  };

  // Get the display number for selected episodes
  const getEpisodeDisplayNumber = (episodeId: number) => {
    const index = selectedEpisodes.indexOf(episodeId);
    return index !== -1 ? index + 1 : null;
  };

  // Handle saving playlist with selected episodes
  const handleSavePlaylist = async (): Promise<void> => {
    if (selectedEpisodes.length === 0) {
      setSaveError('Please select at least one video');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const playlistPayload: CreatePlaylistData = {
        isCreation: false, // We're updating an existing playlist
        playlist_name: playlistData.playlist_name,
        coverfile: playlistData.coverfile,
        description: playlistData.description,
        flix_ids: selectedEpisodes,
        playlist_id: playlistData.id
      };

      const response = await createPlaylistWithEpisodes(playlistPayload);

      if (response.isSuccess) {
        // Playlist updated successfully
        onClose(); // Close the modal
      } else {
        // Handle API-level error
        setSaveError(response.message || 'Failed to save playlist');
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
      setSaveError('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CommonModalLayer
      width='w-full max-w-5xl'
      hideCloseButton={true}
    >
      <div className='w-full flex flex-col bg-bg-color text-text-color h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-border-color">
          <button
            onClick={onBack}
            className="text-text-color absolute left-4 top-1/2 -translate-y-1/2"
          >
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold w-full text-center">Edit Playlist</h1>
        </div>

        {/* Cover Image */}
        <div className="relative w-full h-[40vh]">
          <SafeImage
            src={playlistData.coverfile}
            alt={`${playlistData.playlist_name} Cover`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Playlist Title */}
        <div className="p-4 border-b border-border-color">
          <h2 className="text-2xl font-bold">{playlistData.playlist_name}</h2>
        </div>

        {/* Videos Section */}
        <div className="p-5 flex-grow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Available Videos</h3>
            <p className="text-sm text-primary-text-color">
              {selectedEpisodes.length} videos selected
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <ModerSpinner />
            </div>
          ) : loadingError ? (
            <div className="text-red-500 text-center p-4">
              {loadingError}
            </div>
          ) : allVideos.length === 0 ? (
            <div className="text-center text-primary-text-color">
              No videos available
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {allVideos.map((video) => (
                <div
                  key={video.id}
                  className={`bg-primary-bg-color rounded-lg overflow-hidden cursor-pointer relative ${selectedEpisodes.includes(video.id) ? 'border-l-4 border-blue-500' : ''
                    }`}
                  onClick={() => toggleEpisodeSelection(video.id)}
                >
                  {/* Playlist Order Tag */}
                  {video.playlistOrder && (
                    <div className="absolute top-2 right-2 z-10 bg-blue-500 text-primary-text-color px-2 py-1 rounded-full text-xs">
                      EP {video.playlistOrder}
                    </div>
                  )}

                  <div className="relative flex rounded-lg overflow-hidden">
                    {/* Video Thumbnail */}
                    <div className="w-1/3 relative h-[120px]">
                      <SafeImage
                        src={video.imageUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Selected Episode Number */}
                      {selectedEpisodes.includes(video.id) && (
                        <div className="absolute bottom-2 right-2 bg-green-500 text-primary-text-color w-8 h-8 rounded-full flex items-center justify-center">
                          {getEpisodeDisplayNumber(video.id)}
                        </div>
                      )}
                    </div>
                    {/* Video Info */}
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{video.title}</h3>
                        <p className="text-sm text-primary-text-color mt-1">{video.subtitle}</p>
                      </div>
                      {/* Add button */}
                      <div className="self-end">
                        <Button
                          className={`flex items-center justify-center ${selectedEpisodes.includes(video.id) ? 'bg-green-500' : ''}`}
                          isLinearBorder={!selectedEpisodes.includes(video.id)}
                          isLinearBtn={selectedEpisodes.includes(video.id)}
                        >
                          {selectedEpisodes.includes(video.id) ? (
                            <span>EP {getEpisodeDisplayNumber(video.id)}</span>
                          ) : (
                            <FaPlus />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Changes Button */}
        <div className="p-5">
          <Button
            isLinearBtn={true}
            isLinearBorder={true}
            className="w-full py-3 rounded-md text-center"
            onClick={handleSavePlaylist}
            disabled={saving || selectedEpisodes.length === 0}
          >
            {saving ? (
              <ModerSpinner />
            ) : (
              `Save ${selectedEpisodes.length} videos to playlist`
            )}
          </Button>
          {saveError && (
            <p className="text-red-500 text-center mt-2">{saveError}</p>
          )}
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default EditEpisodeSelectionModal;