import { AppConfig } from '@/config/appConfig';
import { BUTTON, canvasHeight, canvasWidth, defaultElementLeft, defaultElementTop, HOTSPOT, IMAGE, LINK, MAX_ELEMENTS, TEXT } from '@/constants/interactivityConstants';
import { VideoList } from '@/models/videolist';
import { actionIcon, cloneIcon, deleteIcon, editIcon } from '@/utils/features';
import * as fabric from 'fabric';
export interface CustomFabricObject extends fabric.Object {
    [x: string]: any;
    data?: {
        openModal?: () => void;
        openEditModal?: () => void;
        elementId?: number;
        elementType?: string;
        elementData?: any;
    };
    getBoundingRect(): {
        left: number;
        top: number;
        width: number;
        height: number;
    };
}

const addCustomControls = (
    obj: CustomFabricObject,
    canvas: fabric.Canvas,
    addInteractiveElement: (elementType: string, elementData: any) => void,
    deleteInteractiveElement: (elementType: string, elementId: number) => void,
    openModal?: () => void,
    openEditModal?: () => void,
    setActiveObject?: (obj: CustomFabricObject) => void
) => {
    obj.data = {
        ...obj.data,
        openModal: openModal || obj.data?.openModal || (() => { }),
        openEditModal: openEditModal || obj.data?.openEditModal || (() => { })
    };

    // Set controls visibility
    obj.setControlsVisibility({
        mt: true,
        mb: true,
        ml: true,
        mr: true,
        bl: true,
        br: true,
        tl: true,
        tr: true,
    });

    obj.controls = obj.controls || {};

    // Delete control
    obj.controls.deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: -16,
        offsetX: 16,
        cursorStyle: 'pointer',
        mouseUpHandler: () => deleteObject(obj),
        render: renderIcon({ icon: deleteIcon }),
        sizeX: 24,
        sizeY: 24,
    });

    // Clone control
    obj.controls.cloneControl = new fabric.Control({
        x: -0.5,
        y: -0.5,
        offsetY: -16,
        offsetX: -16,
        cursorStyle: 'pointer',
        mouseUpHandler: () => cloneObject(obj, canvas),
        render: renderIcon({ icon: cloneIcon }),
        sizeX: 24,
        sizeY: 24,
    });

    // Action button control (opens the modal)
    if (openModal) {
        obj.controls.actionControl = new fabric.Control({
            x: 0,
            y: 0.5,
            offsetY: 16,
            cursorStyle: 'pointer',
            mouseUpHandler: () => {
                openModal!();
            },
            render: renderIcon({ icon: actionIcon }),
            sizeX: 24,
            sizeY: 24,
        });
    }
    if (openEditModal) {
        obj.controls.editControl = new fabric.Control({
            x: 0,
            y: 0.5,
            offsetY: 16,
            cursorStyle: 'pointer',
            mouseUpHandler: () => {
                openEditModal();
            },
            render: renderIcon({ icon: editIcon }),
            sizeX: 24,
            sizeY: 24,
        });
    }

    const deleteObject = (target: CustomFabricObject) => {
        if (target.data?.elementType && target.data.elementId) {
            deleteInteractiveElement(target.data.elementType, target.data.elementId);
            target.canvas?.remove(target);
            target.canvas?.renderAll();
        }
    };

    const cloneObject = async (
        target: CustomFabricObject,
        canvas: fabric.Canvas,
    ) => {
        const cloned = await target.clone();
        cloned.set({
            left: target.left + 50,
            top: target.top + 50,
        });

        // Preserve modal functions from the target or use passed ones
        const finalOpenModal = openModal || target.data?.openModal;
        const finalOpenEditModal = openEditModal || target.data?.openEditModal;

        // Add cloned object to canvas
        canvas.add(cloned);

        // Reapply controls on cloned object, passing correct modal functions
        addCustomControls(
            cloned as CustomFabricObject,
            canvas,
            addInteractiveElement,
            deleteInteractiveElement,
            finalOpenModal,
            finalOpenEditModal,
            setActiveObject
        );

        canvas.setActiveObject(cloned);
        canvas.renderAll();

        // Add new ID to cloned object
        if (target.data?.elementType) {
            const newId = Math.floor(Math.random() * 1000);
            const elementData = {
                ...target.data.elementData,
                id: newId,
                left: calculateLeft(cloned.left),
                top: calculateTop(cloned.top),
                isSelected: false,
                width: calculateWidth(cloned),
                height: calculateHeight(cloned),
            };
            target.data.elementId = newId;
            // Add cloned element to interactive elements system
            switch (target.data.elementType) {
                case 'BUTTON':
                    addInteractiveElement(BUTTON, elementData);
                    break;
                case 'LINK':
                    addInteractiveElement(LINK, elementData);
                    break;
                case 'TEXT':
                    addInteractiveElement(TEXT, elementData);
                    break;
                case 'IMAGE':
                    addInteractiveElement(IMAGE, elementData);
                    break;
                case 'HOTSPOT':
                    addInteractiveElement(HOTSPOT, elementData);
                    break;

                default:
                    console.warn("Unknown element type:", target.data.elementType);
                    break;
            }

            // Assign new ID and type to the cloned object
            (cloned as CustomFabricObject).data = {
                ...target.data,
                elementId: newId,
            };
            setActiveObject!(cloned);
        }
    };

    // Render all changes on canvas
    canvas.requestRenderAll();
};

