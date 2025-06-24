import Image from 'next/image';
import React from 'react';
import SafeImage from './shared/SafeImage';
export const LoadingSpinner: React.FC = () => {
  return (
    <div className='flex gap-1 justify-center items-center h-max '>
      <span className='sr-only text-text-color'>Loading...</span>
      <div className='h-2 w-2 bg-text-color rounded-full animate-bounce [animation-delay:-0.3s]'></div>
      <div className='h-2 w-2 bg-text-color rounded-full animate-bounce [animation-delay:-0.15s]'></div>
      <div className='h-2 w-2 bg-text-color rounded-full animate-bounce'></div>
    </div>
  );
};

export const LoadingSpinnerWithText = ({ width, height }: { width: string, height: string }) => {
  return (
    <>
      <div aria-label="Loading..." role="status" className="flex items-center space-x-2">
        <svg className={`${width} ${height} animate-spin stroke-gray-900`} viewBox="0 0 256 256">
          <line x1="128" y1="32" x2="128" y2="64" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
          <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="24"></line>
          <line x1="224" y1="128" x2="192" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
          </line>
          <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="24"></line>
          <line x1="128" y1="224" x2="128" y2="192" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
          </line>
          <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="24"></line>
          <line x1="32" y1="128" x2="64" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
          <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
          </line>
        </svg>
      </div>
    </>
  )
}

export const ModerSpinner: React.FC = () => {
  return (
    <>
      <SafeImage
        width={50}
        height={50}
        className="w-6 h-6 animate-spin" src="https://www.svgrepo.com/show/448500/loading.svg" alt="Loading icon" />
    </>
  )
}

export const SkeletonImageLoader = () => {
  return (
    <div className="animate-pulse bg-primary-bg-color w-full h-full">
      <div className="aspect-w-16 aspect-h-9">
        <div className="w-full h-full"></div>
      </div>
    </div>
  )
}