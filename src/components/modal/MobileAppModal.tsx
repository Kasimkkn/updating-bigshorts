import CommonModalLayer from '@/components/modal/CommonModalLayer';
import React from 'react';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { MdSmartphone } from 'react-icons/md';
import Button from '../shared/Button';

interface MobileAppModalProps {
    onClose: () => void;
    deviceType: 'android' | 'ios' | 'desktop';
    contentType: string; // 'Mini', 'Snip', or 'Shot'
}

const MobileAppModal: React.FC<MobileAppModalProps> = ({
    onClose,
    deviceType,
    contentType
}) => {
    const handleAppDownload = () => {
        if (deviceType === 'android') {
            // Replace with your actual Play Store URL
            window.open('https://play.google.com/store/apps/details?id=your.app.package', '_blank');
        } else if (deviceType === 'ios') {
            // Replace with your actual App Store URL
            window.open('https://apps.apple.com/app/your-app-name/idYOUR_APP_ID', '_blank');
        }
    };

    const getAppStoreName = () => {
        switch (deviceType) {
            case 'android':
                return 'Google Play Store';
            case 'ios':
                return 'App Store';
            default:
                return 'App Store';
        }
    };

    const getAppStoreIcon = () => {
        switch (deviceType) {
            case 'android':
                return <FaGooglePlay className="w-6 h-6" />;
            case 'ios':
                return <FaApple className="w-6 h-6" />;
            default:
                return <MdSmartphone className="w-6 h-6" />;
        }
    };

    return (
        <CommonModalLayer onClose={onClose} isModal={false} height="h-max"
            hideCloseButtonOnMobile={true}
        >
            <div className="w-full bg-bg-color rounded-t-2xl shadow-2xl max-w-md mx-auto backdrop-blur-xl border border-border-color">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            <MdSmartphone className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-text-color mb-2">
                        Mobile App Required
                    </h2>
                    <p className="text-primary-text-color text-sm">
                        Create amazing {contentType} content with our mobile app
                    </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3">
                    <Button
                        isLinearBtn={true}
                        className='w-full text-white'
                        onClick={handleAppDownload}
                    >
                        {getAppStoreIcon()}
                        <span>Download from {getAppStoreName()}</span>
                    </Button>

                    <Button
                        onClick={onClose}
                        className="w-full bg-transparent border border-border-color text-primary-text-color hover:bg-primary-bg-color"
                    >
                        Maybe Later
                    </Button>
                </div>
            </div>
        </CommonModalLayer>
    );
};

export default MobileAppModal;