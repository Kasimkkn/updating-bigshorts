import { BUTTON, canvasHeight, canvasWidth, defaultElementFontSize, defaultElementHeight, defaultElementLeft, defaultElementTop, defaultElementWidth, IMAGE, LINK, TEXT } from '@/constants/interactivityConstants';
import { FinalJsonContext, initializeFinalJson } from '@/context/useInteractiveVideo';
import { useDebounce } from '@/hooks/useDebounce';
import { SingleButtons } from '@/models/designofbuttons';
import { ImagesInteractiveResponse } from '@/models/ImagesInteractiveResponse';
import { LinkInteractiveResponse } from '@/models/linkInteractiveResonse';
import { ContainerText } from "@/models/textcontainerdesign";
import { VideoList as FinalJson } from '@/models/videolist';
import { convertColorToString, convertStringToColor } from '@/utils/features';
import * as fabric from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaTimeline } from 'react-icons/fa6';
import { IoIosColorPalette } from 'react-icons/io';
import { IoColorWandSharp, IoTextSharp } from 'react-icons/io5';
import { PiImageSquareBold } from 'react-icons/pi';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { RxText } from "react-icons/rx";
import TrimmerModal from '../modal/TrimmerModal';
import ActionButtonModal from '../shared/ActionButtonModal';
import { absoluteToPercentage, addCustomControls, CustomFabricObject, getExistingElement, percentageToAbsolute, updateObjectDimensions, validateInteractiveElements } from '../shared/allNeededFunction';
import ControlButton from '../shared/ControlButton';
import FontFamilyModal from '../shared/FontFamilyModal';
import FontSizeModal from '../shared/FontSizeModal';
import InteractiveButtonTypesModal from '../shared/InteractiveButtonTypesModal';
import InteractiveStickerModal from '../shared/InteractiveStickerModal';
import InteractvieTextTypesModal from '../shared/InteractvieTextTypesModal';
import LinkAddModal from '../shared/LinkAddModal';
import PostDetails from '../shared/PostDetails/PostDetails';
import TextEditModal from '../shared/TextEditModal';
import { AddInteractiveElementsProps, ElementType, InteractiveElement } from './addInteractiveElementTypes';
import VideoSettings from './VideoSettings';

