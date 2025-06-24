interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export function DeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message
}: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-bg-color/50 flex items-center justify-center z-50">
            <div className="bg-bg-color rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold text-text-color mb-2">{title}</h3>
                <p className="text-primary-text-color mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-text-color hover:bg-secondary-bg-color rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-primary-text-color rounded-md transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}