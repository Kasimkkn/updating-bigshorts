import { Series } from "@/services/getserieslist";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

interface InAppRedirectionContextType {
    inAppSnipsData: any;
    setInAppSnipsData: React.Dispatch<React.SetStateAction<any>>;
    snipIndex: number | null;
    setSnipIndex: React.Dispatch<React.SetStateAction<number | null>>;
    inAppPostData: any;
    setInAppPostData: React.Dispatch<React.SetStateAction<any>>;
    inAppFlixData: any;
    setInAppFlixData: React.Dispatch<React.SetStateAction<any>>;
    snipId: number | null;
    setSnipId: React.Dispatch<React.SetStateAction<number | null>>
    messageUserId: number | null
    setMessageUserId: React.Dispatch<React.SetStateAction<number | null>>
    profilePostData: any
    setProfilePostData: React.Dispatch<React.SetStateAction<any>>
    profilePostId: number | null
    setProfilePostId: React.Dispatch<React.SetStateAction<number | null>>
    shouldRefreshPosts: boolean;
    setShouldRefreshPosts: React.Dispatch<React.SetStateAction<boolean>>;
    seriesData: Series | null;
    setSeriesData: React.Dispatch<React.SetStateAction<Series | null>>
    allVideos: any[];
    setAllVideos: React.Dispatch<React.SetStateAction<any[]>>;
    clearFlixData: () => void; // Added method to clear flix-related data;
    clearSnipsData: () => void; // Added method to clear snips-related data
    isChatOpen: boolean;
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>
    shouldRefreshProfileStory: boolean;
    setShouldRefreshProfileStory: React.Dispatch<React.SetStateAction<boolean>>;
}

const InAppRedirectionContext = createContext<InAppRedirectionContextType | null>(null);

export const InAppRedirectionProvider = ({ children }: { children: React.ReactNode }) => {
    const [inAppSnipsData, setInAppSnipsData] = useState<any>(null);
    const [inAppPostData, setInAppPostData] = useState<any>(null);
    const [inAppFlixData, setInAppFlixData] = useState<any>(null);
    const [snipIndex, setSnipIndex] = useState<number | null>(null);
    const [snipId, setSnipId] = useState<number | null>(null);
    const [messageUserId, setMessageUserId] = useState<number | null>(null);
    const [profilePostData, setProfilePostData] = useState<any>(null);
    const [profilePostId, setProfilePostId] = useState<number | null>(null);
    const [shouldRefreshPosts, setShouldRefreshPosts] = useState<boolean>(false);
    const [seriesData, setSeriesData] = useState<Series | null>(null);
    const [allVideos, setAllVideos] = useState<any[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [shouldRefreshProfileStory, setShouldRefreshProfileStory] = useState(false)

    const clearFlixData = () => {
        setInAppFlixData(null);
        setAllVideos([]);
    };
    const clearSnipsData = () => {
        setInAppSnipsData(null);
        setSnipIndex(null);
        setSnipId(null);
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            setInAppSnipsData(null);
            setInAppPostData(null);
            setInAppFlixData(null);
            setSnipIndex(null);
            setShouldRefreshPosts(false);
            setSeriesData(null);
            setShouldRefreshProfileStory(false);
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const contextValue = useMemo(() => {
        return {
            inAppSnipsData,
            setInAppSnipsData,
            snipIndex,
            setSnipIndex,
            inAppPostData,
            setInAppPostData,
            inAppFlixData,
            setInAppFlixData,
            snipId,
            setSnipId,
            messageUserId,
            setMessageUserId,
            profilePostData,
            setProfilePostData,
            profilePostId,
            setProfilePostId,
            shouldRefreshPosts,
            setShouldRefreshPosts,
            seriesData,
            setSeriesData,
            allVideos,
            setAllVideos,
            clearFlixData,
            clearSnipsData,
            isChatOpen,
            setIsChatOpen,
            shouldRefreshProfileStory,
            setShouldRefreshProfileStory
        };
    }, [
        inAppSnipsData,
        snipIndex,
        inAppPostData,
        inAppFlixData,
        seriesData,
        setSeriesData,
        setInAppSnipsData,
        setSnipIndex,
        setInAppPostData,
        setInAppFlixData,
        snipId,
        setSnipId,
        messageUserId,
        setMessageUserId,
        profilePostData,
        setProfilePostData,
        setProfilePostId,
        profilePostId,
        shouldRefreshPosts,
        shouldRefreshProfileStory,
        allVideos,
        setAllVideos,
        isChatOpen
    ]);

    return (
        <InAppRedirectionContext.Provider value={contextValue}>
            {children}
        </InAppRedirectionContext.Provider>
    );
};

export const useInAppRedirection = () => {
    const context = useContext(InAppRedirectionContext);
    if (!context) {
        throw new Error("useInAppRedirection must be used within an InAppRedirectionProvider");
    }
    return context;
};