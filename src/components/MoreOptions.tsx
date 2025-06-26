import { PostlistItem } from '@/models/postlistResponse';
import { deleteFlix } from '@/services/deleteflix';
import { deletePost } from '@/services/deletepost';
import { mutePost } from '@/services/muteposts';
import { saveOtherFlix } from '@/services/saveotherflix';
import { saveOtherPost } from '@/services/saveotherpost';
import { saveUserBlock } from '@/services/saveuserblock';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { MdAccountCircle, MdBlockFlipped, MdBookmark, MdBookmarkBorder, MdDeleteOutline, MdOutlineBorderColor, MdOutlineFlag, MdVisibility } from 'react-icons/md';
import EditSnipModal from './modal/EditSnipModal';
import EditFLixModal from './modal/EditFlixModal';
import useLocalStorage from '@/hooks/useLocalStorage';
import { acceptcollaborationinvite } from '@/services/acceptcollaborationinvite';
import toast from 'react-hot-toast';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import MobileAppModal from './modal/MobileAppModal';
import ReportModal from './modal/ReportModal';
import AboutAccountModal from './modal/AboutAccountModal';
import { createPortal } from 'react-dom';

interface MoreOptionsProps {
    post: PostlistItem;
    setIsOpen: Dispatch<SetStateAction<number | null>>;
    isSnipsPage?: boolean;
    updatePost: (postId: number, property: string, isBeforeUpdate: number) => void;
    page: 'flix' | 'followers' | 'snips';
}

const isFlix = (post: PostlistItem)=>{
    return 'genreId' in post;
}

