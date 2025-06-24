import React from 'react';
import Button from '../../shared/Button';

interface StoryOptionsDropdownProps {
    isVisible: boolean;
    isOwner: boolean;
    isMuted: number;
    onDelete?: () => void;
    onMute?: () => void;
    onUnmute?: () => void;
    onReport?: () => void;
    showConfirmDialog?: boolean;
    onConfirmDelete?: () => void;
    onCancelDelete?: () => void;
}

export const StoryOptionsDropdown: React.FC<StoryOptionsDropdownProps> = ({
    isVisible,
    isOwner,
    isMuted,
    onDelete,
    onMute,
    onUnmute,
    onReport,
    showConfirmDialog,
    onConfirmDelete,
    onCancelDelete
}) => {
    if (!isVisible) return null;

    return (
        <>
            <div className="absolute top-14 right-2 z-50 max-sm:top-[6.5rem] bg-primary-bg-color w-36 sm:w-32 shadow-lg rounded-md">
                {isOwner ? (
                    <div className="flex flex-col w-full">
                        <button
                            className="text-red-500 hover:bg-secondary-bg-color px-3 py-1.5 text-left text-xs sm:text-sm sm:py-2"
                            onClick={onDelete}
                        >
                            Delete
                        </button>
                        <button className="text-text-color hover:bg-secondary-bg-color px-3 py-1.5 text-left text-xs sm:text-sm sm:py-2">
                            Ssup Settings
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col w-full">
                        <button
                            className="text-text-color hover:bg-secondary-bg-color px-3 py-1.5 text-left text-xs sm:text-sm sm:py-2"
                            onClick={isMuted === 1 ? onUnmute : onMute}
                        >
                            {isMuted === 1 ? 'Unmute' : 'Mute'}
                        </button>
                        <button
                            className="text-text-color hover:bg-secondary-bg-color px-3 py-1.5 text-left text-xs sm:text-sm sm:py-2"
                            onClick={onReport}
                        >
                            Report
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4 sm:px-6">
                    <div className="bg-primary-bg-color p-4 sm:p-6 rounded-md max-w-sm w-full">
                        <p className="text-sm sm:text-base text-gray-700 mb-4">
                            Are you sure you want to delete this Ssup? This cannot be reverted.
                        </p>
                        <div className="flex justify-end mt-4 gap-2 sm:gap-3">
                            <Button isLinearBtn={true} onClick={onConfirmDelete}>Yes</Button>
                            <Button isLinearBorder={true} onClick={onCancelDelete}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
