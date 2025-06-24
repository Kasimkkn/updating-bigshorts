import React from 'react';
import { IoClose } from 'react-icons/io5';
import Button from './Button';

interface ImageAspectRatioPickerProps {
    setAspectRatio: (ratio: string) => void;
    selectedRatio?: string;
    onClose: () => void;
    imageUrl?: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=200&h=200&auto=format&fit=crop'; 
}

const ImageAspectRatioPicker: React.FC<ImageAspectRatioPickerProps> = ({ setAspectRatio, selectedRatio = 'original', onClose, imageUrl }) => {
    const aspectRatios = [
        { id: 'original', name: 'Original', width: 120, height: 90, style: { aspectRatio: 'auto' } },
        { id: '1:1', name: '1:1', width: 100, height: 100, style: { aspectRatio: '1/1' } },
        { id: '3:4', name: '3:4', width: 75, height: 100, style: { aspectRatio: '3/4' } },
        { id: '3:2', name: '3:2', width: 100, height: 67, style: { aspectRatio: '3/2' } },
        { id: '16:9', name: '16:9', width: 100, height: 56, style: { aspectRatio: '16/9' } },
    ];

    const handleSelectRatio = (ratio: string) => {
        setAspectRatio(ratio);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-bg-color bg-opacity-50 z-50">
            <div className="bg-primary-bg-color rounded-lg p-6 w-[90%] max-w-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Select Aspect Ratio</h3>
                    <button
                        className="p-1 rounded-full hover:bg-bg-color transition-colors"
                        onClick={onClose}
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {aspectRatios.map((ratio) => (
                        <div
                            key={ratio.id}
                            className={`
                                flex flex-col items-center justify-center p-3 rounded-md cursor-pointer
                                ${selectedRatio === ratio.id ? 'bg-bg-color border border-border-color' : 'hover:bg-bg-color'}
                                transition-colors duration-200
                            `}
                            onClick={() => handleSelectRatio(ratio.id)}
                        >
                            <div
                                className="mb-2 overflow-hidden border border-border-color rounded-md flex items-center justify-center"
                                style={{
                                    width: `${ratio.width}px`,
                                    height: `${ratio.height}px`,
                                    maxWidth: '100%',
                                    maxHeight: '100px',
                                    ...ratio.style
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundImage: `url(${imageUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                            </div>
                            <span className="text-sm font-medium">{ratio.name}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={onClose}
                        isLinearBtn={true}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImageAspectRatioPicker;