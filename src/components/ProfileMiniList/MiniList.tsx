import { useMobileDetection } from '@/hooks/useMobileDetection';
import { PostProfileData } from '@/models/profileResponse';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { CiPlay1 } from 'react-icons/ci';
import { IoClose } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';
import CommonModalLayer from '../modal/CommonModalLayer';
import MobileAppModal from '../modal/MobileAppModal';
import SafeImage from '../shared/SafeImage';

interface MiniListModalProps {
    minis: PostProfileData[];
    selectedMiniIndex: number;
    onClose: () => void;
    setInAppFlixData: (data: PostProfileData) => void;
    clearFlixData: () => void;
    onEditMini?: (mini: PostProfileData) => void;
    onDeleteMini?: (mini: PostProfileData) => void;
}

const MiniListModal: React.FC<MiniListModalProps> = ({
    minis,
    selectedMiniIndex,
    onClose,
    setInAppFlixData,
    clearFlixData,
    onEditMini,
    onDeleteMini
}) => {
    const router = useRouter();
    const selectedMiniRef = useRef<HTMLDivElement>(null);
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [showMobileModal, setShowMobileModal] = useState(false);
    const [selectedContentType, setSelectedContentType] = useState<string>('');
    const { isMobile, deviceType } = useMobileDetection();
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Recently';

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return '1 day ago';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return months === 1 ? '1 month ago' : `${months} months ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return years === 1 ? '1 year ago' : `${years} years ago`;
        }
    };

    // Format views function
    const formatViews = (views: number | undefined) => {
        if (!views || views === 0) return '0';

        if (views < 1000) {
            return views.toString();
        } else if (views < 1000000) {
            return `${(views / 1000).toFixed(1)}K`;
        } else {
            return `${(views / 1000000).toFixed(1)}M`;
        }
    };

    // Scroll to selected mini on mount
    useEffect(() => {
        if (selectedMiniRef.current) {
            selectedMiniRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, []);

    const handleMiniClick = (mini: PostProfileData, event: React.MouseEvent) => {
        // Prevent navigation if clicking on dropdown or dropdown button
        if ((event.target as HTMLElement).closest('.dropdown-menu') ||
            (event.target as HTMLElement).closest('.dropdown-button')) {
            return;
        }

        clearFlixData();
        setInAppFlixData(mini);
        router.push(`/home/flix/${mini.postId}`);
    };

    const handleDropdownToggle = (index: number, event: React.MouseEvent) => {
        event.stopPropagation();
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    const handleEdit = (mini: PostProfileData, event: React.MouseEvent) => {
        event.stopPropagation();
        if (isMobile) {
            setSelectedContentType('Playlist');
            setShowMobileModal(true);
        } else {
            setOpenDropdownIndex(null);
            if (onEditMini) {
                onEditMini(mini);
            }
        }
    };

    const handleDelete = (mini: PostProfileData, event: React.MouseEvent) => {
        event.stopPropagation();
        setOpenDropdownIndex(null);
        if (onDeleteMini) {
            onDeleteMini(mini);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenDropdownIndex(null);
        };

        if (openDropdownIndex !== null) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openDropdownIndex]);

    const handleMobileModalClose = () => {
        setShowMobileModal(false);
        setSelectedContentType('');
    };
    if (showMobileModal) {
        return (
            <MobileAppModal
                onClose={handleMobileModalClose}
                deviceType={deviceType}
                contentType={selectedContentType}
            />
        );
    }
    return (
        <CommonModalLayer width='max-w-3xl' height='h-max' onClose={onClose} isModal={false} hideCloseButtonOnMobile={true}>
            <div className="bg-secondary-bg-color rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border-color">
                    <h2 className="text-xl font-semibold text-text-color">
                        Minis
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary-bg-color rounded-full transition-colors"
                    >
                        <IoClose className="text-2xl text-primary-text-color" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="divide-y divide-border-color">
                        {minis.map((mini, index) => (
                            <div
                                key={mini.postId}
                                ref={index === selectedMiniIndex ? selectedMiniRef : null}
                                className="flex items-center p-4 cursor-pointer hover:bg-secondary-bg-color transition-colors group relative"
                                onClick={(event) => handleMiniClick(mini, event)}
                            >
                                {/* Cover Image */}
                                <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-secondary-bg-color flex-shrink-0">
                                    <SafeImage
                                        videoUrl={mini?.videoFile[0]}
                                        src={mini.coverFile}
                                        alt={mini.postTitle || `Mini ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Play overlay */}
                                    <div className="absolute inset-0 bg-bg-color bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-primary-bg-color bg-opacity-20 backdrop-blur-sm rounded-full p-2">
                                            <CiPlay1 className="text-primary-text-color text-lg" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 ml-4 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="text-base font-medium text-text-color truncate">
                                                {mini.postTitle}
                                            </h3>
                                            <div className="flex items-center space-x-2 text-primary-text-color text-xs mt-2">
                                                <span>{formatViews(mini.viewCounts)} views</span>
                                                <span>•</span>
                                                <span>{formatDate(mini.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Episode number indicator and menu */}
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            {/* Three dots menu */}
                                            <div className="relative">
                                                <button
                                                    className="dropdown-button p-2 rounded-full hover:bg-secondary-bg-color transition-colors"
                                                    onClick={(e) => handleDropdownToggle(index, e)}
                                                >
                                                    <BsThreeDotsVertical className="text-primary-text-color" />
                                                </button>

                                                {/* Dropdown menu */}
                                                {openDropdownIndex === index && (
                                                    <div className="dropdown-menu absolute right-7 top-2 w-40 bg-bg-color border border-border-color rounded-lg shadow-lg z-10 overflow-hidden">
                                                        <button
                                                            className="w-full flex items-center px-4 py-2 text-sm text-text-color hover:bg-secondary-bg-color transition-colors"
                                                            onClick={(e) => handleEdit(mini, e)}
                                                        >
                                                            <MdEdit className="mr-3 text-blue-500" />
                                                            Edit Mini
                                                        </button>
                                                        <button
                                                            className="w-full flex items-center px-4 py-2 text-sm text-text-color hover:bg-secondary-bg-color transition-colors"
                                                            onClick={(e) => handleDelete(mini, e)}
                                                        >
                                                            <MdDelete className="mr-3 text-red-500" />
                                                            Delete Mini
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty state */}
                    {minis.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-primary-text-color text-4xl mb-4">
                                📱
                            </div>
                            <p className="text-primary-text-color">
                                No minis available
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer with current selection info (commented out) */}
                {/* {minis[selectedMiniIndex] && (
                    <div className="border-t border-border-color p-4 bg-secondary-bg-color">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="relative w-12 h-8 rounded overflow-hidden">
                                    <Image
                                        src={minis[selectedMiniIndex].coverFile}
                                        alt={minis[selectedMiniIndex].postTitle || `Mini ${selectedMiniIndex + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium text-text-color text-sm">
                                        {minis[selectedMiniIndex].postTitle || `Mini ${selectedMiniIndex + 1}`}
                                    </p>
                                    <p className="text-xs text-primary-text-color">
                                        Episode {selectedMiniIndex + 1} of {minis.length}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleMiniClick(minis[selectedMiniIndex], e)}
                                className="bg-blue-500 hover:bg-blue-600 text-primary-text-color px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                                Watch Now
                            </button>
                        </div>
                    </div>
                )} */}
            </div>
        </CommonModalLayer>

    );
};

export default MiniListModal;