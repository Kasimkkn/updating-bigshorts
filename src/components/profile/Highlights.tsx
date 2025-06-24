import { HighlightData, HighlightResponse } from '@/models/highlightResponse';
import { getHighlightData } from '@/services/gethighlightstories';
import { HighlightsList } from '@/services/getuserhighlights';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import HighlightCard from './HighlightCard';
import { on } from 'events';
import StoryQueue from '../story/StoryQueue';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { ProfileData } from "@/types/usersTypes";
import { FaEllipsisVertical } from 'react-icons/fa6';
import EditHighlightModal from './EditHighlightModal';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '../shared/SafeImage';

interface HighlightsProps {
    highlightsList: HighlightsList[];
    profileImage: string;
    userName: string;
    userFullName: string;
    onDelete?: (highlightId: number) => Promise<void>;
}

const Highlights = ({ highlightsList, profileImage, userName, userFullName, onDelete }: HighlightsProps) => {
    const [currentHighlight, setCurrentHighlight] = useState<number | null>(null);
    const [currentHighlightIndex, setCurrentHighlightIndex] = useState<number | null>(null);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedHighlightId, setSelectedHighlightId] = useState<number | null>(null);
    const [userData, setUserData] = useState<ProfileData | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState<{ id: number, name: string, coverfile: string } | null>(null);
    const [editingHighlight, setEditingHighlight] = useState<HighlightData | null>(null);
    const [coverFile, setCoverFile] = useState<string | null>(null);
    const [storedUserData] = useLocalStorage<any>('userData', {});

    useEffect(() => {
        // Use the storedUserData from the hook
        if (storedUserData && Object.keys(storedUserData).length > 0) {
            setUserData(storedUserData);
        }
    }, [storedUserData]);

    const handleOpenHighlight = (highlightId: number, index: number) => {
        setCurrentHighlight(highlightId);
        setCurrentHighlightIndex(index);
    }

    const onClose = () => {
        setCurrentHighlightIndex(null);
        setCurrentHighlight(null);
    }

    const onNext = () => {
        if (currentHighlightIndex !== null) {
            if (currentHighlightIndex < highlightsList.length - 1) {
                setCurrentHighlight(highlightsList[currentHighlightIndex + 1].highlightId);
                setCurrentHighlightIndex(currentHighlightIndex + 1);
            } else {
                onClose();
            }
        }
    }

    const onPrev = () => {
        if (currentHighlightIndex !== null) {
            if (currentHighlightIndex > 0) {
                setCurrentHighlight(highlightsList[currentHighlightIndex - 1].highlightId);
                setCurrentHighlightIndex(currentHighlightIndex - 1);
            } else {
                onClose();
            }
        }
    }

    const handleEditHighlight = (e: React.MouseEvent, highlightId: number) => {
        e.stopPropagation();



    }

    const handleDeleteClick = (e: React.MouseEvent, highlightId: number) => {
        e.stopPropagation(); // Prevent highlight from opening
        setSelectedHighlightId(highlightId);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (!selectedHighlightId) {
                console.error('No highlight selected for deletion');
                return;
            }

            if (!onDelete) {
                console.error('onDelete handler not provided');
                return;
            }
            await onDelete(selectedHighlightId);

            // Close dialog only after successful deletion
            setShowDeleteDialog(false);
            setSelectedHighlightId(null);

        } catch (error) {
            console.error('Failed to delete highlight:', error);
            // Keep dialog open if deletion fails
            // Optionally show error message to user
        }
    };

    const toggleOptions = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowOptions((prev) => !prev);
    };

    const handleDelete = (e: React.MouseEvent, highlightId: number) => {
        e.stopPropagation();
        handleDeleteClick(e, highlightId);
        setShowOptions(false);
    };

    const handleEdit = (e: React.MouseEvent, highlightId: number) => {
        e.stopPropagation();
        handleEditClick(e, highlightId);
        setShowOptions(false);
    };

    const handleEditClick = async (e: React.MouseEvent, highlightId: number) => {
        e.stopPropagation();
        const highlight = highlightsList.find(h => h.highlightId === highlightId);
        if (highlight) {
            setEditData({
                id: highlight.highlightId,
                name: highlight.highlightName,
                coverfile: highlight.coverfile
            });
            setShowEditModal(true);
        }
        setCoverFile(highlight?.coverfile || '');
        const response = await getHighlightData({ highlightId });
        const highlightData = response.data.find((item) => item.highlightId === highlightId);
        if (!highlightData) {
            console.error(`Highlight with ID ${highlightId} not found.`);
            return; // or handle gracefully
        }
        setEditingHighlight({
            highlightId: highlightId,
            highlightName: highlight?.highlightName || '',
            userId: userData?.userId || 0,
            userProfileImage: profileImage,
            userFullName: userFullName,
            userName: userName,
            userMobileNo: userData?.userMobile || '',
            userEmail: userData?.userEmail || '',
            isVerified: userData?.isVerified || 0,
            stories: highlightData.stories || []
        })
    };

    const handleSaveEdit = async (data: { name: string, coverfile: File | null, storyIds: number[] }) => {
        // Call API or mutation to update highlight
        // Optionally refetch data or update UI
        setShowEditModal(false);
        setEditData(null);
    };

    return (
        <div className="overflow-x-auto whitespace-nowrap">
            <div className="flex space-x-2 pr-4">
                {highlightsList.map((highlight, index) => {
                    return (
                        <div
                            key={highlight.highlightId}
                            onClick={() => handleOpenHighlight(highlight.highlightId, index)}
                            className="flex flex-col items-center w-[4.5rem] hover:cursor-pointer relative"
                            onMouseEnter={() => setHoveredId(highlight.highlightId)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div className="rounded-lg border-2 p-[4px] flex items-center justify-center w-[4.5rem] h-24 relative">
                                <SafeImage
                                    onContextMenu={(e) => e.preventDefault()}
                                    src={highlight.coverfile}
                                    alt={highlight.highlightName || `Highlight ${index + 1}`}
                                    className="w-full h-full object-cover rounded-md"
                                />

                                {/* Add only the delete button */}
                                {userData?.userName === userName && hoveredId === highlight.highlightId && (
                                    <div className="absolute top-0 right-0 z-20">
                                        <button
                                            onClick={toggleOptions}
                                            className="p-1 rounded-full bg-bg-color transition-colors duration-200"
                                        >
                                            <FaEllipsisVertical className="text-text-color text-xl" />
                                        </button>

                                        {showOptions && (
                                            <div className="absolute right-0 mt-1 w-[70px] border border-gray-300 rounded-md shadow-lg z-30">
                                                <button
                                                    onClick={(e) => handleEdit(e, highlight.highlightId)}
                                                    className="w-full text-left px-4 py-2 bg-primary-bg-color hover:bg-secondary-bg-color text-sm text-text-color"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, highlight.highlightId)}
                                                    className="w-full text-left px-4 py-2 bg-primary-bg-color hover:bg-red-100 text-sm text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-text-color w-full truncate p-x-1">
                                {highlight.highlightName}
                            </p>
                        </div>
                    );
                })}
            </div>

            {currentHighlight !== null && currentHighlightIndex !== null &&
                <div className='fixed inset-0 bg-bg-color/10 backdrop-blur-sm z-40 flex items-center justify-center'>

                    {currentHighlightIndex > 0 &&
                        <div className='max-md:hidden'>
                            <StoryQueue
                                coverFile={highlightsList[currentHighlightIndex - 1]?.coverfile || ""}
                                profileImage={profileImage}
                                userName={userName}
                                userFullName={userName}
                                uploadTime=''
                            />
                        </div>
                    }

                    <HighlightCard
                        highlightId={currentHighlight}
                        onClose={onClose}
                        onNext={onNext}
                        onPrev={onPrev}
                    />

                    {currentHighlightIndex < highlightsList.length - 1 &&
                        <div className='max-md:hidden'>
                            <StoryQueue
                                coverFile={highlightsList[currentHighlightIndex + 1]?.coverfile || ""}
                                profileImage={profileImage}
                                userName={userName}
                                userFullName={userName}
                                uploadTime=''
                            />
                        </div>
                    }
                </div>
            }

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <DeleteDialog
                    isOpen={showDeleteDialog}
                    onClose={() => {
                        setShowDeleteDialog(false);
                        setSelectedHighlightId(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Delete Highlight"
                    message="Are you sure you want to delete this highlight?"
                />
            )}
            {showEditModal && editingHighlight && (
                <EditHighlightModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}

                    currentHighlight={editingHighlight}
                    coverFile={coverFile} // Pass the current highlight data
                />
            )}
        </div>
    )
}

export default Highlights