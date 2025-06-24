"use client";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { InAppRedirectionProvider } from "@/context/InAppRedirectionContext";
import { useCreationOption } from "@/context/useCreationOption";
import CreationFlows from "@/components/LayoutComponent/CreationFlows";
import MobileHeader from "@/components/LayoutComponent/MobileHeader";
import NotificationPanel from "@/components/LayoutComponent/NotificationPanel";
import SearchPanel from "@/components/LayoutComponent/SearchPanel";
import SettingsPanel from "@/components/LayoutComponent/SettingsPanel";
import SideBar from "@/components/shared/SideBar/SideBar";
import logo from '@/assets/logo.svg';
import TopLoadingBar from "@/components/TopLoadingBar";
import { useProgressBar } from "@/context/ProgressBarContext";
import { useUserProfile } from "@/context/useUserProfile";
import { useLayoutApi } from "@/hooks/LayoutHooks/useLayoutApi";
import { useUIState } from "@/hooks/LayoutHooks/useUIState";
import SearchComponent from "@/components/SearchComponent/SearchComponent";
import AccountOverviewModal from "@/components/modal/AccountOverviewModal";

type LayoutProps = {
  children: ReactNode;
};

// Function to detect if device is mobile
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth <= 768;
};

const Layout = ({ children }: LayoutProps) => {
  const [isPrivateAccount, setIsPrivateAccount] = useState(1);
  const [showPages, setShowPages] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { showProgressBar, } = useProgressBar();

  const shouldHideMobileHeader = pathname === '/home/message' || pathname === '/home/snips';
  const showSearchBar = pathname === "/home" || pathname === "/home/search";

  useEffect(() => {
    setIsClient(true);
    setShowPages(true);
    setIsMobile(isMobileDevice());

    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    openCreatingOptions,
    createPost,
    createSnip,
    createSsup,
    createFlix,
    toggleCreatingOptions,
    togglePostCreate,
    toggleSnipCreate,
    toggleSsupCreate,
    toggleFlixCreate,
    setCreatePost,
    setCreateSnip,
    setCreateSsup,
    setCreateFlix,
    storyViewOpen
  } = useCreationOption();

  const {
    isSideBarOpen,
    isNotificationOpen,
    isSearchOpen,
    openSettings,
    isAccountOverviewOpen,
    toggleSidebar,
    toggleNotification,
    toggleSearch,
    toggleSettings,
    toggleAccountOverview
  } = useUIState();

  const {
    userData
  } = useUserProfile();


  useEffect(() => {
    if (userData) {
      setIsPrivateAccount(userData !== null ? userData.isPrivateAccount : isPrivateAccount);
    }
  }, [userData]);

  const {
    notificationData,
    followRequestData,
    messageCount,
    isFollowerLoading,
    isLoading,
    fetchMessageCount,
    fetchNotificationAlert
  } = useLayoutApi(isNotificationOpen, isPrivateAccount);


  useEffect(() => {
    if (isClient) {
      fetchMessageCount();
      fetchNotificationAlert();
    }
  }, [isClient, fetchMessageCount, fetchNotificationAlert]);

  if (!isClient) {
    return (
      <div className="h-screen flex max-md:flex-col max-md:gap-2 items-center justify-center w-full">
        <img src={logo.src} alt="Logo" width={100} height={100} className="w-40 h-40 animate-slow-grow" />
      </div>
    );
  }

  return (
    <InAppRedirectionProvider>
      {/* CRITICAL: This line renders the progress bar */}
      {showProgressBar && <TopLoadingBar />}

      {!showPages && (
        <div className="h-screen flex max-md:flex-col max-md:gap-2 items-center justify-center w-full">
          <img src={logo.src} alt="Logo" width={100} height={100} className="w-40 h-40 animate-slow-grow" />
        </div>
      )}

      <div className={`flex min-h-screen ${showPages ? '' : 'hidden'}`}>

        {!storyViewOpen && (
          <SideBar
            isSideBarOpen={isSideBarOpen}
            toggleSidebar={toggleSidebar}
            toggleSettings={toggleSettings}
            toggleSearch={toggleSearch}
            messageCount={messageCount}
            toggleNotification={toggleNotification}
            toggleCreatingOptions={toggleCreatingOptions}
          />
        )}

        <main className={`text-text-color bg-bg-color transition-all duration-300 ${isSideBarOpen ? "pl-56" : "md:pl-16"
          } w-screen overflow-y-hidden`}>

          {/* Conditionally render MobileHeader based on path and device */}
          {isMobile && !shouldHideMobileHeader && (
            <MobileHeader
              toggleSearch={toggleSearch}
              userData={userData}
              toggleSettings={toggleSettings}
              toggleNotification={toggleNotification}
              toggleAccountOverview={toggleAccountOverview}
            />
          )}

          <section className={`${isMobile && !shouldHideMobileHeader ? "pt-[4rem]" : ""} `}>
            {showSearchBar && <SearchComponent dropdownStyle="style1"/>}
            {children}
          </section>

          <CreationFlows
            openCreatingOptions={openCreatingOptions}
            createPost={createPost}
            createSnip={createSnip}
            createSsup={createSsup}
            createFlix={createFlix}
            toggleCreatingOptions={toggleCreatingOptions}
            togglePostCreate={togglePostCreate}
            toggleSnipCreate={toggleSnipCreate}
            toggleSsupCreate={toggleSsupCreate}
            toggleFlixCreate={toggleFlixCreate}
            // DON'T PASS toggleShowProgressBar - use context directly in components
            setCreatePost={setCreatePost}
            setCreateSnip={setCreateSnip}
            setCreateSsup={setCreateSsup}
            setCreateFlix={setCreateFlix}
          />
        </main>

        {isNotificationOpen && (
          <NotificationPanel
            followRequestData={followRequestData}
            notificationData={notificationData}
            toggleNotification={toggleNotification}
            isNotificationOpen={isNotificationOpen}
            isPrivateAccount={isPrivateAccount}
            isFollowerLoading={isFollowerLoading}
            isLoading={isLoading}
          />
        )}

        {isSearchOpen && (
          <SearchPanel onClose={() => toggleSearch()} toggleSearch={() => toggleSearch()} toggleSideBar={() => toggleSidebar()} />
        )}

        {openSettings && (
          <SettingsPanel onClose={() => toggleSettings()} />
        )}

        {isAccountOverviewOpen && userData && (
          <AccountOverviewModal onClose={() => toggleAccountOverview()} userId={userData.userId} />
        )}
      </div>
    </InAppRedirectionProvider>
  );
};

export default Layout;