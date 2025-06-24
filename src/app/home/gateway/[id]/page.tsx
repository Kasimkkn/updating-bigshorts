// app/home/gateway/page.tsx
"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ModerSpinner } from "@/components/LoadingSpinner";
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import { getFlixDetails } from "@/services/getflixdetails";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function FlixGateway() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setInAppFlixData, clearFlixData } = useInAppRedirection();
  const [storedUserId] = useLocalStorage<string>('userId', '0');

  const handleFlixNavigation = useCallback(async (flixId: number) => {
    try {
      const userId = parseInt(storedUserId);
      const response = await getFlixDetails(flixId, userId);
      if (response.isSuccess && response.data) {
        // Set data in context for the component to use
        clearFlixData();
        setInAppFlixData({
          postId: response.data[0].postId,
          postTitle: response.data[0].postTitle,
          userFullName: response.data[0].userFullName,
          coverFile: response.data[0].coverFile,
          userProfileImage: response.data[0].userProfileImage,
          userId: response.data[0].userId,
          viewCounts: response.data[0].viewCounts,
          scheduleTime: response.data[0].scheduleTime,
          isLiked: response.data[0].isLiked,
          likeCount: response.data[0].likeCount,
          isSaved: response.data[0].isSaved,
          saveCount: response.data[0].saveCount,
        });
        // Navigate to flix page with data
        router.replace(`/home/flix/${flixId}`);
      } else {
        setError("Flix not found or access denied");
        router.replace('/home/trending');
      }
    } catch (error) {
      console.error("Error fetching flix details:", error);
      router.replace('/home/trending');
    }
  }, [storedUserId, clearFlixData, setInAppFlixData, router]);
  
  // Add handleFlixNavigation to the useEffect dependency array
  useEffect(() => {
    async function processFlixRoute() {
      try {
        // Extract flix ID from the URL
        // Expected format: /home/gateway/flix/123 or /gateway/123
        const pathParts = pathname?.split('/').filter(Boolean) || [];
        let flixId: number | null = null;
        
        // Find the flixId in the URL
        // It should be the last part of the URL or after "flix" if present
        const flixIndex = pathParts.indexOf("flix");
        
        if (flixIndex !== -1 && flixIndex + 1 < pathParts.length) {
          // If "flix" is in the path, get the next segment
          flixId = parseInt(pathParts[flixIndex + 1]);
        } else if (pathParts.length > 0) {
          // Otherwise, assume the last segment is the ID
          flixId = parseInt(pathParts[pathParts.length - 1]);
        }
        
        if (!flixId || isNaN(flixId)) {
          console.error("Invalid flix ID:", pathParts);
          setError("Invalid flix ID");
          router.replace('/home/trending');
          return;
        }
        
        // Now fetch the flix details and handle navigation
        await handleFlixNavigation(flixId);
      } catch (error) {
        console.error("Error in gateway:", error);
        setError("Failed to load content");
        router.replace('/home/trending');
      } finally {
        setLoading(false);
      }
    }
  
    processFlixRoute();
  }, [pathname, router, setInAppFlixData, clearFlixData, handleFlixNavigation]);

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <ModerSpinner />
      </div>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // This should generally not be seen as we should have redirected by now
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <p>Redirecting to Flix...</p>
    </div>
  );
}