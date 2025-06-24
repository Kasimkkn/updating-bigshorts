
import dummyUser from '@/assets/user.png';
import { HighlightData } from "@/models/highlightResponse";
import { createHighlight } from "@/services/createhighlight";
import { getArchives, Story } from "@/services/getarchives"; // API call
import { uploadImage } from "@/utils/fileupload";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiPencil } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa";
import { MdOutlineSaveAlt } from "react-icons/md";
import CommonModalLayer from "../modal/CommonModalLayer";
import Button from '../shared/Button';
import Input from '../shared/Input';
import SafeImage from '../shared/SafeImage';

interface EditHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;

  currentHighlight: HighlightData;
  coverFile?: string | null; // <-- new prop
}

const EditHighlightModal = ({
  isOpen,
  onClose,
  currentHighlight,
  coverFile,
}: EditHighlightModalProps) => {
  const [name, setName] = useState(currentHighlight.highlightName);
  const [coverfile, setCoverfile] = useState<File | null>(null);
  const [archivedStories, setArchivedStories] = useState<Story[]>([]);
  const [selectedStories, setSelectedStories] = useState<number[]>([]);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isStoriesLoading, setIsStoriesLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStories = async () => {
      setIsStoriesLoading(true); // Start loading
      try {
        const response = await getArchives();
        if (response?.data?.length > 0) {
          const allStories = response.data.flatMap((item) => item.stories);
          setArchivedStories(allStories);
        }
      } catch (error) {
        console.error("Failed to fetch stories", error);
      } finally {
        setIsStoriesLoading(false); // End loading
      }
    };

    fetchStories();
    setSelectedStories(currentHighlight.stories.map((story) => story.postId));
    setExistingCoverUrl(coverFile ?? null);
  }, [currentHighlight]);

  useEffect(() => {
    const fetchStories = async () => {
      const response = await getArchives(); // assume it returns an array of stories
      if (response?.data?.length > 0) {
        // Flatten all stories from each archive (if there are multiple users' archives)
        const allStories = response.data.flatMap(item => item.stories);
        setArchivedStories(allStories); // ✅ Correct: stories: Story[]
      }
    };

    fetchStories();
    setSelectedStories(currentHighlight.stories.map(story => story.postId));
  }, [currentHighlight]);

  const handleStorySelect = (storyId: number) => {
    setSelectedStories((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };
  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      let finalCover: string = "";

      if (coverfile instanceof File) {
        const localFilePath = URL.createObjectURL(coverfile);

        const needsUpload = !localFilePath.startsWith('http');

        if (needsUpload) {
          try {
            const imageBlob = await fetch(localFilePath).then(r => r.blob());
            const uploadFile = new File([imageBlob], `highlight_cover.jpg`, { type: 'image/jpeg' });

            const uploadedImageUrl = await uploadImage(uploadFile, "InteractiveVideos", false);

            if (!uploadedImageUrl) throw new Error("Image upload failed");

            finalCover = uploadedImageUrl;
          } catch (uploadError) {
            console.error("Cover image upload failed:", uploadError);
            setIsSaving(false);
            return;
          }
        }
      }

      if (!finalCover) {
        if (existingCoverUrl) {
          finalCover = existingCoverUrl;
        } else {
          const fallbackStory = archivedStories.find(story =>
            selectedStories.includes(story.postId)
          );
          finalCover = fallbackStory?.coverFile || "";
        }
      }

      await createHighlight({
        highlightId: currentHighlight.highlightId,
        highlightName: name,
        coverfile: finalCover,
        postIds: selectedStories,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update highlight:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <CommonModalLayer isModal={false} onClose={onClose} hideCloseButtonOnMobile={true}>
      <div className="bg-primary-bg-color w-full max-h-[90vh] max-w-md mx-auto p-4 rounded-md relative overflow-y-auto">
        <div className="relative flex justify-between items-center mb-2">
          <h2 className="text-xl text-text-color font-semibold text-center">Archives</h2>
          <Button
            onClick={() => {
              if (selectedStories.length === 0) {
                toast.error("Please select at least one ssup before saving.");
                return;
              }
              handleSubmit();
            }}
            className="text-2xl text-text-color font-bold px-3 py-1"
          >
            {isSaving ? "Saving..." : <MdOutlineSaveAlt size={24} />}
          </Button>
        </div>

        {/* Cover Image Section */}
        <div className="flex flex-col justify-center items-center mb-4 relative">
          {existingCoverUrl || coverfile ? (
            <SafeImage
              src={coverfile ? URL.createObjectURL(coverfile) : existingCoverUrl!}
              alt="Cover"
              className="w-32 h-48 object-cover rounded"
            />
          ) : (
            <SafeImage
              src={dummyUser.src}
              alt="No cover"
              className="w-32 h-48 object-cover border border-border-color rounded"
            />
          )}

          <button
            className="absolute top-2 right-2 bg-text-color w-8 h-8 rounded-full flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <BiPencil size={16} className="text-bg-color" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => setCoverfile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Highlight Name */}
        <div className="text-center mb-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Highlight name"
            className="text-center"
          />
        </div>

        <hr className="border-border-color my-3" />

        {/* Stories */}
        <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[50vh]">
          {isStoriesLoading ? (
            <div className="col-span-3 flex flex-col items-center justify-center text-borderborder-border-color py-10">
              <FaSpinner className="animate-spin text-2xl mb-2" />
              <span>Loading ssups...</span>
            </div> // ⬅️ You can use a spinner here
          ) : (
            archivedStories.map((story) => {
              const isSelected = selectedStories.includes(story.postId);
              const index = selectedStories.indexOf(story.postId);
              return (
                <div
                  key={story.postId}
                  onClick={() => handleStorySelect(story.postId)}
                  className={`relative rounded overflow-hidden border-2 ${isSelected ? "border-primary-bg-color" : "border-border-color"
                    }`}
                >
                  <SafeImage
                    src={story.coverFile}
                    alt={`Story ${story.postId}`}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-bg-color text-text-color text-xs px-2 py-0.5 rounded">
                    {new Date(story.scheduleTime).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </div>
                  {isSelected ? (
                    <div className="absolute top-1 right-1 bg-primary-bg-color text-primary-text-color text-xs w-6 h-6 flex items-center justify-center rounded-full">
                      {index + 1}
                    </div>
                  ) : (
                    <div className="absolute top-1 right-1 bg-secondary-bg-color text-transparent text-xs w-6 h-6 flex items-center justify-center rounded-full border border-border-color" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default EditHighlightModal;
