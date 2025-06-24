"use client"
import Posts from '@/components/posts/Posts'
import { PostlistItem } from '@/models/postlistResponse'
import { getPostDetails } from '@/services/getpostdetails'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useInAppRedirection } from '@/context/InAppRedirectionContext'; // Import the context

// This component handles redirects to posts, with support for video/image type specification
const PostsPageRedirect = () => {
  const router = useRouter();
  const params = useParams();
  const { setInAppSnipsData, setSnipIndex } = useInAppRedirection();

  const postId = params?.postId || params?.id;
  const contentType = params?.type;

  const [postData, setPostData] = useState<PostlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redirectToSnips, setRedirectToSnips] = useState(false)

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // Ensure we have a postId to fetch
        if (!postId) {
          console.error('No post ID found in URL parameters');
          setError('Post not found');
          router.push('/home');
          return;
        }
// Extract the actual post ID if the URL contains a content type
        // For /video/123 or /image/123 formats, we need to get just the ID part
        const actualPostId = typeof postId === 'string' && postId.includes('/')
          ? postId.split('/').pop()
          : postId;

        // Make the API call to get post details
        const response = await getPostDetails(String(actualPostId));

        if (response.isSuccess && response.data && response.data.length > 0) {

          const isForInteractiveVideo = response.data.some(item => item.isForInteractiveVideo === 1);

          if (isForInteractiveVideo) {
const snips = response.data.filter((item: PostlistItem) => item.isForInteractiveVideo === 1);

            if (snips.length > 0) {
              setInAppSnipsData(snips);
              setSnipIndex(0);
              setRedirectToSnips(true);
            } else {
              setError('No interactive video content found');
            }
          } else {
            setPostData(response.data);
          }
        } else {
          console.error('API returned unsuccessful response:', response.message);
          setError('Failed to load post');
          router.push('/home');
        }
      } catch (error) {
        console.error('Failed to fetch post details:', error);
        setError('An error occurred while loading the post');
        router.push('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId, contentType, router, setInAppSnipsData, setSnipIndex]);

  // Handle redirect to snips page if needed
  useEffect(() => {
    if (redirectToSnips) {
      router.push('/home/snips');
    }
  }, [redirectToSnips, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Render the Posts component for regular posts
  return (
    <div className="flex flex-col md:flex-row justify-between px-2 md:px-4 py-2">
      <Posts
        postData={postData}
        loadMorePosts={() => { }}
        isFromSaved={false}
        isFromProfile={false}
      />
    </div>
  );
};

export default PostsPageRedirect;