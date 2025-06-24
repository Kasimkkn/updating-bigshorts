"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CgDarkMode } from "react-icons/cg";
import { FiUserX } from "react-icons/fi";
import { IoLockClosedOutline } from "react-icons/io5";
import { LuShare } from "react-icons/lu";
import { MdOutlinePassword, MdOutlineReportGmailerrorred } from "react-icons/md";
import { PiSignOut, PiSpeakerSlash } from "react-icons/pi";

import dummyImage from "@/assets/user.png";
import CommonModalLayer from "@/components/modal/CommonModalLayer";
import ConfirmModal from "@/components/modal/ConfirmModal";
import AboutUsModal from "@/components/modal/AboutUsModal";
import BlockedUserModal from "@/components/SettingsComponents/BlockedUserModal";
import ArchivesModal from "@/components/SettingsComponents/ArchivesModal";
import FeedBackModal from "@/components/SettingsComponents/FeedBackModal";
import HideUserModal from "@/components/SettingsComponents/HideUserModal";
import NavigationSetting from "@/components/SettingsComponents/NavigationSetting";
import SettingToggle from "@/components/SettingsComponents/SettingToggle";
import useSettingsHandlers from "@/components/SettingsComponents/useSettingsHandlers";
import useSettingsState from "@/components/SettingsComponents/useSettingState";
import ThemeSelector from "@/components/ThemeSelector/ThemeSelector";
import MiniWatchHistoryModal from "./MiniWatchHistoryModal";
import { useUserProfile } from "@/context/useUserProfile";

interface SettingModalProps {
    onClose: () => void
}