const AddInteractiveElements: React.FC<AddInteractiveElementsProps> = ({
    fileType,
    videoFileSrc,
    audioDetails,
    startTime,
    endTime,
    videoDuration,
    handleFileSelect,
    fileUploadLoading,
    step,
    setStartTime,
    setEndTime,
    setVideoDuration,
    finalSubmitLoading,
    coverFileImage,
    onSubmit,
    setPostInformation,
    setCoverFileImage,
    onNext,
}) => {

    const context = useContext(FinalJsonContext);

    if (!context) {
        throw new Error('AddInteractiveElements must be used within a FinalJsonProvider');
    }

    const { finalJsondetails, setFinalJsondetails, addInteractiveElement, updateInteractiveElement, deleteInteractiveElement, addNewVideoToFinalJson, setVideoList, videoList } = context;
    const finalJsonRef = useRef<FinalJson | undefined>(finalJsondetails);
    const { editor, onReady } = useFabricJSEditor();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [videoIndex, setVideoIndex] = useState(0);
    const [showButtonTypes, setShowButtonTypes] = useState(false);
    const [activeObject, setActiveObject] = useState<CustomFabricObject | null>(null);
    const [borderColor, setBorderColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [openFontFamily, setOpenFontFamily] = useState(false);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState('10');
    const debouncedBorderColor = useDebounce(borderColor, 500);
    const debouncedTextColor = useDebounce(textColor, 500);
    const debouncedBackgroundColor = useDebounce(backgroundColor, 500);
    const debouncedFontFamily = useDebounce(fontFamily, 500);
    const [isTextEditModalOpen, setIsTextEditModalOpen] = useState(false);
    const [editText, setEditText] = useState('');
    const [openLinkModal, setOpenLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkLabel, setLinkLabel] = useState('');
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [openTextTypesModal, setOpenTextTypesModal] = useState(false);
    const [openFontSizeModal, setOpenFontSizeModal] = useState(false);
    const [showStickerTypes, setShowStickerTypes] = useState(false);
    const [openTimeLineModal, setOpenTimeLineModal] = useState(false);
    const [startingTimeOfElement, setStartingTimeOfElement] = useState(0);
    const [endingTimeOfElement, setEndingTimeOfElement] = useState(0);
    const [maxDuration, setMaxDuration] = useState<number>(0);
    const [videoKey, setVideoKey] = useState<number>(0);
    const videoInitializedRef = useRef(false);
    const videoUrl = videoList[videoIndex]?.path;

    useEffect(() => {
        if (videoDuration) {
            setEndingTimeOfElement(videoDuration);
        }
    }, [videoDuration]);

    useEffect(() => {
        finalJsonRef.current = finalJsondetails;
    }, [finalJsondetails]);

    useEffect(() => {
        if (videoFileSrc && !finalJsondetails && !videoList.some((video) => video.path === videoFileSrc) && !videoInitializedRef.current) {
            const newFinalJson = initializeFinalJson({
                duration: videoDuration?.toFixed(1).toString()!,
                path: videoFileSrc,
                id: 0,
                parent_id: -1,
                audioDuration: audioDetails?.audioDuration || '0',
                audioPath: audioDetails?.audioUrl || '',

            });
            setFinalJsondetails(newFinalJson);
            setVideoList((prevList) => [...prevList, newFinalJson]);
            videoInitializedRef.current = true;
        }
    }, [videoFileSrc, finalJsondetails, videoList]);

    useEffect(() => {
        const video = videoRef.current;

        if (video) {
            const handleThumbnailCapture = () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext("2d");

                if (context) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataURL = canvas.toDataURL("image/png");
                    setCoverFileImage(dataURL);
                }
            };

            // Create a one-time seeked event handler
            const handleSeeked = () => {
                handleThumbnailCapture();
                video.removeEventListener("seeked", handleSeeked);
            };

            // Listen for the seeked event
            video.addEventListener("seeked", handleSeeked);

            // Wait for video to be ready before seeking
            const handleLoadedData = () => {
                // Set current time to 1 second (or less if the video is shorter)
                const targetTime = Math.min(1, video.duration);
                video.currentTime = targetTime;

                // If the video is already at the target time (or very close)
                // we might not get a seeked event, so capture now
                if (Math.abs(video.currentTime - targetTime) < 0.1) {
                    handleThumbnailCapture();
                    video.removeEventListener("seeked", handleSeeked);
                }
            };

            video.addEventListener("loadeddata", handleLoadedData);

            // Clean up all event listeners on unmount
            return () => {
                video.removeEventListener("loadeddata", handleLoadedData);
                video.removeEventListener("seeked", handleSeeked);
            };
        }
    }, [videoUrl]);

    useEffect(() => {
        if (videoRef.current && videoList[videoIndex]) {
            const videoElement = videoRef.current;
            videoElement.src = videoList[videoIndex].path;
            videoElement.currentTime = startTime || 0;
            videoElement.play().catch(error => console.error('Error trying to play the video:', error));

            // Initialize canvas after video metadata is loaded
            const handleLoadedMetadata = () => {
                initializeCanvas();
                videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };

            videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

            return () => {
                videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [videoIndex]);

    useEffect(() => {
        if (activeObject && updateInteractiveElement) {
            const elementId = activeObject.data?.elementId;
            const elementType = activeObject.data?.elementType;

            if (elementId && elementType) {
                let updatedElement: ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse | SingleButtons | null = null;

                switch (elementType) {
                    case 'BUTTON':
                        updatedElement = {
                            ...finalJsondetails?.functionality_datas?.list_of_buttons?.find((btn) => btn.id === elementId),
                            height: absoluteToPercentage.height(activeObject.height * (activeObject.scaleY || 1)),
                            width: absoluteToPercentage.width(activeObject.width * (activeObject.scaleX || 1)),
                            top: absoluteToPercentage.top(activeObject.top),
                            left: absoluteToPercentage.left(activeObject.left),
                            rotation: activeObject.angle || 0,
                            color_for_txt_bg: {
                                background_color: convertColorToString(debouncedBackgroundColor),
                                text_color: convertColorToString(debouncedTextColor),
                            },
                            text_family: debouncedFontFamily,
                        } as unknown as SingleButtons;
                        break;
                    case 'TEXT':
                        updatedElement = {
                            ...finalJsondetails?.functionality_datas?.list_of_container_text?.find((txt) => txt.id === elementId),
                            txtFamily: debouncedFontFamily,
                            color_for_txt_bg: {
                                background_color: convertColorToString(debouncedBackgroundColor),
                                text_color: convertColorToString(debouncedTextColor),
                            },
                            height: absoluteToPercentage.height(activeObject.height * (activeObject.scaleY || 1)),
                            width: absoluteToPercentage.width(activeObject.width * (activeObject.scaleX || 1)),
                            top: absoluteToPercentage.top(activeObject.top),
                            left: absoluteToPercentage.left(activeObject.left),
                        } as unknown as ContainerText;
                        break;

                    case 'IMAGE':
                        updatedElement = {
                            ...finalJsondetails?.functionality_datas?.list_of_images?.find((img) => img.id === elementId),
                            height: absoluteToPercentage.height(activeObject.height * (activeObject.scaleY || 1)),
                            width: absoluteToPercentage.width(activeObject.width * (activeObject.scaleX || 1)),
                            top: absoluteToPercentage.top(activeObject.top),
                            left: absoluteToPercentage.left(activeObject.left),
                            rotation: activeObject.angle || 0,
                        } as unknown as ImagesInteractiveResponse;
                        break;

                    case 'LINK':
                        updatedElement = {
                            ...finalJsondetails?.functionality_datas?.list_of_links?.find((lnk) => lnk.id === elementId),
                            color_for_txt_bg: {
                                background_color: convertColorToString(debouncedBackgroundColor),
                                text_color: convertColorToString(debouncedTextColor),
                            },
                            border_color: convertColorToString(debouncedBorderColor),
                            text_family: debouncedFontFamily,
                            height: absoluteToPercentage.height(activeObject.height * (activeObject.scaleY || 1)),
                            width: absoluteToPercentage.width(activeObject.width * (activeObject.scaleX || 1)),
                            top: absoluteToPercentage.top(activeObject.top),
                            left: absoluteToPercentage.left(activeObject.left),
                            is_border: !!debouncedBorderColor,
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
        activeObject,
        updateInteractiveElement,
    ]);

    const initializeCanvas = useCallback(() => {
        if (!editor) return;
        const canvas = editor.canvas;

        // Clear the canvas but preserve dimensions
        canvas.clear();
        canvas.setDimensions({ width: canvasWidth, height: canvasHeight });

        if (finalJsondetails?.functionality_datas) {
            // Render elements in a specific order to maintain proper layering
            renderButtons(canvas);
            renderTextElements(canvas);
            renderImages(canvas);
            renderLinks(canvas);
        }

        canvas.renderAll();
    }, [editor, finalJsondetails]);

    const renderButtons = (canvas: fabric.Canvas) => {
        if (!finalJsondetails?.functionality_datas || !finalJsondetails.functionality_datas.list_of_buttons) return;
        finalJsondetails.functionality_datas.list_of_buttons.forEach(button => {

            const left = percentageToAbsolute.left(button.left || defaultElementLeft);
            const top = percentageToAbsolute.top(button.top || defaultElementTop);
            const width = percentageToAbsolute.width(button.width || defaultElementWidth);
            const height = percentageToAbsolute.height(button.height || defaultElementHeight);

            if (button.isForHotspot === 1) {
                const rect = new fabric.Rect({
                    width,
                    height,
                    top,
                    left,
                    rx: button.radius || 0,
                    fill: 'transparent',
                    selectable: true,
                    evented: true,
                });
                (rect as CustomFabricObject).data = {
                    elementId: button.id,
                    elementType: 'BUTTON',
                };
                canvas.add(rect);
                addCustomControls(rect, canvas, addInteractiveElement, deleteInteractiveElement, openTheActionModalOnly, undefined, setActiveObject);
            } else {
                const rect = new fabric.Rect({
                    fill: convertStringToColor(button.color_for_txt_bg.background_color!),
                    width,
                    height,
                    rx: button.radius || 0,
                    stroke: convertStringToColor(button.border_color || 'transparent'),
                    strokeWidth: button.is_border ? 1 : 0,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                    evented: true,
                });

                // Create the text for the button
                const buttonText = button.text || 'Button';
                const text = new fabric.Textbox(buttonText, {
                    fontSize: button.font_size || defaultElementFontSize,
                    fill: convertStringToColor(button.color_for_txt_bg.text_color!),
                    fontFamily: button.text_family || 'Arial',
                    width,
                    height,
                    textAlign: 'center',
                    originX: 'center',
                    originY: 'center',
                });

                // Group the rectangle and text together
                const group = new fabric.Group([rect, text], {
                    top,
                    left,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                    evented: true,
                });
                (group as CustomFabricObject).data = {
                    elementId: button.id,
                    elementType: 'BUTTON',
                };
                canvas.add(group);
                addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement, openTheActionModalOnly, undefined, setActiveObject);
            }
        });
    };

    const renderTextElements = (canvas: fabric.Canvas) => {
        if (!finalJsondetails?.functionality_datas || !finalJsondetails.functionality_datas.list_of_container_text) return;

        finalJsondetails.functionality_datas.list_of_container_text.forEach(textItem => {
            const left = percentageToAbsolute.left(textItem.left || defaultElementLeft);
            const top = percentageToAbsolute.top(textItem.top || defaultElementTop);
            const width = percentageToAbsolute.width(textItem.width || defaultElementWidth);
            const height = percentageToAbsolute.height(textItem.height || defaultElementHeight);
            if (textItem.img_path) {
                // Load the image if the path is available
                const imgElement = new Image();
                imgElement.src = textItem.img_path;
                imgElement.onload = function () {
                    // Create the fabric image element
                    const fabricImage = new fabric.FabricImage(imgElement, {
                        originX: 'center',
                        originY: 'center',
                        scaleX: 50 / canvas.width,
                        scaleY: 50 / canvas.height,
                        selectable: true,
                        hasControls: true,
                        evented: true,
                    });

                    // Create the text element to overlay on the image
                    const text = new fabric.Textbox(textItem.text || 'Text', {
                        fontSize: textItem.font_size || defaultElementFontSize,
                        fill: convertStringToColor(textItem.color_for_txt_bg?.text_color!),
                        fontFamily: textItem.txtFamily || 'Arial',
                        width: width,
                        height: height,
                        textAlign: 'center',
                        strokeWidth: textItem.isBorder ? 1 : 0,
                        originX: 'center',
                        originY: 'center',
                        selectable: true,
                        evented: true,
                    });

                    // Group the image and text together
                    const group = new fabric.Group([fabricImage, text], {
                        left: left,
                        top: top,
                        originX: 'center',
                        originY: 'center',
                        selectable: true,
                        evented: true,
                    });

                    (group as CustomFabricObject).data = {
                        elementId: textItem.id,
                        elementType: 'TEXT',
                    };
                    // Add the group to the canvas
                    canvas.add(group);
                    addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement, openTheActionModalOnly, undefined, setActiveObject);
                };

                imgElement.onerror = function () {
                    console.error("Failed to load the image from the provided path");
                };
            } else {
                // Handle the case where there is no image, and only text is rendered
                const text = new fabric.Textbox(textItem.text || 'Text', {
                    fontSize: textItem.font_size || defaultElementFontSize,
                    fill: convertStringToColor(textItem.color_for_txt_bg?.text_color!),
                    fontFamily: textItem.txtFamily || 'Arial',
                    width: width,
                    height: height,
                    textAlign: 'center',
                    strokeWidth: textItem.isBorder ? 1 : 0,
                    top: top,
                    left: left,
                    selectable: true,
                    evented: true,
                });

                (text as CustomFabricObject).data = {
                    elementId: textItem.id,
                    elementType: 'TEXT',
                };

                canvas.add(text);
                addCustomControls(text, canvas, addInteractiveElement, deleteInteractiveElement, openTheActionModalOnly, undefined, setActiveObject);
            }
        });
    };

    const renderImages = (canvas: fabric.Canvas) => {
        if (!finalJsondetails?.functionality_datas || !finalJsondetails.functionality_datas.list_of_images) return;

        if (finalJsondetails?.functionality_datas.list_of_images?.length > 0) {
            finalJsondetails.functionality_datas.list_of_images.forEach(image => {
                const imgElement = new Image();
                imgElement.src = image.img_path!;
                const left = percentageToAbsolute.left(image.left || defaultElementLeft);
                const top = percentageToAbsolute.top(image.top || defaultElementTop);
                const width = percentageToAbsolute.width(image.width || defaultElementWidth);
                const height = percentageToAbsolute.height(image.height || defaultElementHeight);

                imgElement.onload = function () {
                    const scaleX = width / imgElement.width;
                    const scaleY = height / imgElement.height;
                    const fabricImage = new fabric.FabricImage(imgElement, {
                        left: left,
                        top: top,
                        originX: 'center',
                        originY: 'center',
                        scaleX,
                        scaleY,
                        selectable: true,
                        evented: true,
                    });

                    (fabricImage as CustomFabricObject).data = {
                        elementId: image.id,
                        elementType: 'IMAGE',
                    };
                    canvas.add(fabricImage);
                    addCustomControls(fabricImage, canvas, addInteractiveElement, deleteInteractiveElement, openTheActionModalOnly, undefined, setActiveObject);
                };

                imgElement.onerror = function () {
                    console.error("Failed to load the image from the provided URL");
                };
            });

        };
    };

    const renderLinks = (canvas: fabric.Canvas) => {

        if (!finalJsondetails?.functionality_datas || !finalJsondetails.functionality_datas.list_of_links) return;
        finalJsondetails.functionality_datas.list_of_links.forEach(link => {

            const left = percentageToAbsolute.left(link.left || defaultElementLeft);
            const top = percentageToAbsolute.top(link.top || defaultElementTop);
            const width = percentageToAbsolute.width(link.width || defaultElementWidth);
            const height = percentageToAbsolute.height(link.height || defaultElementHeight);
            const rect = new fabric.Rect({
                fill: convertStringToColor(link.color_for_txt_bg?.text_color!),
                width: width,
                height: height,
                stroke: convertColorToString(link.border_color),
                strokeWidth: link.is_border ? 1 : 0,
                originX: 'center',
                originY: 'center',
            });

            const text = new fabric.Textbox(link.label || 'Link', {
                fontSize: link.font_size || defaultElementFontSize,
                fill: convertStringToColor(link.color_for_txt_bg?.text_color!),
                fontFamily: link.text_family || 'Arial',
                width: width,
                height: height,
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            });

            const group = new fabric.Group([rect, text], {
                left: left,
                top: top,
                selectable: true,
                evented: true,
            });

            (group as CustomFabricObject).data = {
                elementId: link.id,
                elementType: 'LINK',
            }
            canvas.add(group);
            addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement, undefined, openOnlyEditModal, setActiveObject);
        });
    };

    useEffect(() => {
        if (editor) {
            const canvas = editor.canvas;
            canvas.clear();


            const videoWidth = canvas.width;
            const videoHeight = canvas.height;

            canvas.on('selection:created', () => {
                const activeObj = canvas.getActiveObject() as CustomFabricObject;
                setActiveObject(activeObj || null);
            });

            canvas.on('selection:updated', () => {
                const activeObj = canvas.getActiveObject() as CustomFabricObject;
                setActiveObject(activeObj || null);
            });

            const activeObj = canvas.getActiveObject() as fabric.Group;
            if (activeObj && activeObj.type === 'group') {
                const textObj = activeObj._objects.find((obj: any) => obj.type === 'textbox') as fabric.Textbox;
                if (textObj) {
                    setEditText(textObj.text || '');
                    setIsTextEditModalOpen(true);
                }
            }

            canvas.on('object:modified', async (e) => {
                const target = e.target as CustomFabricObject;
                if (target) {
                    const currentFinalJson = finalJsonRef.current;
                    if (currentFinalJson) {
                        updateObjectDimensions(target, currentFinalJson, updateInteractiveElement);
                    }
                }
            });
            canvas.on('mouse:dblclick', () => {
                const activeObj = canvas.getActiveObject() as fabric.Group;
                if (activeObj && activeObj.type === 'group') {
                    const textObj = activeObj._objects.find((obj: any) => obj.type === 'textbox') as fabric.Textbox;
                    if (textObj) {
                        setEditText(textObj.text || '');
                        setIsTextEditModalOpen(true);
                    }
                }
            });
            canvas.on('object:moving', (e) => {
                const obj = e.target;
                if (obj.left < 0) {
                    obj.set({ left: 70 });
                    obj.set({ left: 30 });
                }
                if (obj.top < 0) {
                    obj.set({ top: 30 });
                }
                if (obj.left > videoWidth) {
                    obj.set({ left: videoWidth - 45 });
                }
                if (obj.top > videoHeight) {
                    obj.set({ top: videoHeight - 30 });
                }
            });

            canvas.on('selection:cleared', () => {
                setActiveObject(null);
            });
        }
    }, [editor]);

    useEffect(() => {
        if (activeObject && activeObject.type === 'group') {
            const [rect, text] = activeObject._objects;
            setBackgroundColor(rect?.fill);
            setBorderColor(rect?.stroke);
            setFontFamily(text?.fontFamily);
            setTextColor(text?.fill);
        }
    }, [activeObject]);

    useEffect(() => {
        if (activeObject && (activeObject.type === 'group' || activeObject.type === 'textbox' || activeObject.type === 'image')) {
            if (activeObject.type === 'group') {
                const [rect, text] = activeObject._objects || [];

                if (rect && rect.type === 'rect') {
                    rect.set('fill', backgroundColor);
                    rect.set('stroke', borderColor);
                }

                if (text && text.type === 'textbox') {
                    text.set('fill', textColor);
                    text.set('fontFamily', fontFamily);
                }
            }
            if (activeObject.type === 'group' && activeObject._objects[0].type == 'image') {
                const img = activeObject._objects[0];
                if (img && img.type === 'image') {
                    img.set({
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
            editor!.canvas.renderAll();
        }
    }, [backgroundColor, borderColor, textColor, fontFamily, activeObject]);

    const renderImageOnCanvas = (imageUrl: string, is_Sticker?: boolean) => {
        if (!validateInteractiveElements(finalJsondetails!)) {
            toast.error('Maximum number of interactive elements reached');
            return;
        };

        if (imageUrl && editor) {
            const canvas = editor.canvas;
            const imgElement = new Image();
            imgElement.src = imageUrl;
            const width = percentageToAbsolute.width(defaultElementWidth);
            const height = percentageToAbsolute.height(defaultElementHeight);
            const left = percentageToAbsolute.left(defaultElementLeft);
            const top = percentageToAbsolute.top(defaultElementTop);
            imgElement.onload = function () {
                const fabricImage = new fabric.FabricImage(imgElement, {
                    left,
                    top,
                    scaleX: 50 / canvas.height,
                    scaleY: 50 / canvas.height,
                    selectable: true,
                    hasControls: true,
                });

                canvas.add(fabricImage);
                addCustomControls(fabricImage, canvas, addInteractiveElement, deleteInteractiveElement, openTheActionModalOnly, undefined, setActiveObject);
                canvas.setActiveObject(fabricImage);
                canvas.renderAll();
                const newImage: ImagesInteractiveResponse = {
                    album_model_id: '',
                    color_for_txt_bg: {
                        background_color: 'transparent',
                        text_color: 'transparent',
                    },
                    ending_time: endTime || 0,
                    height: absoluteToPercentage.height(height),
                    width: absoluteToPercentage.width(width),
                    top: absoluteToPercentage.height(top),
                    left: absoluteToPercentage.width(left),

                    id: Date.now(),
                    image_type: 0,
                    img_path: imageUrl, // Store the URL path
                    is_selected: false,
                    is_show: null,
                    last_next_video_jump_duration: null,
                    medium_type: 'image',
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
                    starting_time: startTime || 0,
                    text: '',
                    text_and_image_alignment: null,
                    text_family: null,
                    video_id: '',
                    is_Sticker: is_Sticker ? true : false,
                };

                (fabricImage as CustomFabricObject).data = {
                    elementId: newImage.id,
                    elementType: 'IMAGE',
                    elementData: newImage,
                };
                addInteractiveElement(IMAGE, newImage);
            };

            imgElement.onerror = function () {
                console.error("Failed to load the image from the URL path");
            };
        }
    };
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const localImageUrl = URL.createObjectURL(file);
            renderImageOnCanvas(localImageUrl);
            return localImageUrl;
        }
        return null;
    };

    useEffect(() => {
        if (activeObject) {
            const elementId = activeObject.data?.elementId;
            const elementType = activeObject.data?.elementType;
            const existingdata = getExistingElement(elementId!, elementType!, finalJsondetails!);
            const width = absoluteToPercentage.width(activeObject.width * (activeObject.scaleX || 1));
            const height = absoluteToPercentage.height(activeObject.height * (activeObject.scaleY || 1));
            if (elementId && elementType) {
                let updatedElement: SingleButtons | ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse | null = null;
                switch (elementType) {
                    case 'BUTTON':
                        updatedElement = {
                            ...existingdata,
                            color_for_txt_bg: {
                                background_color: convertColorToString(debouncedBackgroundColor),
                                text_color: convertColorToString(debouncedTextColor),
                            },
                            border_color: '',
                            text_family: debouncedFontFamily,
                            height,
                            width,
                            starting_time: startingTimeOfElement,
                            ending_time: endingTimeOfElement,
                        } as unknown as SingleButtons;
                        break;
                    case 'HOTSPOT':
                        updatedElement = {
                            ...existingdata,
                            height,
                            width,
                            starting_time: startingTimeOfElement,
                            ending_time: endingTimeOfElement,
                        }
                        break;
                    case 'TEXT':
                        updatedElement = {
                            ...existingdata,
                            txtFamily: debouncedFontFamily,
                            color_for_txt_bg: {
                                background_color: convertColorToString(debouncedBackgroundColor),
                                text_color: convertColorToString(debouncedTextColor),
                            },
                            height,
                            width,
                            top: activeObject.top,
                            left: activeObject.left,
                            starting_time: startingTimeOfElement,
                            ending_time: endingTimeOfElement,
                        } as unknown as ContainerText;
                        break;

                    case 'IMAGE':
                        updatedElement = {
                            ...existingdata,
                            height,
                            width,
                            top: activeObject.top,
                            left: activeObject.left,
                            starting_time: startingTimeOfElement,
                            ending_time: endingTimeOfElement,
                            rotation: activeObject.angle || 0,
                        } as unknown as ImagesInteractiveResponse;
                        break;

                    case 'LINK':
                        updatedElement = {
                            ...existingdata,
                            color_for_txt_bg: {
                                background_color: convertColorToString(debouncedBackgroundColor),
                                text_color: convertColorToString(debouncedTextColor),
                            },
                            border_color: '',
                            text_family: debouncedFontFamily,
                            height,
                            width,
                            top: activeObject.top,
                            left: activeObject.left,
                            starting_time: startingTimeOfElement,
                            ending_time: endingTimeOfElement,
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
        activeObject,
        startingTimeOfElement,
        endingTimeOfElement,
    ]);
    const addButton = (style: any) => {
        if (!validateInteractiveElements(finalJsondetails!)) {
            setShowButtonTypes(false);
            toast.error("Maximum number of interactive elements reached");
            return;
        }

        if (editor) {
            const canvas = editor.canvas;
            const buttonWidth = percentageToAbsolute.width(defaultElementWidth);
            const buttonHeight = percentageToAbsolute.height(defaultElementHeight);
            const left = percentageToAbsolute.left(defaultElementLeft);
            const top = percentageToAbsolute.top(defaultElementTop);
            const btnbg = style.color_for_txt_bg.background_color ? convertStringToColor(style.color_for_txt_bg.background_color) : '#000000';
            const btnTextColor = style.color_for_txt_bg.text_color ? convertStringToColor(style.color_for_txt_bg.text_color) : '#FFFFFF';
            const btnBorderColor = style.border_color ? convertStringToColor(style.border_color) : '#000000';
            const btnShadowColor = style.background_shadow ? convertStringToColor(style.background_shadow) : '#000000';
            const btnTextShadowColor = style.text_shadow ? convertStringToColor(style.text_shadow) : '#000000';
            const btnFontFamily = style.text_family || 'Arial';
            const btnRadius = style.radius || 8;

            const rect = new fabric.Rect({
                fill: btnbg,
                width: buttonWidth,
                height: buttonHeight,
                rx: btnRadius,
                stroke: btnBorderColor,
                strokeWidth: style.is_border ? 1 : 0,
                shadow: btnShadowColor ? new fabric.Shadow({ color: btnShadowColor }) : undefined,
                originX: 'center',
                originY: 'center',
                selectable: true,
                evented: true,
            });

            const text = new fabric.Textbox(style.text || 'Button', {
                fontSize: defaultElementFontSize,
                fill: btnTextColor,
                fontFamily: btnFontFamily,
                textAlign: 'center',
                width: buttonWidth,
                originX: 'center',
                originY: 'center',
                shadow: btnTextShadowColor ? new fabric.Shadow({ color: btnTextShadowColor }) : undefined,
            });

            const group = new fabric.Group([rect, text], {
                left,
                top,
                originX: 'center',
                originY: 'center',
                selectable: true,
            });

            canvas.add(group);

            addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement, openTheActionModalOnly, undefined, setActiveObject);
            canvas.setActiveObject(group);
            canvas.renderAll();

            setBorderColor(btnBorderColor);
            setTextColor(btnTextColor);
            setBackgroundColor(btnbg);
            setFontFamily(btnFontFamily);

            const newButton: SingleButtons = {
                id: Date.now(),
                type: style.type,
                radius: btnRadius || 0,
                buttonval: 5,
                color_for_txt_bg: {
                    background_color: convertColorToString(btnbg),
                    text_color: convertColorToString(btnTextColor),
                },
                on_action: {
                    video_path: null,
                    link_url: null,
                    id_of_video_list: videoIndex || 1,
                    starting_time: null,
                    ending_time: null,
                    android_streaming_url: null,
                    ios_streaming_url: null,
                    skip_time_on_same_video: null,
                },
                background_shadow: style.background_shadow || null,
                text_shadow: style.text_shadow || null,
                border_color: '',
                is_border: style.is_border || false,
                text: style.text || "",
                is_selected: false,
                text_family: btnFontFamily || 'Arial',
                height: absoluteToPercentage.height(buttonHeight),
                width: absoluteToPercentage.width(buttonWidth),
                top: absoluteToPercentage.height(top),
                left: absoluteToPercentage.width(left),
                starting_time: startTime || startingTimeOfElement || 0,
                ending_time: videoDuration! || endingTimeOfElement,
                album_model_id: '',
                is_png: style.is_png,
                noOfLines: 1,
                is_show: null,
                last_next_video_jump_duration: null,
                btn_alignment: null,
                isForHotspot: 0,
                rotation: 0,
            };

            (group as CustomFabricObject).data = {
                elementId: newButton.id,
                elementType: 'BUTTON',
                elementData: newButton,
            };

            if (!validateInteractiveElements(finalJsondetails!)) {
                canvas.remove(group);
                toast.error("Maximum number of interactive elements reached");
                return;
            }

            addInteractiveElement(BUTTON, newButton);
            setActiveObject(group);
            setShowButtonTypes(false);
        }
    };

    const addText = (style: any) => {
        if (!validateInteractiveElements(finalJsondetails!)) {
            toast.error("Maximum number of interactive elements reached");
            setOpenTextTypesModal(false);
            return;
        };

        if (editor) {
            const canvas = editor.canvas;

            const imgElement = new Image();
            imgElement.src = style.image;

            imgElement.onload = function () {
                const fabricImage = new fabric.FabricImage(imgElement, {
                    originX: 'center',
                    originY: 'center',
                    scaleX: 50 / imgElement.width,
                    scaleY: 50 / imgElement.height,
                    selectable: true,
                    hasControls: true,
                });
                const width = percentageToAbsolute.width(defaultElementWidth);
                const height = percentageToAbsolute.height(defaultElementHeight);
                const left = percentageToAbsolute.left(defaultElementLeft);
                const top = percentageToAbsolute.top(defaultElementTop);

                const text = new fabric.Textbox('Add Text', {
                    fontSize: defaultElementFontSize,
                    fill: convertStringToColor(style.color_for_txt_bg?.text_color) || 'black',
                    fontFamily: fontFamily || style.text_family || 'Arial',
                    textAlign: 'center',
                    width: width,
                    height: height,
                    originX: 'center',
                    originY: 'center',
                });

                const group = new fabric.Group([fabricImage, text], {
                    left,
                    top,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                });

                canvas.add(group);
                addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement, openTheActionModalOnly, undefined, setActiveObject);
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
                    font_size: defaultElementFontSize,
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
                        id_of_video_list: videoIndex || 1,
                        ios_streaming_url: null,
                        skip_time_on_same_video: null,
                        starting_time: null,
                    },
                    is_selected: false,
                    height: absoluteToPercentage.height(height),
                    width: absoluteToPercentage.width(width),
                    top: absoluteToPercentage.top(top),
                    left: absoluteToPercentage.left(left),
                    starting_time: startTime || 0,
                    ending_time: endTime || 0,
                    album_model_id: '000',
                    bgShadow: '',
                    txtShadow: '',
                    img_path: style.image,
                };

                (group as CustomFabricObject).data = {
                    elementId: newText.id,
                    elementType: 'TEXT',
                    elementData: newText,
                };

                addInteractiveElement(TEXT, newText);
                setActiveObject(group);
                setOpenTextTypesModal(false);
            };

            imgElement.onerror = function () {
                console.error("Failed to load the image from URL");
            };
        }
    };

    const addSticker = (style: any) => {
        if (!validateInteractiveElements(finalJsondetails!)) {
            toast.error("Maximum number of interactive elements reached");
            setShowStickerTypes(false);
            return;
        }
        renderImageOnCanvas(style.url, true);
        setShowStickerTypes(false);
    }
    const handleLinkSave = (newLabel: string, newHref: string) => {
        if (!validateInteractiveElements(finalJsondetails!)) {
            toast.error("Maximum number of interactive elements reached");
            setOpenLinkModal(false);
            return;
        };
        setLinkLabel(newLabel);
        setLinkUrl(newHref);
        setOpenLinkModal(false);

        if (editor) {
            const canvas = editor.canvas;
            const activeObject = canvas.getActiveObject() as CustomFabricObject;

            if (activeObject && activeObject.data?.elementType === 'LINK') {

                if (activeObject.type === 'group') {
                    const group = activeObject as fabric.Group;
                    const [text] = group.getObjects();
                    const elementId = activeObject.data?.elementId;
                    const elementType = activeObject.data?.elementType;

                    text.set({ text: newLabel || 'Link' });
                    group.set({ linkUrl: newHref });

                    let updatedElement: LinkInteractiveResponse;

                    if (elementType === 'LINK' && elementId) {
                        updatedElement = {
                            ...finalJsondetails!.functionality_datas!.list_of_links.find(lnk => lnk.id === elementId),
                            label: newLabel || '',
                            link: newHref
                        } as LinkInteractiveResponse;
                        if (updatedElement) {
                            updateInteractiveElement(LINK, updatedElement);
                        }
                    }

                } else {
                    console.warn("Active object is not a group");
                }
            } else {
                const width = percentageToAbsolute.width(defaultElementWidth);
                const height = percentageToAbsolute.height(defaultElementHeight);
                const left = percentageToAbsolute.left(defaultElementLeft);
                const top = percentageToAbsolute.top(defaultElementTop);
                const rect = new fabric.Rect({
                    fill: "black",
                    width: width,
                    height: height,
                    stroke: borderColor,
                    strokeWidth: borderColor ? 1 : 0,
                    rx: 5,
                    ry: 5,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                    evented: true,
                });

                const text = new fabric.Textbox(newLabel || 'Link', {
                    fontSize: defaultElementFontSize,
                    fill: "white",
                    fontFamily: fontFamily,
                    textAlign: 'center',
                    width: width,
                    height: height,
                    originX: 'center',
                    originY: 'center',
                });

                const group = new fabric.Group([rect, text], {
                    left,
                    top,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                });
                group.set({ linkUrl: newHref });
                canvas.add(group);
                addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement, undefined, openOnlyEditModal, setActiveObject);
                canvas.setActiveObject(group);
                canvas.renderAll();

                const newLink: LinkInteractiveResponse = {
                    album_model_id: "",
                    id: Date.now(),
                    label: newLabel,
                    link: newHref,
                    border_color: convertColorToString(borderColor) || '',
                    color_for_txt_bg: {
                        background_color: "0xffffffff",
                        text_color: "0x00000000",
                    },
                    font_size: defaultElementFontSize,
                    height: absoluteToPercentage.height(height),
                    width: absoluteToPercentage.width(width),
                    top: absoluteToPercentage.height(top),
                    left: absoluteToPercentage.width(left),
                    is_border: borderColor ? true : false,
                    is_selected: true,
                    is_show: null,
                    link_alignment: 'center',
                    medium_type: 'link',
                    on_action: {
                        link_url: newHref,
                        android_streaming_url: null,
                        ending_time: null,
                        id_of_video_list: videoIndex || 1,
                        ios_streaming_url: null,
                        skip_time_on_same_video: null,
                        starting_time: null,
                        video_path: null
                    },
                    type: 0,
                    background_shadow: '',
                    btn_alignment: '',
                    ending_time: 0,
                    image_type: 0,
                    isForHotspot: 0,
                    img_path: '',
                    radius: 0,
                    rotation: 0,
                    starting_time: 0,
                    text: newLabel,
                    text_family: fontFamily || null,
                    text_shadow: '',
                    video_id: ''
                };

                (group as CustomFabricObject).data = {
                    elementId: newLink.id,
                    elementType: 'LINK',
                    elementData: newLink,
                };
                addInteractiveElement(LINK, newLink);
                setActiveObject(group);
            }
        }
    };

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
                        let updatedElement: SingleButtons | ContainerText | null = null;

                        switch (elementType) {
                            case 'BUTTON':
                                updatedElement = {
                                    ...finalJsondetails.functionality_datas!.list_of_buttons.find(btn => btn.id === elementId),
                                    text: newText || '',
                                } as SingleButtons;
                                break;

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

    const handleActionModalSave = useCallback(async (data: any) => {
        const activeObject = editor?.canvas?.getActiveObject() as CustomFabricObject;
        const elementType = activeObject?.data?.elementType?.toLowerCase() as ElementType;
        const elementId = activeObject?.data?.elementId;
        if (!elementId || !elementType) return;

        try {
            // Handle video file upload if present
            let uploadResult = {} as any;
            if (data.videoPath && data.videoFile) {
                uploadResult = await handleFileSelect(data.videoFile, 'video', false);
                if (uploadResult.videoUrl) {
                    const newFinalJson = initializeFinalJson({
                        id: videoList.length,
                        parent_id: videoIndex,
                        path: uploadResult.videoUrl,
                        duration: `${data.endTime ? data.endTime - data.startTime! : ''}`,
                        audioDuration: uploadResult.audioDuration,
                        audioPath: uploadResult.audioFileName,
                    });
                    addNewVideoToFinalJson(newFinalJson, finalJsondetails);
                }
            }

            // Create the updated element with correct video path
            const finalElementData = {
                elementId: elementId,
                id: videoIndex + 1,
                video_path: uploadResult.videoUrl || data.videoPath || null,
                link_url: data.linkUrl || null,
                start_time: data.startTime,
                end_time: data.endTime,
                id_of_video_list: videoIndex || videoList.length,
            };

            setFinalJsondetails(prevJson => {
                // Create a deep copy of the previous state
                const prevCopy = JSON.parse(JSON.stringify(prevJson));

                // Get any existing snipShare data to preserve it
                const existingSnipShare = prevCopy.functionality_datas?.snip_share;

                // Create element action object using our finalElementData
                const elementOnAction = { [elementType]: [finalElementData] };

                // Update the JSON with this data
                const updatedJson = updateFinalJsonDetailsForOnAction(
                    elementOnAction,
                    prevCopy,
                    existingSnipShare?.snipItem,
                    data.existingSnip ? data.selectedSnipId : null,
                    data.existingMini ? data.selectedMiniId : null  // Pass the Mini ID here
                );
                return updatedJson;
            });

            // Close the modal after state updates are queued
            setIsActionModalOpen(false);
        } catch (error) {
            console.error('Error in handleActionModalSave:', error);
        }
    }, [editor, videoIndex, videoList, setIsActionModalOpen]);

    // Finally, update the updateFinalJsonDetailsForOnAction function to properly handle the selectedMiniId
    const updateFinalJsonDetailsForOnAction = (allOnAction: any, prevJson: FinalJson, sharedPostData?: any, selectedSnipId?: string, selectedMiniId?: string) => {
        if (!prevJson) {
            return prevJson;
        }

        const updatedJson = JSON.parse(JSON.stringify(prevJson));

        const elementTypeMap = {
            button: 'list_of_buttons' as const,
            text: 'list_of_container_text' as const,
            image: 'list_of_images' as const,
            hotspot: 'list_of_buttons' as const,
        };

        (Object.keys(allOnAction) as Array<keyof typeof elementTypeMap>).forEach((elementType) => {
            const elementsArray = allOnAction[elementType] || [];
            const mappedType = elementTypeMap[elementType];

            updatedJson.functionality_datas[mappedType] = updatedJson.functionality_datas[mappedType] || [];

            elementsArray.forEach((newElement: InteractiveElement) => {
                const targetList = updatedJson.functionality_datas[mappedType];

                const existingElementIndex = targetList.findIndex(
                    (el: any) => el.id === newElement.elementId
                );

                if (existingElementIndex === -1) {
                } else {
                    const newOnAction = {
                        ...targetList[existingElementIndex].on_action || {}, // Keep existing on_action properties
                        starting_time: newElement.start_time?.toString() || null,
                        ending_time: newElement.end_time?.toString() || null,
                        link_url: newElement.link_url || null,
                        video_path: newElement.video_path || null,
                        id_of_video_list: newElement.id_of_video_list || videoList.length,
                        linked_post_id: selectedSnipId ? Number(selectedSnipId) : null,
                        linked_flix_id: selectedMiniId ? Number(selectedMiniId) : null  // Add the Mini ID here
                    };

                    targetList[existingElementIndex] = {
                        ...targetList[existingElementIndex],
                        on_action: newOnAction
                    };
                }
            });
        });

        if (sharedPostData) {
            updatedJson.functionality_datas.snip_share = {
                snipItem: sharedPostData,
                positionX: 19.444444444444446,
                positionY: 0,
                scale: 1.2
            };
        }

        return updatedJson;
    };

    const handleTimeLineModalSave = (data: any) => {
        setStartingTimeOfElement(data.start)
        setEndingTimeOfElement(data.end)
        setOpenTimeLineModal(false)
    }

    const handleFontSizeSave = (fontSize: string) => {
        setFontSize(fontSize);

        const numericFontSize = parseInt(fontSize, 10); // Convert to number if needed

        if (activeObject && activeObject.type === 'group') {
            const textObj = activeObject._objects.find((obj: any) => obj.type === 'textbox') as fabric.Textbox;
            if (textObj) {
                textObj.set('fontSize', numericFontSize); // Use numeric value
                editor!.canvas.renderAll(); // Ensure canvas rerenders
            }

            if (activeObject && finalJsondetails) {
                const elementId = activeObject.data?.elementId;
                const elementType = activeObject.data?.elementType;

                if (elementId) {
                    let updatedElement: SingleButtons | ContainerText | null = null;

                    switch (elementType) {
                        case 'BUTTON':
                            updatedElement = {
                                ...finalJsondetails.functionality_datas!.list_of_buttons.find(btn => btn.id === elementId),
                                fontSize: numericFontSize,
                            } as SingleButtons;
                            break;

                        case 'TEXT':
                            updatedElement = {
                                ...finalJsondetails.functionality_datas!.list_of_container_text.find(txt => txt.id === elementId),
                                fontsize: numericFontSize,
                            } as ContainerText;
                            break;

                        case 'LINK':
                            updatedElement = {
                                ...finalJsondetails.functionality_datas!.list_of_links.find(txt => txt.id === elementId),
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

    const handleDotClick = (index: number) => {
        if (finalJsondetails?.id === undefined) {
            console.error("Error: finalJsondetails.id is undefined!");
            return;
        }
        const selectedVideo = videoList[index];

        if (!selectedVideo) return;

        setVideoIndex(index);
        setFinalJsondetails(selectedVideo);
    };


    const openTheActionModalOnly = () => setIsActionModalOpen(true);
    const toggleButtonTypes = () => setShowButtonTypes(!showButtonTypes);
    const toggleStickerTypes = () => setShowStickerTypes(!showStickerTypes);
    const toggleFontModal = () => setOpenFontFamily(!openFontFamily);
    const toggleLinkModal = () => setOpenLinkModal(!openLinkModal);
    const toggleActionModal = () => setIsActionModalOpen(false);
    const toggleTextTypesModal = () => setOpenTextTypesModal(!openTextTypesModal);
    const openOnlyEditModal = () => setOpenLinkModal(true);
    const closeEditModal = () => setOpenLinkModal(false);
    const openTimeLineModalFunc = () => setOpenTimeLineModal(!openTimeLineModal);
    const toggleFontSizeModal = () => setOpenFontSizeModal(!openFontSizeModal);
    const closeFontSizeModal = () => setOpenFontSizeModal(false);

    const handleVideoLoadedMetadata = () => {
        setVideoDuration(videoRef.current!.duration);
        setMaxDuration(videoRef.current!.duration);
        if (endTime === 0 || endTime === undefined) {
            setEndTime(videoRef.current!.duration);
        }
    };

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current && startTime !== undefined && endTime !== undefined) {
            const currentTime = videoRef.current.currentTime;

            // If current time exceeds endTime, loop back to startTime
            if (currentTime >= endTime) {
                videoRef.current.currentTime = startTime || 0;
            }

            // If current time is before startTime (e.g., if user manually seeks), set to startTime
            if (currentTime < startTime) {
                videoRef.current.currentTime = startTime;
            }
        }
    }, [startTime, endTime]);

    return (
        <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-12 relative gap-2 lg:gap-0">
            {/* Mobile Header Controls - Only visible on mobile */}
            {step !== 4 && activeObject && (
                <div className="lg:hidden w-full p-1">
                    <div className="grid grid-cols-4 gap-2">
                        <ControlButton
                            label="Background"
                            htmlFor="bg-color"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                        >
                            <IoIosColorPalette size={20} />
                        </ControlButton>
                        <ControlButton label="Family" onClick={toggleFontModal}>
                            <IoTextSharp size={20} />
                        </ControlButton>
                        <ControlButton
                            label="Text"
                            htmlFor="text-color"
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                        >
                            <IoColorWandSharp size={20} />
                        </ControlButton>
                        <ControlButton label="Timeline" onClick={openTimeLineModalFunc}>
                            <FaTimeline size={20} />
                        </ControlButton>
                    </div>
                </div>
            )}

            {/* Desktop Left Panel - Hidden on mobile */}
            {step !== 4 && activeObject && (
                <div className="hidden lg:flex lg:col-span-3 items-center justify-center px-4">
                    <div className="grid grid-cols-2 gap-4 h-full place-content-center">
                        <ControlButton
                            label="Background"
                            htmlFor="bg-color"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                        >
                            <IoIosColorPalette size={30} />
                        </ControlButton>
                        <ControlButton label="Family" onClick={toggleFontModal}>
                            <IoTextSharp size={30} />
                        </ControlButton>
                        <ControlButton
                            label="Text"
                            htmlFor="text-color"
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                        >
                            <IoColorWandSharp size={30} />
                        </ControlButton>
                        <ControlButton label="Timeline" onClick={openTimeLineModalFunc}>
                            <FaTimeline size={30} />
                        </ControlButton>
                    </div>
                </div>
            )}

            {/* Center Video Panel */}
            <div className={`${step === 4 && !finalSubmitLoading && "max-md:hidden"}
        flex-1 flex justify-center relative overflow-hidden md:p-4
        ${step !== 4 && activeObject
                    ? "lg:col-span-5"
                    : "lg:col-span-6"
                }
    `}>
                <div className="relative overflow-hidden aspect-video md:aspect-[9/16] w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl max-h-[60vh] sm:max-h-[70vh] lg:max-h-[80vh]">
                    {videoList.length > 0 && (
                        <>
                            <div className="relative bg-bg-color aspect-video md:aspect-[9/16] w-full h-full">
                                <video
                                    key={videoKey}
                                    ref={videoRef}
                                    src={videoUrl}
                                    className="absolute top-0 left-0 z-0 w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    onLoadedMetadata={handleVideoLoadedMetadata}
                                    onTimeUpdate={handleTimeUpdate}
                                />
                                {videoList.length > 1 && (
                                    <div className="absolute bottom-3 sm:bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                                        {videoList.map((_, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleDotClick(index)}
                                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full cursor-pointer ${index === videoIndex
                                                    ? 'bg-primary-bg-color'
                                                    : 'bg-bg-color'
                                                    }`}
                                            ></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <FabricJSCanvas
                        key="canvasElement"
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full h-full"
                        onReady={onReady}
                    />
                </div>
            </div>

            {/* Right Panel - Responsive Layout */}
            <div className={`
        ${step !== 4 && activeObject
                    ? 'lg:col-span-4'
                    : 'lg:col-span-6'
                } 
        flex lg:justify-center md:p-4
    `}>
                {/* Step 2 - Video Settings */}
                {step === 2 && fileType === 'video' && (
                    <div className="w-full max-w-md lg:max-w-none">
                        <VideoSettings
                            maxDuration={maxDuration}
                            playerRef={videoRef}
                            setStartTime={setStartTime}
                            setEndTime={setEndTime}
                            setVideoDuration={setVideoDuration}
                            videoIndex={videoIndex}
                            setVideoKey={setVideoKey}
                            handleNext={onNext}
                        />
                    </div>
                )}

                {/* Step 3 - Interactive Elements */}
                {step === 3 && (
                    <div className="w-full max-w-md lg:max-w-none">
                        {/* Mobile: 2 columns, Tablet: 3 columns, Desktop: 2 columns */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 lg:gap-2 h-full place-content-center lg:pl-3">
                            <ControlButton label="Button" onClick={toggleButtonTypes}>
                                <IoTextSharp size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                            </ControlButton>
                            <ControlButton label="Stickers" onClick={toggleStickerTypes}>
                                <RiEmojiStickerLine size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                            </ControlButton>
                            <ControlButton label="Text" onClick={toggleTextTypesModal}>
                                <RxText size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                            </ControlButton>
                            <ControlButton
                                label="Image"
                                htmlFor="interactive-image"
                                type="file"
                                onChange={handleImageUpload}
                            >
                                <PiImageSquareBold size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                            </ControlButton>
                        </div>
                    </div>
                )}

                {/* Step 4 - Post Details */}
                {step === 4 && !finalSubmitLoading && (
                    <div className="w-full max-w-2xl lg:max-w-none">
                        <PostDetails
                            finalSubmitLoading={finalSubmitLoading}
                            coverFileImage={coverFileImage}
                            onSubmit={onSubmit}
                            setPostInformation={setPostInformation}
                            setCoverFileImage={setCoverFileImage}
                            videoUrl={videoUrl}
                        />
                    </div>
                )}
            </div>

            {/* Modals - All responsive by default */}
            {showButtonTypes && <InteractiveButtonTypesModal addButton={addButton} />}
            {showStickerTypes && <InteractiveStickerModal addSticker={addSticker} closeModal={toggleStickerTypes} />}
            {openTextTypesModal && <InteractvieTextTypesModal addText={addText} />}
            {openFontFamily && (
                <FontFamilyModal
                    setFontFamily={setFontFamily}
                    setopenFontFamily={setOpenFontFamily}
                />
            )}
            {isTextEditModalOpen && (
                <TextEditModal
                    text={editText}
                    onSave={handleTextSave}
                    onClose={() => setIsTextEditModalOpen(false)}
                />
            )}
            {openFontSizeModal && (
                <FontSizeModal
                    fontSize={fontSize}
                    onClose={closeFontSizeModal}
                    onSave={handleFontSizeSave}
                    activeObject={activeObject}
                />
            )}
            {openLinkModal && (
                <LinkAddModal
                    initialLinkLabel={linkLabel}
                    initialLinkHref={linkUrl}
                    onSave={handleLinkSave}
                    onClose={closeEditModal}
                />
            )}
            {isActionModalOpen && (
                <ActionButtonModal
                    onSave={handleActionModalSave}
                    onClose={toggleActionModal}
                    setEndTime={setEndTime}
                    setStartTime={setStartTime}
                    setVideoDuration={setVideoDuration}
                    videoIndex={videoIndex}
                    setVideoKey={setVideoKey}
                    handleNext={onNext}
                    maxDuration={maxDuration}
                    playerRef={videoRef}
                />
            )}
            {openTimeLineModal && (
                <TrimmerModal
                    modalTitle="Element Display Timing"
                    videoSrc={videoList[videoIndex]?.path || videoFileSrc!}
                    saveModal={handleTimeLineModalSave}
                    closeModal={openTimeLineModalFunc}
                    maxDuration={maxDuration}
                    playerRef={videoRef}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    setVideoDuration={setVideoDuration}
                    videoIndex={videoIndex}
                    setVideoKey={setVideoKey}
                    handleNext={onNext}
                />
            )}
        </div>
    );
};

export default AddInteractiveElements;