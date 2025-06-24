export interface ToggleSettingProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    isChecked: boolean;
    onToggle: () => void;
}

export interface NavigationSettingProps {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
    className?: string;
}

export type SettingToggleType = 'private' | 'notification' | 'tagging' | 'contactEmail' | 'contactPhone' | 'deleteAccount';

