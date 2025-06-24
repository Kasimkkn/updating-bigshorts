'use client';
import { IoChevronBack } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileData } from '@/types/usersTypes';
import useLocalStorage from '@/hooks/useLocalStorage';

export default function AboutUsPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [storedUserData] = useLocalStorage<any>('userData', {});

  // Handle copy username - only called client-side
  const handleCopyUsername = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(`${userData?.userName}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle email opening - only called client-side
  const handleOpenMail = () => {
    if (typeof window !== 'undefined') {
      window.location.href = 'mailto:support@bigshorts.co';
    }
  };

  // Client-side only initialization
  useEffect(() => {
    setIsMounted(true);

    // Use the storedUserData from the hook
    if (storedUserData && Object.keys(storedUserData).length > 0) {
      setUserData(storedUserData);
    }
  }, [storedUserData]);

  // If we haven't mounted yet, show a loading state that matches the final layout
  if (!isMounted) {
    return (
      <div className="min-h-screen p-8 relative" style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>
        {/* Static Back Button (non-functional during SSR) */}
        <div
          className="absolute top-8 left-8 z-10 rounded-full p-2"
          style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
        >
          <div className="w-6 h-6" />
        </div>

        {/* Page Title */}
        <h1 className="text-center text-3xl font-bold mt-16 mb-12">About Us</h1>

        {/* Loading Skeletons */}
        <div className="max-w-lg mx-auto space-y-8 px-4">
          {/* Email Section Skeleton */}
          <div className="rounded-lg p-6 animate-pulse" style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
            <p className="text-lg font-medium mb-2">Contact Us</p>
            <p className="text-sm opacity-70 mb-4">For more information please mail us at:</p>
            <div className="h-6 w-48 rounded bg-secondary-bg-color opacity-50" />
          </div>

          {/* Username Section Skeleton */}
          <div className="rounded-lg p-6 animate-pulse" style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
            <p className="text-lg font-medium mb-2">Username</p>
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 rounded bg-secondary-bg-color opacity-50" />
              <div className="h-10 w-20 rounded-lg bg-secondary-bg-color opacity-50" />
            </div>
          </div>

          {/* Terms and Policy Skeleton */}
          <div className="rounded-lg p-6 space-y-4 animate-pulse" style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
            <div className="h-6 w-32 rounded bg-secondary-bg-color opacity-50" />
            <div className="h-6 w-36 rounded bg-secondary-bg-color opacity-50" />
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            BigShorts
          </div>
        </div>
      </div>
    );
  }

  // Client-side rendered content
  return (
    <div className="min-h-screen p-8 relative" style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-8 left-8 z-10 rounded-full p-2 hover:bg-opacity-30 transition duration-300 ease-in-out"
        style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
      >
        <IoChevronBack className="text-2xl" />
      </button>

      {/* Page Title */}
      <h1 className="text-center text-3xl font-bold mt-16 mb-12">About Us</h1>

      {/* Contact Information */}
      <div className="max-w-lg mx-auto space-y-8 px-4">
        {/* Email Section */}
        <div className="rounded-lg p-6" style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
          <p className="text-lg font-medium mb-2">Contact Us</p>
          <p className="text-sm opacity-70 mb-4">For more information please mail us at:</p>
          <button
            onClick={handleOpenMail}
            className="font-medium hover:opacity-80 transition duration-300 ease-in-out"
            style={{ color: 'var(--primary)' }}
          >
            support@bigshorts.co
          </button>
        </div>

        {/* Username Section */}
        <div className="rounded-lg p-6" style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
          <p className="text-lg font-medium mb-2">Username</p>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">{userData?.userName || 'Loading...'}</span>
            <button
              onClick={handleCopyUsername}
              className="rounded-lg px-4 py-2 text-sm font-medium hover:opacity-80 transition duration-300 ease-in-out"
              style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Terms and Policy */}
        <div className="rounded-lg p-6 space-y-4" style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
          <a
            href="https://www.bigshorts.co/Home/Termsandconditions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-left block w-full hover:opacity-80 transition duration-300 ease-in-out"
            style={{ color: 'var(--primary)' }}
          >
            Terms of Use
          </a>
          <a
            href="https://www.bigshorts.co/Home/Privacy_Policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-left block w-full hover:opacity-80 transition duration-300 ease-in-out"
            style={{ color: 'var(--primary)' }}
          >
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          BigShorts
        </div>
      </div>
    </div>
  );
}