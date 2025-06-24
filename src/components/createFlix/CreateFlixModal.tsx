import React, { useRef } from "react";
import Button from "../shared/Button";
import { toast } from 'react-hot-toast';

interface CreateFlixModalProps {
    onClose: () => void;
    onFileSelect: (file: File, type: 'photo' | 'video') => void;
}

const CreateFlixModal: React.FC<CreateFlixModalProps> = ({ onClose, onFileSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const validateFile = (file: File): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const allowedFormats = ['video/mp4', 'video/quicktime'];
            if (!allowedFormats.includes(file.type)) {
                reject(new Error('Please select an MP4 or MOV video file.'));
                return;
            }

            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);

            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src);

                if (video.duration < 3) {
                    reject(new Error('Video must be at least 3 seconds long.'));
                    return;
                }

                if (video.duration > 900) {
                    reject(new Error('Video must be no longer than 15 minutes.'));
                    return;
                }

                resolve(true);
            };

            video.onerror = () => {
                URL.revokeObjectURL(video.src); // Clean up object URL
                reject(new Error('Failed to load video. Please select a valid video file.'));
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files || files.length === 0) {
            toast.error('Please select a valid file.');
            return;
        }
        if (files.length > 1) {
            toast.error('Please select only one video file.');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        const selectedFile = files[0];
        setIsLoading(true);

        try {
            await validateFile(selectedFile);
            const type = selectedFile.type.startsWith('video') ? 'video' : 'photo';
            onFileSelect(selectedFile, type);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
                accept="video/mp4,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-dashed border-4 border-border-color rounded-lg p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border-color mb-2"></div>
                            <p className="text-lg font-semibold">Validating video...</p>
                        </div>
                    ) : (
                        <>
                            <p className="mb-2">Drag and drop video here</p>
                            <Button
                                onCLick={handleButtonClick}
                                isLinearBtn={true}
                            >
                                Select from Computer
                            </Button>
                        </>
                    )}
                </div>
            </label>
        </div>
    );
}

export default CreateFlixModal