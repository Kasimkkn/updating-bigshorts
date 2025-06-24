import { HighlightData } from '@/models/highlightResponse';
import { createHighlight } from '@/services/createhighlight';
import { ArchivesReponseTypes, Story } from '@/services/getarchives';
import { StoryData } from '@/types/storyTypes';
import React, { useEffect, useState } from 'react';
import { HiEllipsisHorizontal } from 'react-icons/hi2';
import CommonModalLayer from '../modal/CommonModalLayer';
import EditHighlightModal from '../profile/EditHighlightModal';
import SingleStoryModal from '../story/SingleStoryModal';
import SafeImage from '../shared/SafeImage';

interface ArchivesModalProps {
    archives: ArchivesReponseTypes[] | null;
    setArchivesModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ArchivesModal = ({ archives, setArchivesModal, }: ArchivesModalProps) => {
    const [selectedStories, setSelectedStories] = useState<Story[]>([]);
    const [highlightName, setHighlightName] = useState<string>('');
    const [showCreateMomentForm, setShowCreateMomentForm] = useState<boolean>(false);
    const [coverFile, setCoverFile] = useState<string>('');
    const [previewHightlight, setPreviewHighlight] = useState<StoryData[] | null>(null);
    const [showEditHighlightModal, setShowEditHighlightModal] = useState(false);
    const [editHighlightData, setEditHighlightData] = useState<HighlightData | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const toggleStorySelection = (story: Story, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }


        const isSelected = selectedStories.some(s => s.postId === story.postId);

        if (isSelected) {
            setSelectedStories(selectedStories.filter(s => s.postId !== story.postId));
        } else {
            setSelectedStories([...selectedStories, story]);
        }

    };

    const preparePreview = (index: number) => {
        if (archives) {
            const previewStory: StoryData = {
                ...archives[0], stories: [archives[0].stories[index]],
                isFriend: 0
            }
            setPreviewHighlight([previewStory])
        }
    }

    const handleCreateMoment = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }


        if (selectedStories.length > 0) {
            try {
                const response = await createHighlight({
                    coverfile: coverFile || (selectedStories[0]?.coverFile || ''),
                    highlightId: null,
                    highlightName: highlightName,
                    postIds: selectedStories.map(story => story.postId)
                })
            } catch (error) {
            }

            setSelectedStories([]);
            setHighlightName('');
            setCoverFile('');
            setShowCreateMomentForm(false);
        }

    };

    const handleOptionsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setShowDropdown(true);

    };

    const handleModalClose = () => {
        setArchivesModal(false);
    };

    const handleCreateHighlightClick = () => {
        setEditHighlightData({
            highlightId: 0, // 0 for new highlight
            highlightName: '',
            userId: 0,
            userProfileImage: '',
            userFullName: '',
            userName: '',
            userMobileNo: '',
            userEmail: '',
            isVerified: 0,
            stories: [], // start with no stories selected
        });
        setShowEditHighlightModal(true);
        setShowDropdown(false);
    };

    const handleStoryClick = (story: Story, index: number) => {
        // Show preview modal for this story
        if (archives) {
            const previewStory = {
                ...archives[0],
                stories: [story],
                isFriend: 0
            };
            setPreviewHighlight([previewStory]);
        }
    };

    useEffect(() => {
        if (selectedStories.length > 0) {
            setCoverFile(selectedStories[0]?.coverFile || '');
        }
    }, [selectedStories])
    return (
        <CommonModalLayer
            width="max-w-md" height="h-max">
            <div className="bg-primary-bg-color w-full max-h-[90vh] max-w-md mx-auto p-4 pt-8 rounded-md relative overflow-y-auto">
                <div className="relative flex justify-between items-center mb-2">
                    <button onClick={handleModalClose} className="text-2xl text-text-color font-bold">×</button>
                    <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl text-text-color font-semibold text-center">Archives</h2>
                    <div className="relative">
                        <button
                            className="ml-auto p-2 rounded-full"
                            onClick={() => setShowDropdown((v) => !v)}
                        >
                            <HiEllipsisHorizontal size={20} />
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-10">
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                                    onClick={handleCreateHighlightClick}
                                >
                                    Create Highlight
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="overflow-y-auto max-h-[50vh] grid grid-cols-3 gap-3">
                    {archives && archives[0]?.stories && archives[0].stories.length > 0 ? (
                        archives[0].stories.map((story, index) => {
                            const interactiveVideoArray = JSON.parse(story.interactiveVideo);
                            const videoUrl = interactiveVideoArray[0]?.path || "";
                            return (
                                <div
                                    key={`${story.postId}-${index}`}
                                    className={`relative rounded overflow-hidden border-2 border-border-color w-32 h-40 cursor-pointer`}
                                    onClick={() => handleStoryClick(story, index)}
                                >
                                    <SafeImage
                                        videoUrl={videoUrl}
                                        src={story.coverFile}
                                        alt="Story preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                                        {new Date(story.scheduleTime).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: '2-digit',
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-text-color text-center p-4 col-span-3">No stories found</p>
                    )}
                </div>
                {previewHightlight &&
                    <SingleStoryModal
                        storyData={previewHightlight}
                        closeModal={() => setPreviewHighlight(null)}
                        isFromMessage={false}
                    />}
                {showEditHighlightModal && editHighlightData && (
                    <EditHighlightModal
                        isOpen={showEditHighlightModal}
                        onClose={() => setShowEditHighlightModal(false)}
                        currentHighlight={editHighlightData}
                        coverFile={editHighlightData.stories[0]?.coverFile || ''}
                    />
                )}
            </div>
        </CommonModalLayer>
    );
};

export default ArchivesModal;