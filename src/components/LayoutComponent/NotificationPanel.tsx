
import Notification from "@/components/Notification";
import { FollowRequestData, NotificationData } from "@/models/notficationResponse";

type NotificationPanelProps = {
    followRequestData: FollowRequestData[];
    notificationData: NotificationData[];
    toggleNotification: () => void;
    isNotificationOpen: boolean;
    isPrivateAccount: number;
    isFollowerLoading: boolean;
    isLoading: boolean;
};

const NotificationPanel = ({
    followRequestData,
    notificationData,
    toggleNotification,
    isNotificationOpen,
    isPrivateAccount,
    isFollowerLoading,
    isLoading
}: NotificationPanelProps) => {
    return (
        <Notification
            followRequestData={followRequestData}
            notificatioData={notificationData}
            toggleNotification={toggleNotification}
            isNotificationOpen={isNotificationOpen}
            isPrivateAccount={isPrivateAccount}
            isFollowerLoading={isFollowerLoading}
            isLoading={isLoading}
        />
    );
};

export default NotificationPanel;