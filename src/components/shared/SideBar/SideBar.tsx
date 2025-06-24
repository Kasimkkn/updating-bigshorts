import logo from "@/assets/mainLogo.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar/Avatar";
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { BiMoviePlay } from "react-icons/bi";
import { MdBookmarkBorder, MdInfoOutline, MdNotificationsNone, MdOutlineAddPhotoAlternate, MdOutlineChat, MdOutlineHome, MdOutlinePersonOutline, MdOutlineSettings, MdSearch } from "react-icons/md";
import { useUserProfile } from "@/context/useUserProfile";
import SocialIcon from "@/components/SocialIcon";
import { IconType } from 'react-icons';

interface SideBarProps {
  isSideBarOpen: boolean;
  toggleSidebar: () => void;
  toggleSettings: () => void;
  toggleSearch: () => void;
  messageCount: string | null;
  toggleNotification: () => void;
  toggleCreatingOptions: () => void;
}

interface BaseNavItem {
  href: string;
  label: string;
  isMobileShow: boolean;
  icon?: IconType;
  className?: string;
  messageCount?: boolean;
  isDekstopShow?: boolean;
  external?: boolean;
}

interface ActionNavItem extends BaseNavItem {
  action?: () => void;
  icon: IconType;
}

interface ProfileNavItem extends BaseNavItem {
  label: "Profile";
}

type NavItem = BaseNavItem | ActionNavItem | ProfileNavItem;

