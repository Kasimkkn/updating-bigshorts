import { canvasHeight, canvasWidth, defaultElementHeight, defaultElementLeft, defaultElementTop, defaultElementWidth, IMAGE, LINK, MAX_ELEMENTS, TEXT } from '@/constants/interactivityConstants';
import { FinalJsonContext } from '@/context/useInteractvieImage';
import { useDebounce } from '@/hooks/useDebounce';
import { ImagesInteractiveResponse } from '@/models/ImagesInteractiveResponse';
import { LinkInteractiveResponse } from '@/models/linkInteractiveResonse';
import { ContainerText } from "@/models/textcontainerdesign";
import { VideoList as FinalJson, VideoList } from '@/models/videolist';
import { convertColorToString, convertStringToColor } from '@/utils/features';
import * as fabric from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { absoluteToPercentage, addCustomControls, calculateDimension, calculateLeft, calculateTop, CustomFabricObject, percentageToAbsolute } from '../shared/allNeededFunction';
import FontFamilyModal from '../shared/FontFamilyModal';
import FontSizeModal from '../shared/FontSizeModal';
import InteractvieTextTypesModal from '../shared/InteractvieTextTypesModal';
import TextEditModal from '../shared/TextEditModal';
import ControlButton from '../shared/ControlButton';
import PostDetails from '../shared/PostDetails/PostDetails';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ActionButtonModal from '../shared/ActionButtonModal';
import ImageTypePicker from '../shared/ImageTypePicker';
import ImageAspectRatioPicker from '../shared/ImageAspectRatioPicker';
import StickerModal from '../shared/StickerModal';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { PiImageSquareBold } from 'react-icons/pi';
import { RxText } from 'react-icons/rx';
interface AddInteractiveElementsProps {
    fileUploadLoading: boolean
    step: number;
    onSubmit: () => void;
    finalSubmitLoading: boolean;
    setPostInformation: React.Dispatch<React.SetStateAction<{
        title: string,
        isForAll: boolean,
        scheduleDateTime: string,
        hashArray: string[],
        friendArray: string[],
        usersSelectedate: Date | null
        collaborators: number[],
        isAllowComment: 0 | 1,
        location: string;
    }>>
    imageJsonList: VideoList[];
    setImageJsonList: React.Dispatch<React.SetStateAction<VideoList[]>>
}
const AddInteractiveElementsImage: React.FC<AddInteractiveElementsProps> = ({
    step,
    onSubmit,
    finalSubmitLoading,
    setPostInformation,
    imageJsonList,
    setImageJsonList
}) => {
    const context = useContext(FinalJsonContext);

    if (!context) {
        throw new Error('AddInteractiveElements must be used within a FinalJsonProvider');
    }


    const { finalJsondetails, setFinalJsondetails, addInteractiveElement, updateInteractiveElement, deleteInteractiveElement, } = context;
    const finalJsonRef = useRef<FinalJson | undefined>(finalJsondetails);
    const { editor, onReady } = useFabricJSEditor();
    const [activeObject, setActiveObject] = useState<CustomFabricObject | null>(null);
    const [borderColor, setBorderColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [shadowColor, setShadowColor] = useState('#000000');
    const [openFontFamily, setOpenFontFamily] = useState(false);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState('16');
    const [openStickerModal, setOpenStickerModal] = useState(false);
    const debouncedBorderColor = useDebounce(borderColor, 500);
    const debouncedTextColor = useDebounce(textColor, 500);
    const debouncedBackgroundColor = useDebounce(backgroundColor, 500);
    const debouncedFontFamily = useDebounce(fontFamily, 500);
    const debouncedShadowColor = useDebounce(shadowColor, 500);
    const [isTextEditModalOpen, setIsTextEditModalOpen] = useState(false);
    const [isImageTypePickerOpen, setIsImageTypePickerOpen] = useState(false);
    const [isAspectRatioPickerOpen, setIsAspectRatioPickerOpen] = useState(false);
    const [editText, setEditText] = useState('');
    const [openLinkModal, setOpenLinkModal] = useState(false);
    const [openTextTypesModal, setOpenTextTypesModal] = useState(false);
    const [openFontSizeModal, setOpenFontSizeModal] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageType, setImageType] = useState(0); //type for clipping interactive images
    const [aspectRatio, setAspectRatio] = useState('original'); //aspect ratio of image elements
    const canvasElementsRef = useRef<Record<number, fabric.Object[]>>({}); // index of image: list of its elements

    const MainImageAspectRatio = finalJsondetails?.aspect_ratio

    const parentSize = { width: canvasWidth, height: canvasWidth * 16 / 9 }

    const imageFileSrc = imageJsonList[currentIndex].path;

    const imageRef = useRef<HTMLImageElement>(null);

    //_____________________________________Side Effects_____________________________________

    //putting current image's json into the context
    useEffect(() => {
        const currentImageJson: VideoList | undefined = imageJsonList[currentIndex];

        if (currentImageJson) {
            setFinalJsondetails(currentImageJson);
            initializeCanvas();
        }
    }, [currentIndex]);

    //updating current image's json as json in context changes, imageJsonLost is used to upload post at the end
    useEffect(() => {
        if (!finalJsondetails) {
            return;
        }
        setImageJsonList((prev) => {
            const updatedList = [...prev];
            updatedList[currentIndex] = finalJsondetails!;
            return updatedList;
        });
    }, [finalJsondetails]);

    //updating the finalJsonRef when finalJsondetails changes
    useEffect(() => {
        finalJsonRef.current = finalJsondetails;
    }, [finalJsondetails]);


    //when another object is selected, set the properties of that object in the state
    useEffect(() => {
        if (activeObject && activeObject.type === 'group') {
            const [rect, text] = activeObject._objects;
            setBackgroundColor(rect?.fill || '#ffffff');
            setBorderColor(rect?.stroke || '#000000');
            setFontFamily(text?.fontFamily || 'Arial');
            setTextColor(text?.fill || '#000000');
        }
        if (activeObject && activeObject.data?.elementType === "IMAGE") {
            setImageType(activeObject.data?.elementData?.image_type || 0);
        }
    }, [activeObject]);


    //runs aspect ratio handler when aspect ratio changes
    useEffect(() => {
        handleAspectRatioChange(aspectRatio);
    }, [aspectRatio]);

    useEffect(() => {
        if (step === 3) {
            closeAllModals()
            setActiveObject(null)
        }
    }, [step])

    // when properties are changed, update fabric object, this does not update the json context
    useEffect(() => {
        // Check if the activeObject is either a group, textbox, or image
        if (activeObject && (activeObject.type === 'group' || activeObject.type === 'textbox' || activeObject.type === 'image')) {

            // If it's a group, handle the group objects
            if (activeObject.type === 'group') {
                const [rect, text, img] = activeObject._objects || [];

                // Handle rect updates
                if (rect && rect.type === 'rect') {
                    rect.set('fill', backgroundColor);
                    rect.set('stroke', borderColor);
                }

                // Handle text updates
                if (text && text.type === 'textbox') {
                    text.set('fill', textColor);
                    text.set('fontFamily', fontFamily);
                }
            }
            if (activeObject.type === 'group' && activeObject._objects[0].type == 'image') {
                const img = activeObject._objects[0];
                if (img && img.type === 'image') {
                    img.set({
                        // backgroundColor: backgroundColor,
                        shadow: {
                            color: backgroundColor,
                            blur: 10,
                            offsetX: 0,
                            offsetY: 0,
                        }
                    });
                }
            }

            if (activeObject.type === 'textbox') {
                activeObject.set({
                    fill: textColor,
                    fontFamily: fontFamily
                });
            }

            if (activeObject.type === "image") {
                // Apply the clip path to the image object
                const clipPath = fabricClipPath(imageType, activeObject as fabric.Image);
                activeObject.clipPath = clipPath;
                if (activeObject.data) {
                    activeObject.data.elementData.image_type = imageType
                }
                activeObject.dirty = true; // Force re-render, Fabric does not update when switching between non-undefined clipPaths
            }
            editor!.canvas.renderAll();
        }
    }, [backgroundColor, borderColor, textColor, fontFamily, activeObject, imageType]);

    // when properties are changed, update them in the json context, this does not update the canvas
    useEffect(() => {
        if (activeObject && updateInteractiveElement) {
            const elementId = activeObject.data?.elementId;
            const elementType = activeObject.data?.elementType;

            if (elementId && elementType) {
                let updatedElement: ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse | null = null;
                const height = activeObject.height * activeObject.scaleY;
                const width = activeObject.width * activeObject.scaleX;
                const top = activeObject.top * activeObject.scaleY;
                const left = activeObject.left * activeObject.scaleX;

                switch (elementType) {
                    case 'TEXT':
                        updatedElement = {
                            ...finalJsondetails?.functionality_datas?.list_of_container_text?.find((txt) => txt.id === elementId),
                            txtFamily: debouncedFontFamily,
                            color_for_txt_bg: {
                                background_color: debouncedBackgroundColor,
                                text_color: debouncedTextColor,
                            },


                            height: absoluteToPercentage.height(height),
                            width: absoluteToPercentage.width(width),
                            top: absoluteToPercentage.top(top),
                            left: absoluteToPercentage.left(left),
                            bgShadow: debouncedShadowColor || '',
                        } as unknown as ContainerText;
                        break;

                    case 'IMAGE':
                        updatedElement = {
                            ...finalJsondetails?.functionality_datas?.list_of_images?.find((img) => img.id === elementId),
                            height: absoluteToPercentage.height(height),
                            width: absoluteToPercentage.width(width),
                            top: absoluteToPercentage.top(top),
                            left: absoluteToPercentage.left(left),
                            rotation: activeObject.angle || 0,
                            image_type: imageType,
                        } as unknown as ImagesInteractiveResponse;
                        break;

                    case 'LINK':
                        updatedElement = {
                            ...finalJsondetails?.functionality_datas?.list_of_links?.find((lnk) => lnk.id === elementId),
                            color_for_txt_bg: {
                                background_color: debouncedBackgroundColor,
                                text_color: debouncedTextColor,
                            },
                            border_color: debouncedBorderColor,
                            text_family: debouncedFontFamily,
                            height: absoluteToPercentage.height(height),
                            width: absoluteToPercentage.width(width),
                            top: absoluteToPercentage.top(top),
                            left: absoluteToPercentage.left(left),
                            is_border: debouncedBorderColor ? 1 : 0,
                        } as unknown as LinkInteractiveResponse;
                        break;


                    default:
                        console.warn("Unknown element type:", elementType);
                        return;
                }


                if (updatedElement) {
                    updateInteractiveElement(elementType, updatedElement);
                }
            }
        }
    }, [
        debouncedBorderColor,
        debouncedTextColor,
        debouncedBackgroundColor,
        debouncedFontFamily,
        debouncedShadowColor,
        imageType,
        activeObject,
        updateInteractiveElement,
    ]);

    // handling canvas events, e.g clicking on a fabric object should update activeObject state
    // basically syncs canvas with the states
    useEffect(() => {
        if (editor) {
            const canvas = editor.canvas;
            const ImageWidth = imageRef.current?.width || canvasWidth;
            const ImageHeight = imageRef.current?.height || canvasHeight;

            const handleSelectionCreated = () => {
                const activeObj = canvas.getActiveObject() as CustomFabricObject;
                setActiveObject(activeObj || null);
            };

            const handleObjectModified = (e: any) => {
                const target = e.target as CustomFabricObject;
                if (target) {
                    const currentFinalJson = finalJsonRef.current;
                    if (currentFinalJson) {
                        updateObjectDimensions(target, currentFinalJson);
                    }
                }
            };

            const handleMouseDoubleClick = () => {
                const activeObj = canvas.getActiveObject() as fabric.Group;
                if (activeObj && activeObj.type === 'group') {
                    const textObj = activeObj._objects.find((obj: any) => obj.type === 'textbox') as fabric.Textbox;
                    if (textObj) {
                        setEditText(textObj.text || '');
                        setIsTextEditModalOpen(true);
                    }
                }
            };

            const handleObjectMoving = (e: any) => {
                const obj = e.target;
                const height = obj.height! * obj.scaleY;
                const width = obj.width! * obj.scaleX;

                // Set object boundary constraints
                if (obj.left < 0) {
                    obj.set({ left: 0 });
                }
                if (obj.top < 0) {
                    obj.set({ top: 0 });
                }
                if (obj.left + width > ImageWidth!) {
                    obj.set({ left: ImageWidth! - width });
                }
                if (obj.top + height > ImageHeight!) {
                    obj.set({ top: ImageHeight! - height });
                }
            };

            const handleSelectionCleared = () => {
                setActiveObject(null);
            };

            canvas.on('selection:created', handleSelectionCreated);
            canvas.on('selection:updated', handleSelectionCreated);
            canvas.on('object:modified', handleObjectModified);
            canvas.on('mouse:dblclick', handleMouseDoubleClick);
            canvas.on('object:moving', handleObjectMoving);
            canvas.on('selection:cleared', handleSelectionCleared);

            const activeObj = canvas.getActiveObject() as CustomFabricObject;
            if (activeObj) {
                setActiveObject(activeObj);
            }

            return () => {
                canvas.off('selection:created', handleSelectionCreated);
                canvas.off('selection:updated', handleSelectionCreated);
                canvas.off('object:modified', handleObjectModified);
                canvas.off('mouse:dblclick', handleMouseDoubleClick);
                canvas.off('object:moving', handleObjectMoving);
                canvas.off('selection:cleared', handleSelectionCleared);
            };
        }
    }, [editor, currentIndex]);

    //_____________________________________Functions_____________________________________

    //clears the canvas, gets elements of current image and adds them to the canvas
    const initializeCanvas = () => {
        if (!editor) return;
        const canvas = editor.canvas;
        canvas.clear();
        canvas.renderAll();

        canvas.setDimensions({ width: parentSize.width, height: parentSize.height });

        if (canvasElementsRef.current[currentIndex]) {
            canvasElementsRef.current[currentIndex].forEach((element) => canvas.add(element));
        } else {
        }

        canvas.renderAll();
    };

    //save elements of current image before switching to another image, so that they are available when we come back to this image
    const saveCanvasElements = () => {
        if (!editor) return;
        const canvas = editor.canvas;

        // Save the current canvas elements to the ref
        const elements = canvas.getObjects();
        canvasElementsRef.current[currentIndex] = elements;
    };

    //returns clip path
    const fabricClipPath = (type: number, obj: fabric.Image) => {
        const width = obj.width!;
        const height = obj.height!;

        let clipPath;

        switch (type) {
            case 1: // Circle
                const radius = Math.min(width, height) / 2
                clipPath = new fabric.Circle({
                    radius: radius,
                    originX: 'center',
                    originY: 'center',
                });
                break;

            case 2: // Heart shape
                const heartPath = new fabric.Path(
                    'M 0 0 L 0 -2 C -5 -5 -4 0 -2 2 L 0 4 L 2 2 C 4 0 5 -5 0 -2 Z'
                );
                heartPath.set({
                    originX: 'center',
                    originY: 'center',
                    scaleX: width / 8,
                    scaleY: height / 8
                });
                clipPath = heartPath;
                break;

            case 3: // Triangle
                clipPath = new fabric.Triangle({
                    width: width,
                    height: height,
                    originX: 'center',
                    originY: 'center',
                });
                break;

            case 4: // Star shape
                const starPath = new fabric.Path(
                    'M 0 -5 L 1.5 -1.5 L 5 -1.5 L 2 1 L 3 5 L 0 2.5 L -3 5 L -2 1 L -5 -1.5 L -1.5 -1.5 z'
                );
                starPath.set({
                    originX: 'center',
                    originY: 'center',
                    scaleX: width / 10,
                    scaleY: height / 10
                });
                clipPath = starPath;
                break;

            default: // Rectangle (no clip)
                clipPath = undefined;
                break;
        }

        return clipPath;
    };

    //changes scale Y of fabric image to set aspect ratio
    const handleAspectRatioChange = (ratio: string) => {
        setAspectRatio(ratio);

        // Apply aspect ratio to the selected image
        if (activeObject && activeObject.type === "image") {
            const img = activeObject as fabric.Image;
            const originalWidth = img.width || 100;
            const originalHeight = img.height || 100;

            // Calculate new dimensions based on aspect ratio
            let newWidth = originalWidth;
            let newHeight = originalHeight;

            switch (ratio) {
                case '1:1':
                    // Make it square
                    newHeight = newWidth;
                    break;
                case '3:4':
                    newHeight = (newWidth * 4) / 3;
                    break;
                case '3:2':
                    newHeight = (newWidth * 2) / 3;
                    break;
                case '16:9':
                    newHeight = (newWidth * 9) / 16;
                    break;
                case 'original':
                default:
                    // Keep original dimensions
                    break;
            }

            // Set new scale to maintain original size but change proportions
            img.set({
                scaleX: img.scaleX,
                scaleY: (newHeight / originalHeight) * img.scaleX
            });

            editor!.canvas.renderAll();
        }
    };

    // Checks if the number of interactive elements exceeds the limit, always call this before adding a new element
    const validateInteractiveElements = () => {
        if (!finalJsondetails || !finalJsondetails.functionality_datas) return true;

        const totalElements =
            finalJsondetails.functionality_datas.list_of_buttons.length +
            finalJsondetails.functionality_datas.list_of_container_text.length +
            finalJsondetails.functionality_datas.list_of_images.length +
            finalJsondetails.functionality_datas.list_of_links.length;

        if (totalElements >= MAX_ELEMENTS) {
            return false;
        }
        return true;
    };


    // Handling the image upload, setting interactiveImage triggers useEffect that adds the image to canvas
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        closeAllModals();
        const file = event.target.files?.[0];
        if (file) {
            const localPath = URL.createObjectURL(file); // Create a URL representing the file object
            addImage(localPath);
        }
    };

    //handling the sticker upload
    const handleStickerUpload = (sticker: string) => {
        if (!validateInteractiveElements()) {
            toast.error('Maximum number of interactive elements reached');
            return;
        };
        if (sticker && editor) {
            const canvas = editor.canvas;

            const imgElement = new Image();
            imgElement.src = sticker;

            imgElement.onload = function () {
                const fabricImage = new fabric.FabricImage(imgElement, {
                    left: 50,
                    top: 50,
                    scaleX: 60 / canvas.width,
                    scaleY: 60 / canvas.height,
                    selectable: true,
                    hasBorders: true,
                    hasControls: true,
                });

                canvas.add(fabricImage);
                addCustomControls(fabricImage, canvas, addInteractiveElement, deleteInteractiveElement, undefined, undefined, setActiveObject);
                canvas.setActiveObject(fabricImage);
                canvas.renderAll();

                const newImage: ImagesInteractiveResponse = {
                    album_model_id: '',
                    color_for_txt_bg: {
                        background_color: null,
                        text_color: "0xffffffff",
                    },
                    ending_time: 0,
                    height: fabricImage.height!,
                    id: Date.now(),
                    image_type: 0,
                    img_path: sticker,
                    is_selected: false,
                    is_show: null,
                    is_Sticker: true,
                    last_next_video_jump_duration: null,
                    left: fabricImage.left!,
                    medium_type: "",
                    on_action: {
                        link_url: null,
                        video_path: null,
                        android_streaming_url: null,
                        ending_time: null,
                        id_of_video_list: 1,
                        ios_streaming_url: null,
                        skip_time_on_same_video: null,
                        starting_time: null,
                    },
                    rotation: fabricImage.angle || 0,
                    starting_time: 0,
                    text: '',
                    text_and_image_alignment: null,
                    text_family: null,
                    top: fabricImage.top!,
                    video_id: "-1",
                    width: fabricImage.width!,
                };

                (fabricImage as CustomFabricObject).data = {
                    elementId: newImage.id,
                    elementType: 'IMAGE',
                    elementData: newImage,
                };
                addInteractiveElement(IMAGE, newImage);
                setActiveObject(fabricImage);
            };

            imgElement.onerror = function () {
                console.error("Failed to load the image from local path");
            };
        }
        closeStickerModal();
    }

    // Add text	
    const addText = useCallback((style: any) => {
        if (!validateInteractiveElements()) {
            toast.error("Maximum number of interactive elements reached");
            setOpenTextTypesModal(false);
            return;
        }

        else if (editor) {
            const canvas = editor.canvas;

            const imgElement = new Image();
            imgElement.src = style.image;

            imgElement.onload = function () {
                const fabricImage = new fabric.FabricImage(imgElement, {
                    originX: 'center',
                    originY: 'center',
                    scaleX: 160 / imgElement.width,
                    scaleY: 160 / imgElement.height,
                    selectable: true,
                    hasControls: true,
                });

                const width = calculateDimension(defaultElementWidth, canvasWidth);
                const height = calculateDimension(defaultElementHeight, canvasHeight);
                const left = calculateLeft(40);
                const top = calculateTop(40);

                const text = new fabric.Textbox('Add Text', {
                    fontSize: 16,
                    fill: convertStringToColor(style.color_for_txt_bg?.text_color) || 'black',
                    fontFamily: fontFamily || style.text_family || 'Arial',
                    textAlign: 'center',
                    width: width,
                    height: height,
                    originX: 'center',
                    originY: 'center',
                });

                // Group the image and text together
                const group = new fabric.Group([fabricImage, text], {
                    left,
                    top,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                });

                canvas.add(group);
                addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement, undefined, undefined, setActiveObject);
                canvas.setActiveObject(group);
                canvas.renderAll();

                // Set the state for the colors, fonts, and other properties
                setBorderColor(convertStringToColor(style.color_for_txt_bg?.background_color || 'transparent'));
                setTextColor(convertStringToColor(style.color_for_txt_bg?.text_color || 'transparent'));
                setBackgroundColor(convertStringToColor(style.color_for_txt_bg?.background_color || 'transparent'));
                setFontFamily(style.text_family || 'Arial');

                const newText: ContainerText = {
                    id: Date.now(),
                    text: style.text || 'Text',
                    font_size: 6,
                    rotation: 0,
                    txtFamily: fontFamily || 'Arial',
                    color_for_txt_bg: {
                        background_color: convertStringToColor(style.color_for_txt_bg?.background_color || '') || 'transparent',
                        text_color: convertStringToColor(style.color_for_txt_bg?.text_color || '') || 'transparent',
                    },
                    on_action: {
                        link_url: null,
                        video_path: null,
                        android_streaming_url: null,
                        ending_time: '',
                        id_of_video_list: -1,
                        ios_streaming_url: null,
                        skip_time_on_same_video: null,
                        starting_time: null,
                        linked_post_id: null,
                    },
                    is_selected: false,
                    height: height,
                    width: width,
                    top: top,
                    left: left,
                    starting_time: 0,
                    ending_time: 0,
                    album_model_id: '000',
                    bgShadow: '',
                    txtShadow: '',
                    img_path: style.image,
                };

                (group as CustomFabricObject).data = {
                    elementType: 'TEXT',
                    elementId: newText.id,
                };

                addInteractiveElement(TEXT, newText);
                setActiveObject(group);
                setOpenTextTypesModal(false);
            };

            imgElement.onerror = function () {
                console.error("Failed to load the image from URL");
            };
        }
    }, [editor, fontFamily]);

    // rendering image on the canvas
    const addImage = (interactiveImage: string) => {
        if (!validateInteractiveElements()) {
            toast.error('Maximum number of interactive elements reached');
            return;
        };
        if (interactiveImage && editor) {
            const canvas = editor.canvas;

            const imgElement = new Image();
            imgElement.src = interactiveImage; // Use the local path

            imgElement.onload = function () {
                const fabricImage = new fabric.FabricImage(imgElement, {
                    left: 50,
                    top: 50,
                    scaleX: 60 / canvas.width,
                    scaleY: 60 / canvas.height,
                    selectable: true,
                    hasBorders: true,
                    hasControls: true,
                });

                canvas.add(fabricImage);
                addCustomControls(fabricImage, canvas, addInteractiveElement, deleteInteractiveElement, undefined, undefined, setActiveObject);
                canvas.setActiveObject(fabricImage);
                canvas.renderAll();

                const newImage: ImagesInteractiveResponse = {
                    album_model_id: '',
                    color_for_txt_bg: {
                        background_color: null,
                        text_color: "0xffffffff",
                    },
                    ending_time: 0,
                    id: Date.now(),
                    image_type: 0,
                    img_path: interactiveImage, // Store the local path
                    is_selected: false,
                    is_show: null,
                    is_Sticker: false,
                    last_next_video_jump_duration: null,
                    medium_type: "",
                    on_action: {

                        link_url: null,
                        video_path: null,
                        android_streaming_url: null,
                        ending_time: null,
                        id_of_video_list: 1,
                        ios_streaming_url: null,
                        skip_time_on_same_video: null,

                        starting_time: null,
                    },
                    rotation: fabricImage.angle || 0,
                    starting_time: 0,
                    text: '',
                    text_and_image_alignment: null,
                    text_family: null,
                    video_id: "-1",
                    height: fabricImage.height!,
                    width: fabricImage.width!,
                    top: fabricImage.top!,
                    left: fabricImage.left!,
                };

                (fabricImage as CustomFabricObject).data = {
                    elementId: newImage.id,
                    elementType: 'IMAGE',
                    elementData: newImage,
                };
                fabricImage.setControlsVisibility({      //hinding scaling handles on edges, keep them only on corners to lock aspect ratio
                    mt: false, 
                    mb: false, 
                    ml: false, 
                    mr: false, 
                })
                addInteractiveElement(IMAGE, newImage);
                setActiveObject(fabricImage);
            };

            imgElement.onerror = function () {
                console.error("Failed to load the image from local path");
            };
        }
    };

    // update object dimensions in the json context when the object is moved or resized
    // used when handling canvas events
    const updateObjectDimensions = useCallback(
        (object: CustomFabricObject, finalJson: FinalJson) => {
            if (object?.data?.elementId && object?.data?.elementType) {
                const elementId = object.data.elementId;
                const elementType = object.data.elementType;
                const existingElement = getExistingElement(elementId, elementType, finalJson);
                const height = object.height * object.scaleY;
                const width = object.width * object.scaleX;
                const top = object.top;
                const left = object.left;


                if (existingElement) {
                    const updatedElement = {
                        ...existingElement,

                        height: pixelToPercentage(height, parentSize.height),
                        width: pixelToPercentage(width, parentSize.width),
                        top: pixelToPercentage(top, parentSize.height) - 4.3,
                        left: pixelToPercentage(left, parentSize.width) - 10,

                    };

                    updateInteractiveElement(elementType, updatedElement);
                }
            }
        },
        [updateInteractiveElement]
    );

    // Get existing element from finalJson based on elementId and elementType
    const getExistingElement = useCallback(
        (elementId: number, elementType: string, finalJson: FinalJson) => {
            if (!finalJson) {
                return null;
            }

            const { functionality_datas } = finalJson;

            switch (elementType) {
                case 'BUTTON':
                    return functionality_datas!.list_of_buttons.find((btn) => btn.id === elementId);
                case 'TEXT':
                    return functionality_datas!.list_of_container_text.find((txt) => txt.id === elementId);
                case 'IMAGE':
                    return functionality_datas!.list_of_images.find((img) => img.id === elementId);
                case 'LINK':
                    return functionality_datas!.list_of_links.find((lnk) => lnk.id === elementId);
                default:
                    return null;
            }
        },
        []
    );

    // Saving the text of the interactive element in finalJson
    const handleTextSave = (newText: string) => {
        if (activeObject && activeObject.type === 'group' || activeObject && activeObject.type === 'textbox') {
            const textObj = activeObject.type === 'group'
                ? activeObject._objects.find((obj: any) => obj.type === 'textbox') as fabric.Textbox
                : activeObject as fabric.Textbox;

            if (textObj) {
                textObj.set('text', newText);
                editor!.canvas.renderAll();
                if (activeObject && finalJsondetails) {
                    const elementId = activeObject.data?.elementId;
                    const elementType = activeObject.data?.elementType;

                    if (elementId) {
                        let updatedElement: ContainerText | null = null;

                        switch (elementType) {
                            case 'TEXT':
                                updatedElement = {
                                    ...finalJsondetails.functionality_datas!.list_of_container_text.find(txt => txt.id === elementId),
                                    text: newText || '',
                                } as ContainerText;
                                break;

                            default:
                                console.warn('Unknown element type:', elementType);
                                return;
                        }

                        if (updatedElement) {
                            updateInteractiveElement(elementType, updatedElement);
                        }
                    }
                }
            }
        }
        setIsTextEditModalOpen(false);
    };

    const handleFontSizeSave = (fontSize: string) => {
        setFontSize(fontSize);

        const numericFontSize = parseInt(fontSize, 10);

        if (activeObject && activeObject.type === 'group') {
            const textObj = activeObject._objects.find((obj: any) => obj.type === 'textbox') as fabric.Textbox;

            if (textObj) {
                textObj.set('fontSize', numericFontSize);
                editor!.canvas.renderAll();
            }

            if (activeObject && finalJsondetails) {
                const elementId = activeObject.data?.elementId;
                const elementType = activeObject.data?.elementType;

                if (elementId) {
                    let updatedElement: ContainerText | null = null;

                    switch (elementType) {

                        case 'TEXT':
                            updatedElement = {
                                ...finalJsondetails.functionality_datas!.list_of_container_text.find(txt => txt.id === elementId),
                                fontsize: numericFontSize,
                            } as ContainerText;
                            break;

                        default:
                            console.warn('Unknown element type:', elementType);
                            return;
                    }

                    if (updatedElement) {
                        updateInteractiveElement(elementType, updatedElement);
                    }
                }
            }
        }

        setOpenFontSizeModal(false);
    };

    // control functions
    const closeAllModals = () => {
        setOpenFontFamily(false);
        setOpenLinkModal(false);
        setOpenTextTypesModal(false);
        setOpenFontSizeModal(false);
        setIsImageTypePickerOpen(false);
        setIsAspectRatioPickerOpen(false);
        setOpenLinkModal(false);
    }

    const toggleFontModal = () => { closeAllModals(); setOpenFontFamily(!openFontFamily) };
    const toggleImageTypePicker = () => { closeAllModals(); setIsImageTypePickerOpen(!isImageTypePickerOpen) };
    const toggleTextTypesModal = () => { closeAllModals(); setOpenTextTypesModal(!openTextTypesModal) };
    const toggleFontSizeModal = () => { closeAllModals(); setOpenFontSizeModal(!openFontSizeModal) };

    const closeFontSizeModal = () => setOpenFontSizeModal(false);
    const handleOpenStickerModal = () => { closeAllModals(); setOpenStickerModal(true) };
    const closeStickerModal = () => setOpenStickerModal(false);
    const toggleAspectRatioPicker = () => {
        closeAllModals();
        setIsAspectRatioPickerOpen(!isAspectRatioPickerOpen);
    };
    const handleNext = () => {
        closeAllModals();
        saveCanvasElements();
        setCurrentIndex((prev) => prev + 1);
    }
    const handlePrev = () => {
        closeAllModals();
        saveCanvasElements();
        setCurrentIndex((prev) => prev - 1);
    }

    const checkIsSticker = (): boolean => {
        if (activeObject) {
            const elementId = activeObject.data?.elementId
            const elementType = activeObject.data?.elementType;
            if (!elementId || !elementType || elementType !== "IMAGE") {
                return false;
            };
            const json = finalJsondetails?.functionality_datas?.list_of_images?.find((img) => img.id === elementId);

            if (!json || json?.is_Sticker) {

                return false;
            }

            return true
        }
        else {
            return false
        }
    }


    const pixelToPercentage = (value: number, parentSize: number) => {
        return (value / parentSize) * 100;
    }
    const percentToPixel = (value: number, parentSize: number) => {
        return (value / 100) * parentSize;
    }


    return (
        <div className="w-full h-full flex flex-col lg:flex-row">
            {/* Image and canvas */}
            <div className={`flex-1 lg:h-full w-full flex items-center justify-center p-2 sm:p-4 lg:p-0 ${step === 3 && !finalSubmitLoading && 'max-md:hidden'} `}>
                <div className="px-2 sm:px-4 lg:px-7 relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                    <div className="relative overflow-hidden bg-bg-color flex justify-start items-start rounded-lg lg:rounded-none">
                        <div
                            style={{ aspectRatio: finalJsondetails?.aspect_ratio }}
                            className="aspect-[9/16] w-full max-h-[50vh] sm:max-h-[60vh] lg:max-h-[80vh] lg:w-96"
                        >
                            <img
                                key={currentIndex}
                                src={imageFileSrc as string}
                                className="z-0 object-cover w-full h-full"
                                width={canvasWidth}
                                height={canvasHeight}
                                ref={imageRef}
                                alt="interactive Shot"
                            />
                        </div>

                        <FabricJSCanvas
                            key={"canvasEditor"}
                            className="absolute inset-0"
                            onReady={onReady}
                        />
                    </div>

                    {/* Navigation arrows */}
                    {imageJsonList.length > 1 && (
                        <>
                            <button
                                className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-secondary-bg-color rounded-full p-1.5 sm:p-2 transition-opacity ${currentIndex === 0 ? 'opacity-40' : 'opacity-100'
                                    }`}
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                            >
                                <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-secondary-bg-color opacity-70 rounded-full p-1.5 sm:p-2 transition-opacity ${currentIndex === imageJsonList.length - 1 ? 'opacity-40' : 'opacity-100'
                                    }`}
                                onClick={handleNext}
                                disabled={currentIndex === imageJsonList.length - 1}
                            >
                                <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col justify-between lg:h-full w-full lg:max-w-md xl:max-w-lg">
                {/* Select element type */}
                <div className={`${step === 3 ? 'flex-1' : 'md:mb-2'} p-2 lg:p-0`}>
                    {step === 2 && (
                        <div className="w-full">
                            <div className="grid grid-cols-3 lg:grid-cols-2 gap-3 lg:gap-4 place-content-center lg:p-4">
                                <ControlButton label="Stickers" onClick={handleOpenStickerModal}>
                                    <RiEmojiStickerLine size={30} />
                                </ControlButton>
                                <ControlButton
                                    label="Image"
                                    htmlFor="interactive-image"
                                    type="file"
                                    onChange={handleImageUpload}
                                >
                                    <PiImageSquareBold size={30} />
                                </ControlButton>
                                <ControlButton label="Text" onClick={toggleTextTypesModal}>
                                    <RxText size={30} />
                                </ControlButton>
                            </div>
                        </div>
                    )}
                    {step === 3 && !finalSubmitLoading && (
                        <div className="w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0">
                            <PostDetails
                                finalSubmitLoading={finalSubmitLoading}
                                coverFileImage={imageJsonList[0].path}
                                onSubmit={onSubmit}
                                setPostInformation={setPostInformation}
                            />
                        </div>
                    )}
                </div>

                {/* Select properties */}
                <div className={`${step === 3 && !finalSubmitLoading && 'max-md:hidden'} p-2 lg:p-0`}>
                    {activeObject && activeObject.data?.elementType !== "IMAGE" ? (
                        <div className="w-full border-t border-border-color lg:border-t lg:border-border-color pt-3 lg:pt-0">
                            <div className="grid grid-cols-3 lg:grid-cols-2 gap-3 lg:gap-4 place-content-center lg:p-4">
                                <ControlButton
                                    label="Border"
                                    htmlFor="border-color"
                                    type="color"
                                    value={borderColor}
                                    onChange={(e) => setBorderColor(e.target.value)}
                                />
                                <ControlButton
                                    label="Text Color"
                                    htmlFor="text-color"
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                />
                                <ControlButton label="Family" onClick={toggleFontModal} />
                                <ControlButton label="Size" onClick={toggleFontSizeModal} />
                                <ControlButton
                                    label="Background"
                                    htmlFor="bg-color"
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                />
                                <ControlButton
                                    label="Shadow"
                                    htmlFor="shadow-color"
                                    type="color"
                                    value={shadowColor}
                                    onChange={(e) => setShadowColor(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : activeObject && checkIsSticker() && (
                        <div className="w-full border-t border-border-color lg:border-t lg:border-border-color pt-3 lg:pt-0">
                            <div className="grid grid-cols-2 gap-3 lg:gap-4 place-content-center lg:p-4">
                                <ControlButton label="Aspect-Ratio" onClick={toggleAspectRatioPicker} />
                                <ControlButton label="Type" onClick={toggleImageTypePicker} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {openTextTypesModal && <InteractvieTextTypesModal addText={addText} />}
            {openFontFamily && <FontFamilyModal setFontFamily={setFontFamily} setopenFontFamily={setOpenFontFamily} />}
            {isTextEditModalOpen && <TextEditModal text={editText} onSave={handleTextSave} onClose={() => setIsTextEditModalOpen(false)} />}
            {openFontSizeModal && <FontSizeModal activeObject={activeObject} fontSize={fontSize} onClose={closeFontSizeModal} onSave={handleFontSizeSave} />}
            {isImageTypePickerOpen && <ImageTypePicker imageUrl={activeObject?.data?.elementData.img_path} setImageType={setImageType} selectedType={imageType} onClose={() => setIsImageTypePickerOpen(false)} />}
            {isAspectRatioPickerOpen && <ImageAspectRatioPicker imageUrl={activeObject?.data?.elementData.img_path} setAspectRatio={setAspectRatio} selectedRatio={aspectRatio} onClose={() => setIsAspectRatioPickerOpen(false)} />}
            {openStickerModal && <StickerModal onClose={closeStickerModal} handleStickerUpload={handleStickerUpload} />}
        </div>
    )
}

export default AddInteractiveElementsImage