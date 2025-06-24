import React, { useRef } from 'react';
import Button from '../shared/Button';
import { toast } from 'react-hot-toast';

interface CreateSnipModalProps {
    onClose: () => void;
    onFileSelect: (file: File, type: 'photo' | 'video', isForFirst: boolean) => void;
}

const CreateSnipModal: React.FC<CreateSnipModalProps> = ({ onClose, onFileSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const validateFile = (file: File): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const allowedFormats = ['video/mp4', 'video/quicktime'];
            if (!allowedFormats.includes(file.type)) {
                reject(new Error('Please select an MP4 or MOV video file.'));
                return;
            }

            // Check video duration
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);

            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src); // Clean up object URL

                if (video.duration < 3) {
                    reject(new Error('Video must be at least 3 seconds long.'));
                    return;
                }

                if (video.duration > 120) { // 2 minutes = 120 seconds
                    reject(new Error('Video must be no longer than 2 minutes.'));
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

        // Prevent multiple file selection
        if (files.length > 1) {
            toast.error('Please select only one video file.');
            // Reset file input
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
            onFileSelect(selectedFile, type, true);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
            // Reset file input so the same file can be selected again if needed
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
                accept="video/mp4,video/quicktime" // Only accept MP4 and MOV files
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-dashed border-4 border-border-color rounded-lg p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
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
};

export default CreateSnipModal;