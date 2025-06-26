'use client';

import React, { useEffect, useRef, useState } from 'react';
import CommonModalLayer from '../modal/CommonModalLayer';
import Posts from '@/components/posts/Posts';
import { PostlistItem } from '@/models/postlistResponse';

interface ShotsModalProps {
  post: PostlistItem[];
  selectedShot: PostlistItem | null;
  onClose: () => void;
  loadMorePosts: () => void;
}

const ShotsModal = ({ post, selectedShot, onClose, loadMorePosts }: ShotsModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null); // Reference for the scrollable container
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isAnyPostExpanded, setIsAnyPostExpanded] = useState(false);

  // Define selectedIndex and selectedPostId regardless of whether selectedShot is null
  // This ensures hooks are called in the same order on every render
  const selectedIndex = selectedShot ? post.findIndex(p => p.postId === selectedShot.postId) : -1;
  const selectedPostId = selectedShot ? String(selectedShot.postId) : '';

  // Scroll to the selected post when the modal opens or the selectedShot changes
  useEffect(() => {
    // Only attempt to scroll if we have a valid selectedPostId
    if (selectedPostId) {
      const targetPost = document.getElementById(selectedPostId); // Find post by its ID
      if (targetPost) {
        targetPost.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        console.warn(`Post with ID ${selectedPostId} not found in the DOM.`);
      }
    }
  }, [selectedPostId]);

  // Handle the case where selectedShot is null
  if (!selectedShot) {
    return (
      <CommonModalLayer onClose={onClose} width="w-max" height="h-[80vh]">
        <div className="p-4 text-center">
          <p>No post selected. Please select a post to view details.</p>
        </div>
      </CommonModalLayer>
    );
  }

  // Dynamically determine modal class based on expansion state
  // Only apply expanded width on XL screens and make it double the original width
  const containerClass = `overflow-y-auto h-full p-4 transition-all duration-300 ${
    isAnyPostExpanded ? 'xl:w-[53rem]' : 'w-auto'
  }`;
  
  return (
    <CommonModalLayer
      width={isAnyPostExpanded ? 'xl:w-[54rem] w-max' : 'w-max'}
      height='h-[80vh]'
      onClose={onClose}
      hideCloseButton={false}
    >
      <div ref={containerRef} className={containerClass}>
        {post && (
          <Posts
            postData={post}
            loadMorePosts={loadMorePosts}
            index={selectedIndex}
            isFromSaved={true}
            isFromProfile={false}
            onPostExpansionChange={setIsAnyPostExpanded}
          />
        )}
      </div>
    </CommonModalLayer>
  );
};

export default ShotsModal;