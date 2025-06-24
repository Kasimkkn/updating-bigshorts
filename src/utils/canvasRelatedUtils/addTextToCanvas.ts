import { calculateHeight, calculateLeft, calculateTop, calculateWidth } from '@/components/shared/allNeededFunction';
import * as fabric from 'fabric';
import toast from 'react-hot-toast';
export interface StyleProps {
    image: string;
    text: string;
    color_for_txt_bg?: {
        text_color?: string;
        background_color?: string;
    };
    text_family?: string;
    width?: number;
    type?: string;
    font_size?: number;
    text_container_style?: any;
}

export interface AddTextParams {
    editor: any;
    style: StyleProps;
    fontFamily: string;
    validateInteractiveElements: (data: any) => boolean;
    finalJsondetails: any;
    setOpenTextTypesModal: (state: boolean) => void;
    addCustomControls: Function;
    addInteractiveElement: Function;
    deleteInteractiveElement: Function;
    convertStringToColor: (color?: string) => string;
    setBorderColor: (color: string) => void;
    setTextColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    setFontFamily: (font: string) => void;
    setActiveObject: (obj: any) => void;
}

export const addTextToCanvas = ({
    editor,
    style,
    fontFamily,
    validateInteractiveElements,
    finalJsondetails,
    setOpenTextTypesModal,
    addCustomControls,
    addInteractiveElement,
    deleteInteractiveElement,
    convertStringToColor,
    setBorderColor,
    setTextColor,
    setBackgroundColor,
    setFontFamily,
    setActiveObject,
}: AddTextParams) => {
    if (!validateInteractiveElements(finalJsondetails)) {
        toast.error("Maximum number of interactive elements reached");
        setOpenTextTypesModal(false);
        return;
    }

    if (!editor) return;

    const canvas = editor.canvas;
    const imgElement = new Image();
    imgElement.src = style.image;

    imgElement.onload = function () {
        const fabricImage = new fabric.Image(imgElement, {
            originX: "center",
            originY: "center",
            scaleX: 160 / imgElement.width,
            scaleY: 160 / imgElement.height,
            selectable: true,
            hasControls: true,
        });

        const text = new fabric.Textbox("Add Text", {
            fontSize: 16,
            fill: convertStringToColor(style.color_for_txt_bg?.text_color) || "black",
            fontFamily: fontFamily || style.text_family || "Arial",
            textAlign: "center",
            width: style.width || 150,
            originX: "center",
            originY: "center",
        });

        // Group the image and text together
        const group = new fabric.Group([fabricImage, text], {
            left: 50,
            top: 100,
            originX: "center",
            originY: "center",
            selectable: true,
        });

        canvas.add(group);
        addCustomControls(group, canvas, addInteractiveElement, deleteInteractiveElement);
        canvas.setActiveObject(group);
        canvas.renderAll();

        // Set UI state updates
        setBorderColor(convertStringToColor(style.color_for_txt_bg?.background_color || "transparent"));
        setTextColor(convertStringToColor(style.color_for_txt_bg?.text_color || "transparent"));
        setBackgroundColor(convertStringToColor(style.color_for_txt_bg?.background_color || "transparent"));
        setFontFamily(style.text_family || "Arial");

        const newText = {
            id: Date.now(),
            text: style.text || "",
            font_size: style.font_size,
            rotation: 0,
            type: style.type,
            txtFamily: fontFamily || "Arial",
            color_for_txt_bg: {
                background_color: convertStringToColor(style.color_for_txt_bg?.background_color || "transparent"),
                text_color: convertStringToColor(style.color_for_txt_bg?.text_color || "transparent"),
            },
            img_path: style.image,
            text_container_style: style.text_container_style,
            containerAlignment: null,
            isBorder: null,
            isPng: null,
            isShow: null,
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
            height: calculateHeight(text),
            width: calculateWidth(text),
            top: calculateTop(text.top!),
            left: calculateLeft(text.left!),
            starting_time: 0,
            ending_time: 0,
            album_model_id: '000',
            bgShadow: null,
            txtShadow: null,
            noOfLines: 0,
            noOfLinesForCloud: 1,
        };

        (group as any).data = {
            elementId: newText.id,
            elementType: "TEXT",
        };

        addInteractiveElement("TEXT", newText);
        setActiveObject(group);
        setOpenTextTypesModal(false);
    };

    imgElement.onerror = function () {
        console.error("Failed to load the image from URL");
    };
};
