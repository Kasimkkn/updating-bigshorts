"use client";
import SafeImage from '@/components/shared/SafeImage';
import { HashtagPageSkeleton } from '@/components/Skeletons/Skeletons';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { discoverhashtag, Hashtag } from '@/services/discoverhashtag';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HashtagPage() {
  // Get params using the useParams hook instead of receiving them as props
  const params = useParams();
  const hashTagId = params!.id;
  // Move ALL hook calls to the top level - this is the key fix
  const [hashtagData, setHashtagData] = useState<Hashtag | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {
    setInAppSnipsData,
    setSnipIndex,
  } = useInAppRedirection();

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        // Suppose this is how you're calling discoverhashtag
        const id = Array.isArray(hashTagId) ? hashTagId[0] : hashTagId;
        const numericId = parseInt(id); // safely parse string to number
        if (isNaN(numericId)) {
          throw new Error('Invalid hashtag ID');
        }
        const data = await discoverhashtag({ hashTagId: numericId });
        setHashtagData(data);
      } catch (err) {
        console.error(err);
        setHashtagData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [hashTagId]); // Add hashTagId as dependency// No dependencies since we're using a hardcoded value

  const handleCardClick = (index: number) => {
    if (!hashtagData?.postList) return;
    setInAppSnipsData(hashtagData.postList);
    setSnipIndex(index);
    router.push('/home/snips');
  };

  return (
    <div className="min-h-screen px-4 py-6">
      {loading ? (
        <HashtagPageSkeleton />
      ) : hashtagData?.postList?.length ? (
        <>
          {/* Header */}
          <h2 className="text-xl font-semibold text-center text-primary-text-color mb-6">
            {hashtagData.hashName}
          </h2>
          {/* Posts Grid (Vertical scroll, 3 cards per row) */}
          <div className="w-[600px] mx-auto flex flex-wrap gap-4 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            {hashtagData.postList.map((post, index) => (
              <div
                key={post.postId}
                onClick={() => handleCardClick(index)}
                className="w-[180px] h-[300px] border border-border-color hover:shadow-md transition-shadow duration-200 cursor-pointer rounded overflow-hidden"
              >
                <div className="relative w-full h-full bg-secondary-bg-color">
                  {post.coverFile ? (
                    <SafeImage
                      src={post.coverFile}
                      alt={post.postTitle}
                      videoUrl={post.videoFile[0]}
                      className="w-full h-full object-cover"
                   />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-text-light">No Image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 text-primary-text-color p-2 bg-bg-color/40">
                    <h3 className="text-sm font-medium line-clamp-1">{post.postTitle}</h3>
                    <p className="text-xs">{post.userName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-4 px-6">
          <p className="text-primary-text-color">No results found.</p>
        </div>
      )}
    </div>
  );
}