const renderIcon = ({ icon }: { icon: string }) => {
    return function (
        ctx: CanvasRenderingContext2D,
        left: number,
        top: number,
        fabricObject: fabric.Object
    ) {
        const size = 24;
        const img = new Image();
        img.src = icon;

        img.onload = () => {
            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();
        };

        img.onerror = () => {
            console.error(`Failed to load icon from ${icon}`);
        };
    };
};

const getExistingElement = (elementId: number, elementType: string, finalJson: VideoList) => {
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
}

const checkElementExistingElements = (finalJsonDetail: VideoList) => {
    if (!finalJsonDetail || !finalJsonDetail.functionality_datas) return false;
    const totalElements =
        finalJsonDetail.functionality_datas.list_of_buttons.length +
        finalJsonDetail.functionality_datas.list_of_container_text.length +
        finalJsonDetail.functionality_datas.list_of_images.length +
        finalJsonDetail.functionality_datas.list_of_links.length;
    if (totalElements > 0) {
        return true;
    }
    return false;
}

const validateInteractiveElements = (finalJsondetails: VideoList) => {
    if (!finalJsondetails || !finalJsondetails.functionality_datas) return true;

    const totalElements =
        finalJsondetails.functionality_datas.list_of_buttons.length +
        finalJsondetails.functionality_datas.list_of_container_text.length +
        finalJsondetails.functionality_datas.list_of_images.length +
        finalJsondetails.functionality_datas.list_of_links.length;
    if (totalElements == MAX_ELEMENTS) {
        return false;
    }
    return true;
};

// Calculation Utilities (keep these consistent)
export const absoluteToPercentage = {
    width: (absWidth: number) => (absWidth / canvasWidth) * 100,
    height: (absHeight: number) => (absHeight / canvasHeight) * 100,
    left: (absLeft: number) => (absLeft / canvasWidth) * 100,
    top: (absTop: number) => (absTop / canvasHeight) * 100,
};

export const percentageToAbsolute = {
    width: (percentWidth: number) => (percentWidth / 100) * canvasWidth,
    height: (percentHeight: number) => (percentHeight / 100) * canvasHeight,
    left: (percentLeft: number) => (percentLeft / 100) * canvasWidth,
    top: (percentTop: number) => (percentTop / 100) * canvasHeight,
};

const updateObjectDimensions = (
    object: CustomFabricObject,
    finalJson: VideoList,
    updateInteractiveElement: (elementType: string, elementData: any) => void,
) => {
    if (object?.data?.elementId && object?.data?.elementType) {
        const elementId = object.data.elementId;
        const elementType = object.data.elementType
        const existingElement = getExistingElement(elementId, elementType, finalJson);

        if (existingElement) {
            const updatedElement = {
                ...existingElement,
                height: absoluteToPercentage.height(object.height * (object.scaleY || 1)),
                width: absoluteToPercentage.width(object.width * (object.scaleX || 1)),
                top: absoluteToPercentage.top((object.top + 5) || defaultElementTop),
                left: absoluteToPercentage.left((object.left + 12) || defaultElementLeft),
            };
            updateInteractiveElement(elementType, updatedElement);
        }
    }
};

export const calculateDimension = (percentage: any, dimension: any) => ((percentage / 100) * dimension);

export const calculateHeight = (activeObject: CustomFabricObject) => {
    return ((activeObject.height * activeObject.scaleY || 1) / canvasHeight) * 100;
}
export const calculateWidth = (activeObject: CustomFabricObject) => {
    return ((activeObject.width * activeObject.scaleX || 1) / canvasWidth) * 100;
}

export const calculateLeft = (leftVal: number) => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const left = (leftVal || defaultElementLeft) / devicePixelRatio;
    return (left / canvasWidth) * 100;
}

export const calculateTop = (topVal: number) => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const top = (topVal || defaultElementTop) / devicePixelRatio;
    return (top / canvasHeight) * 100;
}

export const calculateAll = (elementWidth?: number, elementHeight?: number, elementTop?: number, elementleft?: number) => {
    const parentWidth = canvasWidth;
    const parentHeight = canvasHeight;
    const appConfig = new AppConfig();
    let calculatedTop;
    let calculatedLeft;
    let width;
    let height;
    if (elementTop) {
        calculatedTop = appConfig.deviceHeight(Math.round(elementTop), parentHeight);
    }
    if (elementleft) {
        calculatedLeft = appConfig.deviceWidth(Math.round(elementleft), parentWidth);
    }


    if (elementWidth) {
        width = appConfig.deviceWidth(elementWidth!, parentWidth);
    }
    if (elementHeight) {
        height = appConfig.deviceHeight(elementHeight, parentHeight);
    }

    const { top, left } = appConfig.checkPosition(
        calculatedTop!,
        calculatedLeft!,
        width!,
        height!,
        parentWidth,
        parentHeight
    );

    return {
        top,
        left,
        width,
        height
    }
}


export { addCustomControls, getExistingElement, validateInteractiveElements, updateObjectDimensions, checkElementExistingElements };