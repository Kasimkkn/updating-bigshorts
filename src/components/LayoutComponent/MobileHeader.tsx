"use client";
import logo from "@/assets/mainLogo.svg";
import { ProfileData } from "@/types/usersTypes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineMenu } from "react-icons/hi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineAccountBalanceWallet, MdOutlineChat, MdSearch } from "react-icons/md";

type MobileHeaderProps = {
    userData: ProfileData | null;
    toggleSettings: () => void;
    toggleNotification: () => void;
    toggleSearch: () => void;
    toggleAccountOverview?: () => void;
};

const MobileHeader = ({ userData, toggleSettings, toggleNotification, toggleSearch, toggleAccountOverview }: MobileHeaderProps) => {
    const pathName = usePathname();
    return (
        <div className="fixed md:hidden z-30 top-0 right-0 h-16 flex justify-between items-center px-4 
                    bg-primary-bg-color/30 backdrop-blur-lg  
                    md:border max-md:border-b border-border-color max-md:w-full max-md:px-6">
            <div className="flex items-center gap-2 md:hidden">
            <img 
                src={logo.src}
                alt="logo"
                className="h-5 w-5 object-contain"
                onContextMenu={(e) => e.preventDefault()}
            />
                <span className="text-lg text-text-color font-bold">BigShorts</span>
            </div>
            <div className="flex items-center gap-4 relative">
                <button onClick={toggleSearch}>
                    <MdSearch className="w-7 h-7 text-text-color" />
                </button>
                {pathName === '/home/profile' ? 
                (<button onClick={toggleAccountOverview}>
                    <MdOutlineAccountBalanceWallet className="w-7 h-7 text-text-color" />
                </button>) :
                (<button onClick={toggleNotification}>
                    <IoMdNotificationsOutline className="w-7 h-7 text-text-color" />
                </button>
                )}
                {pathName === `/home/profile` ? (
                    <button onClick={toggleSettings}>
                        <HiOutlineMenu className="w-7 h-7 text-text-color" />
                    </button>
                ) : (
                    <Link href={`/home/message`}>
                        <MdOutlineChat className="w-6 h-6 text-text-color ransform scale-x-[-1]" />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default MobileHeader;



