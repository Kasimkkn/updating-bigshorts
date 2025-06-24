
import { canvasHeight, canvasWidth, defaultElementFontSize, defaultElementHeight, defaultElementLeft, defaultElementTop, defaultElementWidth, IMAGE, LINK, TEXT } from '@/constants/interactivityConstants';
import { FinalJsonContext, initializeFinalJson } from '@/context/useInteractvieImage';
import { useDebounce } from '@/hooks/useDebounce';
import { ImagesInteractiveResponse } from '@/models/ImagesInteractiveResponse';
import { LinkInteractiveResponse } from '@/models/linkInteractiveResonse';
import { ContainerText } from "@/models/textcontainerdesign";
import { VideoList as FinalJson } from '@/models/videolist';
import { FileType } from '@/types/fileTypes';
import { convertColorToString, convertStringToColor } from '@/utils/features';
import * as fabric from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import React, { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BsMusicNote } from 'react-icons/bs';
import { IoIosColorPalette } from 'react-icons/io';
import { IoColorWandSharp, IoLocationSharp, IoTextSharp } from 'react-icons/io5';
import { PiImageSquareBold } from 'react-icons/pi';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { RxText } from 'react-icons/rx';
import ReactPlayer from 'react-player';
import { absoluteToPercentage, addCustomControls, calculateDimension, calculateHeight, calculateLeft, calculateTop, calculateWidth, CustomFabricObject, percentageToAbsolute, updateObjectDimensions, validateInteractiveElements } from '../shared/allNeededFunction';
import ControlButton from '../shared/ControlButton';
import FontFamilyModal from '../shared/FontFamilyModal';
import FontSizeModal from '../shared/FontSizeModal';
import InteractvieTextTypesModal from '../shared/InteractvieTextTypesModal';
import LinkAddModal from '../shared/LinkAddModal';
import TextEditModal from '../shared/TextEditModal';
import SsupDetails from './SsupDetails';
import StoryModal from '../story/StoryModal';
import SharedSsupViewer from '../story/StoryModalSsup';
import SnippageSnup from '../story/snipinssupplayer';
interface AddInteractiveElementsProps {
    fileSrc?: string | null;
    fileType?: FileType | null;
    duration?: string;
    storyDetails?: boolean;
    selectedDuration?: string;
    setSelectedDuration: Dispatch<SetStateAction<string>>;
    sharedPostData: any;
    sharedSsupData: any;
}
const AddInteractiveElementsImage: React.FC<AddInteractiveElementsProps> = ({
    fileSrc,
    fileType,
    duration,
    storyDetails,
    selectedDuration,
    setSelectedDuration,
    sharedPostData,
    sharedSsupData
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
    const [fontSize, setFontSize] = useState('10');
    const debouncedBorderColor = useDebounce(borderColor, 500);
    const debouncedTextColor = useDebounce(textColor, 500);
    const debouncedBackgroundColor = useDebounce(backgroundColor, 500);
    const debouncedFontFamily = useDebounce(fontFamily, 500);
    const debouncedShadowColor = useDebounce(shadowColor, 500);
    const [isTextEditModalOpen, setIsTextEditModalOpen] = useState(false);
    const [editText, setEditText] = useState('');
    const [openLinkModal, setOpenLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkLabel, setLinkLabel] = useState('');
    const [openTextTypesModal, setOpenTextTypesModal] = useState(false);
    const [openFontSizeModal, setOpenFontSizeModal] = useState(false);
    const [interactiveImage, setInteractiveImage] = useState<string | null>(null);



    // 2. Inside the AddInteractiveElementsImage component, add this state
    const [showSsupStoryModal, setShowSsupStoryModal] = useState(false);

    // 3. Add these handlers for the StoryModal
    const handleRemoveStory = () => {
// Implement story removal logic if needed
    };

    const handleReadStory = () => {

    };

    const handleReactionUpdate = () => {

    };

    const handleMuteUpdate = () => {

    };

    const imageRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
    const ImageInitializedRef = useRef(false);

    useEffect(() => {
if (fileSrc && !finalJsondetails && !ImageInitializedRef.current) {
            const newFinalJson = initializeFinalJson({
                duration: duration?.toString() || '',
                path: fileSrc,
                id: 0,
                parent_id: -1,
                aspect_ratio: 0,
            });
            if (sharedPostData) {
                if (newFinalJson.functionality_datas) {
                    newFinalJson.functionality_datas.snip_share = {
                        snipItem: sharedPostData,
                        positionX: 19.44,
                        positionY: 0,
                        scale: 1.2
                    };
                }
            }
            if (sharedSsupData) {
                if (newFinalJson.functionality_datas) {
                    newFinalJson.functionality_datas.ssup_share = {
                        ssupItem: sharedSsupData,
                        positionX: 19.44,
                        positionY: 0,
                        scale: 1.2
                    };
                }
            }

            setFinalJsondetails(newFinalJson);
            ImageInitializedRef.current = true;
        }
    }, [fileSrc, finalJsondetails, sharedPostData, sharedSsupData]);

    useEffect(() => {
        finalJsonRef.current = finalJsondetails;

    }, [finalJsondetails]);

    useEffect(() => {
        if (activeObject && updateInteractiveElement) {
            const elementId = activeObject.data?.elementId;
            const elementType = activeObject.data?.elementType;
            if (elementId && elementType) {
                let updatedElement: ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse | null = null;

                switch (elementType) {
                    case 'TEXT':
                        updatedElement = {
                            ...finalJsondetails?.functionality_datas?.list_of_container_text?.find((txt) => txt.id === elementId),
                            txtFamily: debouncedFontFamily,
                            color_for_txt_bg: {
                                background_color: convertColorToString(debouncedBackgroundColor),
                                text_color: convertColorToString(debouncedTextColor),
                            },
                            height: calculateHeight(activeObject),
                            width: calculateWidth(activeObject),
                            top: calculateTop(activeObject.top!) - 10,
                            left: calculateLeft(activeObject.left!) - 10,
                            bgShadow: convertColorToString(debouncedShadowColor),
                        } as unknown as ContainerText;
                        break;

                    case 'IMAGE':
                        updatedElement = {
                            ...finalJsondetails?.functionality_datas?.list_of_images?.find((img) => img.id === elementId),
                            height: calculateHeight(activeObject),
                            width: calculateWidth(activeObject),
                            top: calculateTop(activeObject.top!),
                            left: calculateLeft(activeObject.left!),
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
                            height: calculateHeight(activeObject),
                            width: calculateWidth(activeObject),
                            top: calculateTop(activeObject.top!),
                            left: calculateLeft(activeObject.left!),
                            is_border: debouncedBorderColor ? true : false,
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
        activeObject,
        updateInteractiveElement,
    ]);

    useEffect(() => {
        if (editor) {
            const canvas = editor.canvas;
            canvas.clear();

            const ImageWidth = imageRef.current?.width;
            const ImageHeight = imageRef.current?.height;

            canvas.on('selection:created', () => {
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


                // Set object boundary constraints
                if (obj.left < 0) {
                    obj.set({ left: 5 });
                }
                if (obj.top < 0) {
                    obj.set({ top: 10 });
                }
                if (obj.left > ImageWidth!) {
                    obj.set({ left: ImageWidth! });
                }
                if (obj.top > ImageHeight!) {
                    obj.set({ top: ImageHeight! - 30 });
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
            setBackgroundColor(rect?.fill || '#ffffff');
            setBorderColor(rect?.stroke || '#000000');
            setFontFamily(text?.fontFamily || 'Arial');
            setTextColor(text?.fill || '#000000');
        }
    }, [activeObject]);

    useEffect(() => {
        if (activeObject && (activeObject.type === 'group' || activeObject.type === 'textbox' || activeObject.type === 'image')) {

            if (activeObject.type === 'group') {
                const [rect, text] = activeObject._objects || [];

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

    useEffect(() => {
        if (!validateInteractiveElements(finalJsondetails!)) {
            toast.error('Maximum number of interactive elements reached');
            return;
        };
        if (interactiveImage && editor) {
            const canvas = editor.canvas;

            const imgElement = new Image();
            imgElement.src = interactiveImage; // Use the local path

            const width = percentageToAbsolute.width(defaultElementWidth);
            const height = percentageToAbsolute.height(defaultElementHeight);
            const left = percentageToAbsolute.left(defaultElementLeft);
            const top = percentageToAbsolute.top(defaultElementTop);
            imgElement.onload = function () {
                const fabricImage = new fabric.FabricImage(imgElement, {
                    left,
                    top,
                    width,
                    height,
                    scaleX: 160 / canvas.width,
                    scaleY: 160 / canvas.height,
                    selectable: true,
                    hasBorders: true,
                    hasControls: true,
                });

                canvas.add(fabricImage);
                addCustomControls(fabricImage, canvas, addInteractiveElement, deleteInteractiveElement, undefined, undefined);
                canvas.setActiveObject(fabricImage);
                canvas.renderAll();

                const newImage: ImagesInteractiveResponse = {
                    album_model_id: '000',
                    color_for_txt_bg: {
                        background_color: 'transparent',
                        text_color: 'transparent'
                    },
                    ending_time: 0,
                    height: absoluteToPercentage.height(height),
                    width: absoluteToPercentage.width(width),
                    top: absoluteToPercentage.height(top),
                    left: absoluteToPercentage.width(left),
                    id: Date.now(),
                    image_type: 0,
                    is_Sticker: false,
                    img_path: interactiveImage, // Store the local path
                    is_selected: false,
                    is_show: null,
                    last_next_video_jump_duration: null,
                    medium_type: '',
                    on_action: {
                        video_path: null,
                        id_of_video_list: 1,
                        ios_streaming_url: null,
                        android_streaming_url: null,
                        link_url: null,
                        starting_time: null,
                        ending_time: null,
                        skip_time_on_same_video: null,
                    },
                    rotation: fabricImage.angle || 0,
                    starting_time: 0,
                    text: '',
                    text_and_image_alignment: null,
                    text_family: null,
                    video_id: '-1',
                };

                (fabricImage as CustomFabricObject).data = {
                    elementId: newImage.id,
                    elementType: 'IMAGE',
                };
                addInteractiveElement(IMAGE, newImage);
            };

            imgElement.onerror = function () {
                console.error("Failed to load the image from local path");
            };
        }
    }, [interactiveImage, editor]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const localFilePath = URL.createObjectURL(file);
                setInteractiveImage(localFilePath);
            } catch (error) {
                console.error('Error uploading interactive image file:', error);
            }
        }
    };

    // Add text	
    const addText = useCallback((style: any) => {
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
                    scaleX: 160 / imgElement.width,
                    scaleY: 160 / imgElement.height,
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

                // Group the image and text together
                const group = new fabric.Group([fabricImage, text], {
                    left,
                    top,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                });

                canvas.add(group);
                addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement, undefined, undefined);
                canvas.setActiveObject(group);
                canvas.renderAll();

                // Set the state for the colors, fonts, and other properties
                setBorderColor(convertStringToColor(style.color_for_txt_bg?.background_color || 'transparent'));
                setTextColor(convertStringToColor(style.color_for_txt_bg?.text_color || 'transparent'));
                setBackgroundColor(convertStringToColor(style.color_for_txt_bg?.background_color || 'transparent'));
                setFontFamily(style.text_family || 'Arial');

                const newText: ContainerText = {
                    id: Date.now(),
                    text: style.text || '',
                    font_size: style.font_size,
                    rotation: 0,
                    containerAlignment: null,
                    isBorder: null,
                    isPng: null,
                    isShow: null,
                    type: style.type,
                    txtFamily: fontFamily || 'Arial',
                    color_for_txt_bg: {
                        background_color: convertStringToColor(style.color_for_txt_bg?.background_color || '') || 'transparent',
                        text_color: convertStringToColor(style.color_for_txt_bg?.text_color || '') || 'transparent',
                    },
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
                    is_selected: false,
                    height: absoluteToPercentage.height(height),
                    width: absoluteToPercentage.width(width),
                    top: absoluteToPercentage.top(top),
                    left: absoluteToPercentage.left(left),
                    starting_time: 0,
                    ending_time: 0,
                    album_model_id: '000',
                    bgShadow: null,
                    txtShadow: null,
                    img_path: style.image,
                    noOfLines: 0,
                    noOfLinesForCloud: 1,
                    text_container_style: style.text_container_style,
                };

                (group as CustomFabricObject).data = {
                    elementId: newText.id,
                    elementType: 'TEXT',
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

    const handleLinkSave = useCallback((newLabel: string, newHref: string) => {
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
                            updateInteractiveElement(elementType, updatedElement);
                        }
                    }

                } else {
                    console.warn("Active object is not a group");
                }
            } else {
                // This is the add case
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
                    left: left,
                    top: top,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                });

                group.set({ linkUrl: newHref });
                canvas.add(group);
                addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement, undefined, openOnlyEditModal);
                canvas.setActiveObject(group);
                canvas.renderAll();

                const newLink: LinkInteractiveResponse = {
                    album_model_id: "",
                    id: Date.now(),
                    label: newLabel,
                    link: newHref,
                    radius: 5,
                    border_color: convertColorToString(borderColor) || '',
                    color_for_txt_bg: {
                        background_color: '0xffffffff',
                        text_color: '0x00000000',
                    },
                    font_size: defaultElementFontSize,
                    height: absoluteToPercentage.height(height),
                    width: absoluteToPercentage.width(width),
                    top: absoluteToPercentage.height(top),
                    left: absoluteToPercentage.width(left),

                    is_border: borderColor ? true : false,
                    is_selected: true,
                    is_show: true,
                    link_alignment: 'center',
                    medium_type: '',
                    on_action: {
                        link_url: newHref,
                        android_streaming_url: null,
                        ending_time: null,
                        id_of_video_list: 1,
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
                };
                addInteractiveElement(LINK, newLink);
                setActiveObject(group);
            }
        }
    }, [editor, linkLabel, linkUrl]);


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
                        let updatedElement = null;

                        switch (elementType) {
                            case 'TEXT':
                                updatedElement = {
                                    ...finalJsondetails.functionality_datas!.list_of_container_text.find(txt => txt.id === elementId),
                                    text: newText || '',
                                } as ContainerText;
                                break;
                            case 'LINK':
                                updatedElement = {
                                    ...finalJsondetails.functionality_datas!.list_of_links.find(lnk => lnk.id === elementId),
                                    label: newText || '',
                                } as LinkInteractiveResponse;
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
                                font_size: numericFontSize / canvasWidth * 100
                            } as ContainerText;
                            break;
                        case 'LINK':
                            updatedElement = {
                                ...finalJsondetails.functionality_datas!.list_of_links.find(lnk => lnk.id === elementId),
                                font_size: numericFontSize / canvasWidth * 100
                            } as LinkInteractiveResponse;
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

    const toggleFontModal = () => setOpenFontFamily(!openFontFamily);
    const toggleLinkModal = () => setOpenLinkModal(!openLinkModal);
    const toggleTextTypesModal = () => setOpenTextTypesModal(!openTextTypesModal);
    const openOnlyEditModal = () => setOpenLinkModal(true);
    const closeEditModal = () => setOpenLinkModal(false);
    const toggleFontSizeModal = () => setOpenFontSizeModal(!openFontSizeModal);
    const closeFontSizeModal = () => setOpenFontSizeModal(false);
    useEffect(() => {
        if (storyDetails && (!selectedDuration || selectedDuration === '')) {
            setSelectedDuration('24');
        }
    }, [storyDetails]);
    const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDuration(event.target.value); // Update the state with the selected value
    };

    return (
        <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-12 relative gap-2 lg:gap-0">
            {/* Mobile Header Controls - Only visible on mobile */}
            {activeObject && (
                <div className="lg:hidden w-full p-2">
                    <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
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
                    </div>
                </div>
            )}

            {/* Desktop Left Panel - Hidden on mobile */}
            {activeObject && (
                <div className="hidden lg:flex lg:col-span-3 items-center justify-center px-4">
                    <div className="grid grid-cols-2 w-full gap-4">
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
                    </div>
                </div>
            )}

            {/* Center Media Panel */}
            <div className={`
        md:flex-1 flex justify-center relative overflow-hidden p-2 md:p-4 ${storyDetails && "max-md:hidden"}
        ${activeObject ? "lg:col-span-5" : "lg:col-span-6"}
    `}>
                <div className="relative flex items-center justify-center bg-bg-color rounded-lg lg:rounded-none overflow-hidden w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-[309px] lg:h-[550px] aspect-[9/16] lg:aspect-auto max-h-[40vh] sm:max-h-[70vh] lg:max-h-none">
                    {/* Video container */}
                    {fileType === 'video' ? (
                        <div className="absolute top-0 left-0 w-full h-full z-0">
                            <ReactPlayer
                                url={sharedPostData ? "" : fileSrc as string}
                                width="100%"
                                height="100%"
                                loop={true}
                                muted={true}
                                playing={true}
                                className="lg:!w-[309px] lg:!h-[550px]"
                            />
                        </div>
                    ) : (
                        <img
                            src={fileSrc as string}
                            className="z-0 w-full h-full object-cover lg:w-[309px] lg:h-[550px]"
                            alt="interactive image"
                        />
                    )}

                    {/* Canvas */}
                    <FabricJSCanvas
                        className="absolute top-0 w-full h-full z-10 lg:w-[309px] lg:h-[550px]"
                        onReady={onReady}
                    />

                    {sharedSsupData && (
                        <div className="absolute top-0 left-0 w-full h-full z-0 flex items-center justify-center lg:w-[309px] lg:h-[550px]">
                            <div className="w-[75%] h-[80%] relative flex items-center justify-center">
                                <SharedSsupViewer
                                    sharedSsupData={sharedSsupData}
                                    onClose={() => {}}
                                    scale={0.56}
                                />
                            </div>
                        </div>
                    )}

                    {sharedPostData && (
                        <div className="absolute top-0 left-0 w-full h-full z-0 flex items-center justify-center lg:w-[309px] lg:h-[550px]">
                            <div className="w-full h-full flex items-center justify-center overflow-hidden lg:w-[309px] lg:h-[550px]">
                                <SnippageSnup
                                    postShare={sharedPostData}
                                    isTimerPaused={false}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Story Details or Controls */}
            <div className={`
        ${activeObject ? 'lg:col-span-4' : 'lg:col-span-6'} 
        flex items-center justify-center p-2 md:p-4 lg:px-4
    `}>
                {storyDetails ? (
                    <div className="w-full max-w-md lg:max-w-none">
                        <SsupDetails
                            handleDurationChange={handleDurationChange}
                            selectedDuration={selectedDuration}
                        />
                    </div>
                ) : (
                    <div className="w-full max-w-md lg:max-w-none">
                        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-2 w-full gap-3 lg:gap-2">
                            {fileType !== 'video' && (
                                <ControlButton label="Music" onClick={() => { }}>
                                    <BsMusicNote size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                                </ControlButton>
                            )}
                            <ControlButton label="Stickers" onClick={() => { }}>
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
                            <ControlButton label="Link" onClick={toggleLinkModal}>
                                <IoTextSharp size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                            </ControlButton>
                            <ControlButton label="Location" onClick={() => { }}>
                                <IoLocationSharp size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                            </ControlButton>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
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
                    activeObject={activeObject}
                    fontSize={fontSize}
                    onClose={closeFontSizeModal}
                    onSave={handleFontSizeSave}
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
        </div>
    );
}

export default AddInteractiveElementsImage