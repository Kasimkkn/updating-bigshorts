import { ModerSpinner } from '@/components/LoadingSpinner';
import CommonModalLayer from '@/components/modal/CommonModalLayer';
import Button from '@/components/shared/Button';
import { uploadImage } from '@/utils/fileupload';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaChevronLeft } from 'react-icons/fa';
import { IoCalendarOutline, IoTimeOutline } from 'react-icons/io5';
import { SeriesData } from '../createSeries/createSeries';
import SeriesEpisodeSelectionModal from './seriesepisodeselection';
import SafeImage from '../shared/SafeImage';

interface CreateSeasonModalProps {
  onClose: () => void;
  onBack: () => void;
  onCreateSeason?: (seasonData?: SeasonData) => void;
  seriesData?: SeriesData;
}

interface SeasonData {
  season_name: string;
  description: string;
  coverfile: string | null;
  season_scheduledAt?: string;
}

const CreateSeasonModal = ({
  onClose,
  onBack,
  onCreateSeason,
  seriesData
}: CreateSeasonModalProps) => {
  const [seasonData, setSeasonData] = useState<SeasonData>({
    season_name: '',
    description: '',
    coverfile: null,
    season_scheduledAt: ""
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'))
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEpisodeSelection, setShowEpisodeSelection] = useState(false);
  const [isDatepickerOpen, setIsDatepickerOpen] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSeasonData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const usersSelectedate = new Date(inputValue.replace("T", " ") + ":00");
    if (isNaN(usersSelectedate.getTime())) {
      console.error("Invalid date parsed from input value:", inputValue);
      return;
    }

    const difference = calculateDateDifference(usersSelectedate);
    const formattedDifference = formatDateDifference(difference);
    const [datePart, timePart] = inputValue.split("T");

    const [year, month, day] = datePart.split("-");
    const formattedDate = `${day}/${month}/${year}`;
    setDate(formattedDate)
    setTime(timePart)

    const localDate = new Date(inputValue);
    const isoFormattedDate = localDate.toISOString();

    setSeasonData((prev) => ({
      ...prev,
      season_scheduledAt: formattedDifference
    }))
  };

  const calculateDateDifference = (selectedDate: Date) => {
    const now = new Date();
    const diffInMilliseconds = selectedDate.getTime() - now.getTime();

    const diffInSeconds = Math.max(diffInMilliseconds / 1000, 0);
    const days = Math.floor(diffInSeconds / (3600 * 24));
    const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    return { days, hours, minutes };
  };

  const formatDateDifference = (difference: { days: number, hours: number, minutes: number }) => {
    return `${difference.days} days ${difference.hours} hours ${difference.minutes} minutes`;
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
          coverfile: imageUrl || ""
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

  const handleProceedToEpisodeSelection = () => {
    // Basic validation
    if (!seasonData.season_name.trim()) {
      toast.error("Please enter a season name");
      return;
    }

    // Proceed to episode selection
    setShowEpisodeSelection(true);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };


  if (showEpisodeSelection) {
    return (
      <SeriesEpisodeSelectionModal
        onClose={() => {
          onClose();
          if (onCreateSeason) onCreateSeason();
        }}
        onBack={() => setShowEpisodeSelection(false)}
        seasonData={{
          season_name: seasonData.season_name,
          description: seasonData.description,
          coverfile: seasonData.coverfile || '',
          season_scheduledAt: seasonData.season_scheduledAt || ''
        }}
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
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <button
            onClick={onBack}
            className="text-text-color"
          >
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Create Season</h1>
          <div className="w-6"></div> {/* Empty div for alignment */}
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
                  <span className="text-xl text-primary-text-color">Add season cover image</span>
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

          {/* Schedule */}
          <div className="space-y-2">
            <label className="text-2xl font-bold">Schedule Time</label>
            <div className="bg-primary-bg-color p-4 rounded-md">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <IoCalendarOutline size={24} className="mr-2" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center">
                  <IoTimeOutline size={24} className="mr-2" />
                  <span>{time}</span>
                </div>
                {!isDatepickerOpen ? (
                  <button
                    onClick={toggleDatePicker}
                    className="bg-bg-color border border-border-color text-text-color py-2 px-4 rounded-md self-end w-1/7"
                  >
                    <div className="flex items-center justify-center" onClick={() => setIsDatepickerOpen(true)}>
                      <IoCalendarOutline size={20} className="mr-2" />
                      Change
                    </div>
                  </button>
                ) : (
                  <input
                    type="datetime-local"
                    onChange={handleScheduleDateChange}
                    min={new Date().toISOString().slice(0, 16)}
                    placeholder="Click here"
                    className="bg-bg-color border border-border-color text-text-color py-2 px-4 rounded-md self-end"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="p-5 mt-auto">
          <Button
            isLinearBtn={true}
            isLinearBorder={true}
            className="w-full py-3 rounded-md text-center"
            onClick={handleProceedToEpisodeSelection}
            disabled={uploading}
          >
            Continue to Add Episodes
          </Button>
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default CreateSeasonModal;