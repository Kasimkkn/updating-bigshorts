
import SettingModal from "@/components/modal/SettingModal";

type SettingsPanelProps = {
    onClose: () => void;
};

const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
    return <SettingModal onClose={onClose} />;
};

export default SettingsPanel;