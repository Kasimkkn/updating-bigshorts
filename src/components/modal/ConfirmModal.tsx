import CommonModalLayer from "./CommonModalLayer";
import Button from "../shared/Button";
import { ModerSpinner } from "../LoadingSpinner";

interface ConfirmModalProps {
    isDeleteAccount?: boolean;
    isOpen: boolean;
    message: string;
    isPerformingAction?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isDeleteAccount = false, isPerformingAction = false, isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <CommonModalLayer
            width="w-max"
            height="h-max"
            onClose={onCancel}
            isModal={false}
            hideCloseButtonOnMobile={true}
        >
            <div className="p-6 w-96 bg-primary-bg-color">
                <h3 className="text-lg font-semibold text-text-color">{message}</h3>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md text-primary-text-color"
                    >
                        {isDeleteAccount ? "Cancel" : "No"}
                    </button>
                    <Button
                        onCLick={onConfirm}
                        isLinearBtn={true}
                    >
                        {isPerformingAction ? (
                            <ModerSpinner />
                        )
                            : (
                                isDeleteAccount ? "Delete Account Permanently" : "Yes"
                            )}
                    </Button>

                </div>
            </div>
        </CommonModalLayer>
    );
};

export default ConfirmModal;
