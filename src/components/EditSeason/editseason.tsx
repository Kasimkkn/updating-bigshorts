import { ModerSpinner } from '@/components/LoadingSpinner';
import CommonModalLayer from '@/components/modal/CommonModalLayer';
import Button from '@/components/shared/Button';
import { uploadImage } from '@/utils/fileupload';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SeriesData } from '../createSeries/createSeries';
import SeasonEpisodeManagementModal from './editseasonapisodeselection';
import SafeImage from '../shared/SafeImage';


interface EditSeasonModalProps {
  onClose: () => void;
  onSaveChanges: () => void;
  currentSeasonData: {
    id: number;
    season_name: string;
    description: string;
    coverfile: string;
    scheduleDate?: string;
    scheduleTime?: string;
  };
  seriesName: string;
  existingFlixIds?: number[];
  seriesData?: SeriesData;
}

interface SeasonData {
  id: number;
  season_name: string;
  description: string;
  coverfile: string | null;
  scheduleDate: string;
  scheduleTime: string;
}

const EditSeasonModal = ({
  onClose,
  onSaveChanges,
  currentSeasonData,
  seriesName,
  existingFlixIds = [],
  seriesData
}: EditSeasonModalProps) => {
  const [seasonData, setSeasonData] = useState<SeasonData>({
    id: currentSeasonData.id,
    season_name: currentSeasonData.season_name || '',
    description: currentSeasonData.description || '',
    coverfile: currentSeasonData.coverfile || null,
    scheduleDate: currentSeasonData.scheduleDate || new Date().toLocaleDateString('en-GB'),
    scheduleTime: currentSeasonData.scheduleTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEpisodeSelection, setShowEpisodeSelection] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  // No need to extract flixids as we're now directly receiving them

  // Set image preview from existing cover file on initial load
  useEffect(() => {
    if (currentSeasonData.coverfile) {
      setImagePreview(currentSeasonData.coverfile);
    }
  }, [currentSeasonData.coverfile]);

  // Check if form has been changed
  useEffect(() => {
    const hasChanged =
      seasonData.season_name !== currentSeasonData.season_name ||
      seasonData.description !== currentSeasonData.description ||
      seasonData.coverfile !== currentSeasonData.coverfile ||
      seasonData.scheduleDate !== currentSeasonData.scheduleDate ||
      seasonData.scheduleTime !== currentSeasonData.scheduleTime;

    setIsFormChanged(hasChanged);
  }, [seasonData, currentSeasonData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSeasonData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setUploading(true);
      setUploadError(null);

      try {
        const imageUrl = await uploadImage(file, 'coverFiles', true);

        setSeasonData(prev => ({
          ...prev,
          coverfile: imageUrl || currentSeasonData.coverfile
        }));

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            setImagePreview(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);

      } catch (error) {
        console.error('Failed to upload image:', error);
        setUploadError('Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleManageEpisodes = () => {
    if (!seasonData.season_name.trim()) {
      toast.error("Please enter a season name");
      return;
    }
    setShowEpisodeSelection(true);
  };

  if (showEpisodeSelection) {
    return (
      <SeasonEpisodeManagementModal
        onClose={() => { onClose(); onSaveChanges() }}
        onBack={() => setShowEpisodeSelection(false)}
        seasonData={{
          id: seasonData.id,
          season_name: seasonData.season_name,
          description: seasonData.description,
          coverfile: seasonData.coverfile || '',
          series_name: seriesName
        }}
        seasonId={seasonData.id}
        existingFlixIds={existingFlixIds}
        seriesData={seriesData}
      />
    );
  }

  return (
    <CommonModalLayer
      width='w-full max-w-5xl'
      height='h-max'
      onClose={onClose}
    >
      <div className='w-full flex flex-col bg-bg-color text-text-color h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-border-color">
          <h1 className="text-2xl font-bold">Edit Season</h1>
        </div>

        {/* Form Content */}
        <div className="flex flex-col p-5 space-y-8 flex-grow">
          {/* Cover Image Upload */}
          <div>
            <label htmlFor="coverImage" className="block w-full relative h-[30vh] md:h-[30vh] bg-primary-bg-color rounded-md cursor-pointer">
              <div className="flex items-center justify-center h-full">
                {uploading ? (
                  <ModerSpinner />
                ) : imagePreview || seasonData.coverfile ? (
                  <div className="absolute inset-0">
                    <SafeImage
                      src={imagePreview || seasonData.coverfile || ''}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-color to-transparent" />
                  </div>
                ) : (
                  <span className="text-xl text-primary-text-color">Change season cover image</span>
                )}
              </div>
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {uploadError && (
              <p className="text-red-500 mt-2 text-sm">{uploadError}</p>
            )}
          </div>

          {/* Season Title */}
          <div className="space-y-2">
            <label className="text-2xl font-bold">Season Title</label>
            <div className="relative">
              <input
                type="text"
                name="season_name"
                placeholder="Enter Season title (Season 1...)"
                value={seasonData.season_name}
                onChange={handleInputChange}
                className="w-full p-4 bg-primary-bg-color rounded-md text-text-color focus:outline-none"
                maxLength={32}
              />
              <span className="absolute right-4 bottom-4 text-primary-text-color">
                {seasonData.season_name.length}/32
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-2xl font-bold">Description</label>
            <div className="relative">
              <textarea
                name="description"
                placeholder="Describe your season..."
                value={seasonData.description}
                onChange={handleInputChange}
                className="w-full p-4 bg-primary-bg-color rounded-md text-text-color focus:outline-none min-h-[150px] resize-none"
                maxLength={255}
              />
              <span className="absolute right-4 bottom-4 text-primary-text-color">
                {seasonData.description.length}/255
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 mt-auto space-y-4">
          <Button
            isLinearBorder={true}
            className="w-full py-3 rounded-md text-center"
            onClick={handleManageEpisodes}
            disabled={uploading}
          >
            Manage Episodes {existingFlixIds.length > 0 ? `(${existingFlixIds.length})` : ''}
          </Button>
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default EditSeasonModal;