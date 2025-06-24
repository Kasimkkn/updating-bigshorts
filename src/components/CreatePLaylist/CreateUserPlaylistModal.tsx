import EpisodeSelectionModal from '@/components/CreatePLaylist/episodeselection';
import { uploadImage } from '@/utils/fileupload';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaChevronLeft } from 'react-icons/fa';
import { IoCalendarOutline, IoTimeOutline } from 'react-icons/io5';
import { ModerSpinner } from '../LoadingSpinner';
import CommonModalLayer from '../modal/CommonModalLayer';
import Button from '../shared/Button';
import Input from '../shared/Input';
import SafeImage from '../shared/SafeImage';

interface CreateUserPlaylistModalProps {
  onClose: () => void;
  onCreatePlaylist?: () => void;
}

interface PlaylistData {
  playlist_name: string;
  description: string;
  coverfile: string | null;
  playlist_scheduledAt?: string;
}

const CreateUserPlaylistModal = ({ onClose, onCreatePlaylist }: CreateUserPlaylistModalProps) => {
  const [playlistData, setPlaylistData] = useState<PlaylistData>({
    playlist_name: '',
    description: '',
    coverfile: null,
    playlist_scheduledAt: "",
  });

  // Add new states for image upload
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEpisodeSelection, setShowEpisodeSelection] = useState(false);
  const [isDatepickerOpen, setIsDatepickerOpen] = useState<boolean>(false);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'))
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPlaylistData(prev => ({ ...prev, [name]: value }));
  };

  // Updated image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Show loading state
      setUploading(true);
      setUploadError(null);

      try {
        // Use the uploadCoverImage function to upload the file
        const imageUrl = await uploadImage(file, 'coverFiles', true);

        // Update state with the cloud URL
        setPlaylistData(prev => ({
          ...prev,
          coverfile: imageUrl
        }));

        // Set preview for display
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

    setPlaylistData((prev) => ({
      ...prev,
      playlist_scheduledAt: formattedDifference
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

  const handleProceedToEpisodeSelection = () => {
    // Basic validation
    if (!playlistData.playlist_name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    // Proceed to episode selection
    setShowEpisodeSelection(true);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  // If showing episode selection, render that modal instead
  if (showEpisodeSelection) {
    return (
      <EpisodeSelectionModal
        onClose={() => {
          onClose();
          if (onCreatePlaylist) onCreatePlaylist();
        }}
        onBack={() => setShowEpisodeSelection(false)}
        playlistData={{
          playlist_name: playlistData.playlist_name,
          description: playlistData.description,
          coverfile: playlistData.coverfile || '',
          playlist_scheduledAt: playlistData.playlist_scheduledAt
        }}
      />
    );
  }

  return (
    <CommonModalLayer
      width='w-full max-w-5xl'
      height='h-max'
      onClose={onClose}
      hideCloseButtonOnMobile={true}
      isModal={false}
    >
      <div className='w-full max-w-4xl flex flex-col bg-primary-bg-color text-text-color h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <button
            onClick={onClose}
            className="text-text-color"
          >
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Create Mini Drama Series</h1>
          <div className="w-6"></div> {/* Empty div for alignment */}
        </div>

        {/* Form Content */}
        <div className="flex flex-col p-5 space-y-8 flex-grow">
          {/* Cover Image Upload - Updated with loading states */}
          <div>
            <label htmlFor="coverImage" className="block w-full relative h-[30vh] md:h-[30vh] bg-bg-color rounded-md cursor-pointer">
              <div className="flex items-center justify-center h-full">
                {uploading ? (
                  <ModerSpinner />
                ) : imagePreview || playlistData.coverfile ? (
                  <div className="absolute inset-0">
                    <SafeImage
                      src={imagePreview || playlistData.coverfile || ''}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-color to-transparent" />
                  </div>
                ) : (
                  <span className="text-xl text-primary-text-color">Add cover image</span>
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

          {/* Rest of your form remains the same */}
          {/* Title */}
          <div className="space-y-2">
            <label className="text-2xl font-bold">Mini Drama Title</label>
            <div className="relative">
              <Input
                type="text"
                name="playlist_name"
                placeholder="Enter Playlist title (Playlist 1...)"
                value={playlistData.playlist_name}
                onChange={handleInputChange}
                maxLength={32}
              />
              <span className="absolute right-4 bottom-4 text-primary-text-color">
                {playlistData.playlist_name.length}/32
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-2xl font-bold">Description</label>
            <div className="relative">
              <Input
                type='text'
                name="description"
                placeholder="Describe your playlist..."
                className="h-24"
                value={playlistData.description}
                onChange={handleInputChange}
                maxLength={255}
              />
              <span className="absolute right-4 bottom-4 text-primary-text-color">
                {playlistData.description.length}/255
              </span>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <label className="text-2xl font-bold">Schedule Time</label>
            <div className="p-4 rounded-md">
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
                    className="border border-border-color text-text-color py-2 px-4 rounded-md self-end w-1/7"
                  >
                    <div className="flex items-center justify-center" onClick={() => setIsDatepickerOpen(true)}>
                      <IoCalendarOutline size={20} className="mr-2" />
                      Change
                    </div>
                  </button>
                ) : (
                  <Input
                    type="datetime-local"
                    onChange={handleScheduleDateChange}
                    min={new Date().toISOString().slice(0, 16)}
                    placeholder="Click here"
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
            Continue to Add Videos
          </Button>
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default CreateUserPlaylistModal;