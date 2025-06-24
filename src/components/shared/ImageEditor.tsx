import React, { useRef, useEffect, useState } from 'react';
import Button from '../shared/Button';
import { ModerSpinner } from '../LoadingSpinner';

interface ImageEditorProps {
    imageUrl: string;
    onSave: (editedBlob: Blob, aspectRatio: "1:1" | "4:5" | "16:9") => void
    onCancel: () => void;
    isFirstImage: boolean;
    aspectRatio: AspectRatio;
    setAspectRatio: React.Dispatch<React.SetStateAction<AspectRatio>>;
}

type EditMode = 'none' | 'adjust' | 'crop' | 'text';
type AspectRatio = '1:1' | '4:5' | '16:9';

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel, isFirstImage, aspectRatio, setAspectRatio }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    const [canvasWidth, setCanvasWidth] = useState<number>(0);
    const [canvasHeight, setCanvasHeight] = useState<number>(0);
    const [scale, setScale] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isRenderingImage, setIsRenderingImage] = useState<boolean>(false);
    const [hasMadeChanges, setHasMadeChanges] = useState<boolean>(false);

    // Edit modes
    const [editMode, setEditMode] = useState<EditMode>('none');

    // Crop properties
    const [cropOverlay, setCropOverlay] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
        isResizing: boolean;
        isDragging: boolean;
        resizeHandle: string | null;
    }>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        isResizing: false,
        isDragging: false,
        resizeHandle: null
    });
    const [isCropping, setIsCropping] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
    const [isCropApplied, setIsCropApplied] = useState<boolean>(false);

    // Initialize image and canvas
    useEffect(() => {
        setEditMode("none")
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            setOriginalImage(img);

            if (canvasRef.current && containerRef.current) {
                const container = containerRef.current;
                const containerWidth = container.clientWidth;

                // Calculate scale to fit image within container width
                const imgScale = containerWidth / img.width;

                // Set canvas dimensions
                const scaledWidth = Math.round(img.width * imgScale);
                const scaledHeight = Math.round(img.height * imgScale);

                const canvas = canvasRef.current;
                canvas.width = scaledWidth;
                canvas.height = scaledHeight;

                setCanvasWidth(scaledWidth);
                setCanvasHeight(scaledHeight);
                setScale(imgScale);

                // Initialize crop overlay to full image size
                setCropOverlay(prev => ({
                    ...prev,
                    width: scaledWidth,
                    height: scaledHeight,
                    x: 0,
                    y: 0
                }));

                renderImage();
            }
        };
    }, [imageUrl]);

    // Re-render image when adjustments change
    useEffect(() => {
        renderImage();
    }, [isCropping, cropOverlay, editMode]);

    // Draw the image and all elements on canvas
    const renderImage = () => {
        if (!canvasRef.current || !originalImage) return;

        setIsRenderingImage(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Save context before transformations
        ctx.save();

        // Draw the image at the correct size
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

        // Restore context for text rendering and overlay
        ctx.restore();

        // Draw crop overlay if in crop mode
        if (editMode === 'crop' && isCropping) {
            drawCropOverlay(ctx);
        }
        setIsRenderingImage(false);
    };

    // Draw the crop overlay on top of the image
    const drawCropOverlay = (ctx: CanvasRenderingContext2D) => {
        if (!isCropping) return;

        // Draw semi-transparent overlay outside crop area
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

        // Top area
        ctx.fillRect(0, 0, canvasWidth, cropOverlay.y);

        // Bottom area
        ctx.fillRect(0, cropOverlay.y + cropOverlay.height, canvasWidth, canvasHeight - (cropOverlay.y + cropOverlay.height));

        // Left area
        ctx.fillRect(0, cropOverlay.y, cropOverlay.x, cropOverlay.height);

        // Right area
        ctx.fillRect(cropOverlay.x + cropOverlay.width, cropOverlay.y, canvasWidth - (cropOverlay.x + cropOverlay.width), cropOverlay.height);

        // Draw crop rectangle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cropOverlay.x, cropOverlay.y, cropOverlay.width, cropOverlay.height);

        // Draw resize handles
        const handleSize = 10;
        const halfHandle = handleSize / 2;

        // Draw resize handles
        ctx.fillStyle = '#ffffff';
        // Top left
        ctx.fillRect(cropOverlay.x - halfHandle, cropOverlay.y - halfHandle, handleSize, handleSize);
        // Top middle
        //ctx.fillRect(cropOverlay.x + cropOverlay.width / 2 - halfHandle, cropOverlay.y - halfHandle, handleSize, handleSize);
        // Top right
        ctx.fillRect(cropOverlay.x + cropOverlay.width - halfHandle, cropOverlay.y - halfHandle, handleSize, handleSize);
        // Middle left
        //ctx.fillRect(cropOverlay.x - halfHandle, cropOverlay.y + cropOverlay.height / 2 - halfHandle, handleSize, handleSize);
        // Middle right
        //ctx.fillRect(cropOverlay.x + cropOverlay.width - halfHandle, cropOverlay.y + cropOverlay.height / 2 - halfHandle, handleSize, handleSize);
        // Bottom left
        ctx.fillRect(cropOverlay.x - halfHandle, cropOverlay.y + cropOverlay.height - halfHandle, handleSize, handleSize);
        // Bottom middle
        //ctx.fillRect(cropOverlay.x + cropOverlay.width / 2 - halfHandle, cropOverlay.y + cropOverlay.height - halfHandle, handleSize, handleSize);
        // Bottom right
        ctx.fillRect(cropOverlay.x + cropOverlay.width - halfHandle, cropOverlay.y + cropOverlay.height - halfHandle, handleSize, handleSize);
    };

    useEffect(() => {
        if (isCropping === false && isSaving === true) {
            renderImage();

            setTimeout(() => {
                if (canvasRef.current) {
                    applyCropIfNeeded();

                    canvasRef.current.toBlob((blob) => {
                        if (blob) {
                            onSave(blob, aspectRatio);

                            // Reset all properties after saving
                            setIsCropping(false);
                            setIsCropApplied(false);
                            setEditMode('none');
                            setHasMadeChanges(false);
                        }
                    }, 'image/jpeg', 0.95);
                }
                setLoading(false);
            }, 300);
        } else {
            setIsSaving(false);
            setLoading(false);
        }
    }, [isCropping, isSaving])

    // Handle save button click
    const handleSave = () => {
        setIsSaving(true);
        setLoading(true);
        setIsCropping(false);
    };

    const selectEditMode = (mode: EditMode) => {
        setEditMode(mode);
    }

    // Handle reset button click
    const handleReset = () => {
        // Reset crop
        // setIsCropping(false);
        setHasMadeChanges(false)
        setIsCropApplied(false);

        // Reload the original image
        const img = new Image();
        img.src = imageUrl; // Use the original imageUrl from props
        img.onload = () => {
            setOriginalImage(img);

            if (canvasRef.current && containerRef.current) {
                const container = containerRef.current;
                const containerWidth = container.clientWidth;

                // Calculate scale to fit image within container width
                const imgScale = containerWidth / img.width;

                // Set canvas dimensions
                const scaledWidth = Math.round(img.width * imgScale);
                const scaledHeight = Math.round(img.height * imgScale);

                const canvas = canvasRef.current;
                canvas.width = scaledWidth;
                canvas.height = scaledHeight;

                setCanvasWidth(scaledWidth);
                setCanvasHeight(scaledHeight);
                setScale(imgScale);

                setCropOverlay(prev => ({
                    ...prev,
                    width: scaledWidth,
                    height: scaledHeight,
                    x: 0,
                    y: 0
                }));

                // Reset mode
                setEditMode('none');

                renderImage();
            }
        };
    };


    // Start crop mode and initialize crop overlay
    const startCropMode = () => {
        setEditMode('crop');
        setIsCropping(true);

        // Don't reset isCropApplied flag - we need to know if we're cropping after a previous crop

        // Initialize crop overlay to center of image with aspect ratio
        initCropOverlay();
    };

    // Initialize crop overlay based on selected aspect ratio
    const initCropOverlay = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        let cropWidth = canvas.width * 0.8;
        let cropHeight = canvas.height * 0.8;

        let ratio = 1;
        switch (aspectRatio) {
            case '1:1': ratio = 1; break;
            case '4:5': ratio = 4 / 5; break;
            case '16:9': ratio = 16 / 9; break;
        }

        // Calculate dimensions based on aspect ratio
        if (cropWidth / cropHeight > ratio) {
            cropWidth = cropHeight * ratio;
        } else {
            cropHeight = cropWidth / ratio;
        }

        // Center the crop overlay
        const x = (canvas.width - cropWidth) / 2;
        const y = (canvas.height - cropHeight) / 2;

        setCropOverlay({
            x,
            y,
            width: cropWidth,
            height: cropHeight,
            isDragging: false,
            isResizing: false,
            resizeHandle: null
        });
    };

    // Apply the crop to the image
    const applyCrop = () => {
        if (!canvasRef.current || !originalImage) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create a temporary canvas with the crop dimensions
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = cropOverlay.width;
        tempCanvas.height = cropOverlay.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        // Clear the temporary canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Calculate the source coordinates in the original image
        let sourceX, sourceY, sourceWidth, sourceHeight;

        if (isCropApplied) {
            // If we're doing a second crop, use canvas coordinates directly
            sourceX = cropOverlay.x;
            sourceY = cropOverlay.y;
            sourceWidth = cropOverlay.width;
            sourceHeight = cropOverlay.height;

            // Draw directly from the canvas (which already contains the first crop)
            tempCtx.drawImage(
                canvas,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                cropOverlay.width,
                cropOverlay.height
            );
        } else {
            // First time cropping - use scaling to map to original image coordinates
            sourceX = cropOverlay.x / scale;
            sourceY = cropOverlay.y / scale;
            sourceWidth = cropOverlay.width / scale;
            sourceHeight = cropOverlay.height / scale;

            // Draw from the original image
            tempCtx.drawImage(
                originalImage,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                cropOverlay.width,
                cropOverlay.height
            );
        }

        // Create a new image from the temp canvas
        const croppedImage = new Image();
        croppedImage.onload = () => {
            // Store the cropped image as our new "original" for further edits
            setOriginalImage(croppedImage);

            // Important: Reset scale since we're working with a 1:1 crop now
            setScale(1);

            // Resize main canvas to match crop dimensions
            canvas.width = cropOverlay.width;
            canvas.height = cropOverlay.height;
            setCanvasWidth(cropOverlay.width);
            setCanvasHeight(cropOverlay.height);

            // Draw cropped image on main canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(croppedImage, 0, 0);

            // Reset crop mode
            setIsCropping(false);
            setIsCropApplied(true);
            setEditMode('none');

            // Render the result
            //renderImage();      //not needed if not using other edit modes
        };
        croppedImage.src = tempCanvas.toDataURL();
        setHasMadeChanges(true);
    };

    // Apply crop if needed before saving
    const applyCropIfNeeded = () => {
        if (isCropping && editMode === 'crop') {
            applyCrop();
        }
    };

    // Update aspect ratio and recalculate crop overlay
    const applyAspectRatio = (ratio: AspectRatio) => {
        setAspectRatio(ratio);

        if (!canvasRef.current) return;

        // Update crop rectangle with new aspect ratio
        let newCrop = { ...cropOverlay };

        let aspectValue = 1;
        switch (ratio) {
            case '1:1': aspectValue = 1; break;
            case '4:5': aspectValue = 4 / 5; break;
            case '16:9': aspectValue = 16 / 9; break;
        }

        // Keep the center point the same
        const centerX = newCrop.x + newCrop.width / 2;
        const centerY = newCrop.y + newCrop.height / 2;

        // Calculate new dimensions based on aspect ratio
        // Use the smaller dimension as reference
        if (newCrop.width > newCrop.height * aspectValue) {
            // Height is the limiting factor
            newCrop.width = newCrop.height * aspectValue;
        } else {
            // Width is the limiting factor
            newCrop.height = newCrop.width / aspectValue;
        }

        // Recalculate position to maintain center point
        newCrop.x = centerX - newCrop.width / 2;
        newCrop.y = centerY - newCrop.height / 2;

        // Ensure crop stays within bounds
        newCrop.x = Math.max(0, Math.min(newCrop.x, canvasWidth - newCrop.width));
        newCrop.y = Math.max(0, Math.min(newCrop.y, canvasHeight - newCrop.height));

        setCropOverlay(newCrop);
        renderImage();
    };

    // Mouse event handling for drag operations and text placement
    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Handle crop area interactions
        if (editMode === 'crop' && isCropping) {
            const handle = getResizeHandle(x, y);

            if (handle) {
                // Start resizing crop area
                setCropOverlay(prev => ({
                    ...prev,
                    isResizing: true,
                    resizeHandle: handle
                }));
            } else if (isPointInCropArea(x, y)) {
                // Start dragging crop area
                setCropOverlay(prev => ({
                    ...prev,
                    isDragging: true
                }));
            }

            setDragStart({ x, y });
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!canvasRef.current || !dragStart) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const deltaX = x - dragStart.x;
        const deltaY = y - dragStart.y;

        // Handle crop area dragging or resizing
        if (editMode === 'crop' && (cropOverlay.isDragging || cropOverlay.isResizing)) {
            let newCrop = { ...cropOverlay };

            if (cropOverlay.isDragging) {
                // Move the entire crop rectangle
                newCrop.x += deltaX;
                newCrop.y += deltaY;

                // Keep within canvas bounds
                newCrop.x = Math.max(0, Math.min(newCrop.x, canvasWidth - newCrop.width));
                newCrop.y = Math.max(0, Math.min(newCrop.y, canvasHeight - newCrop.height));
            } else if (cropOverlay.isResizing && cropOverlay.resizeHandle) {
                // Resize based on which handle is being dragged
                const handle = cropOverlay.resizeHandle;

                // Calculate new dimensions based on aspect ratio
                let newWidth = newCrop.width;
                let newHeight = newCrop.height;
                let newX = newCrop.x;
                let newY = newCrop.y;

                // Handle different resize handles
                if (handle.includes('left')) {
                    newWidth -= deltaX;
                    newX += deltaX;
                } else if (handle.includes('right')) {
                    newWidth += deltaX;
                }

                if (handle.includes('top')) {
                    newHeight -= deltaY;
                    newY += deltaY;
                } else if (handle.includes('bottom')) {
                    newHeight += deltaY;
                }

                // Apply aspect ratio constraints if needed
                let ratio = 1;
                switch (aspectRatio) {
                    case '1:1': ratio = 1; break;
                    case '4:5': ratio = 4 / 5; break;
                    case '16:9': ratio = 16 / 9; break;
                }

                // Determine which dimension controls based on the handle
                if (handle.includes('left') || handle.includes('right')) {
                    // Width is controlling dimension
                    newHeight = newWidth / ratio;

                    // Adjust y position for top handles
                    if (handle.includes('top')) {
                        newY = newCrop.y + newCrop.height - newHeight;
                    }
                } else {
                    // Height is controlling dimension
                    newWidth = newHeight * ratio;

                    // Adjust x position for left handles
                    if (handle.includes('left')) {
                        newX = newCrop.x + newCrop.width - newWidth;
                    }
                }

                // Apply new dimensions and ensure positive values
                if (newWidth > 10 && newHeight > 10) {
                    newCrop.width = newWidth;
                    newCrop.height = newHeight;
                    newCrop.x = newX;
                    newCrop.y = newY;

                    // Keep within canvas bounds
                    newCrop.x = Math.max(0, Math.min(newCrop.x, canvasWidth - newCrop.width));
                    newCrop.y = Math.max(0, Math.min(newCrop.y, canvasHeight - newCrop.height));
                }
            }

            setCropOverlay(newCrop);
            setDragStart({ x, y });
            renderImage();
        }
    };

    const handleCanvasMouseUp = () => {
        if (cropOverlay.isDragging || cropOverlay.isResizing) {
            setCropOverlay(prev => ({
                ...prev,
                isDragging: false,
                isResizing: false,
                resizeHandle: null
            }));
        }

        setDragStart(null);
    };

    // Check if a point is inside crop area
    const isPointInCropArea = (x: number, y: number): boolean => {
        return (
            x >= cropOverlay.x &&
            x <= cropOverlay.x + cropOverlay.width &&
            y >= cropOverlay.y &&
            y <= cropOverlay.y + cropOverlay.height
        );
    };

    // Get the resize handle at a given point
    const getResizeHandle = (x: number, y: number): string | null => {
        const handleSize = 10;
        const halfHandle = handleSize / 2;

        // Check each handle
        if (Math.abs(x - cropOverlay.x) <= halfHandle && Math.abs(y - cropOverlay.y) <= halfHandle) {
            return 'top-left';
        }
        // if (Math.abs(x - (cropOverlay.x + cropOverlay.width/2)) <= halfHandle && Math.abs(y - cropOverlay.y) <= halfHandle) {
        //     return 'top-middle';
        // }
        if (Math.abs(x - (cropOverlay.x + cropOverlay.width)) <= halfHandle && Math.abs(y - cropOverlay.y) <= halfHandle) {
            return 'top-right';
        }
        // if (Math.abs(x - cropOverlay.x) <= halfHandle && Math.abs(y - (cropOverlay.y + cropOverlay.height/2)) <= halfHandle) {
        //     return 'middle-left';
        // }
        // if (Math.abs(x - (cropOverlay.x + cropOverlay.width)) <= halfHandle && Math.abs(y - (cropOverlay.y + cropOverlay.height/2)) <= halfHandle) {
        //     return 'middle-right';
        // }
        if (Math.abs(x - cropOverlay.x) <= halfHandle && Math.abs(y - (cropOverlay.y + cropOverlay.height)) <= halfHandle) {
            return 'bottom-left';
        }
        // if (Math.abs(x - (cropOverlay.x + cropOverlay.width/2)) <= halfHandle && Math.abs(y - (cropOverlay.y + cropOverlay.height)) <= halfHandle) {
        //     return 'bottom-middle';
        // }
        if (Math.abs(x - (cropOverlay.x + cropOverlay.width)) <= halfHandle && Math.abs(y - (cropOverlay.y + cropOverlay.height)) <= halfHandle) {
            return 'bottom-right';
        }

        return null;
    };

    return (
        <div className="flex flex-col md:flex-row h-full w-full overflow-hidden gap-2">

            {/* Canvas container - left side */}
            <div
                className="w-full h-[30vh] md:h-[70vh] max-h-[30vh] md:max-h-[70vh] md:max-w-lg overflow-hidden flex justify-center items-center"
                ref={containerRef}
            >
                <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[30vh] md:max-h-[70vh] border border-gray-300 rounded cursor-crosshair"
                    style={{
                    width: 'auto',
                    height: 'auto',
                    aspectRatio: `${canvasWidth} / ${canvasHeight}`,
                    display: 'block',
                }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                />
            </div>

            {/* Controls container - right side */}
            <div
                className='flex flex-col items-center justify-start w-full md:h-[95%] md:p-4 overflow-y-auto'
            >
                <div className={`p-4 bg-bg-color text-text-color rounded-md w-full max-w-md mt-2 md:mt-4 mb-2 relative ${!isFirstImage && "pointer-events-none"}`}>
                    <h3 className="font-medium mb-2">Aspect Ratio</h3>
                    <div className="flex gap-2">
                        <Button onClick={() => applyAspectRatio('1:1')} isLinearBtn={aspectRatio === '1:1'} isLinearBorder={aspectRatio !== '1:1'} className='w-full'>
                            1:1
                        </Button>
                        <Button onClick={() => applyAspectRatio('4:5')} isLinearBtn={aspectRatio === '4:5'} isLinearBorder={aspectRatio !== '4:5'} className='w-full'>
                            4:5
                        </Button>
                        <Button onClick={() => applyAspectRatio('16:9')} isLinearBtn={aspectRatio === '16:9'} isLinearBorder={aspectRatio !== '16:9'} className='w-full'>
                            16:9
                        </Button>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <p className="text-sm">
                            Drag to position, resize handles to adjust
                        </p>
                    </div>

                    {!isFirstImage &&
                        <div className='absolute inset-0 bg-secondary-bg-color/20 rounded-md' />}

                </div>

                <div className="text-text-color w-full max-w-md flex justify-between">
                    <Button onClick={handleReset} className={`bg-bg-color border-border-color hover:border ${!hasMadeChanges && "pointer-events-none"}`} disabled={!hasMadeChanges}>
                        Reset
                    </Button>

                    {editMode === "crop" ?
                        (<Button onClick={applyCrop} isLinearBtn={true}>
                            Apply Crop
                        </Button>) :
                        (<Button
                            onClick={startCropMode}
                            isLinearBorder={true}
                        >
                            Start
                        </Button>)}

                </div>
                {loading && <p className='text-text-color text-ms'>Applying your changes...</p>}
                <div className="w-full flex justify-between mt-4 md:mt-auto">
                    <Button onClick={onCancel} isLinearBorder={true}>
                        Auto-Apply to Remaining
                    </Button>
                    <Button onClick={handleSave} isLinearBtn={hasMadeChanges} className="bg-bg-color text-text-color" disabled={loading || !hasMadeChanges}>
                        {loading ? <ModerSpinner /> : "Save & Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;