"use client";

import { PlaylistDetailSkeleton } from '@/components/Skeletons/Skeletons';
import ReportModal from "@/components/modal/ReportModal";
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { PostlistItem } from "@/models/postlistResponse";
import { deletePlaylist } from "@/services/deleteplaylist";
import { getPlaylistVideos } from "@/services/getplaylistflixdetails";
import { Playlist } from "@/services/getplaylistslist";
import { timeAgo } from "@/utils/features";
import useUserRedirection from "@/utils/userRedirection";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaEllipsisVertical, FaPlay } from "react-icons/fa6";
import { IoIosEye } from "react-icons/io";
import { IoChevronDownSharp, IoChevronUpSharp } from "react-icons/io5";
import Avatar from "../Avatar/Avatar";
import EditPlaylistModal from "../EditPlaylist/editplaylist";
import CommonModalLayer from '../modal/CommonModalLayer';
import ConfirmModal from "../modal/ConfirmModal";
import MobileAppModal from "../modal/MobileAppModal";
import Button from "../shared/Button";
import SafeImage from '../shared/SafeImage';

interface PlaylistDetailOverlayProps {
    playlist: Playlist;
    onClose: () => void;
    isFromProfile: boolean;
    updateUpstream?: () => void;
}

const PlaylistDetailOverlay: React.FC<PlaylistDetailOverlayProps> = ({
    playlist,
    onClose,
    isFromProfile,
    updateUpstream = () => { },
}) => {
    const router = useRouter();
    const { setInAppFlixData } = useInAppRedirection();
    const { setAllVideos } = useInAppRedirection();
    const redirectUser = useUserRedirection();

    const [videos, setVideos] = useState<PostlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<PostlistItem | null>(null);
    const [openReportModal, setOpenReportModal] = useState<number | null>(null);
    const [openPlaylistOptions, setOpenPlaylistOptions] = useState(false);
    const [openEditPlaylistModal, setOpenEditPlaylistModal] = useState(false);
    const [isUserAuthorized, setIsUserAuthorized] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showMore, setShowMore] = useState<number | null>(null);
    const [showMobileModal, setShowMobileModal] = useState(false);
    const [selectedContentType, setSelectedContentType] = useState<string>('');
    const { isMobile, deviceType } = useMobileDetection();
    const [storedUserId] = useLocalStorage<string>('userId', '');
    // Extract playlist data directly from the playlist prop
    const playlistName = playlist.playlist_name;
    const playlistCoverfile = playlist.coverfile;
    const playlistDescription = playlist.description || "";

    useEffect(() => {
        // Check if the current user is the creator of the playlist
        const currentUserId = storedUserId;
        const playlistUserId = playlist.userData?.id;

        setIsUserAuthorized(
            !!currentUserId &&
            !!playlistUserId &&
            currentUserId === playlistUserId.toString()
        );
    }, [playlist.id, playlist.userData]);
    useEffect(() => {
        const fetchPlaylistVideos = async () => {
            setLoading(true);
            try {
                const response = await getPlaylistVideos({ playlistId: playlist.id });
                if (response.isSuccess && response.data) {
                    setVideos(response.data);
                    setAllVideos(response.data);
                    // Set first video as selected by default
                    if (response.data.length > 0) {
                        setSelectedVideo(response.data[0]);
                    }
                } else {
                    setError(response.message || "Failed to load playlist videos");
                }
            } catch (error) {
                console.error("Failed to fetch playlist videos:", error);
                setError("Failed to fetch playlist videos");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylistVideos();
    }, [playlist.id]);

    const handleDeletePlaylist = async () => {
        setDeleting(true);
        try {
            const response = await deletePlaylist({ playlistId: playlist.id });

            if (response.isSuccess) {
                setShowDeleteConfirmation(false);
                updateUpstream();
                onClose(); // Close the modal
            } else {
                console.error('Failed to delete playlist:', response.message);
                alert(response.message || 'Failed to delete playlist');
            }
        } catch (error) {
            console.error('Error deleting playlist:', error);
            alert('An unexpected error occurred');
        } finally {
            setDeleting(false);
        }
    };

    const handleShowMore = (id: number) => {
        if (id === showMore) {
            setShowMore(null);
        } else {
            setShowMore(id)
        }
    }

    const handleEditPlaylist = () => {
        if (isMobile) {
            setSelectedContentType('Playlist');
            setShowMobileModal(true);
        } else {
            setOpenPlaylistOptions(false);
            setOpenEditPlaylistModal(true);
        }
    };

    const handleUpdatePlaylist = () => {
        updateUpstream()
        onClose();
    };

    const handlePlayVideo = () => {
        if (selectedVideo) {
            setInAppFlixData({
                ...selectedVideo,
                isForPlaylist: true
            });
            router.push(`/home/playlist/${playlist.id}`);
            onClose();
        }
    };

    if (loading) {
        return (
            <CommonModalLayer
                width='w-full max-w-5xl'
                height='h-max'
                onClose={onClose}
            >
                <PlaylistDetailSkeleton />
            </CommonModalLayer>
        );
    }

    if (error) {
        return (
            <CommonModalLayer
                width='w-full max-w-5xl'
                height='h-max'
                onClose={onClose}
            >
                <div className="w-full flex flex-col bg-bg-color h-[90vh] overflow-y-auto">
                    <p className="text-red-500 p-8">{error}</p>
                </div>
            </CommonModalLayer>
        );
    }

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
        <CommonModalLayer
            width='w-full max-w-5xl'
            height='h-max'
            onClose={onClose}
        >
            <div className='w-full flex flex-col bg-bg-color h-[90vh] overflow-y-auto'>
                {/* Banner area with selected video or playlist cover */}
                <div className='relative text-text-color flex flex-col'>
                    <div className="relative h-[30vh] md:h-[50vh] w-full">
                        <div className="absolute inset-0">
                            <SafeImage
                                src={playlistCoverfile}
                                alt={playlistName}
                                className="w-full h-full object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-bg-color to-transparent" />
                            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-bg-color-70 to-transparent" />
                        </div>
                    </div>

                    {/* Playlist options button - Only show if user is authorized */}
                    {isUserAuthorized && isFromProfile && (
                        <button
                            onClick={() => setOpenPlaylistOptions(!openPlaylistOptions)}
                            className="absolute top-4 right-4 text-primary-text-color hover:text-gray-300"
                        >
                            <FaEllipsisVertical size={24} />
                        </button>
                    )}

                    {/* Playlist options menu */}
                    {isUserAuthorized && openPlaylistOptions && isFromProfile && (
                        <div className="absolute top-14 right-4 bg-secondary-bg-color py-2 rounded shadow-lg z-10">
                            <button
                                onClick={handleEditPlaylist}
                                className="block w-full text-left px-4 py-2 text-sm text-primary-text-color hover:bg-secondary-bg-color"
                            >
                                Edit Playlist
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-secondary-bg-color"
                            >
                                Delete Playlist
                            </button>
                        </div>
                    )}

                    <div className="md:absolute bottom-0 left-0 z-10 flex flex-col justify-end md:p-12 px-2">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{playlistName}</h1>
                        <div className="text-sm text-text-color mb-4 flex items-center">
                            {playlist.userData && (
                                <button
                                    onClick={() => {
                                        redirectUser(playlist.userData.id, `/home/users/${playlist.userData.id}`)
                                    }}
                                    className='flex items-center'>
                                    <Avatar src={playlist.userData.profileImage} name={playlist.userData.name || playlist.userData.username} />
                                    <div className="ml-2 flex flex-col">
                                        <p className="font-bold text-text-color">
                                            {playlist.userData.name ? playlist.userData.name : `@${playlist.userData.username}`}
                                        </p>
                                        <p className="text-start text-sm text-text-color">{playlist.userData.name ? `@${playlist.userData.username}` : '\u00A0'}</p>
                                    </div>
                                </button>
                            )}
                        </div>
                        <p className="text-lg md:text-xl mb-6">{playlistDescription || "No description available"}</p>
                        <div className="flex items-center gap-4">
                            <Button isLinearBorder={true} isLinearBtn={true} onClick={handlePlayVideo} disabled={!selectedVideo}>
                                <FaPlay />
                                <p className="font-semibold">Play</p>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full p-5">
                    {videos.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                            <p>This playlist is empty</p>
                        </div>
                    ) : (
                        <>
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className="text-2xl font-bold">Items</h2>
                                <p>{videos.length} Items</p>
                            </div>

                            <div className='w-full max-h-[50vh] overflow-y-auto'>
                                {videos.map((video, index) => (
                                    <div
                                        key={video.postId}
                                        className="flex items-center gap-4 rounded-md hover:bg-primary-bg-color p-2"
                                        onClick={() => {
                                            setInAppFlixData({
                                                ...video,
                                                isForPlaylist: true
                                            });
                                            router.push(`/home/playlist/${video.postId}/${playlist.id}`);
                                        }}
                                    >
                                        <div className="mr-4 text-2xl text-gray-500 font-light w-8 text-center">
                                            {index + 1}
                                        </div>
                                        <div
                                            className="relative w-1/3 rounded-md overflow-hidden flex-shrink-0 aspect-video cursor-pointer"
                                        >
                                            <SafeImage
                                                src={video.coverFile}
                                                alt={video.postTitle}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-bg-color/50 transition-opacity">
                                                <FaPlay className="text-primary-text-color" size={20} />
                                            </div>
                                        </div>
                                        <div className="w-2/3 min-w-0">
                                            <h3 className="text-xl font-semibold truncate">{video.postTitle}</h3>
                                            <p className="text-sm text-gray-400">{timeAgo(video.scheduleTime)}</p>
                                            <div className="flex items-center gap-1 my-1 text-sm text-gray-400">
                                                <IoIosEye />
                                                <p>{video.viewCounts}</p>
                                            </div>
                                            <div onClick={(e) => { e.stopPropagation(); handleShowMore(video.postId) }}>
                                                <p className={`text-sm ${showMore !== video.postId && "line-clamp-1 xl:line-clamp-2"}`}>{video.description}</p>
                                                {showMore === video.postId ?
                                                    <div className='flex'>
                                                        <p>Show less</p>
                                                        <IoChevronUpSharp />
                                                    </div>
                                                    :
                                                    <div className='flex items-center gap-1'>
                                                        <p>Show more</p>
                                                        <IoChevronDownSharp />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {openReportModal && (
                <ReportModal
                    postId={openReportModal}
                    onClose={() => setOpenReportModal(null)}
                />
            )}

            {openEditPlaylistModal && (
                <EditPlaylistModal
                    onClose={() => setOpenEditPlaylistModal(false)}
                    onUpdatePlaylist={handleUpdatePlaylist}
                    playlistData={{
                        id: playlist.id,
                        playlist_name: playlistName,
                        description: playlistDescription,
                        coverfile: playlistCoverfile,
                    }}
                />
            )}

            {showDeleteConfirmation && (
                <ConfirmModal
                    onConfirm={handleDeletePlaylist}
                    onCancel={() => setShowDeleteConfirmation(false)}
                    isOpen={showDeleteConfirmation}
                    isPerformingAction={deleting}
                    message={`Are you sure you want to delete the playlist "${playlistName}"?`}
                />
            )}
        </CommonModalLayer>
    );
};

export default PlaylistDetailOverlay;