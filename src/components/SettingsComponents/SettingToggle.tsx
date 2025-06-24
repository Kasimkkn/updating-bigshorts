import { ToggleSettingProps } from "./settingPageTypes";

const SettingToggle: React.FC<ToggleSettingProps> = ({
    icon,
    title,
    description,
    isChecked,
    onToggle
}) => {
    return (
        <div className="flex gap-4 items-center w-full">
            <div className="text-xl text-text-color">{icon}</div>
            <div className="flex flex-col flex-grow">
                <p className="text-lg max-md:text-base text-text-color">{title}</p>
                {description && (
                    <span className="text-sm max-md:text-xs text-text-color">
                        {description}
                    </span>
                )}
            </div>
            <label className="inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={onToggle}
                    checked={isChecked}
                />
                <div className="relative w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-border-color after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-primary-bg-color bg-secondary-bg-color-3 after:border-border-color after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-bg-color
                bg-secondary-bg-color
                "></div>
            </label>
        </div>
    );
};

export default SettingToggle;