const SettingModal = ({ onClose }: SettingModalProps) => {
    const router = useRouter()
    const state = useSettingsState();
    const handlers = useSettingsHandlers(state);
    const {fetchUserData} = useUserProfile();

    useEffect(()=>{
        fetchUserData();
    },[]);

    return (
        <CommonModalLayer isModal={false} isThemeSelectionOpen={state.openThemeSelection} onClose={onClose}>
            <div id="settingModal" className=" md:w-[70%] lg:w-1/3 xl:w-[28%] fixed max-lg:w-2/4 max-md:w-[90%] bg-bg-color h-full overflow-y-auto right-0 shadow-2xl border-l border-border-color">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="sticky top-0 bg-bg-color/95 backdrop-blur-sm border-b border-border-color px-6 py-4 z-10">
                        <h2 className="text-text-color text-2xl font-semibold">Settings</h2>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="space-y-6">
                            {/* Privacy & Security Section */}
                            <div className="space-y-4">
                                <h3 className="text-text-color text-sm font-medium uppercase tracking-wider">Privacy & Security</h3>
                                <div className="space-y-2">
                                    {/* <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <SettingToggle
                                            icon={<GoBell className="text-2xl max-md:text-3xl" />}
                                            title="Notifications"
                                            description="If you disable notifications, you won't get latest updates from your followers"
                                            isChecked={state.userData?.isAllowNotification === 1}
                                            onToggle={() => handlers.handleConfirmation(
                                                `${state.userData?.isAllowNotification
                                                    ? "Are you sure you want to disable notifications?"
                                                    : "Are you sure you want to enable notifications?"
                                                }`, "notification"
                                            )}
                                        />
                                    </div> */}

                                    <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <SettingToggle
                                            icon={<IoLockClosedOutline className="text-xl" />}
                                            title="Private Account"
                                            isChecked={state.userData?.isPrivateAccount === 1}
                                            onToggle={() => handlers.handleConfirmation(
                                                `${state.userData?.isPrivateAccount
                                                    ? "Are you sure you want to make your account public?"
                                                    : "Are you sure you want to make your account private?"
                                                }`, "private"
                                            )}
                                        />
                                    </div>

                                    {/* Allow Tagging Option Removed */}

                                    {/* <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <SettingToggle
                                            icon={<IoAtSharp className="text-xl" />}
                                            title="Allow Tagging"
                                            isChecked={state.userData?.isAllowTagging === 1}
                                            onToggle={() => handlers.handleConfirmation(
                                                `${state.userData?.isAllowTagging
                                                    ? "Are you sure you want to disable tagging?"
                                                    : "Are you sure you want to enable tagging?"
                                                }`, "tagging"
                                            )}
                                        />
                                    </div> */}
                                </div>
                            </div>

                            {/* Appearance Section */}
                            <div className="space-y-4">
                                <h3 className="text-text-color text-sm font-medium uppercase tracking-wider">Appearance</h3>
                                <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                    <NavigationSetting
                                        icon={<CgDarkMode className="text-xl" />}
                                        title="App Theme Preference"
                                        onClick={() => state.setOpenThemeSelection(!state.openThemeSelection)}
                                    />
                                    {state.openThemeSelection && (
                                        <div className="mt-4 pt-4 border-t border-border-color/30">
                                            <ThemeSelector />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content Management Section */}
                            <div className="space-y-4">
                                <h3 className="text-text-color text-sm font-medium uppercase tracking-wider">Content Management</h3>
                                <div className="space-y-2">
                                    <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <NavigationSetting
                                            icon={<PiSpeakerSlash className="text-xl" />}
                                            title="Hidden Users"
                                            onClick={handlers.fetchMutedUsers}
                                        />
                                    </div>

                                    <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <NavigationSetting
                                            icon={<MdOutlineReportGmailerrorred className="text-xl" />}
                                            title="Blocked Users"
                                            onClick={handlers.fetchBlockedUsers}
                                        />
                                    </div>

                                    <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <NavigationSetting
                                            icon={<MdOutlineReportGmailerrorred className="text-xl" />}
                                            title="Archives"
                                            onClick={handlers.fetchArchive}
                                        />
                                    </div>

                                    <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <NavigationSetting
                                            icon={<MdOutlineReportGmailerrorred className="text-xl" />}
                                            title="Mini Watch History"
                                            onClick={handlers.getMiniWatchHistory}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Management Section */}
                            <div className="space-y-4">
                                <h3 className="text-text-color text-sm font-medium uppercase tracking-wider">Account Management</h3>
                                <div className="space-y-2">
                                    <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <NavigationSetting
                                            icon={<MdOutlinePassword className="text-xl" />}
                                            title="Change Password"
                                            onClick={() => router.push('/auth/change-known-password')}
                                        />
                                    </div>

                                    <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <NavigationSetting
                                            icon={<LuShare className="text-xl" />}
                                            title="Feedback"
                                            onClick={() => state.setOpenFeedbackModal(true)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Legal & Support Section
                            <div className="space-y-4">
                                <h3 className="text-text-color/70 text-sm font-medium uppercase tracking-wider">Legal & Support</h3>
                                <div className="space-y-2">
                                    <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <NavigationSetting
                                            icon={<MdOutlinePolicy className="text-xl" />}
                                            title="Privacy Policy"
                                            onClick={() => router.push('/home/privacyPolicy')}
                                        />
                                    </div>

                                    <div className="rounded-xl bg-bg-color/50 border border-border-color/50 p-4 hover:bg-bg-color/80 transition-colors">
                                        <NavigationSetting
                                            icon={<AiOutlineSafety className="text-xl" />}
                                            title="Child Safety"
                                            onClick={() => router.push('/home/childSafety')}
                                        />
                                    </div>
                                </div>
                            </div> */}

                            {/* Danger Zone */}
                            <div className="space-y-4">
                                <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 hover:bg-red-500/10 transition-colors">
                                    <NavigationSetting
                                        icon={<FiUserX className="text-xl text-red-600" />}
                                        title="Delete Account"
                                        onClick={() => {
                                            state.setIsDeleteAccount(true);
                                            handlers.handleConfirmation(
                                                "Do you really wish to delete your account? Please be aware that by deleting your account, you will lose your profile and all associated data.",
                                                "deleteAccount");
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Logout Button */}
                    <div className="sticky bottom-0 bg-bg-color/95 backdrop-blur-sm border-t border-border-color p-6">
                        <button
                            onClick={handlers.handleLogout}
                            className="flex gap-4 items-center w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors group"
                        >
                            <PiSignOut className="text-xl text-red-600 group-hover:scale-110 transition-transform" />
                            <div className="flex flex-col">
                                <p className="text-lg text-red-600 font-medium">Logout</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Watch History Modal */}
                {state.watchHistoryModal && (
                    <MiniWatchHistoryModal
                        watchHistory={state.watchHistory}
                        setWatchHistoryModal={state.setWatchHistoryModal}
                        toggleSettings={onClose}
                    />
                )}

                {/* Confirmation Modal */}
                {state.isConfirmationModalOpen && (
                    <ConfirmModal
                        isDeleteAccount={state.isDeleteAccount}
                        isOpen={state.isConfirmationModalOpen}
                        message={state.confirmationMessage}
                        onConfirm={handlers.handleSettingToggle}
                        onCancel={() => {
                            state.setIsConfirmationModalOpen(false);
                            state.setCurrentSetting(null);
                            state.setIsDeleteAccount(false);
                        }}
                    />
                )}

                {/* Muted Users Modal */}
                {state.mutedModal && (
                    <HideUserModal
                        mutedUsers={state.mutedUsers}
                        setMutedModal={state.setMutedModal}
                        handleUnhideClicked={handlers.handleUnhideClicked}
                        dummyImage={dummyImage}
                    />
                )}

                {/* Blocked Users Modal */}
                {state.unhideModal && (
                    <BlockedUserModal
                        blockedUsers={state.blockedUsers}
                        setUnhideModal={state.setUnhideModal}
                        handlUnblockUser={handlers.handleUnblockUser}
                        dummyImage={dummyImage}
                    />
                )}

                {/* Archives Modal */}
                {state.archivesModal && (
                    <ArchivesModal
                        archives={state.archives}
                        setArchivesModal={state.setArchivesModal}
                    />
                )}

                {/* Feedback Modal */}
                {state.openFeedbackModal && (
                    <FeedBackModal
                        formData={state.formData}
                        setOpenFeedbackModal={state.setOpenFeedbackModal}
                        handleFeedBackSend={handlers.handleFeedbackSend}
                        handleInputChange={handlers.handleInputChange}
                    />
                )}

                {/* About Us Modal */}
                {state.openAboutUs && (
                    <AboutUsModal
                        setOpenAboutUs={state.setOpenAboutUs}
                        openTermsOfService={state.openTermsOfService}
                        setOpenTermsOfService={state.setOpenTermsOfService}
                    />
                )}
            </div>
        </CommonModalLayer>
    );
};

export default SettingModal;