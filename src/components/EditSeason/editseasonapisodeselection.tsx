

import { ModerSpinner } from '@/components/LoadingSpinner';
import CommonModalLayer from '@/components/modal/CommonModalLayer';
import Button from '@/components/shared/Button';
import Image from 'next/image';
import { FaChevronLeft } from 'react-icons/fa';
import { getUserProfileFlixLists, ProfileRequest } from '@/services/userprofileflixlist';

import { PostProfileData, PostProfileResponse } from '@/models/profileResponse';

import { editSeason, EditSeasonData } from '@/services/editseason';

import { useEffect, useState } from 'react';


import { SeriesData } from '../createSeries/createSeries';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '../shared/SafeImage';

interface SeasonEpisode {
  id: number;
  flixid: number;
  title: string;
  description: string;
  thumbnail: string;
  order: number;
}

interface AvailableFlix {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string;
  isInSeason?: boolean; // Track if this flix is already in the season
  episodeNumber?: number; // Track episode number for pre-selected videos
}

interface SeasonEpisodeManagementModalProps {
  onClose: () => void;
  onBack?: () => void;
  seasonData: {
    id: number;
    season_name: string;
    description: string;
    coverfile: string;
    series_name: string;
  };
  seasonId: number;
  existingFlixIds: number[];
  seriesData?: SeriesData
}

const SeasonEpisodeManagementModal = ({
  onClose,
  onBack,
  seasonData,
  seasonId,
  existingFlixIds,
  seriesData
}: SeasonEpisodeManagementModalProps) => {
  // State for managing episodes
  const [availableFlixList, setAvailableFlixList] = useState<AvailableFlix[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFlixIds, setSelectedFlixIds] = useState<number[]>(existingFlixIds || []);
  const [id] = useLocalStorage<string>('userId', '');
  const userId = id ? parseInt(id) : 0;

  // Fetch available flix from user profile
  useEffect(() => {
    fetchAvailableFlix();
  }, [existingFlixIds, userId]);

  // Fetch available flix from user profile
  const fetchAvailableFlix = async () => {
    try {
      setLoading(true);

      // Prepare request parameters
      const requestParams: ProfileRequest = {
        ownerId: Number(userId),
        isPosted: 1,  // Only show posted content
        isTrending: 0,
        isTaged: 0,
        isLiked: 0,
        isSaved: 0,
        isSavedVideo: 0,
        isOnlyVideo: 0,
        isSuperLike: 0
      };

      const response: PostProfileResponse = await getUserProfileFlixLists(requestParams);

      if (response.isSuccess && response.data) {
        // Ensure data is an array, even if it might not be
        const dataArray = Array.isArray(response.data)
          ? response.data
          : [response.data];

        // Transform response data to AvailableFlix interface
        const fetchedFlix = dataArray.map((flix: PostProfileData) => {
          // Check if this flix is in the existingFlixIds array
          const isInSeason = existingFlixIds.includes(flix.postId);

          // Calculate episode number (position in existingFlixIds + 1)
          const episodeNumber = isInSeason
            ? existingFlixIds.indexOf(flix.postId) + 1
            : undefined;

          return {
            id: flix.postId,
            title: flix.postTitle || 'Untitled',
            subtitle: flix.postTitle || flix.isInteractive || '',
            imageUrl: flix.coverFile || "/api/placeholder/400/320",
            description: `${flix.userFullName}'s Post`,
            isInSeason,
            episodeNumber
          };
        });

        // Sort fetchedFlix to ensure existing episodes are displayed first, by their episodeNumber
        fetchedFlix.sort((a, b) => {
          if (a.isInSeason && b.isInSeason) {
            // Sort by episode number if both are in the season
            return (a.episodeNumber || 0) - (b.episodeNumber || 0);
          } else if (a.isInSeason) {
            // Move existing episodes to the top
            return -1;
          } else if (b.isInSeason) {
            // Move existing episodes to the top
            return 1;
          }
          // Keep normal order for other videos
          return 0;
        });

        // Show all flix, but mark those already in the season
        setAvailableFlixList(fetchedFlix);
      } else {
        console.error('Failed to fetch flix:', response.message);
      }
    } catch (error) {
      console.error('Error fetching flix:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle flix selection
  const toggleFlixSelection = (flixId: number) => {
    setSelectedFlixIds(prev => {
      if (prev.includes(flixId)) {
        return prev.filter(id => id !== flixId);
      } else {
        return [...prev, flixId];
      }
    });
  };

  // Get the episode display number for selected flixes
  const getEpisodeDisplayNumber = (flixId: number) => {
    const index = selectedFlixIds.indexOf(flixId);
    return index !== -1 ? index + 1 : null;
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Prepare the season update data
      const seasonUpdateData: EditSeasonData = {
        season_id: seasonId,
        series_id: seriesData?.id ?? 0, // Assuming the seasonData.id is the series_id
        flix_ids: selectedFlixIds,
        season_title: seasonData.season_name,
        season_poster_image: seasonData.coverfile || '',
        season_description: seasonData.description
      };

      // Call the edit season API
      const response = await editSeason(seasonUpdateData);

      if (response.isSuccess) {
        onClose();
      } else {
        // Failed - show error
        alert(response.message || 'Failed to update season');
      }
    } catch (error) {
      console.error('Error saving episode changes:', error);
      alert('Failed to save episode changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CommonModalLayer
      width='w-full max-w-5xl'
      height='h-max'
      onClose={onClose}
    >
      <div className='w-full flex flex-col bg-bg-color text-text-color h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <button
            onClick={onBack || onClose}
            className="text-text-color"
          >
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Select Episodes</h1>
          <div className="w-6"></div> {/* Empty div for alignment */}
        </div>

        {/* Banner Area */}
        <div className="relative w-full h-[25vh] flex-shrink-0">
          <div className="absolute inset-0">
            {seasonData.coverfile ? (
              <SafeImage
                src={seasonData.coverfile}
                alt="Season Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-bg-color flex items-center justify-center">
                <h2 className="text-4xl font-bold">{seasonData.season_name}</h2>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-color to-transparent" />
          </div>
          <div className="absolute bottom-4 left-4 z-10">
            <h2 className="text-4xl font-bold">{seasonData.season_name}</h2>
            <p className="text-lg">{seasonData.series_name}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border-color my-4"></div>

        {/* Available Flix Selection */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Select Episodes</h2>
            <div className="text-sm text-primary-text-color">
              {selectedFlixIds.length} selected
            </div>
          </div>

          <p className="text-sm text-primary-text-color mb-4">
            Select episodes to add to your season. Episodes already in your season are pre-selected.
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <ModerSpinner />
            </div>
          ) : availableFlixList.length === 0 ? (
            <div className="text-center text-primary-text-color py-8">
              No available videos to add. Please create more videos first.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {availableFlixList.map((flix) => (
                <div
                  key={flix.id}
                  className={`bg-primary-bg-color rounded-lg overflow-hidden cursor-pointer ${selectedFlixIds.includes(flix.id) ? 'border-2 border-blue-500' : ''
                    }`}
                  onClick={() => toggleFlixSelection(flix.id)}
                >
                  <div className="relative flex rounded-lg overflow-hidden">
                    {/* Flix Image */}
                    <div className="w-1/3 relative h-[120px]">
                      <SafeImage
                        src={flix.imageUrl}
                        alt={flix.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Selected Indicator with Episode Number */}
                      {selectedFlixIds.includes(flix.id) && (
                        <div className="absolute top-2 right-2 bg-green-500 text-primary-text-color w-8 h-8 rounded-full flex items-center justify-center">
                          {getEpisodeDisplayNumber(flix.id)}
                        </div>
                      )}
                      {/* Initial Episode Number Tag for pre-selected videos */}
                      {flix.isInSeason && flix.episodeNumber !== undefined && !selectedFlixIds.includes(flix.id) && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-primary-text-color px-3 py-1 rounded-md">
                          EP {flix.episodeNumber}
                        </div>
                      )}
                    </div>

                    {/* Flix Info */}
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {flix.title}
                          {selectedFlixIds.includes(flix.id) &&
                            <span className="ml-2 text-sm text-green-500">
                              (Episode {getEpisodeDisplayNumber(flix.id)})
                            </span>
                          }
                        </h3>
                        <p className="text-sm text-primary-text-color mt-1">{flix.subtitle}</p>
                      </div>

                      {/* Toggle button with episode number */}
                      <div className="self-end">
                        <Button
                          className={`flex items-center justify-center ${selectedFlixIds.includes(flix.id) ? 'bg-green-500 text-primary-text-color' : ''}`}
                          isLinearBorder={!selectedFlixIds.includes(flix.id)}
                          isLinearBtn={selectedFlixIds.includes(flix.id)}
                        >
                          {selectedFlixIds.includes(flix.id) ? (
                            <span>EP {getEpisodeDisplayNumber(flix.id)}</span>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save Changes Button */}
          <div className="mt-6">
            <Button
              isLinearBtn={true}
              isLinearBorder={true}
              className="w-full py-3 rounded-md text-center"
              onClick={handleSaveChanges}
              disabled={saving || selectedFlixIds.length === 0}
            >
              {saving ? <ModerSpinner /> : `Save Changes (${selectedFlixIds.length} Episodes)`}
            </Button>
          </div>
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default SeasonEpisodeManagementModal;