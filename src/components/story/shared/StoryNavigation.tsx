import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface StoryNavigationProps {
    onPrevious: () => void;
    onNext: () => void;
}

export const StoryNavigation: React.FC<StoryNavigationProps> = ({
    onPrevious,
    onNext
}) => {
    return (
        <div className="absolute top-1/2 left-0 right-0 flex justify-between z-40">
            <button
                className="relative right-6 sm:right-10 text-text-color bg-secondary-bg-color opacity-70 rounded-full z-50 p-2 max-sm:p-3 max-sm:right-4"
                onClick={onPrevious}
            >
                <FaChevronLeft className="max-sm:text-lg" />
            </button>
            <button
                className="relative left-6 sm:left-10 text-text-color bg-secondary-bg-color opacity-70 rounded-full z-50 p-2 max-sm:p-3 max-sm:left-4"
                onClick={onNext}
            >
                <FaChevronRight className="max-sm:text-lg" />
            </button>
        </div>
    );
};

