import React, { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface CommonModalLayerProps {
    children: React.ReactNode;
    onClose?: () => void;
    width?: string;
    height?: string;
    isModal?: boolean;
    bgColor?: string;
    isThemeSelectionOpen?: boolean;
    hideCloseButton?: boolean;
    hideCloseButtonOnMobile?: boolean;
}

const CommonModalLayer: FC<PropsWithChildren<CommonModalLayerProps>> = ({
    children,
    onClose,
    width,
    height,
    isModal = true,
    bgColor = 'bg-primary-bg-color',
    isThemeSelectionOpen = false,
    hideCloseButton = false,
    hideCloseButtonOnMobile = false
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLButtonElement>(null);
    const [dragStartY, setDragStartY] = useState<number>(0);
    const [dragCurrentY, setDragCurrentY] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [translateY, setTranslateY] = useState<number>(0);
    const [dragStartTime, setDragStartTime] = useState<number>(0);

    useEffect(() => {
        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Prevent background scrolling
        document.body.style.overflow = 'hidden';

        // Compensate for scrollbar
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Cleanup function
        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = ''; // Reset padding
        };
    }, []);

    useEffect(() => {
        const node = dragHandleRef.current;
        if (!node) return;

        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            setDragStartY(touch.clientY);
            setDragStartTime(Date.now());
            setIsDragging(true);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            const deltaY = touch.clientY - dragStartY;
            if (deltaY > 0) {
                setDragCurrentY(touch.clientY);
                setTranslateY(deltaY);
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            if (!isDragging) return;
            const deltaY = dragCurrentY - dragStartY;
            const dragDuration = Date.now() - dragStartTime;
            const velocity = deltaY / dragDuration;
            const threshold = 50;
            const velocityThreshold = 0.5;

            if (deltaY > threshold || velocity > velocityThreshold) {
                onClose?.();
            } else {
                setTranslateY(0);
            }

            setIsDragging(false);
            setDragStartY(0);
            setDragCurrentY(0);
            setDragStartTime(0);
        };

        node.addEventListener('touchstart', handleTouchStart, { passive: false });
        node.addEventListener('touchmove', handleTouchMove, { passive: false });
        node.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            node.removeEventListener('touchstart', handleTouchStart);
            node.removeEventListener('touchmove', handleTouchMove);
            node.removeEventListener('touchend', handleTouchEnd);
        };
    }, [dragHandleRef, isDragging, dragStartY, dragCurrentY, dragStartTime, onClose]);


    // Mouse event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setDragStartY(e.clientY);
        setDragStartTime(Date.now());
        setIsDragging(true);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Only close if not dragging and click is on backdrop
        if (!isDragging) {
            onClose?.();
        }
    };

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.target === modalRef.current && !isDragging) {
            onClose?.();
        }
    };

    const handleDragHandleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDragging) {
            onClose?.();
        }
    };

    return (
        <div
            className={`fixed inset-0 ${isThemeSelectionOpen ? '' : 'backdrop-blur-[2px]'} flex items-center justify-center z-[100]`}
            ref={modalRef}
            onClick={handleBackdropClick}
        >
            {isModal ? (
                <div
                    onClick={handleContentClick}
                    className={`${width || 'max-w-4xl'} w-full relative flex items-center justify-center ${bgColor} rounded-lg ${height || 'h-96'}`}
                >
                    {children}
                    {!hideCloseButton && onClose && (
                        <button
                            onClick={onClose}
                            className="absolute z-50 -top-4 right-0 md:-right-4 p-2 rounded-full bg-secondary-bg-color focus:outline-none hover:rotate-90 transition-all cursor-pointer"
                        >
                            <IoClose className='text-xl text-text-color' />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    onClick={handleContentClick}
                    className='relative w-full h-full flex flex-col items-center md:justify-center justify-end'
                >
                    <div
                        className={`rounded-t-xl relative flex w-full flex-col justify-center items-center z-100 ${hideCloseButtonOnMobile ? ' max-h-[74%]' : 'h-full'}`}
                        style={{
                            transform: `translateY(${translateY}px)`,
                            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                        }}
                    >
                        <button
                            ref={dragHandleRef}
                            onClick={handleDragHandleClick}
                            className="md:hidden w-full flex justify-center cursor-grab active:cursor-grabbing touch-none"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="w-12 h-[5px] bg-text-color rounded-full" />
                        </button>
                        {children}
                    </div>
                    {!hideCloseButton && onClose && (
                        <button
                            onClick={onClose}
                            className={`${hideCloseButtonOnMobile && 'max-md:hidden'} absolute top-2 z-50 right-2 p-2 rounded-full bg-secondary-bg-color focus:outline-none hover:rotate-90 transition-all cursor-pointer`}
                        >
                            <IoClose className='text-xl text-text-color' />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommonModalLayer;