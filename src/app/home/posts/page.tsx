"use client"
import Posts from '@/components/posts/Posts'
import { useInAppRedirection } from '@/context/InAppRedirectionContext'
import { PostlistItem } from '@/models/postlistResponse'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const PostsPage = () => {
    const router = useRouter();
    const [postData, setPostData] = useState<PostlistItem[]>([])
    const { profilePostData } = useInAppRedirection()
    useEffect(() => {
        if (profilePostData && profilePostData.length > 0) {
            setPostData(profilePostData)
        } else {
            router.push('/home');
        }
    })
    return (
        <div className="flex flex-col md:flex-row justify-between px-2 md:px-4 py-2">
            <Posts postData={postData} loadMorePosts={() => { }} isFromSaved={false} isFromProfile={true} />
        </div>
    )
}

export default PostsPage