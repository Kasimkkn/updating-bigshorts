import { uploadImage } from '@/utils/fileupload';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import EpisodeSelectionModal from '../EditPlaylist/editepisodeselection';
import { ModerSpinner } from '../LoadingSpinner';
import CommonModalLayer from '../modal/CommonModalLayer';
import Button from '../shared/Button';
import SafeImage from '../shared/SafeImage';

interface EditPlaylistModalProps {
  onClose: () => void;
  onUpdatePlaylist?: () => void;
  playlistData: {
    id?: number;
    playlist_name: string;
    description: string;
    coverfile: string | null;
  };
}

const EditPlaylistModal = ({
  onClose,
  onUpdatePlaylist,
  playlistData: initialPlaylistData
}: EditPlaylistModalProps) => {
  const [playlistData, setPlaylistData] = useState(initialPlaylistData);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialPlaylistData.coverfile);
  const [showEpisodeSelection, setShowEpisodeSelection] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPlaylistData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      setUploadError(null);
      try {
        const imageUrl = await uploadImage(file, 'coverFiles', true);
        setPlaylistData(prev => ({
          ...prev,
          coverfile: imageUrl || prev.coverfile // Use the previous coverfile value if imageUrl is null
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

  const handleSaveChanges = () => {
    // Basic validation
    if (!playlistData.playlist_name.trim()) {
      toast.error("Please enter a playlist name")
      alert('Please enter a playlist name');
      return;
    }

    // Instead of closing modal, show episode selection
    setShowEpisodeSelection(true);
  };

  // If showing episode selection, render that modal instead
  if (showEpisodeSelection) {
    return (
      <EpisodeSelectionModal
        onClose={() => {
          onClose();
          if (onUpdatePlaylist) onUpdatePlaylist();
        }}
        onBack={() => setShowEpisodeSelection(false)}
        playlistData={{
          id: playlistData.id || 0,
          playlist_name: playlistData.playlist_name,
          description: playlistData.description,
          coverfile: playlistData.coverfile || '' // Ensure coverfile is passed
        }}
      />
    );
  }

  return (
    <CommonModalLayer
      width='w-full max-w-5xl'
      height='h-max'
      hideCloseButton={true}
    >
      <div className='w-full flex flex-col bg-bg-color text-text-color h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-border-color">
          <h1 className="text-2xl font-bold">Edit Playlist</h1>
        </div>
        {/* Form Content */}
        <div className="flex flex-col p-5 space-y-8 flex-grow">
          {/* Cover Image Upload */}
          <div>
            <label htmlFor="coverImage" className="block w-full relative h-[30vh] md:h-[30vh] bg-primary-bg-color rounded-md cursor-pointer">
              <div className="flex items-center justify-center h-full">
                {uploading ? (
                  <ModerSpinner />
                ) : imagePreview || playlistData.coverfile ? (
                  <div className="absolute inset-0">
                    <SafeImage
                      src={imagePreview || (playlistData.coverfile || '/path/to/default/image.jpg')}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-color to-transparent" />
                  </div>
                ) : (
                  <span className="text-xl text-primary-text-color">Change cover image</span>
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
          {/* Title */}
          <div className="space-y-2">
            <label className="text-2xl font-bold">Playlist Title</label>
            <div className="relative">
              <input
                type="text"
                name="playlist_name"
                placeholder="Enter Playlist title (Playlist 1...)"
                value={playlistData.playlist_name}
                onChange={handleInputChange}
                className="w-full p-4 bg-primary-bg-color rounded-md text-text-color focus:outline-none"
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
              <textarea
                name="description"
                placeholder="Describe your playlist..."
                value={playlistData.description}
                onChange={handleInputChange}
                className="w-full p-4 bg-primary-bg-color rounded-md text-text-color focus:outline-none min-h-[150px] resize-none"
                maxLength={255}
              />
              <span className="absolute right-4 bottom-4 text-primary-text-color">
                {playlistData.description.length}/255
              </span>
            </div>
          </div>
        </div>
        {/* Continue to Videos Button */}
        <div className="p-5 mt-auto">
          <Button
            isLinearBtn={true}
            isLinearBorder={true}
            className="w-full py-3 rounded-md text-center"
            onClick={handleSaveChanges}
            disabled={uploading}
          >
            Continue to Videos
          </Button>
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default EditPlaylistModal;