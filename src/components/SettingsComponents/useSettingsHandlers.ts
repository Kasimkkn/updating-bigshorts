import { getBlockedUsers } from "@/services/getblockedusers";
import { getMutedUsers } from "@/services/getmutedusers";
import { mutePost } from "@/services/muteposts";
import { privateAccount } from "@/services/privateaccount";
import { SaveFeedBack } from "@/services/savefeedback";
import { saveUserBlock } from "@/services/saveuserblock";
import toast from "react-hot-toast";
import useSettingsState from "./useSettingState";
import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import { SettingToggleType } from "./settingPageTypes";
import { deleteAccount } from "@/services/deleteaccount";
import { getArchives } from "@/services/getarchives";
import { fetchMiniWatchHistory } from "@/services/getminiwatchhistory";
import { useUserProfile } from "@/context/useUserProfile";

const useSettingsHandlers = (state: ReturnType<typeof useSettingsState>) => {
    const router = useRouter();
    const {fetchUserData} = useUserProfile();
    const handleSettingToggle = async () => {
        if (!state.currentSetting) return;

        try {
            switch (state.currentSetting) {
                case 'private':
                    await onChangeOfPrivateToggle();
                    break;
                case 'notification':
                    await handleNotificationToggle();
                    break;
                case 'tagging':
                    await handleTaggingToggle();
                    break;
                case 'contactEmail':
                    await handleContactEmailToggle();
                    break;
                case 'contactPhone':
                    await handleContactPhoneToggle();
                    break;
                case 'deleteAccount':
                    await handleDeleteAccount();
                    break;
            }
        } catch (error) {
            console.error(`Error toggling ${state.currentSetting}:`, error);
            toast.error('Failed to update setting');
        }
    };


    const handleConfirmation = (message: string, setting: SettingToggleType) => {
        state.setCurrentSetting(setting);
        state.setIsConfirmationModalOpen(!state.isConfirmationModalOpen);
        state.setConfirmationMessage(message);
    };

    const onChangeOfPrivateToggle = async () => {
        try {
            const response = await privateAccount();
            if (response.isSuccess) {
                fetchUserData();
                toast.success(
                    "Account is now " +
                    (state.userData?.isPrivateAccount === 0 ? "Private" : "Public")
                );
                state.setIsConfirmationModalOpen(false);
            }
        } catch (error) {
}
    };

    const handleNotificationToggle = async () => {
state.setIsConfirmationModalOpen(false);
    }

    const handleTaggingToggle = async () => {
state.setIsConfirmationModalOpen(false);

    }

    const handleContactEmailToggle = async () => {
state.setIsConfirmationModalOpen(false);

    }

    const handleContactPhoneToggle = async () => {
state.setIsConfirmationModalOpen(false);

    }
    const fetchMutedUsers = async () => {
        try {
            const response = await getMutedUsers();
            if (response.isSuccess) {
                state.setMutedUsers(response.data);
                state.setMutedModal(true);
            }
        } catch (error) {
}
    };

    const fetchBlockedUsers = async () => {
        try {
            const response = await getBlockedUsers();
            if (response.isSuccess) {
                state.setBlockedUsers(response.data);
                state.setUnhideModal(true);
            }
        } catch (error) {
}
    };

    const fetchArchive = async () => {
        try {
            const response = await getArchives();
            if (response.isSuccess) {
                state.setArchives(response.data);
                state.setArchivesModal(true);
            }
        } catch (error) {
}
    }
    const getMiniWatchHistory = async () => {
        try {
          const response = await fetchMiniWatchHistory();
          if (response.isSuccess && response.data.history && response.data.history.length > 0) {
            // Cast the history array to the correct type that your state expects
            state.setWatchHistory(response.data.history as any);
            state.setWatchHistoryModal(true);
          } else {
            toast.error("No watch history found");
          }
        } catch (error) {
toast.error("Failed to fetch watch history");
        }
      };
    const handleUnhideClicked = async (userId: number) => {
        try {
            await mutePost({ mutedUserId: userId });
            fetchMutedUsers();
        } catch (error) {
}
    };

    const handleUnblockUser = async (userId: number) => {
        try {
            await saveUserBlock({ blockuserId: userId, isBlock: 0 });
            fetchBlockedUsers();
        } catch (error) {
}
    };

    const handleFeedbackSend = async () => {
        try {
            const response = await SaveFeedBack(state.formData);
            if (response.isSuccess) {
                toast.success("Feedback sent successfully");
                state.setFormData({ description: "", email: "", phone: "" });
                state.setOpenFeedbackModal(false);
            }
        } catch (error) {
}
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        state.setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push("/auth/login");
    };

    const handleDeleteAccount = async () => {
        const userData = { isActive: 0 }
        try {
            const response = await deleteAccount(userData);
            if (response.isSuccess) {
                localStorage.clear();
                router.push("/auth/login");
                toast.success(
                    "Account is now deleted"
                );
                state.setIsConfirmationModalOpen(false);
            }
        } catch (error) {
}
    };

    return {
        handleSettingToggle,
        handleConfirmation,
        onChangeOfPrivateToggle,
        fetchMutedUsers,
        fetchBlockedUsers,
        fetchArchive,
        getMiniWatchHistory,
        handleUnhideClicked,
        handleUnblockUser,
        handleFeedbackSend,
        handleInputChange,
        handleLogout,
        handleDeleteAccount,
    };
};

export default useSettingsHandlers;