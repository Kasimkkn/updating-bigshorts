'use client';

import React, { useEffect, useRef } from 'react';
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

  return (
    <CommonModalLayer
      width='w-max'
      height='h-[80vh]'
      onClose={onClose}
      hideCloseButton={false}
    >
      <div ref={containerRef} className="overflow-y-auto h-full p-4">
        {post && (
          <Posts
            postData={post}
            loadMorePosts={loadMorePosts}
            index={selectedIndex}
            isFromSaved={true}
            isFromProfile={false}
          />
        )}
      </div>
    </CommonModalLayer>
  );
};

export default ShotsModal;