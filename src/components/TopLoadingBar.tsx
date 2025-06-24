// components/progressBar/TopLoadingBar.tsx
"use client";
import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import Image from "next/image";
import logo from '@/assets/logo.svg';
import SafeImage from "./shared/SafeImage";

interface TopLoadingBarRef {
  completeProgress: () => void;
}

interface TopLoadingBarProps {
  onComplete?: () => void;
}

const TopLoadingBar = forwardRef<TopLoadingBarRef, TopLoadingBarProps>(({ onComplete }, ref) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
// Method to complete the progress bar (call this when your response comes)
  const completeProgress = () => {
setProgress(100);
    setIsComplete(true);
    // Call the onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
    // Reset after 1 second of showing complete state
    setTimeout(() => {
      setProgress(0);
      setIsComplete(false);
    }, 1000);
  };

  // Expose the complete method via ref
  useImperativeHandle(ref, () => ({
    completeProgress
  }));

  // Expose the complete method globally (optional)
  useEffect(() => {
    // You can access this method globally if needed
    (window as any).completeTopLoadingBar = completeProgress;
    return () => {
      delete (window as any).completeTopLoadingBar;
    };
  }, []);

  useEffect(() => {
let interval: NodeJS.Timeout;

    // Start progress animation immediately
    setProgress(0);
    setIsComplete(false);

    // Update progress by 1% every second (1000ms)
    interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
// Stop at 99% and wait for manual completion
        if (newProgress >= 99) {
clearInterval(interval);
          return 99;
        }
        return newProgress;
      });
    }, 1000); // 1000ms = 1 second

    return () => {
if (interval) clearInterval(interval);

      // Complete immediately on unmount
      setProgress(100);
      setIsComplete(true);

      setTimeout(() => {
        setProgress(0);
        setIsComplete(false);
      }, 300);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* Main Progress Container */}
      <div
        className="relative w-full"
        style={{
          height: '6px',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 99999
        }}
      >
        {/* Progress Bar */}
        <div
          className={`h-full transition-all duration-500 ease-out relative overflow-hidden ${isComplete
            ? 'bg-gradient-to-r from-green-400 to-green-600'
            : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
            }`}
          style={{
            width: `${progress}%`,
            boxShadow: isComplete
              ? '0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3)'
              : '0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
          }}
        >
          {/* Animated shimmer effect */}
          {!isComplete && (
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                animation: 'shimmer 2s infinite ease-in-out',
              }}
            />
          )}

          {/* Gradient overlay for depth */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)'
            }}
          />
        </div>
      </div>

      {/* Logo and Status Bar */}
      <div
        className="absolute top-0 left-0 flex items-center px-4 py-2"
        style={{
          height: '50px',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
          backdropFilter: 'blur(20px)',
          borderRadius: '0 0 16px 0',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: 'none',
          borderLeft: 'none',
          zIndex: 100000
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={logo.src}
              alt="Logo"
              width={24}
              height={24}
              className={`transition-all duration-300 ${isComplete ? 'animate-bounce' : 'animate-pulse'
                }`}
            />
            {/* Glow effect around logo */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${isComplete
                ? 'shadow-[0_0_20px_rgba(34,197,94,0.8)]'
                : 'shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                }`}
            />
          </div>

          {/* Status Text */}
          <div className="flex flex-col">
            <span className="text-primary-text-color text-sm font-medium">
              {isComplete ? 'Completed!' : 'Content is being uploaded'}
            </span>
            <span className="text-gray-300 text-xs">
              {Math.round(progress)}% • {isComplete ? 'Done' : 'Please wait'}
            </span>
          </div>
        </div>

        {/* Spinning indicator */}
        {!isComplete && (
          <div
            className="ml-4 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          />
        )}

        {/* Success checkmark */}
        {isComplete && (
          <div className="ml-4 w-4 h-4 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-400 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Progress Waves Animation */}
      {!isComplete && (
        <div
          className="absolute top-0 left-0 w-full h-[6px] opacity-30 overflow-hidden"
          style={{ zIndex: 99998 }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              width: '30%',
              animation: 'wave 3s ease-in-out infinite',
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { 
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% { 
            transform: translateX(200%);
            opacity: 0;
          }
        }
        
        @keyframes wave {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
});

TopLoadingBar.displayName = 'TopLoadingBar';

export default TopLoadingBar;

// You can also export the complete function separately if needed
export const completeTopLoadingBar = () => {
  if ((window as any).completeTopLoadingBar) {
    (window as any).completeTopLoadingBar();
  }
};