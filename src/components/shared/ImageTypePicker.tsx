import React from 'react';
import { IoClose } from 'react-icons/io5';
import Button from './Button';

interface ImageTypePickerProps {
    setImageType: React.Dispatch<React.SetStateAction<number>>;
    selectedType?: number;
    onClose: () => void;
    imageUrl?: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=200&h=200&auto=format&fit=crop'; 
}

const ImageTypePicker: React.FC<ImageTypePickerProps> = ({ setImageType, selectedType = 0, onClose, imageUrl }) => {

    const shapeClipPath = (type: number) => { //returns clipPath value for interactive image based on type i.e circle, triangle etc
        switch (type) {
            case 1:
                return 'circle(50%)'; // Circle shape
            case 2:
                return 'path("M50,20 C55,10 65,0 80,10 C95,20 95,35 80,55 C65,75 50,90 50,90 C50,90 35,75 20,55 C5,35 5,20 20,10 C35,0 45,10 50,20 Z")'; // Heart shape
            case 3:
                return 'polygon(50% 0%, 0% 100%, 100% 100%)'; // Triangle shape
            case 4:
                return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; // Star shape
            default:
                return 'none'; // Rectangle shape
        }
    };

    const shapeNames = [
        'Rectangle',
        'Circle',
        'Heart',
        'Triangle',
        'Star',
    ];

    const handleSelectType = (type: number) => {
        setImageType(type);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-bg-color bg-opacity-50 z-50">
            <div className="bg-primary-bg-color rounded-lg p-6 w-[90%] max-w-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Select Image Shape</h3>
                    <button
                        className="p-1 rounded-full hover:bg-bg-color transition-colors"
                        onClick={onClose}
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[0, 1, 2, 3, 4].map((type) => (
                        <div
                            key={type}
                            className={`
                                flex flex-col items-center p-3 rounded-md cursor-pointer
                                ${selectedType === type ? 'bg-bg-color border border-border-color' : 'hover:bg-bg-color'}
                                transition-colors duration-200
                            `}
                            onClick={() => handleSelectType(type)}
                        >
                            <div
                                className="w-24 h-24 mb-2 overflow-hidden rounded-md flex items-center justify-center"
                                style={{
                                    position: 'relative',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundImage: `url(${imageUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        clipPath: shapeClipPath(type),
                                    }}
                                />
                            </div>
                            <span className="text-sm font-medium">{shapeNames[type]}</span>
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

export default ImageTypePicker;