import { ModerSpinner } from '@/components/LoadingSpinner';
import CommonModalLayer from '@/components/modal/CommonModalLayer';
import Button from '@/components/shared/Button';
import { PostProfileData, PostProfileResponse, VideoFile } from '@/models/profileResponse';
import { CreateSeriesData, createSeriesWithEpisodes } from '@/services/createseries';
import { getUserProfileFlixLists, ProfileRequest } from '@/services/userprofileflixlist';
import { useEffect, useState } from 'react';
import { FaChevronLeft, FaPlus } from 'react-icons/fa';
import { SeriesData } from '../createSeries/createSeries';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '../shared/SafeImage';

interface Episode {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string;
}

interface EpisodeSelectionModalProps {
  onClose: () => void;
  onBack: () => void;
  seasonData: {
    season_name: string;
    description: string;
    coverfile: string;
    season_scheduledAt?: string;
  };
  seriesData?: SeriesData
}

const SeriesEpisodeSelectionModal = ({
  onClose,
  onBack,
  seasonData,
  seriesData
}: EpisodeSelectionModalProps) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [id] = useLocalStorage<string>('userId', '');
  const userId = id ? parseInt(id) : 0;

  // Parse interactive video JSON
  const parseInteractiveVideo = (videoString: string): VideoFile[] | null => {
    try {
      return JSON.parse(videoString);
    } catch {
      return null;
    }
  };

  // Extract video URL from interactive video or video files
  //   const extractVideoUrl = (flix: PostProfileData): string => {
  //     // First try interactive video
  //     const interactiveVideoData = parseInteractiveVideo(flix.interactiveVideo);
  //     if (interactiveVideoData && interactiveVideoData.length > 0) {
  //       return interactiveVideoData[0].path || 
  //              interactiveVideoData[0].ios_streaming_url || 
  //              interactiveVideoData[0].android_streaming_url;
  //     }

  //     // Fallback to videoFile
  //     return flix.videoFile?.[0] || 
  //            flix.videoFile_base?.[0] || 
  //            "/api/placeholder/400/320";
  //   };

  // Fetch flix/episodes list
  useEffect(() => {
    const fetchEpisodes = async () => {
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

          // Transform response data to Episode interface
          const fetchedEpisodes = dataArray.map((flix: PostProfileData) => ({
            id: flix.postId,
            title: flix.postTitle || 'Untitled',
            subtitle: flix.postTitle || flix.isInteractive || '',
            imageUrl: flix.coverFile || "/api/placeholder/400/320",
            description: `${flix.userFullName}'s Post`,
          }));

          setEpisodes(fetchedEpisodes);
        } else {
          console.error('Failed to fetch episodes:', response.message);
        }
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [userId]);

  const toggleEpisodeSelection = (episodeId: number) => {
    if (selectedEpisodes.includes(episodeId)) {
      setSelectedEpisodes(selectedEpisodes.filter(id => id !== episodeId));
    } else {
      setSelectedEpisodes([...selectedEpisodes, episodeId]);
    }
  };

  // Get the display number for selected episodes
  const getEpisodeDisplayNumber = (episodeId: number) => {
    const index = selectedEpisodes.indexOf(episodeId);
    return index !== -1 ? index + 1 : null;
  };

  const handleCreateSeries = async () => {
    if (selectedEpisodes.length === 0) {
      alert('Please select at least one episode');
      return;
    }

    setCreating(true);
    try {
      const data: CreateSeriesData = {
        isCreation: true,
        series_name: seriesData?.series_name || "",
        series_description: seriesData?.series_description || "",
        series_coverfile: seriesData?.series_coverfile || '',
        series_id: seriesData?.id,
        // Season-specific details
        season_title: seasonData.season_name,
        season_description: seasonData.description,
        season_poster_image: seasonData.coverfile || '',
        season_release_year: new Date().getFullYear(),

        // Episode IDs
        flix_ids: selectedEpisodes,

        // Scheduling
        series_scheduledAt: seriesData?.series_scheduledAt || '',
        season_scheduledAt: seasonData?.season_scheduledAt || '',
      };

      const response = await createSeriesWithEpisodes(data);

      if (response.isSuccess) {
        onClose();
      } else {
        console.error('Failed to create series:', response.message);
        alert(response.message || 'Failed to create series');
      }
    } catch (error) {
      console.error('Error creating series:', error);
      alert('An error occurred while creating the series');
    } finally {
      setCreating(false);
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
            onClick={onBack}
            className="text-text-color"
          >
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Add Episodes</h1>
          <div className="w-6"></div> {/* Empty div for alignment */}
        </div>

        {/* Banner Area */}
        <div className="relative w-full h-[30vh] flex-shrink-0">
          <div className="absolute inset-0">
            {seasonData.coverfile ? (
              <SafeImage
                src={seasonData.coverfile}
                alt="Season Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-bg-color flex items-center justify-center">
                <h2 className="text-4xl font-bold">{seasonData.season_name || "New Season"}</h2>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-color to-transparent" />
          </div>
          <div className="absolute bottom-4 left-4 z-10">
            <h2 className="text-4xl font-bold">{seasonData.season_name || "New Season"}</h2>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border-color my-4"></div>

        {/* Episodes Section */}
        <div className="p-5">
          <h2 className="text-2xl font-bold mb-4">Episodes</h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <ModerSpinner />
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center text-primary-text-color">
              No episodes available
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-primary-bg-color rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => toggleEpisodeSelection(episode.id)}
                >
                  <div className="relative flex rounded-lg overflow-hidden">
                    {/* Episode Image */}
                    <div className="w-1/3 relative h-[120px]">
                      <SafeImage
                        src={episode.imageUrl}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Episode Number Tag - Only show if selected */}
                      {selectedEpisodes.includes(episode.id) ? (
                        <div className="absolute top-2 left-2 bg-blue-500 text-primary-text-color px-3 py-1 rounded-md">
                          EP {getEpisodeDisplayNumber(episode.id)}
                        </div>
                      ) : null}
                      {/* Selected Episode Number Tag */}
                      {selectedEpisodes.includes(episode.id) && (
                        <div className="absolute bottom-2 right-2 bg-green-500 text-primary-text-color w-8 h-8 rounded-full flex items-center justify-center">
                          {getEpisodeDisplayNumber(episode.id)}
                        </div>
                      )}
                    </div>
                    {/* Episode Info */}
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{episode.title}</h3>
                        <p className="text-sm text-primary-text-color mt-1">{episode.subtitle}</p>
                      </div>
                      {/* Add button */}
                      <div className="self-end">
                        <Button
                          className={`flex items-center justify-center ${selectedEpisodes.includes(episode.id) ? 'bg-green-500' : ''}`}
                          isLinearBorder={!selectedEpisodes.includes(episode.id)}
                          isLinearBtn={selectedEpisodes.includes(episode.id)}
                        >
                          {selectedEpisodes.includes(episode.id) ? (
                            <span>EP {getEpisodeDisplayNumber(episode.id)}</span>
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

        {/* Add Episodes Button */}
        <div className="p-5 mt-auto">
          <Button
            isLinearBtn={true}
            isLinearBorder={true}
            className="w-full py-3 rounded-md text-center"
            onClick={handleCreateSeries}
            disabled={creating || selectedEpisodes.length === 0}
          >
            {creating ? (
              <ModerSpinner />
            ) : (
              `Add ${selectedEpisodes.length} episodes`
            )}
          </Button>
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default SeriesEpisodeSelectionModal;