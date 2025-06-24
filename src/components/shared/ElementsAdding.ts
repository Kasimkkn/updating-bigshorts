import { canvasHeight, canvasWidth } from "@/constants/interactivityConstants";
import { addCustomControls, calculateDimension, CustomFabricObject } from "./allNeededFunction";
import { VideoList } from "@/models/videolist";
import { convertColorToString, convertStringToColor } from "@/utils/features";
import * as fabric from 'fabric';
// Render buttons
export const renderButtons = (canvas: fabric.Canvas, finalJsondetails: VideoList, addInteractiveElement: any, deleteInteractiveElement: any, openTheActionModalOnly: any, setActiveObject: any) => {
    if (!finalJsondetails?.functionality_datas) return;
    finalJsondetails.functionality_datas.list_of_buttons.forEach(button => {
        const left = calculateDimension(button.left, canvasWidth);
        const top = calculateDimension(button.top, canvasHeight);
        const width = calculateDimension(button.width, canvasWidth);
        const height = calculateDimension(button.height, canvasHeight);
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
                fill: convertStringToColor(button.color_for_txt_bg.background_color || '#000000'),
                width,
                height,
                rx: button.radius || 0,
                stroke: button.border_color,
                strokeWidth: button.is_border ? 1 : 0,
                originX: 'center',
                originY: 'center',
                selectable: true,
                evented: true,
            });

            // Create the text for the button
            const buttonText = button.text || 'Button';
            const text = new fabric.Textbox(buttonText, {
                fontSize: button.font_size || 16,
                fill: convertStringToColor(button.color_for_txt_bg.text_color || '#000000'),
                fontFamily: button.text_family || 'Arial',
                width,
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

// Render text elements
export const renderTextElements = (canvas: fabric.Canvas, finalJsondetails: VideoList, addInteractiveElement: any, deleteInteractiveElement: any, openTheActionModalOnly: any, setActiveObject: any) => {
    if (!finalJsondetails?.functionality_datas) return;

    finalJsondetails.functionality_datas.list_of_container_text.forEach(textItem => {
        const left = calculateDimension(textItem.left, canvasWidth);
        const top = calculateDimension(textItem.top, canvasHeight);
        const width = calculateDimension(textItem.width, canvasWidth);
        const height = calculateDimension(textItem.height, canvasHeight);
        if (textItem.img_path) {
            // Load the image if the path is available
            const imgElement = new Image();
            imgElement.src = textItem.img_path;
            imgElement.onload = function () {
                // Create the fabric image element
                const fabricImage = new fabric.FabricImage(imgElement, {
                    originX: 'center',
                    originY: 'center',
                    scaleX: 160 / imgElement.width,
                    scaleY: 160 / imgElement.height,
                    selectable: true,
                    hasControls: true,
                    evented: true,
                });

                // Create the text element to overlay on the image
                const text = new fabric.Textbox(textItem.text || 'Text', {
                    fontSize: textItem.font_size || 16,
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
                fontSize: textItem.font_size || 16,
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

// Render images
export const renderImages = (canvas: fabric.Canvas, finalJsondetails: VideoList, addInteractiveElement: any, deleteInteractiveElement: any, openTheActionModalOnly: any, setActiveObject: any) => {
    if (!finalJsondetails?.functionality_datas) return;

    if (finalJsondetails?.functionality_datas.list_of_images?.length > 0) {
        finalJsondetails.functionality_datas.list_of_images.forEach(image => {
            const imgElement = new Image();
            imgElement.src = image.img_path!; // Use the image path
            const left = calculateDimension(image.left, canvasWidth);
            const top = calculateDimension(image.top, canvasHeight);

            imgElement.onload = function () {
                const fabricImage = new fabric.FabricImage(imgElement, {
                    left: left,
                    top: top,
                    scaleX: 60 / canvasWidth,
                    scaleY: 60 / canvasHeight,
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

// Render links
export const renderLinks = (canvas: fabric.Canvas, finalJsondetails: VideoList, addInteractiveElement: any, deleteInteractiveElement: any, openOnlyEditModal: any, setActiveObject: any) => {
    if (!finalJsondetails?.functionality_datas) return;
    finalJsondetails.functionality_datas.list_of_links.forEach(link => {
        const left = calculateDimension(link.left, canvasWidth);
        const top = calculateDimension(link.top, canvasHeight);
        const width = calculateDimension(link.width, canvasWidth);
        const height = calculateDimension(link.height, canvasHeight);
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
            fontSize: link.font_size || 16,
            fill: convertStringToColor(link.color_for_txt_bg?.text_color!),
            fontFamily: link.text_family || 'Arial',
            width: width,
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