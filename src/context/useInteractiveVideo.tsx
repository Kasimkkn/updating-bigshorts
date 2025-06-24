import { createContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { VideoList as FinalJson } from '@/models/videolist';
import { CommonModel } from '@/models/commonmodelforallfunctionality';
import { SingleButtons } from "@/models/designofbuttons";
import { ImagesInteractiveResponse } from '@/models/ImagesInteractiveResponse';
import { LinkInteractiveResponse } from '@/models/linkInteractiveResonse';
import { ContainerText } from '@/models/textcontainerdesign';
import toast from 'react-hot-toast';
import { BUTTON, LINK, IMAGE, TEXT, MAX_ELEMENTS, HOTSPOT } from '@/constants/interactivityConstants';

export const FinalJsonContext = createContext<{
    finalJsondetails: FinalJson | undefined;
    setFinalJsondetails: React.Dispatch<React.SetStateAction<FinalJson | undefined>>;
    videoList: FinalJson[];
    setVideoList: React.Dispatch<React.SetStateAction<FinalJson[]>>;
    addInteractiveElement: (elementType: string, element: SingleButtons | ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse) => void;
    updateInteractiveElement: (elementType: string, updatedElement: SingleButtons | ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse) => void;
    deleteInteractiveElement: (elementType: string, elementId: number) => void;
    addNewVideoToFinalJson: (video: FinalJson, exisitingFinalJson?: FinalJson) => void;
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

const initializeFunctionalityData = (): CommonModel => ({
    list_of_buttons: [],
    list_of_container_text: [],
    list_of_images: [],
    list_of_links: [],
    list_of_polls: [],
    snip_share: {
        snipItem: null,
        positionX: 0,
        positionY: 0,
        scale: 1
    }

});

export const initializeFinalJson = ({
    id,
    parent_id,
    path,
    duration,
    audioPath,
    audioDuration,
}: {
    id: number;
    parent_id: number;
    path: string;
    duration: string;
    audioPath: string;
    audioDuration: string;
}): FinalJson => {

    return {
        functionality_datas: initializeFunctionalityData(),
        currentTime: 0,
        id: id || 0,
        parent_id: parent_id,
        path: path || '',
        duration: duration || '',
        is_selcted: false,
        video_id: 0,
        androidStreamingUrl: '',
        audioDuration: audioDuration || '',
        audioFilePath: audioPath || '',
        audioId: 0,
        postId: 0,
        audioName: '',
        timeOfVideElementoShow: '',
        iosStreamingUrl: '',
        onVideoEnd: 'Do Nothing',
        aspect_ratio: 1,
    };
};

export const FinalJsonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [finalJsondetails, setFinalJsondetails] = useState<FinalJson | undefined>(undefined);
    const [videoList, setVideoList] = useState<FinalJson[]>([]);

    const addNewVideoToFinalJson = useCallback(
        (newFinalJson: FinalJson, exisitingFinalJson?: FinalJson) => {
            setVideoList((prevList) => {
                return [...prevList, newFinalJson];
            });
        },
        [setVideoList] // Remove videoList from dependencies
    );

    const addInteractiveElement = useCallback(
        (elementType: string, element: SingleButtons | ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse) => {
            setFinalJsondetails((prevJson) => {
                if (!prevJson) {
                    return initializeFinalJson({ id: 0, parent_id: 0, path: '', duration: '', audioPath: '', audioDuration: '' });
                }
    
                const updatedFunctionalityData: CommonModel = {
                    list_of_buttons: prevJson.functionality_datas?.list_of_buttons || [],
                    list_of_container_text: prevJson.functionality_datas?.list_of_container_text || [],
                    list_of_images: prevJson.functionality_datas?.list_of_images || [],
                    list_of_links: prevJson.functionality_datas?.list_of_links || [],
                    list_of_polls: prevJson.functionality_datas?.list_of_polls || [],
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
    
                const updatedFinalJson = {
                    ...prevJson,
                    functionality_datas: updatedFunctionalityData,
                };
    
                setVideoList((prevList) => {
                    const videoIndex = prevList.findIndex(video => video.id === updatedFinalJson.id);
                    if (videoIndex !== -1) {
                        const updatedVideoList = [...prevList];
                        updatedVideoList[videoIndex] = {
                            ...updatedVideoList[videoIndex],
                            functionality_datas: updatedFunctionalityData,
                        };
                        return updatedVideoList;
                    }
                    return prevList;
                });
    
                return updatedFinalJson;
            });
        },
        [setVideoList] // Remove videoList from dependencies
    );

    const updateInteractiveElement = useCallback(
        (elementType: string, updatedElement: SingleButtons | ContainerText | ImagesInteractiveResponse | LinkInteractiveResponse) => {
            setFinalJsondetails((prevJson) => {
                if (!prevJson) return prevJson;

                const updatedFunctionalityData: CommonModel = {
                    list_of_buttons: prevJson.functionality_datas?.list_of_buttons || [],
                    list_of_container_text: prevJson.functionality_datas?.list_of_container_text || [],
                    list_of_images: prevJson.functionality_datas?.list_of_images || [],
                    list_of_links: prevJson.functionality_datas?.list_of_links || [],
                    list_of_polls: prevJson.functionality_datas?.list_of_polls || [],
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

                const updatedFinalJson = { ...prevJson, functionality_datas: updatedFunctionalityData };

                // Update the videoList entry for the corresponding finalJsondetails
                setVideoList((prevList) => {
                    const videoIndex = prevList.findIndex(video => video.id === updatedFinalJson.id);
                    if (videoIndex !== -1) {
                        const updatedVideoList = [...prevList];
                        updatedVideoList[videoIndex] = { ...updatedVideoList[videoIndex], functionality_datas: updatedFunctionalityData };
                        return updatedVideoList;
                    }
                    return prevList;
                });

                return updatedFinalJson;
            });
        },
        [setVideoList]
    );

    const deleteInteractiveElement = useCallback(
        (elementType: string, elementId: number) => {
            setFinalJsondetails((prevJson) => {
                if (!prevJson) {
                    return prevJson; // Return as is if prevJson is undefined
                }

                // Safely clone functionality_datas, ensuring default values for undefined fields
                const functionalityData = {
                    ...prevJson.functionality_datas,
                    list_of_buttons: prevJson.functionality_datas!.list_of_buttons ?? [], // Provide default empty array
                    list_of_container_text: prevJson.functionality_datas!.list_of_container_text ?? [],
                    list_of_images: prevJson.functionality_datas!.list_of_images ?? [],
                    list_of_links: prevJson.functionality_datas!.list_of_links ?? [],
                    list_of_polls: prevJson.functionality_datas!.list_of_polls ?? []
                };

                switch (elementType) {
                    case 'BUTTON':
                        functionalityData.list_of_buttons = functionalityData.list_of_buttons.filter((btn) => btn.id !== elementId);
                        break;
                    case 'HOTSPOT':
                        functionalityData.list_of_buttons = functionalityData.list_of_buttons.filter((btn) => btn.id !== elementId && btn.isForHotspot === 1);
                        break;
                    case 'TEXT':
                        functionalityData.list_of_container_text = functionalityData.list_of_container_text.filter((txt) => txt.id !== elementId);
                        break;
                    case 'IMAGE':
                        functionalityData.list_of_images = functionalityData.list_of_images.filter((img) => img.id !== elementId);
                        break;
                    case 'LINK':
                        functionalityData.list_of_links = functionalityData.list_of_links.filter((lnk) => lnk.id !== elementId);
                        break;
                    default:
                        toast.error('Invalid element type.');
                        return prevJson; // Return original json if element type is invalid
                }

                // Update the videoList entry for the corresponding finalJsondetails
                setVideoList((prevList) => {
                    const videoIndex = prevList.findIndex((video) => video.id === prevJson.id);
                    if (videoIndex !== -1) {
                        const updatedVideo = { ...prevList[videoIndex], functionality_datas: functionalityData };
                        const newVideoList = [...prevList];
                        newVideoList[videoIndex] = updatedVideo;
                        return newVideoList;
                    }
                    return prevList;
                });

                // Return the updated structure ensuring it conforms to VideoList type
                return {
                    ...prevJson,
                    functionality_datas: functionalityData // Make sure this structure matches the VideoList type
                };
            });
        },
        [setVideoList]
    );


    const contextValue = useMemo(() => ({
        finalJsondetails,
        setFinalJsondetails,
        videoList,
        setVideoList,
        addInteractiveElement,
        updateInteractiveElement,
        deleteInteractiveElement,
        addNewVideoToFinalJson,
    }), [finalJsondetails, addInteractiveElement, updateInteractiveElement, deleteInteractiveElement, videoList, addNewVideoToFinalJson]);

    return (
        <FinalJsonContext.Provider value={contextValue}>
            {children}
        </FinalJsonContext.Provider>
    );
};

