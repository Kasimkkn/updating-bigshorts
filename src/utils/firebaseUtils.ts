import { getToken } from 'firebase/messaging';
import { v4 as uuidv4 } from 'uuid';

const vapidKey = 'YOUR_PUBLIC_VAPID_KEY';

// export const getFcmToken = async (): Promise<string | undefined> => {
//     if (!messaging) {
//         console.warn("Firebase Messaging is not initialized or supported in this environment.");
//         return;
//     }
//     try {
//         const currentToken = await getToken(messaging, { vapidKey });
//         if (currentToken) {
//             return currentToken;
//         } else {
//         }
//     } catch (error) {
//         console.error('An error occurred while retrieving token. ', error);
//     }
// };

export const getDeviceId = (): string => {
    if (typeof window !== 'undefined') {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }
    return 'web';
};
