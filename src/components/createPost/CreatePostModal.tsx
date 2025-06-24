import React, { useEffect, useRef, useState } from "react";
import Button from "../shared/Button";
import ImageEditor from "../shared/ImageEditor";
import toast from "react-hot-toast";

interface CreatePostModalProps {
    onClose: () => void;
    onFileSelect: (files: File[], aspectRatiot: "1:1" | "4:5" | "16:9") => void;
    handleNextStep: () => void;
    setCoverFile: React.Dispatch<React.SetStateAction<string | null>>;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, setCoverFile, onFileSelect, handleNextStep }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [editedFiles, setEditedFiles] = useState<File[]>([]);
    const [currentEditIndex, setCurrentEditIndex] = useState<number>(-1);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedImageUrls, setEditedImageUrls] = useState<string[]>([]);
    const [saveEdits, setSaveEdits] = useState<boolean>(false);
    const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "16:9">("4:5");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 20) {
            toast.error("You can only upload a maximum of 20 files.");
            return;
        }
        if (files.length > 0) {
            const imageUrl = URL.createObjectURL(files[0]);
            setCoverFile(imageUrl);
            setEditedFiles(files)
            setSelectedFiles(files);

            // Create image URLs for editing
            const imageUrls = files.map(file => URL.createObjectURL(file));
            setEditedImageUrls(imageUrls);

            // Enter editing mode with the first image
            setCurrentEditIndex(0);
            setIsEditing(true);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageEdited = (editedImageBlob: Blob) => {
        // Create a new file from the edited blob
        const originalFile = editedFiles[currentEditIndex];
        const editedFile = new File([editedImageBlob], `${originalFile.name}`, {
            type: editedImageBlob.type,
            lastModified: new Date().getTime()
        });

        //Update the file in our array
        const updatedFiles = [...editedFiles];
        updatedFiles[currentEditIndex] = editedFile;
        setEditedFiles(updatedFiles);

        // Update the preview URL
        const editedUrl = URL.createObjectURL(editedImageBlob);
        const updatedUrls = [...editedImageUrls];
        updatedUrls[currentEditIndex] = editedUrl;
        setEditedImageUrls(updatedUrls);

        // If it's the first image, update the cover
        if (currentEditIndex === 0) {
            setCoverFile(editedUrl);
        }

        // Move to next image or finish editing
        if (currentEditIndex < selectedFiles.length - 1) {
            setCurrentEditIndex(prevIndex => prevIndex + 1);
            setIsEditing(true);
        } else {
            setSaveEdits(true);
        }
    };

    const finishEditing = () => {
onFileSelect(editedFiles, aspectRatio);
        setTimeout(() => {
            handleNextStep();
        }, 300)
    };

    const skipEditing = () => {
        setSaveEdits(true);
    };

    useEffect(() => {
        if (saveEdits) {
            finishEditing();
            setSaveEdits(false);
        }
    }, [saveEdits])

    useEffect(() => {
        setEditedFiles(selectedFiles)
        const imageUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setEditedImageUrls(imageUrls);
    }, [aspectRatio])
if (isEditing) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-3">
                <div className="w-full overflow-x-auto py-2">
                    <div className="flex gap-2 px-1">
                        {editedImageUrls.map((url, index) => (
                            <div
                                key={index}
                                onClick={() => setCurrentEditIndex(index)}
                                className={`relative cursor-pointer transition-all flex-shrink-0 ${index === currentEditIndex
                                    ? 'border-2 border-primary scale-105'
                                    : 'border border-gray-300 opacity-70'
                                    }`}
                            >
                                <img
                                    src={url}
                                    alt={`Image ${index + 1}`}
                                    className="h-16 w-16 object-cover rounded"
                                />
                                <span className="absolute bottom-1 right-1 bg-bg-color bg-opacity-70 text-primary-text-color text-xs px-1 rounded">
                                    {index + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <ImageEditor
                    imageUrl={editedImageUrls[currentEditIndex]}
                    onSave={handleImageEdited}
                    onCancel={skipEditing}
                    isFirstImage={currentEditIndex === 0}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                />
            </div>
        );
    }

    return (
        <div className="text-center">
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-dashed border-4 border-border-color rounded-lg p-8">
                    <p className="mb-4">Drag and drop files here</p>

                    <Button onClick={handleButtonClick} isLinearBtn={true}>
                        Select From Computer
                    </Button>
                </div>
            </label>

            {/* Show Selected Files */}
            {selectedFiles.length > 0 && !isEditing && (
                <div className="mt-4 text-left">
                    <p className="font-semibold">Selected Files:</p>
                    <ul className="list-disc list-inside text-sm">
                        {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CreatePostModal;
