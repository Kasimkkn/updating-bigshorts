import * as fabric from 'fabric';
import { useFabricJSEditor } from "fabricjs-react";
import { CustomFabricObject } from "@/components/shared/allNeededFunction";
import { CommonElementType } from "@/context/useInteractvieImage";

const initializeCanvas = (
    editor: ReturnType<typeof useFabricJSEditor>["editor"], // ✅ Correct typing for latest Fabric.js
    imageRef: React.RefObject<HTMLImageElement | HTMLVideoElement>,
    setActiveObject: (obj: fabric.Object | null) => void,
    setEditText: (text: string) => void,
    setIsTextEditModalOpen: (isOpen: boolean) => void,
    finalJsonRef: React.MutableRefObject<any>,
    updateInteractiveElement: (elementType: string, updatedElement: CommonElementType) => void,
    updateObjectDimensions: (object: CustomFabricObject, finalJson: any, updateInteractiveElement: (elementType: string, elementData: any) => void) => void
): void => {
    if (!editor?.canvas) return;

    const canvas = editor.canvas;
    canvas.clear();

    const ImageWidth = imageRef.current?.width || 0;
    const ImageHeight = imageRef.current?.height || 0;

    // ✅ Object selection event
    canvas.on("selection:created", () => {
        const activeObj = canvas.getActiveObject() as CustomFabricObject;
        setActiveObject(activeObj || null);
    });

    // ✅ Handle double-click event (Latest Fabric.js method)
    canvas.on("mouse:dblclick", () => {
        const activeObj = canvas.getActiveObject() as fabric.Group;
        if (activeObj?.type === "group") {
            const textObj = activeObj._objects.find(
                (obj: fabric.Object) => obj.type === "textbox"
            ) as fabric.Textbox;
            if (textObj) {
                setEditText(textObj.text || "");
                setIsTextEditModalOpen(true);
            }
        }
    });

    // ✅ Object modified event
    canvas.on("object:modified", (e) => {
        const target = e.target as CustomFabricObject;
        if (target && finalJsonRef.current) {
            updateObjectDimensions(target, finalJsonRef.current, updateInteractiveElement);
        }
    });

    // ✅ Object movement with boundary check
    // canvas.on("object:moving", (e) => {
    //     const obj = e.target;
    //     if (!obj) return;

    //     obj.set({
    //         left: Math.max(5, Math.min(obj.left ?? 0, ImageWidth)),
    //         top: Math.max(10, Math.min(obj.top ?? 0, ImageHeight)),
    //     });
    // });
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

    // ✅ Selection cleared event
    canvas.on("selection:cleared", () => {
        setActiveObject(null);
    });
};

export default initializeCanvas;
