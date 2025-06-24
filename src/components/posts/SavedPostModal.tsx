import { AllSavedData, ImageSaved, MusicSaved, VideoSaved } from '@/types/savedTypes'
import React, { useState } from 'react'
import CommonModalLayer from '../modal/CommonModalLayer'
import AudioPost from './AudioPost'
import ImagePost from './ImagePost'
import VideoPost from './VideoPost'
import Image from 'next/image'
import useUserRedirection from '@/utils/userRedirection'
import { useInAppRedirection } from '@/context/InAppRedirectionContext'
import { useRouter } from "next/navigation";
import { PostlistItem } from '@/models/postlistResponse'
import Avatar from '../Avatar/Avatar'
import { timeAgo } from '@/utils/features'
import Button from '../shared/Button'
import SafeImage from '../shared/SafeImage'

interface SavedPostModalProps {
    post: AllSavedData,
    onClose: () => void,
    updatePost: (postId: number, property: string, isBeforeUpdate: number) => void,
    type: "flix" | "video" | "audio" | "image"
}


const SavedPostModal = ({ post, onClose, updatePost, type }: SavedPostModalProps) => {
    const redirectUser = useUserRedirection();
    const { setInAppFlixData, clearFlixData } = useInAppRedirection();
    const router = useRouter();
    const [isImagePostExpanded, setIsImagePostExpanded] = useState(false);

    const redirectToFlix = (flixData: PostlistItem) => {
        clearFlixData();
        setInAppFlixData(flixData);
        router.push(`/home/flix/${flixData.postId}`);
    }

    return (
        <CommonModalLayer
            width='w-max'
            height='h-max'
            onClose={onClose}
            hideCloseButton={isImagePostExpanded}
        >
            <div>
                {type === "audio" ? (
                    <AudioPost key={post.audioId} post={post as MusicSaved} />
                ) : type === "image" ? (
                    <ImagePost key={post.postId} post={post as unknown as ImageSaved} updatePost={updatePost} onExpandChange={setIsImagePostExpanded} />
                ) : type === "video" ? (
                    <VideoPost key={post.postId} post={post as unknown as VideoSaved} updatePost={updatePost} onExpandChange={setIsImagePostExpanded} />
                ) : type === "flix" && (
                    <div
                        className="shadow-md shadow-shadow-color rounded-md w-[95vw] max-w-lg bg-bg-color"
                    >
                        <div className="relative w-full aspect-video rounded-md">
                        <SafeImage
                        src={post.coverFile}
                        alt={post.postTitle}
                        className="w-full h-full object-cover rounded-md"
                        />

                            <Button className="absolute top-2 left-2" onClick={() => redirectToFlix(post as unknown as PostlistItem)} isLinearBtn={true}>
                                Watch
                            </Button>
                        </div>
                        <div className="p-2 text-text-color">
                            <div className="flex">
                                <button
                                    onClick={() => {
                                        redirectUser(post.userId, `/home/users/${post.userId}`)
                                    }}
                                    className="w-max"
                                >
                                    <Avatar src={post.userProfileImage} name={post.userFullName} />
                                </button>
                                <div className="flex justify-between w-[calc(100%-40px)] items-start relative px-2"> {/* Subtracting width of avatar */}
                                    <div className="flex flex-col w-full">
                                        <h2 className="text-sm font-semibold mb-2 truncate break-words">
                                            {post.postTitle}
                                        </h2>
                                        <div className="flex justify-between w-full">
                                            <p className="text-xs truncate]">{post.userFullName}</p>
                                            <p className="text-xs whitespace-nowrap">
                                                {post.viewCounts} Views · {timeAgo(post.scheduleTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CommonModalLayer>
    )
}

export default SavedPostModal