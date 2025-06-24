"use client";
import { ModerSpinner } from '@/components/LoadingSpinner';
import SharePostModal from '@/components/modal/SharePostModal';
import ShotsModal from '@/components/modal/ShotsModal';
import SnipsModal from '@/components/modal/SnipsModal';
import SavedPostModal from '@/components/posts/SavedPostModal';
import Button from '@/components/shared/Button';
import SafeImage from '@/components/shared/SafeImage';
import Suggestion from '@/components/suggestions/Suggestion';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { PostlistItem, PostlistResponse } from '@/models/postlistResponse';
import { getUserSavedAudio } from '@/services/getuserbookmarklist';
import { getUserSavedFlix } from '@/services/getusersavedflix';
import { saveOtherFlix } from '@/services/saveotherflix';
import { saveOtherPost } from '@/services/saveotherpost';
import { getUserSavedImage } from '@/services/usersavedimagelist';
import { getUserSavedVideo } from '@/services/usersavedvideolist';
import { AllSavedData, FlixSaved, ImageSaved, MusicSaved, VideoSaved } from "@/types/savedTypes";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { IconType } from 'react-icons';
import { BsMusicNoteBeamed } from 'react-icons/bs';
import { CiShare2 } from 'react-icons/ci';
import { FaBookmark, FaClipboard, FaImage, FaPlay, FaRegBookmark, FaVideo } from 'react-icons/fa';
import { FiMoreHorizontal } from 'react-icons/fi';
import { IoIosMusicalNotes } from 'react-icons/io';
import { IoCloseOutline } from 'react-icons/io5';
import { MdOutlineMovie } from 'react-icons/md';

const savedCategories: { id: number; icon: IconType; name: string }[] = [
    //{ id: 1, icon: IoGrid, name: 'All' },
    { id: 2, icon: FaImage, name: 'Shots' },
    { id: 3, icon: FaVideo, name: 'Snips' },
    { id: 4, icon: BsMusicNoteBeamed, name: 'Music' },
    { id: 5, icon: MdOutlineMovie, name: 'Mini' },
];

type PostData = AllSavedData[] | ImageSaved[] | VideoSaved[] | MusicSaved[] | FlixSaved[];