const SideBar = ({
  isSideBarOpen,
  toggleSidebar,
  toggleSettings,
  toggleSearch,
  messageCount,
  toggleNotification,
  toggleCreatingOptions,
}: SideBarProps) => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const { isChatOpen, clearSnipsData } = useInAppRedirection();
  const { userData } = useUserProfile()
  const [username] = useLocalStorage<string>('username', '');
  useEffect(() => {
    if (isHovered && !isSideBarOpen) {
      toggleSidebar();
    } else if (!isHovered && isSideBarOpen) {
      toggleSidebar();
    }
  }, [isHovered, isSideBarOpen, toggleSidebar]);

  const mainNavItems: (ActionNavItem | BaseNavItem)[] = [
    {
      href: "/home",
      label: "Home",
      icon: MdOutlineHome,
      className: "text-xl",
      isMobileShow: true,
    },
    {
      href: "/home/followers",
      label: "Social",
      icon: SocialIcon,
      isMobileShow: true,
    },
    {
      href: "/home/creation-option",
      label: "Create",
      icon: MdOutlineAddPhotoAlternate,
      isMobileShow: true,
      isDekstopShow: true,
      action: toggleCreatingOptions,
    },
    {
      href: "/home/message",
      label: "Message",
      icon: MdOutlineChat,
      messageCount: true,
      isMobileShow: false,
    },
    {
      href: "/home/snips",
      label: "Snips",
      icon: BiMoviePlay,
      isMobileShow: true,
    },
    {
      href: "/home/saved",
      label: "Saved",
      icon: MdBookmarkBorder,
      className: "text-xl",
      isMobileShow: false,
    },
    {
      href: "/home/searchs",
      label: "Search",
      icon: MdSearch,
      className: "text-xl",
      isMobileShow: false,
      action: toggleSearch,
    },
  ];

  const bottomNavItems: (ActionNavItem | ProfileNavItem)[] = [
    {
      href: "/home/notification",
      label: "Notification",
      icon: MdNotificationsNone,
      className: "w-5",
      isMobileShow: false,
      isDekstopShow: true,
      action: toggleNotification,
    },
    {
      href: "https://about.bigshorts.co/",
      label: "About us",
      icon: MdInfoOutline,
      isMobileShow: false,
      isDekstopShow: true,
      external: true,
    },
    {
      href: "/home/settings",
      label: "Settings",
      icon: MdOutlineSettings,
      isMobileShow: false,
      isDekstopShow: true,
      action: toggleSettings,
    },
    {
      href: "/home/profile",
      label: "Me",
      icon: MdOutlinePersonOutline,
      className: "text-2xl",
      isMobileShow: true,
      isDekstopShow: true,
    },
  ];
  const NavItem = ({ item }: { item: NavItem }) => {
    const isExternal = "external" in item && item.external;
    if (isExternal && item.icon) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <span
            className={`relative flex items-center gap-3 ${isSideBarOpen ? "py-2 px-4" : "py-2 px-2 justify-center"
              } 
                        rounded-md hover:bg-secondary-bg-color/10 transition-all duration-200`}
          >
            <span className={`${isSideBarOpen ? "text-lg" : "text-xl"}`}>
              {<item.icon className={item?.className}/>}
            </span>
            {isSideBarOpen && item.label}
          </span>
        </a>
      );
    }

    if (item.label === "Me") {
      return (
        <Link href={item.href} className="w-full">
          <span
            className={`relative flex items-center gap-2 ${isSideBarOpen ? "py-2 px-4" : "p-1 justify-center"
              } 
                        rounded-md hover:bg-secondary-bg-color/10 transition-all duration-200`}
          >
            <span className={`${isSideBarOpen ? "text-lg" : "text-xl"}`}>
              <Avatar
                src={userData?.userProfileImage}
                width="w-10"
                height="h-10"
              />
            </span>
            {isSideBarOpen && (
              <div className="flex flex-col">
                <span className="text-xs truncate w-24">
                  @{username || 'User'}
                </span>
              </div>
            )}
          </span>
        </Link>
      );
    }


    const isActionItem = (item: NavItem): item is ActionNavItem => {
      return "action" in item;
    };

    if (isActionItem(item)) {
      return (
        <button type="button" className="w-full" onClick={item.action}>
          <span
            className={`relative flex items-center gap-3 ${isSideBarOpen ? "py-2 px-4" : "py-2 px-2 justify-center"
              } 
                        rounded-md hover:bg-secondary-bg-color/10 transition-all duration-200
                        ${pathname === item.href
                ? "linearBtn "
                : ""
              }`}
          >
            <span
              className={`${isSideBarOpen ? "text-lg" : "text-xl"}`}
            >
              {<item.icon className={item?.className}/>}
            </span>
            {isSideBarOpen && item.label}
          </span>
        </button>
      );
    }

    return (
      <Link href={item.href} onClick={item.label === "Snips" ? clearSnipsData : undefined}>
        <span
          className={`relative flex items-center gap-3 ${isSideBarOpen ? "py-2 px-4" : "py-2 px-2 justify-center"
            }
                    rounded-md hover:bg-secondary-bg-color/10 transition-all duration-200
                    ${pathname === item.href ? "linearBtn" : ""
            }`}
        >
          {item.messageCount && messageCount?.length! > 0 && (
            <span
              className="absolute top-[5px] left-[10px] text-xs text-text-color bg-red-500 w-4 h-4 
                            flex justify-center items-center rounded-full"
            >
              {messageCount}
            </span>
          )}
          <span
            className={isSideBarOpen ? "text-lg" : "text-xl"}
          >
            {item.icon && <item.icon className={item?.className}/>}
          </span>
          {isSideBarOpen && item.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      <aside
        className={`md:block hidden transition-all duration-300 bg-primary-bg-color text-text-color 
                fixed h-[100vh] z-30 ${isSideBarOpen ? "w-56" : "w-16"} sidebar
                border-r border-gray-800/20`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="px-4 flex items-center gap-1 py-3 mb-2">
          <span className="block p-1">
            <img
              src={logo.src}
              alt="logo"
              className="logo"
              onContextMenu={(e) => e.preventDefault()}
            />
          </span>
          {isSideBarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-lg text-text-color font-bold">
                BigShorts
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col h-[calc(100vh-5rem)] justify-between pb-4">
          <nav className="px-2">
            <ul className="flex flex-col gap-1">
              {mainNavItems.map((item) => (
                <li key={item.href} className="w-full">
                  <NavItem item={item} />
                </li>
              ))}
            </ul>
          </nav>

          <nav className="px-2 mt-auto border-t border-gray-800/20 pt-4">
            <ul className="flex flex-col gap-1">
              {bottomNavItems.map((item) => {
                if (item.isDekstopShow === false) return null;
                return (
                  <li key={item.href} className="w-full">
                    <NavItem item={item} />
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      <nav
        className={`md:hidden flex items-center justify-between p-2 fixed z-50 bottom-0 w-full bg-bg-color
                border-t border-gray-800/20 ${isChatOpen ? "hidden" : ""}`}
      >
        {[...mainNavItems, ...bottomNavItems].map((item) => {
          if (!item.isMobileShow) return null;

          const isActionItem = (item: NavItem): item is ActionNavItem => {
            return "action" in item;
          };

          if (isActionItem(item)) {
            return (
              <button key={item.label} onClick={item.action}>
                <span
                  className={`relative flex flex-col p-1 items-center text-text-color gap-1 rounded-md 
                                ${pathname === item.href ? "linearText" : ""}`}
                >
                  <span
                    className={`text-xl ${pathname === item.href
                      ? "text-text-color"
                      : "text-text-color"
                      }`}
                  >
                    {<item.icon className={item?.className}/>}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </span>
              </button>
            );
          }

          return (
            <Link key={item.href} href={item.href} onClick={item.label === "Snips" ? clearSnipsData : undefined}>
              <span
                className={`relative flex flex-col p-1 items-center text-text-color gap-1 rounded-md 
                                ${pathname === item.href ? "linearText" : ""}`}
              >
                <span className="text-xl">
                  {item.icon && <item.icon className={`${item.className} ${pathname === item.href ? "svg-gradient" : ""}`}/>}
                </span>
                <span className="text-sm">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};



export default SideBar;