import { useState, useEffect } from 'react';

interface MobileDetection {
    isMobile: boolean;
    isAndroid: boolean;
    isIOS: boolean;
    deviceType: 'android' | 'ios' | 'desktop';
}

export const useMobileDetection = (): MobileDetection => {
    const [detection, setDetection] = useState<MobileDetection>({
        isMobile: false,
        isAndroid: false,
        isIOS: false,
        deviceType: 'desktop'
    });

    useEffect(() => {
        const checkDevice = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            const isAndroidDevice = /android/i.test(userAgent);
            const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent);

            // Additional check for screen size
            const isMobileScreen = window.innerWidth <= 768;
            const isMobile = isMobileDevice || isMobileScreen;

            let deviceType: 'android' | 'ios' | 'desktop' = 'desktop';
            if (isAndroidDevice) deviceType = 'android';
            else if (isIOSDevice) deviceType = 'ios';

            setDetection({
                isMobile,
                isAndroid: isAndroidDevice,
                isIOS: isIOSDevice,
                deviceType
            });
        };

        // Check on mount
        checkDevice();

        // Listen for resize events
        const handleResize = () => {
            checkDevice();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return detection;
};