const hasLikeCount = (post: AllSavedData | ImageSaved | VideoSaved | MusicSaved): post is (AllSavedData | ImageSaved | VideoSaved) => {
    return 'likeCount' in post;
};
const hasSaveCount = (post: AllSavedData | ImageSaved | VideoSaved | MusicSaved): post is (AllSavedData | ImageSaved | VideoSaved) => {
    return 'saveCount' in post;
};
const hasShareCount = (post: AllSavedData | ImageSaved | VideoSaved | MusicSaved): post is (AllSavedData | ImageSaved | VideoSaved) => {
    return 'shareCount' in post;
};
const hasCommentCount = (post: AllSavedData | ImageSaved | VideoSaved | MusicSaved): post is (AllSavedData | ImageSaved | VideoSaved) => {
    return 'commentCount' in post;
};
const SavedPage = () => {

    const [activeCategory, setActiveCategory] = useState(2);
    const [postData, setPostData] = useState<PostData | null>(null);
    const [snipData, setSnipData] = useState<PostlistResponse["data"]>([]);
    const [shotData, setShotData] = useState<PostlistResponse["data"]>([]);
    const [loading, setLoading] = useState(true);
    const [openMoreOptions, setOpenMoreOptions] = useState<number | null>(null);
    const [openPost, setOpenPost] = useState<{ id: number, type: "flix" | "video" | "audio" | "image" } | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState<number | null>(null);
    const [selectedSnip, setSelectedSnip] = useState<PostlistItem | null>(null);
    const [selectedShot, setSelectedShot] = useState<PostlistItem | null>(null);
    const [isSnipsModalOpen, setIsSnipsModalOpen] = useState(false);
    const { setInAppFlixData, clearFlixData } = useInAppRedirection();
    const { setInAppSnipsData, setSnipId, setSnipIndex, } = useInAppRedirection()
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            let data: PostData = [];
            if (activeCategory === 2) {
                const response = await getUserSavedImage({ isForYou: 1, isLogin: 1, languageId: -1 });
                data = Array.isArray(response.data) ? response.data : [];
                setShotData(data as PostlistResponse["data"]);
            } else if (activeCategory === 3) {
                const response = await getUserSavedVideo({ isForYou: 1, isLogin: 1, languageId: -1 });
                data = Array.isArray(response.data) ? response.data : [];
                setSnipData(data as PostlistResponse["data"]);
            } else if (activeCategory === 4) {
                const response = await getUserSavedAudio({ limit: 4, pageNo: 1 });
                data = Array.isArray(response.data) ? response.data : [];
            } else if (activeCategory === 5) {
                const response = await getUserSavedFlix({ isForYou: 1, isLogin: 1, languageId: -1 });
                data = Array.isArray(response.data) ? response.data : [];
            }
            setPostData(data);
        } catch (error) {
setPostData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeCategory]);

    const handleCategoryClick = (id: number) => {
        setLoading(true)
        setActiveCategory(id);
    };

    const updatePost = (postId: number, property: string, isBeforeUpdate: number) => {
        if (postData !== null) {
            if (property === 'like') {
                setPostData(prev =>
                    prev!.map(post => {
                        if ('postId' in post && post.postId === postId && hasLikeCount(post)) {
                            return {
                                ...post,
                                isLiked: isBeforeUpdate ? 0 : 1,
                                likeCount: isBeforeUpdate ? post.likeCount - 1 : post.likeCount + 1
                            };
                        }
                        return post;
                    })
                );
            }
            else if (property === 'save') {
                setPostData(prev =>
                    prev!.map(post => {
                        if ('postId' in post && post.postId === postId && hasSaveCount(post)) {
                            return {
                                ...post,
                                isSaved: isBeforeUpdate ? 0 : 1,
                                saveCount: isBeforeUpdate ? post.saveCount - 1 : post.saveCount + 1
                            };
                        }
                        return post;
                    })
                );
            }
            else if (property === 'share') {
                setPostData(prev =>
                    prev!.map(post => {
                        if ('postId' in post && post.postId === postId && hasShareCount(post)) {
                            return {
                                ...post,
                                shareCount: post.shareCount + isBeforeUpdate
                            };
                        }
                        return post;
                    })
                );
            }
            else if (property === 'comment') {
                setPostData(prev =>
                    prev!.map(post => {
                        if ('postId' in post && post.postId === postId && hasCommentCount(post)) {
                            return {
                                ...post,
                                commentCount: post.commentCount + isBeforeUpdate   // isBeforeUpdate = -1 for deleting and 1 for sending comment
                            };
                        }
                        return post;
                    })
                );
            }
        }
    };

    const MoreOptions = ({ post, type }: { post: any, type: "flix" | "video" | "audio" | "image" }) => {
        const options = type === "audio" ? [
            { name: 'Unsave', icon: post.isSaved ? <FaBookmark /> : <FaRegBookmark /> },
            { name: "Cancel", icon: <IoCloseOutline /> }
        ] : [
            { name: 'Unsave', icon: post.isSaved ? <FaBookmark /> : <FaRegBookmark /> },
            { name: "Share", icon: <CiShare2 /> },
            { name: "Cancel", icon: <IoCloseOutline /> }
        ]

        const handleOptionClick = (option: string) => {
            switch (option) {
                case 'Unsave':
                    handleSave(type === "audio" ? post.audioId : post.postId, post.isSaved);

                    setOpenMoreOptions(null);
                    break;
                case 'Share':
                    setIsShareModalOpen(post.postId);
                    setOpenMoreOptions(null);
                    break;
                case 'Cancel':
                    setOpenMoreOptions(null);
                    break;
            }
        }

        const handleSave = async (postId: number, isSave: number) => {
            try {
                if (!postId) return;
                const res = type === 'flix' ? await saveOtherFlix({ postId, isSave }) : await saveOtherPost({ postId: postId.toString(), isSave })
                if (res.isSuccess) {
updatePost(postId, 'save', isSave);
                }
                fetchData();
            } catch (error) {
                console.error('Error liking the video:', error);
            }
        }

        return (
            <div className="absolute w-max bg-bg-color top-2 right-2 z-30 rounded-md shadow-sm">
                <ul className="text-sm">
                    {options.map((option, i) => {
                        return (
                            <li key={i}>
                                <button className="w-full text-left bg-bg-color hover:bg-primary-bg-color flex gap-3 items-center p-2 rounded-md" onClick={(e) => { e.stopPropagation(); handleOptionClick(option.name) }}>
                                    {option.icon}
                                    <p className="text-text-color text-sm">{option.name}</p>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

    const handlePostClick = (postId: number, type: "flix" | "video" | "audio" | "image") => {
        if (type === "flix") {
            clearFlixData();
            router.push(`/home/flix/${postId}`);
        }
        setOpenPost({ id: postId, type });
        if (type === "video") {
            const snip = snipData.find((item) => item.postId === postId) || null;
            const snipIndex = snipData.findIndex(snips => snips.postId === snip?.postId);
            setInAppSnipsData(snipData);
            setSnipIndex(snipIndex);
            router.push('/home/snips');
            setSelectedSnip(snip);
            setIsSnipsModalOpen(false);
        }
        if (type === "image") {
            const shot = shotData.find((item) => item.postId === postId) || null;
            setSelectedShot(shot);
        }
    }

    const handleClosePost = () => {
setTimeout(() => {
            setOpenPost(null);
            setSelectedSnip(null);
            setIsSnipsModalOpen(false);
        }, 0);
    }

    const renderPosts = () => {
        if (loading) {
            return <div className='text-center flex h-full w-full items-center justify-center'><ModerSpinner /></div>;
        }

        if (!postData || postData.length === 0) {
            return (
                <div className="text-center flex flex-col h-full w-full items-center justify-center">
                    {(() => {
                        const Icon = savedCategories.find(category => category.id === activeCategory)?.icon;
                        return Icon ? <Icon size={64} className="text-text-color" /> : null;
                    })()}

                    <p className="font-semibold text-lg">No favourites yet!</p>
                    <p className="flex items-center gap-1 font-light text-sm text-primary-text-color">
                        Click on <FaBookmark className="inline" /> button to collect
                    </p>
                    <p className="font-light text-sm text-primary-text-color">your favourites</p>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-3xl">
                {(postData as AllSavedData[]).map((post: AllSavedData, index) => {
                    let type: "flix" | "video" | "audio" | "image" | null = null;

                    if (activeCategory === 1) {
                        if (post.mediaType === 0) {
                            type = "image"
                        } else if (post.mediaType === 1) {
                            type = post.isForInteractiveVideo === 1 ? "video" : "flix"
                        } else if (post.mediaType === 2) {
                            type = "audio"
                        }
                    } else {
                        if (activeCategory === 2) {
                            type = "image"
                        } else if (activeCategory === 3) {
                            type = "video"
                        } else if (activeCategory === 4) {
                            type = "audio"
                        } else {
                            type = "flix"
                        }
                    }
                    

                    const imageSrc = type === "audio" ? post.audioCoverImage : post.coverFile;

                    if (!type) {
                        return (
                            <div className=" w-full aspect-square rounded-sm flex items-center justify-center" key={index}>
                                <p>Post not found</p>
                            </div>
                        )
                    };

                    return (
                        <div className={`relative w-full ${activeCategory === 5 ? "aspect-video" : "aspect-square"} rounded-sm`} onClick={() => {if(type){handlePostClick(post.postId, type)}}} key={index}>
                            <div className="w-full h-full">
                                <div className="w-full h-full relative">
                                <SafeImage
                                    onContextMenu={(e) => e.preventDefault()}
                                    src={imageSrc}
                                    videoUrl={post?.videoFile[0]}
                                    alt={`post-${index}`}
                                    className="w-full h-full object-cover rounded-md"
                                />
                                </div>
                                <div className="absolute top-0 left-0 p-2 bg-gradient-to-br from-bg-color to-transparent rounded-tl-md">
                                    {type === "audio" ? (
                                        <IoIosMusicalNotes className="text-2xl text-text-color" />
                                    ) : type === "video" ? (
                                        <FaPlay className="text-2xl text-text-color" />
                                    ) : type === "image" ? (
                                        <FaClipboard className="text-2xl text-text-color" />
                                    ) : type === "flix" && (
                                        <MdOutlineMovie className="text-2xl text-text-color" />
                                    )}
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-bg-color/0 hover:bg-bg-color/20 transition-all rounded-md md:opacity-0 md:hover:opacity-100">
                                <button
                                    className="absolute top-2 right-2 text-primary-text-color bg-bg-color/50 hover:bg-bg-color rounded-full px-1"
                                    onClick={(e) => { e.stopPropagation(); setOpenMoreOptions(post.postId) }}
                                >
                                    <FiMoreHorizontal className="text-2xl" />
                                </button>
                            </div>
                            {openMoreOptions === post.postId && <MoreOptions post={post} type={type} />}
                            {type === "video"
                                ? (openPost?.id === post.postId && isSnipsModalOpen && (
                                    <SnipsModal
                                        snips={snipData}
                                        selectedSnip={selectedSnip}
                                        onClose={handleClosePost}
                                        searchterm={""}
                                    />
                                ))
                                : type === "image" ? (
                                    openPost?.id === post.postId && (
                                        <ShotsModal
                                            post={shotData}
                                            selectedShot={selectedShot}
                                            onClose={handleClosePost}
                                            loadMorePosts={() => { }}
                                        />
                                    )
                                ) : (openPost?.id === post.postId && openPost?.type === 'audio' && (
                                    <SavedPostModal
                                        post={post}
                                        onClose={handleClosePost}
                                        updatePost={updatePost}
                                        type={type}
                                    />
                                ))}
                            {isShareModalOpen === post.postId && type !== "audio" && (
                                <SharePostModal
                                    data={post}
                                    onClose={() => setIsShareModalOpen(null)}
                                    postId={post.postId}
                                    updatePost={updatePost}
                                    isModal={true}
                                    type={type === "flix" ? 7 : 4}
                                // type for audio = 1, audio sharing to be added later
                                />)}
                        </div>
                    )

                })}
            </div>
        )
    };

    return (
        <div className='px-2 pt-2 max-md:pb-20'>
            <div className='flex flex-col md:flex-row justify-between px-2 md:px-4 py-2'>
                <div className='flex flex-col w-full items-center gap-4'>
                    <div className="overflow-x-auto whitespace-nowrap w-full max-w-lg">
                        <div className="flex justify-between p-1">
                            {savedCategories.map((category) => (
                                <Button
                                    key={category.id}
                                    isLinearBtn={activeCategory === category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    <category.icon size={20} className="mr-1" />
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {renderPosts()}
                </div>
                <div className='max-md:hidden pt-7'>
                    <Suggestion isfull={true} />
                </div>
            </div>
        </div>
    );
};

export default SavedPage;