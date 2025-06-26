import { useState } from "react";

export const useUIState = () => {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAccountOverviewOpen, setIsAccountOverviewOpen] = useState(false);

    const toggleSidebar = () => setIsSideBarOpen(!isSideBarOpen);
    const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);
    const toggleSettings = () => setOpenSettings(!openSettings);
    const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
    const toggleAccountOverview = () => setIsAccountOverviewOpen(!isAccountOverviewOpen);

    return {
        isSideBarOpen,
        isNotificationOpen,
        isSearchOpen,
        setIsSideBarOpen,
        openSettings,
        isAccountOverviewOpen,
        toggleSidebar,
        toggleNotification,
        toggleSearch,
        toggleSettings,
        toggleAccountOverview
    };
};
