import { ArchivesReponseTypes } from "@/services/getarchives";
import { MutedUser } from "@/services/getmutedusers";
import { ProfileData } from "@/types/usersTypes";
import { useEffect, useState } from "react";
import { SettingToggleType } from "./settingPageTypes";
import { useUserProfile } from "@/context/useUserProfile";

const useSettingsState = () => {
    const [currentSetting, setCurrentSetting] = useState<SettingToggleType | null>(null);
    const [openThemeSelection, setOpenThemeSelection] = useState(false);
    const {userData} = useUserProfile();
    const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
    const [openAboutUs, setOpenAboutUs] = useState(false);
    const [openTermsOfService, setOpenTermsOfService] = useState(false);
    const [isDeleteAccount, setIsDeleteAccount] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState<string>("");
    const [mutedUsers, setMutedUsers] = useState<MutedUser[] | null>(null);
    const [blockedUsers, setBlockedUsers] = useState<MutedUser[] | null>(null);
    const [unhideModal, setUnhideModal] = useState(false);
    const [archives, setArchives] = useState<ArchivesReponseTypes[] | null>(null);
    const [archivesModal, setArchivesModal] = useState(false);
    const [mutedModal, setMutedModal] = useState(false);
    const [watchHistoryModal, setWatchHistoryModal] = useState(false);
    const [watchHistory, setWatchHistory] = useState<[]>([]);
    const [formData, setFormData] = useState({
        description: "",
        email: "",
        phone: "",
    });

    return {
        openThemeSelection,
        setOpenThemeSelection,
        userData,
        openFeedbackModal,
        setOpenFeedbackModal,
        openAboutUs,
        setOpenAboutUs,
        openTermsOfService,
        setOpenTermsOfService,
        isDeleteAccount,
        setIsDeleteAccount,
        isConfirmationModalOpen,
        setIsConfirmationModalOpen,
        confirmationMessage,
        setConfirmationMessage,
        mutedUsers,
        setMutedUsers,
        blockedUsers,
        setBlockedUsers,
        unhideModal,
        setUnhideModal,
        mutedModal,
        setMutedModal,
        archivesModal,
        setArchivesModal,
        archives,
        setArchives,
        formData,
        setFormData,
        currentSetting,
        setCurrentSetting,
        watchHistoryModal,
       setWatchHistoryModal,
       watchHistory,
       setWatchHistory,
    };
};

export default useSettingsState;