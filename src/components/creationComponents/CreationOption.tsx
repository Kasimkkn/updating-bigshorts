import CommonModalLayer from '@/components/modal/CommonModalLayer';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import React, { useState } from 'react';
import { FaImage } from 'react-icons/fa';
import { GoDeviceCameraVideo } from 'react-icons/go';
import { PiFilmReelFill } from 'react-icons/pi';
import MobileAppModal from '../modal/MobileAppModal';
import Button from '../shared/Button';

interface CreationOptionProps {
  onClose: () => void;
  setCreatePost: (value: boolean) => void;
  setCreateSsup: (value: boolean) => void;
  setCreateSnip: (value: boolean) => void;
  setCreateFlix: (value: boolean) => void;
}

const CreationOption: React.FC<CreationOptionProps> = ({
  onClose,
  setCreatePost,
  setCreateSsup,
  setCreateSnip,
  setCreateFlix,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const { isMobile, deviceType } = useMobileDetection();
  const forceClose = () => {
    const modalElement = document.querySelector('.modal-backdrop');
    if (modalElement) {
      modalElement.remove();
    }
    onClose();
  };

  const handleSelection = (optionName: string, callback: () => void) => {
    setSelectedOption(optionName);

    if (isMobile) {
      setSelectedContentType(optionName);
      setShowMobileModal(true);
    } else {
      callback();
    }
  };

  const handleMobileModalClose = () => {
    setShowMobileModal(false);
    setSelectedOption(null);
    setSelectedContentType('');
  };

  const handlePostCreation = () => handleSelection('Shot', () => setCreatePost(true));
  const handleSnipCreation = () => handleSelection('Snip', () => setCreateSnip(true));
  const handleFlixCreation = () => handleSelection('Mini', () => setCreateFlix(true));

  const creationOptions = [
    {
      name: 'Mini',
      description: 'Short video stories',
      icon: <PiFilmReelFill className="w-7 h-7" />,
      onClick: handleFlixCreation,
      gradient: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/25',
      hoverShadow: 'hover:shadow-blue-500/40'
    },
    {
      name: 'Snip',
      description: 'Quick video clips',
      icon: <GoDeviceCameraVideo className="w-7 h-7" />,
      onClick: handleSnipCreation,
      gradient: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-500/25',
      hoverShadow: 'hover:shadow-purple-500/40'
    },
    {
      name: 'Shot',
      description: 'Photo and image posts',
      icon: <FaImage className="w-7 h-7" />,
      onClick: handlePostCreation,
      gradient: 'from-green-500 to-green-600',
      shadowColor: 'shadow-green-500/25',
      hoverShadow: 'hover:shadow-green-500/40'
    }
  ];

  // If mobile modal is open, show it instead
  if (showMobileModal) {
    return (
      <MobileAppModal
        onClose={handleMobileModalClose}
        deviceType={deviceType}
        contentType={selectedContentType}
      />
    );
  }

  return (
    <CommonModalLayer onClose={onClose} isModal={false} height="h-max" hideCloseButtonOnMobile={true}>
      <div className="w-full bg-bg-color rounded-3xl shadow-2xl max-w-lg mx-auto backdrop-blur-xl border border-border-color ">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-b-border-color ">
          <h2 className="text-2xl font-semibold text-text-color  mb-2">
            Create New Content
          </h2>
          <p className="text-primary-text-color text-sm font-medium">
            {isMobile ? 'Download our app for the best creation experience' : 'Choose your creative canvas'}
          </p>
        </div>

        {/* Content Options */}
        <div className="p-8">
          <div className="space-y-4">
            {creationOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.onClick}
                disabled={selectedOption !== null}
                className={`
                  group relative w-full p-5 rounded-2xl border border-border-color 
                  bg-bg-color hover:bg-primary-bg-color
                  transition-all duration-300 ease-out
                  hover:shadow-lg hover:shadow-border-color 
                  hover:-translate-y-1 active:scale-[0.98]
                  focus:outline-none focus:ring-0 
                  cursor-pointer
                `}
                aria-label={`Create ${option.name}`}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon Container */}
                  <div className={`
                    relative flex items-center justify-center w-14 h-14 rounded-2xl
                    bg-gradient-to-br ${option.gradient} text-text-color
                    shadow-lg ${option.shadowColor} group-hover:${option.hoverShadow}
                    transition-all duration-300 group-hover:scale-105
                    ${selectedOption === option.name ? 'scale-105' : ''}
                  `}>
                    {option.icon}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-text-color mb-1 ">
                      {option.name}
                    </h3>
                    <p className="text-sm text-primary-text-color">
                      {option.description}
                    </p>
                  </div>

                  {/* Arrow indicator or Mobile badge */}
                  <div className="text-primary-text-color transition-all duration-300 group-hover:translate-x-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-5 pt-4 flex justify-center border-t border-t-border-color">
          <Button
            onClick={forceClose}
            disabled={selectedOption !== null}
            className='w-full'
          >
            Cancel
          </Button>
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default CreationOption;