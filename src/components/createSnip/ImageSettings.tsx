import Image from 'next/image';
import React from 'react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import SafeImage from '../shared/SafeImage';

interface ImageSettingsProps {
    onNext: () => void;
    previewImageSrc: string | null;
}

const ImageSettings: React.FC<ImageSettingsProps> = ({ onNext, previewImageSrc }) => {

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex justify-between">
                <div className="w-2/3">
                    <div className="border border-border-color h-64 mb-4">
                    <SafeImage
                    src={previewImageSrc || ''}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    />
                    </div>
                </div>
                <div className="w-1/3">
                    <div className="bg-primary-bg-color rounded-md p-4 mb-4">
                        <h3 className="text-lg mb-2">Filters</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {/* Filter Options (these would be actual image previews in a real app) */}
                            <div className="bg-primary-bg-color h-16 rounded-md">Filter 1</div>
                            <div className="bg-primary-bg-color h-16 rounded-md">Filter 2</div>
                            <div className="bg-primary-bg-color h-16 rounded-md">Filter 3</div>
                            {/* Add more filters as needed */}
                        </div>
                    </div>
                    <div className="bg-primary-bg-color rounded-md p-4">
                        <h3 className="text-lg mb-2">Adjustments</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label>Brightness</label>
                                <Input type="range" min="0" max="100" className="w-1/2" />
                            </div>
                            <div className="flex justify-between">
                                <label>Contrast</label>
                                <Input type="range" min="0" max="100" className="w-1/2" />
                            </div>
                            <div className="flex justify-between">
                                <label>Saturation</label>
                                <Input type="range" min="0" max="100" className="w-1/2" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Button
                onCLick={onNext}
                className='self-end'
                isLinearBtn={true}
            >
                Next
            </Button>
        </div>
    );
};

export default ImageSettings;