const MoreOptions = ({ post, setIsOpen, isSnipsPage, updatePost, page }: MoreOptionsProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [id] = useLocalStorage<string>('userId', '');
    const userId = parseInt(id!);
    const [openEditSnipModal, setOpenEditSnipModal] = useState(false);
    const [openEditFlixModal, setOpenEditFlixModal] = useState(false);
    const [loadingOption, setLoadingOption] = useState<string | null>(null);
    const [showMobileModal, setShowMobileModal] = useState(false);
    const [selectedContentType, setSelectedContentType] = useState<string>('');
    const { isMobile, deviceType } = useMobileDetection();
    const [openReportModal, setOpenReportModal] = useState(false);
    const [openAboutAccountModal, setOpenAboutAccountModal] = useState(false);
    // Track if we're mounted to safely render portals
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const optionsIfPostByUser = [
        { name: `Edit ${page === 'flix' ? 'Flix' : post.isForInteractiveVideo ? 'Snip' : 'Shot'}`, icon: <MdOutlineBorderColor className='text-lg'/> },
        { name: `Delete ${page === 'flix' ? 'Flix' : post.isForInteractiveVideo ? 'Snip' : 'Shot'}`, icon: <MdDeleteOutline className='text-lg text-red-500' /> },
        { name: `${post.isSaved ? "Remove" : "Save to"} Bookmark`, icon: post.isSaved ? <MdBookmark className='text-lg'/> : <MdBookmarkBorder className='text-lg'/> },
    ]

    const handleMobileEditAttempt = (contentType: string, fallbackAction: () => void) => {
        if (isMobile) {
            setSelectedContentType(contentType);
            setShowMobileModal(true);
        } else {
            fallbackAction();
        }
    };

    const handleMobileModalClose = () => {
        setShowMobileModal(false);
        setSelectedContentType('');
    };

    const optionsIfPostNotByUser = {
        flix: [
            { name: 'About this Account', icon: <MdAccountCircle className='text-lg'/> },
            { name: 'Report', icon: <MdOutlineFlag className='text-lg'/>  },
            { name: 'Hide Content', icon: <MdVisibility className='text-lg' /> },
            { name: 'Block User', icon: <MdBlockFlipped className='text-lg text-red-500'/> },
        ],
        followers: [
            { name: 'About this Account', icon: <MdAccountCircle className='text-lg'/> },
            { name: 'Report', icon: <MdOutlineFlag className='text-lg'/> },
            { name: 'Hide Content', icon: <MdVisibility className='text-lg' /> },
            { name: 'Block User', icon: <MdBlockFlipped className='text-lg text-red-500'/> },
            ...(post?.userCollab === 1 ? [{ name: 'Remove Collaboration', icon: <MdDeleteOutline className='text-lg'/> }] : [])
        ],
        snips: [
            { name: 'Report', icon: <MdOutlineFlag className='text-lg'/>  },
            { name: `${post.isSaved ? "Remove" : "Save to"} Bookmark`, icon: post.isSaved ? <MdBookmark className='text-lg'/> : <MdBookmarkBorder className='text-lg'/> },
            { name: 'Block User', icon: <MdBlockFlipped className='text-lg text-red-500'/> },
            ...(post?.userCollab === 1 ? [{ name: 'Remove Collaboration', icon: <MdDeleteOutline className='text-lg'/> }] : [])
        ]
    }

    const options = userId === post.userId ? optionsIfPostByUser : optionsIfPostNotByUser[page]

    const handleOptionClick = (optionName: string) => {
        switch (optionName) {
            case 'Edit Flix':
                handleMobileEditAttempt('Mini', () => toggleEditFlixModal());
                break;
            case 'Edit Snip':
                handleMobileEditAttempt('Snip', () => toggleEditSnipModal());
                break;
            case 'Edit Shot':
                handleMobileEditAttempt('Shot', () => toggleEditSnipModal());
                break;
            case 'Delete Flix':
            case 'Delete Snip':
            case 'Delete Shot':
                setLoadingOption(optionName);
                handleDelete(post.postId, post.isPosted);
                break;
            case 'About this Account':
                setOpenAboutAccountModal(true);
                break;
            case 'Hide Content':
                setLoadingOption(optionName);
                handleHide(post.userId);
                break;
            case 'Report':
                setOpenReportModal(true);
                break;
            case 'Save to Bookmark':
            case 'Remove Bookmark':
                setLoadingOption(optionName)
                handleSave(post.postId, post.isSaved);
                break;
            case 'Block User':
                setLoadingOption(optionName)
                handleBlock(post.userId);
                break;
            case 'Remove Collaboration':
                setLoadingOption(optionName);
                handleRemoveCollaboration(post.postId);
                break;
        }
    }

    useEffect(() => {
        if (openEditSnipModal || openEditFlixModal || showMobileModal || openReportModal || openAboutAccountModal) {
            return;
        }
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openEditSnipModal, openEditFlixModal, showMobileModal, openReportModal, openAboutAccountModal]);

    const handleSave = async (postId: number, isSave: number) => {
        try {
            if (!postId) return;
            const res = page === 'flix' ? await saveOtherFlix({ postId, isSave }) : await saveOtherPost({ postId: postId.toString(), isSave })
            setLoadingOption(null);
            if (res.isSuccess) {
                updatePost(post.postId, 'save', isSave);
                setIsOpen(null);
            }
        } catch (error) {
            console.error('Error liking the video:', error);
        }
    }

    const handleHide = async (userId: number) => {
        try {
            const res = await mutePost({ mutedUserId: userId });
            setLoadingOption(null);
            updatePost(userId, 'hide', 0);
            setIsOpen(null);
        } catch (error) {
            console.error('Error hiding content:', error);
        }
    };

    const handleBlock = async (userId: number) => {
        try {
            const res = await saveUserBlock({ blockuserId: userId, isBlock: 1 });
            setLoadingOption(null);
            if (res.isSuccess) {
                updatePost(userId, 'block', 0);
                setIsOpen(null);
            }
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    };

    const handleDelete = async (postId: number, isPost: number) => {
        try {
            const res = page === 'flix' ? await deleteFlix({ postId: postId.toString() }) : await deletePost({ postId, isPost })
            setLoadingOption(null);
            if (res.isSuccess) {
                updatePost(postId, 'delete', 0);
                setIsOpen(null);
            }
        } catch (error) {
            console.error('Error deleting content:', error);
        }
    }

    const toggleEditSnipModal = () => {
        setOpenEditSnipModal(!openEditSnipModal);
    }

    const toggleEditFlixModal = () => {
        setOpenEditFlixModal(!openEditFlixModal);
    }

    const toggleModalClose = () => {
        setOpenEditSnipModal(false);
        setIsOpen(null);
    }

    const handleRemoveCollaboration = async (post_id: number) => {
        try {
            const res = await acceptcollaborationinvite({ post_id, is_accepted: false });
            if (res.isSuccess) {
                toast.success("Collaboration removed successfully");
                updatePost(post_id, 'collaboration', 1); // 1 because update post takes value before the update
                setIsOpen(null);
            } else {
                toast.error("Failed to remove collaboration");
            }
        } catch (error) {
            console.error("Error removing collaboration:", error);
        }
    }
    
    const handleReportModalClose = () => {
        setOpenReportModal(false);
        setIsOpen(null);
    }
    
    const handleAboutAccountModalClose = () => {
        setOpenAboutAccountModal(false);
        setIsOpen(null);
    }

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
        <>
            <div className={`absolute w-max right-0 bg-bg-color z-30 rounded-sm shadow-sm`} ref={menuRef} onClick={(e) => e.stopPropagation()}>
                <ul className="text-sm">
                    {options.map((option, i) => {
                        const isEditOption = option.name.startsWith('Edit');
                        return (
                            <li key={i}>
                                <button
                                    className={`
                                        ${loadingOption === option.name && "animate-pulse"} 
                                        w-full text-text-color text-left bg-secondary-bg-color hover:bg-primary-bg-color 
                                        flex gap-3 items-center p-2 z-10
                                        ${isEditOption && isMobile ? 'relative' : ''}
                                    `}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOptionClick(option.name)
                                    }}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        {option.icon}
                                        <p className="text-text-color flex-1">{option.name}</p>
                                    </div>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
            
            {openEditSnipModal && !isMobile && (
                <EditSnipModal onClose={toggleModalClose} post={post} isSnipsPage={isSnipsPage} />
            )}
            
            {openEditFlixModal && !isMobile && (
                <EditFLixModal onClose={toggleEditFlixModal} flix={post} />
            )}
            
            {/* Render modals in portals to avoid parent positioning constraints */}
            {mounted && openReportModal && createPortal(
                <div className="fixed inset-0 z-[100]">
                    <ReportModal postId={post.postId} onClose={handleReportModalClose} isFlix={isFlix(post)}/>
                </div>,
                document.body
            )}
            
            {openAboutAccountModal && (
                <div className="fixed inset-0 z-[100]">
                    <AboutAccountModal userId={post.userId} onClose={handleAboutAccountModalClose} />
                </div>
            )}
        </>
    )
}

export default MoreOptions