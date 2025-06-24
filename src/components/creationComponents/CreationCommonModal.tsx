import { ReactNode } from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import CommonModalLayer from "../modal/CommonModalLayer";

interface CreationCommonModalProps {
    onClose: () => void;
    title: string;
    step: number;
    fileUploadLoading: boolean;
    finalSubmitLoading: boolean;
    handlePreviousStep: () => void;
    handleNextStep: () => void;
    renderStepContent: (step: number) => ReactNode;
    renderActionButtons: (step: number) => ReactNode;
    width?: string;
    height?: string;
    isFileSelectionSkipped?: boolean;
}

const CreationCommonModal: React.FC<CreationCommonModalProps> = ({
    onClose,
    title,
    step,
    fileUploadLoading,
    finalSubmitLoading,
    handlePreviousStep,
    renderStepContent,
    renderActionButtons,
    width = "max-w-4xl",
    height = "h-[90vh]",
    isFileSelectionSkipped = false,
}) => {
    return (
        <CommonModalLayer onClose={onClose} width={width} height={height}>
            <div className="flex flex-col w-full h-full shadow-md shadow-shadow-color">
                {/* Header section */}
                <div className="flex gap-1 justify-between items-center p-3">
                    {step > (isFileSelectionSkipped ? 2 : 1) && !fileUploadLoading && !finalSubmitLoading && (
                        <button onClick={handlePreviousStep} className="text-text-color">
                            Back
                        </button>
                    )}
                    <h2 className="text-text-color">{title}</h2>
                    {!fileUploadLoading && !finalSubmitLoading && renderActionButtons(step)}
                </div>

                {/* Content section */}
                {fileUploadLoading || (finalSubmitLoading && step > 1) ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <LoadingSpinner />
                        <p className="mt-4 text-lg font-semibold text-text-color">Content is being uploaded...</p>
                    </div>
                ) : (
                    <div className="flex w-full justify-center items-center h-full px-4">
                        {renderStepContent(step)}
                    </div>
                )}
            </div>
        </CommonModalLayer>
    );
};

export default CreationCommonModal;
