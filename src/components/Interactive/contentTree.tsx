// components/ContentTree/ContentTree.tsx
import useLocalStorage from '@/hooks/useLocalStorage';
import { getPostDetails } from '@/services/getpostdetails';
import React, { useEffect, useState, useMemo } from 'react';
import SafeImage from '../shared/SafeImage';

interface VideoNode {
  id: number;
  parent_id: number;
  path: string;
  duration: string;
  functionality_datas?: any;
}

// Extended type for nodes with children
interface VideoNodeWithChildren extends VideoNode {
  children: VideoNodeWithChildren[];
}

interface ContentTreeProps {
  postId: number;
  onClose: () => void;
}

const ContentTree = ({ postId, onClose }: ContentTreeProps) => {
  const [postData, setPostData] = useState<any | null>(null);
  const [interactiveVideos, setInteractiveVideos] = useState<VideoNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [storedUserId] = useLocalStorage<string>('userId', '');

  // Helper function to extract thumbnail from video path
  const getThumbnailFromPath = (path: string): string => {
    if (!path) return "/api/placeholder/100/80";

    const thumbnailPath = path.replace('hls/master.m3u8', 'Thumbnail.jpg.webp');
return thumbnailPath;
  };

  // Helper function to extract linked IDs from a video node
  const getLinkedIds = (video: VideoNode) => {
    if (!video || !video.functionality_datas || !video.functionality_datas.list_of_buttons) {
      return { linkedFlixId: null, linkedPostId: null };
    }

    let linkedFlixId = null;
    let linkedPostId = null;

    const buttons = video.functionality_datas.list_of_buttons;
    for (const button of buttons) {
      if (button.on_action) {
        if (button.on_action.linked_flix_id) {
          linkedFlixId = button.on_action.linked_flix_id;
        }
        if (button.on_action.linked_post_id) {
          linkedPostId = button.on_action.linked_post_id;
        }
      }
    }

    return { linkedFlixId, linkedPostId };
  };

  // Memoized calculations for better performance
  const { rootVideo, level1Children } = useMemo(() => {
    const root = interactiveVideos.find(video => video.parent_id === -1);
    const children = root
      ? interactiveVideos.filter(video => video.parent_id === root.id)
      : [];

    return { rootVideo: root, level1Children: children };
  }, [interactiveVideos]);

  // Function to find level 2 children
  const getLevel2Children = (parentId: number): VideoNode[] => {
    return interactiveVideos.filter(video => video.parent_id === parentId);
  };

  // Fetch the post data when the component mounts
  useEffect(() => {
    const fetchInitialPost = async () => {
      if (!postId || !storedUserId) return;

      try {
        setLoading(true);
        setError(null);

        const parsedUserId = parseInt(storedUserId);
        if (isNaN(parsedUserId)) {
          throw new Error('Invalid userId');
        }

        const res = await getPostDetails(postId.toString());
        if (res.isSuccess && res.data) {
          setPostData(res.data[0]);

          if (res.data[0].interactiveVideo) {
            try {
              const interactiveVideo = typeof res.data[0].interactiveVideo === 'string'
                ? JSON.parse(res.data[0].interactiveVideo)
                : res.data[0].interactiveVideo;
              setInteractiveVideos(Array.isArray(interactiveVideo) ? interactiveVideo : []);
            } catch (jsonError) {
              console.error("Error parsing interactive video data:", jsonError);
              throw new Error('Failed to parse interactive video data');
            }
          }
        } else {
          throw new Error(res.message || 'Data not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPost();
  }, [postId, storedUserId]);

  // Common style for 9:16 aspect ratio
  const imageStyle = {
    aspectRatio: '9/16',
    objectFit: 'cover' as 'cover',
    width: '100%',
    height: '100%'
  };

  // Component for rendering linked content (Post or Flix)
  const LinkedContent = ({ linkedIds, size }: { linkedIds: any, size: 'large' | 'medium' | 'small' }) => {
    const sizeClasses = {
      large: { container: 'w-24 h-44', text: 'text-sm' },
      medium: { container: 'w-20 h-36', text: 'text-xs' },
      small: { container: 'w-16 h-28', text: 'text-xs' }
    };

    const currentSize = sizeClasses[size];

    return (
      <>
        {linkedIds.linkedPostId && (
          <>
            <div className="h-6 w-1 bg-blue-400"></div>
            <div className="bg-purple-600 p-2 rounded-md mb-2">
              <div className={currentSize.container} style={{ aspectRatio: '9/16' }}>
                <div className={`w-full h-full flex items-center justify-center text-text-color ${currentSize.text}`}>
                  existing snip
                </div>
              </div>
            </div>
          </>
        )}

        {linkedIds.linkedFlixId && (
          <>
            <div className="h-6 w-1 bg-blue-400"></div>
            <div className="bg-indigo-600 p-2 rounded-md mb-2">
              <div className={currentSize.container} style={{ aspectRatio: '9/16' }}>
                <div className={`w-full h-full flex items-center justify-center text-text-color ${currentSize.text}`}>
                  existing mini
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  // Component for rendering video node with linked content
  const VideoNode = ({ video, size, label }: { video: VideoNode, size: 'large' | 'medium' | 'small', label: string }) => {
    const sizeClasses = {
      large: 'w-24 h-44',
      medium: 'w-20 h-36',
      small: 'w-16 h-28'
    };

    const linkedIds = getLinkedIds(video);

    return (
      <div className="flex flex-col items-center">
        <div className="bg-primary-bg-color p-2 rounded-md mb-2">
          <div className={sizeClasses[size]}>
            <SafeImage
              src={size === 'large' && postData?.coverFile ? postData.coverFile : getThumbnailFromPath(video.path)}
              alt={label}
              className="rounded"
              style={imageStyle}
            />
          </div>
        </div>
        <LinkedContent linkedIds={linkedIds} size={size} />
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg-color/70 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-text-color"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-bg-color/70 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-bg-color rounded-lg w-[90%] max-w-lg p-6 relative max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-text-color text-2xl font-bold">Error</h2>
            <button onClick={onClose} className="text-text-color text-3xl hover:text-red-400 transition-colors">×</button>
          </div>
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  // No data state
  if (!rootVideo) {
    return (
      <div className="fixed inset-0 bg-bg-color/70 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-bg-color rounded-lg w-[90%] max-w-lg p-6 relative max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-text-color text-2xl font-bold">Content Tree</h2>
            <button onClick={onClose} className="text-text-color text-3xl hover:text-red-400 transition-colors">×</button>
          </div>
          <div className="text-center text-gray-400">No interactive video data found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-bg-color/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-bg-color rounded-lg w-[90%] max-w-lg p-6 relative max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-text-color text-2xl font-bold">Content Tree</h2>
          <button onClick={onClose} className="text-text-color text-3xl hover:text-red-400 transition-colors">×</button>
        </div>

        {/* Content Tree Visualization */}
        <div className="flex flex-col items-center p-4 pb-8">
          {/* Root node */}
          <VideoNode video={rootVideo} size="large" label="Main Video" />

          {level1Children.length > 0 && (
            <>
              {/* Connecting line from root to level 1 */}
              <div className="h-10 w-1 bg-blue-400"></div>

              {/* Conditional horizontal line - only show if more than one child */}
              {level1Children.length > 1 && (
                <div className="w-64 h-1 bg-blue-400 mb-4"></div>
              )}

              {/* Level 1 nodes */}
              <div className={`flex justify-center w-full ${level1Children.length > 1 ? 'gap-8' : ''}`}>
                {level1Children.map((child, index) => (
                  <div key={child.id} className="flex flex-col items-center">
                    <VideoNode video={child} size="medium" label={`Level 1 Video ${index + 1}`} />

                    {/* Level 2 children for this node */}
                    {(() => {
                      const level2Children = getLevel2Children(child.id);
                      if (level2Children.length > 0) {
                        return (
                          <>
                            <div className="h-10 w-1 bg-blue-400"></div>

                            {/* Conditional horizontal line for level 2 - only show if more than one child */}
                            {level2Children.length > 1 && (
                              <div className="w-36 h-1 bg-blue-400 mb-4"></div>
                            )}

                            <div className={`flex justify-center w-full ${level2Children.length > 1 ? 'gap-4' : ''}`}>
                              {level2Children.map((grandChild, gIndex) => (
                                <VideoNode
                                  key={grandChild.id}
                                  video={grandChild}
                                  size="small"
                                  label={`Level 2 Video ${gIndex + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentTree;