import { FaChevronRight } from "react-icons/fa";
import { NavigationSettingProps } from "./settingPageTypes";

const NavigationSetting: React.FC<NavigationSettingProps> = ({
    icon,
    title,
    onClick,
    className
}) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-between gap-2 w-full ${className || ''}`}
        >
            <div className="flex items-center gap-3">
                <div className="text-xl text-text-color">{icon}</div>
                <div className="flex flex-col">
                    <p className="text-lg max-md:text-base text-text-color">{title}</p>
                </div>
            </div>
            <FaChevronRight className="text-xl text-text-color" />
        </button>
    );
};

export default NavigationSetting;