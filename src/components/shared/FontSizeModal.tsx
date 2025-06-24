import React, { useState } from 'react';
import Button from './Button';
import CommonModalLayer from '../modal/CommonModalLayer';
import Input from './Input';

const FontSizeModal: React.FC<{
    fontSize: string;
    onSave: (fontSize: string) => void;
    onClose: () => void;
    activeObject: any;
}> = ({ fontSize, onSave, onClose, activeObject }) => {

    const initialFontSizePercentage = (parseFloat(fontSize) / activeObject.width) * 100;
    const [newFontSizePercentage, setNewFontSizePercentage] = useState(initialFontSizePercentage);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Math.max(1, Math.min(100, parseFloat(e.target.value))); // keep the range within 1-100%
        setNewFontSizePercentage(newValue);
    };

    return (
        <CommonModalLayer
            width='w-max'
            height='h-max'
        >
            <div className="w-72 mx-auto p-3">
                <h3 className="text-lg font-semibold mb-4 text-text-color ">Edit Text Size</h3>
                <Input
                    type="range"
                    min="10"
                    max="30"
                    value={newFontSizePercentage}
                    onChange={handleSliderChange}
                />
                <div className="flex justify-end space-x-4 mt-3">

                    <Button
                        onClick={onClose}
                        isLinearBorder={true}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSave(`${(newFontSizePercentage * activeObject.width) / 100}px`)}
                        isLinearBtn={true}>
                        Save
                    </Button>
                </div>
            </div>
        </CommonModalLayer>
    );
};

export default FontSizeModal;
