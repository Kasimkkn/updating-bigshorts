import React, { useRef } from 'react';
import Button from '../shared/Button';

interface CreateSsupModalProps {
    onClose: () => void;
    onFileSelect: (file: File, type: 'photo' | 'video') => void;
}

const CreateSsupModal: React.FC<CreateSsupModalProps> = ({ onClose, onFileSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const type = selectedFile.type.startsWith('video') ? 'video' : 'photo';
            onFileSelect(selectedFile, type);
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="text-center">
            <input
                type="file"
                accept=""
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-dashed border-4 border-border-color rounded-lg p-8">
                    <p className="mb-4">Drag and drop photo here</p>
                    <Button
                        onCLick={handleButtonClick}
                        isLinearBtn={true}
                    >
                        Select from Computer
                    </Button>
                </div>
            </label>
        </div>
    );
};

export default CreateSsupModal;
