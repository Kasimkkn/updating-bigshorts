import { createContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { VideoList as FinalJson } from '@/models/videolist';
import { CommonModel } from '@/models/commonmodelforallfunctionality';
import { SingleButtons } from "@/models/designofbuttons";
import { ImagesInteractiveResponse } from '@/models/ImagesInteractiveResponse';
import { LinkInteractiveResponse } from '@/models/linkInteractiveResonse';
import { ContainerText } from '@/models/textcontainerdesign';
import toast from 'react-hot-toast';
import { BUTTON, LINK, IMAGE, TEXT, MAX_ELEMENTS, HOTSPOT } from '@/constants/interactivityConstants';

export type CommonElementType = SingleButtons | ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse

export const FinalJsonContext = createContext<{
    finalJsondetails: FinalJson | undefined;
    setFinalJsondetails: React.Dispatch<React.SetStateAction<FinalJson | undefined>>;
    addInteractiveElement: (elementType: string, element: CommonElementType) => void;
    updateInteractiveElement: (elementType: string, updatedElement: CommonElementType) => void;
    deleteInteractiveElement: (elementType: string, elementId: number) => void;
} | undefined>(undefined);

export const getTotalInteractiveElements = (functionalityData: CommonModel) => {
    return (
        (functionalityData?.list_of_buttons?.length || 0) +
        (functionalityData?.list_of_container_text?.length || 0) +
        (functionalityData?.list_of_images?.length || 0) +
        (functionalityData?.list_of_links?.length || 0) +
        (functionalityData?.list_of_polls?.length || 0)
    );
};


export const initializeFinalJson = ({ id, parent_id, path, duration, aspect_ratio }: { id: number, parent_id: number, path: string, duration: string, aspect_ratio:number }): FinalJson => ({
    functionality_datas: {
        list_of_buttons: [],
        list_of_container_text: [],
        list_of_images: [],
        list_of_links: [],
        list_of_polls: [],
        list_of_locations: [],
        music: [],
        snip_share: {  // Add this block
            snipItem: null,
            positionX: 0,
            positionY: 0,
            scale: 1
        },
        ssup_share:null,
    },
    currentTime: 0,
    id: id || 0,
    parent_id: parent_id || -1,
    path: path || '',
    duration: duration || '',
    is_selcted: false,
    postId: 0,
    androidStreamingUrl: null,
    audioDuration: null,
    audioFilePath: null,
    audioId: null,
    audioName: null,
    timeOfVideElementoShow: null,
    video_id: 0,
    iosStreamingUrl: null,
    onVideoEnd: null,
    backdrop_gradient: null,
    aspect_ratio: aspect_ratio || 0,
});

export const FinalJsonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [finalJsondetails, setFinalJsondetails] = useState<FinalJson | undefined>(undefined);

    const addInteractiveElement = useCallback(
        (elementType: string, element: CommonElementType) => {
            setFinalJsondetails((prevJson) => {
                if (!prevJson) {
                    return prevJson;
                }

                // Create a deep copy of the functionality_datas to avoid mutation
                const updatedFunctionalityData = {
                    ...prevJson.functionality_datas,
                    list_of_buttons: [...(prevJson.functionality_datas?.list_of_buttons || [])],
                    list_of_container_text: [...(prevJson.functionality_datas?.list_of_container_text || [])],
                    list_of_images: [...(prevJson.functionality_datas?.list_of_images || [])],
                    list_of_links: [...(prevJson.functionality_datas?.list_of_links || [])],
                    list_of_polls: [...(prevJson.functionality_datas?.list_of_polls || [])],
                    // Preserve snip_share explicitly
                    snip_share: prevJson.functionality_datas?.snip_share || {
                        snipItem: null,
                        positionX: 0,
                        positionY: 0,
                        scale: 1
                    }
                };

                const maxElements = getTotalInteractiveElements(updatedFunctionalityData);

                if (maxElements >= MAX_ELEMENTS) {
                    toast.error('Maximum number of elements reached.');
                    return prevJson;
                }

                switch (elementType) {
                    case BUTTON:
                        updatedFunctionalityData.list_of_buttons = [...updatedFunctionalityData.list_of_buttons, element as SingleButtons];
                        break;
                    case TEXT:
                        updatedFunctionalityData.list_of_container_text = [...updatedFunctionalityData.list_of_container_text, element as ContainerText];
                        break;
                    case IMAGE:
                        updatedFunctionalityData.list_of_images = [...updatedFunctionalityData.list_of_images, element as ImagesInteractiveResponse];
                        break;
                    case LINK:
                        updatedFunctionalityData.list_of_links = [...updatedFunctionalityData.list_of_links, element as LinkInteractiveResponse];
                        break;
                    case HOTSPOT:
                        updatedFunctionalityData.list_of_buttons = [...updatedFunctionalityData.list_of_buttons, element as SingleButtons];
                        break;
                    default:
                        toast.error('Invalid element type.');
                        return prevJson;
                }

                return {
                    ...prevJson,
                    functionality_datas: updatedFunctionalityData,
                };
            });
        },
        []
    );

    const updateInteractiveElement = useCallback(
        (elementType: string, updatedElement: SingleButtons | ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse) => {
            setFinalJsondetails((prevJson) => {
                if (!prevJson) return prevJson;

                // Create a deep copy of functionality_datas to avoid mutation
                const updatedFunctionalityData = {
                    ...prevJson.functionality_datas,
                    list_of_buttons: [...(prevJson.functionality_datas?.list_of_buttons || [])],
                    list_of_container_text: [...(prevJson.functionality_datas?.list_of_container_text || [])],
                    list_of_images: [...(prevJson.functionality_datas?.list_of_images || [])],
                    list_of_links: [...(prevJson.functionality_datas?.list_of_links || [])],
                    list_of_polls: [...(prevJson.functionality_datas?.list_of_polls || [])],
                    // Preserve snip_share explicitly
                    snip_share: prevJson.functionality_datas?.snip_share || {
                        snipItem: null,
                        positionX: 0,
                        positionY: 0,
                        scale: 1
                    }
                };

                switch (elementType) {
                    case 'BUTTON':
                        updatedFunctionalityData.list_of_buttons = updatedFunctionalityData.list_of_buttons.map((btn) =>
                            btn.id === updatedElement.id ? (updatedElement as SingleButtons) : btn
                        );
                        break;
                    case 'TEXT':
                        updatedFunctionalityData.list_of_container_text = updatedFunctionalityData.list_of_container_text.map((txt) =>
                            txt.id === updatedElement.id ? (updatedElement as ContainerText) : txt
                        );
                        break;
                    case 'IMAGE':
                        updatedFunctionalityData.list_of_images = updatedFunctionalityData.list_of_images.map((img) =>
                            img.id === updatedElement.id ? (updatedElement as ImagesInteractiveResponse) : img
                        );
                        break;
                    case 'LINK':
                        updatedFunctionalityData.list_of_links = updatedFunctionalityData.list_of_links.map((lnk) =>
                            lnk.id === updatedElement.id ? (updatedElement as LinkInteractiveResponse) : lnk
                        );
                        break;
                    case 'HOTSPOT':
                        updatedFunctionalityData.list_of_buttons = updatedFunctionalityData.list_of_buttons.map((btn) =>
                            btn.id === updatedElement.id && btn.isForHotspot == 1 ? (updatedElement as SingleButtons) : btn
                        );
                        break;
                    default:
                        toast.error('Invalid element type.');
                        return prevJson;
                }

                // Return a new object with the updated functionality_datas
                return {
                    ...prevJson,
                    functionality_datas: updatedFunctionalityData
                };
            });
        },
        []
    );

    const deleteInteractiveElement = useCallback(
        (elementType: string, elementId: number) => {
            setFinalJsondetails((prevJson: FinalJson | undefined) => {
                if (!prevJson) return prevJson;

                // Create a deep copy to avoid mutation
                const functionalityData = {
                    ...prevJson.functionality_datas,
                    list_of_buttons: [...(prevJson.functionality_datas?.list_of_buttons || [])],
                    list_of_container_text: [...(prevJson.functionality_datas?.list_of_container_text || [])],
                    list_of_images: [...(prevJson.functionality_datas?.list_of_images || [])],
                    list_of_links: [...(prevJson.functionality_datas?.list_of_links || [])],
                    list_of_polls: [...(prevJson.functionality_datas?.list_of_polls || [])],
                    // Preserve snip_share explicitly
                    snip_share: prevJson.functionality_datas?.snip_share
                };

                switch (elementType) {
                    case 'BUTTON':
                        functionalityData.list_of_buttons = functionalityData.list_of_buttons.filter(
                            (btn) => btn.id !== elementId
                        );
                        break;
                    case 'HOTSPOT':
                        functionalityData.list_of_buttons = functionalityData.list_of_buttons.filter(
                            (btn) => btn.id !== elementId && btn.isForHotspot === 1
                        );
                        break;
                    case 'TEXT':
                        functionalityData.list_of_container_text = functionalityData.list_of_container_text.filter(
                            (txt) => txt.id !== elementId
                        );
                        break;
                    case 'IMAGE':
                        functionalityData.list_of_images = functionalityData.list_of_images.filter(
                            (img) => img.id !== elementId
                        );
                        break;
                    case 'LINK':
                        functionalityData.list_of_links = functionalityData.list_of_links.filter(
                            (lnk) => lnk.id !== elementId
                        );
                        break;
                    default:
                        toast.error('Invalid element type.');
                        return prevJson;
                }

                return {
                    ...prevJson,
                    functionality_datas: functionalityData
                };
            });
        },
        []
    );

    const contextValue = useMemo(() => ({
        finalJsondetails,
        setFinalJsondetails,
        addInteractiveElement,
        updateInteractiveElement,
        deleteInteractiveElement,
    }), [finalJsondetails, addInteractiveElement, updateInteractiveElement, deleteInteractiveElement]);

    return (
        <FinalJsonContext.Provider value={contextValue}>
            {children}
        </FinalJsonContext.Provider>
    );
};