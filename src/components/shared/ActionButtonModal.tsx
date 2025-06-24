import React, { useEffect, useState } from 'react';
import TrimmerModal from '../modal/TrimmerModal';
import Button from './Button';
import SelectSnipModal from './SelectSnipModal';
import SelectMiniModal from './SelectMiniModal';

interface ActionButtonModalProps {
    onClose: () => void;
    onSave: (data: { videoPath: string | null, videoFile: File | null, linkUrl: string | null, startTime?: number | null, endTime?: number | null, existingSnip?: boolean, existingMini?: boolean, selectedSnipId?: string,selectedMiniId?: string}) => void;
    handleNext?: () => void;
    maxDuration?: number;
    playerRef?: React.RefObject<HTMLVideoElement>;
    setStartTime: (time: number) => void;
    setEndTime: (time: number) => void;
    setVideoDuration: (time: number) => void;
    videoIndex?: number;
    setVideoKey?: React.Dispatch<React.SetStateAction<number>>
}

const ActionButtonModal: React.FC<ActionButtonModalProps> = ({ onClose, onSave, handleNext, maxDuration, playerRef, setEndTime, setStartTime, setVideoDuration, videoIndex, setVideoKey }) => {
    const [selectedAction, setSelectedAction] = useState<string>('Do Nothing');
    const [videoPath, setVideoPath] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [linkUrl, setLinkUrl] = useState<string | null>(null);
    const [openTrimmerModal, setOpenTrimmerModal] = useState(false);
    const [openSelectSnipModal, setOpenSelectSnipModal] = useState(false);
    const [openSelectMiniModal, setOpenSelectMiniModal] = useState(false);
    const [existingSnip, setExistingSnip] = useState(false);
    const [existingMini, setExistingMini] = useState(false);
    const [selectedSnipId, setSelectedSnipId] = useState<string | null>(null);
    const [selectedMiniId, setSelectedMiniId] = useState<string | null>(null);

    const handleActionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAction(event.target.value);
        setVideoPath(null);
        setLinkUrl(null);
        setExistingSnip(event.target.value === 'Attach Existing Snip');
        setExistingMini(event.target.value === 'Attach Existing Mini');
    };

    const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setVideoFile(event.target.files[0]);
            setVideoPath(URL.createObjectURL(event.target.files[0]));
        }
    };

    const handleLinkUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLinkUrl(event.target.value);
    };

    useEffect(() => {
        if (videoPath)
            setOpenTrimmerModal(true);
    }, [videoPath]);

    const saveAction = (data: { start?: number, end?: number }) => {
        if (selectedAction === 'Attach Existing Snip') {
            setOpenSelectSnipModal(true);
        } else if (selectedAction === 'Attach Existing Mini') {
            setOpenSelectMiniModal(true);
        } else {
            onSave({
                videoPath,
                videoFile,
                linkUrl,
                startTime: data?.start,
                endTime: data?.end,
                existingSnip: existingSnip,
                existingMini: existingMini
            });
        }
    };

    const handleSnipSelect = (snipId: string) => {
        setSelectedSnipId(snipId);
        setOpenSelectSnipModal(false);
        
        onSave({
            videoPath: null,
            videoFile: null,
            linkUrl: null,
            existingSnip: true,
            existingMini: false,
            selectedSnipId: snipId
        });
    };

    const handleMiniSelect = (miniId: string) => {
        setSelectedMiniId(miniId);
        setOpenSelectMiniModal(false);
        
        onSave({
          videoPath: null,
          videoFile: null,
          linkUrl: null,
          existingSnip: false,
          existingMini: true,
          selectedMiniId: miniId
        });
      };

    const toggleOpenTrimmerModal = () => {
        setOpenTrimmerModal(!openTrimmerModal);
    };
    
    const closeTheModal = () => {
        onClose();
    };
    
    return (
        <>
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md border-none bg-primary-bg-color bg-opacity-80 p-4 z-50'>
                <div className="w-full max-w-md mx-auto">
                    <h2 className="text-lg font-semibold mb-4 text-text-color">Select Action</h2>

                    <div className="mb-4 text-text-color flex items-center gap-2">
                        <input
                            type="radio"
                            value="Add Video"
                            checked={selectedAction === 'Add Video'}
                            onChange={handleActionChange}
                            className='text-text-color mr-3'
                        /> Add Video
                        {selectedAction === 'Add Video' && (
                            <input type="file" accept="video/*" onChange={handleVideoChange}
                                className="mt-1 block w-full px-3 py-2 border border-border-color rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        )}
                    </div>

                    <div className="mb-4 text-text-color flex items-center gap-2">
                        <input
                            type="radio"
                            value="Attach Existing Snip"
                            checked={selectedAction === 'Attach Existing Snip'}
                            onChange={handleActionChange}
                            className='text-text-color mr-3'
                        /> Attach Existing Snip
                    </div>

                    <div className="mb-4 text-text-color flex items-center gap-2">
                        <input
                            type="radio"
                            value="Attach Existing Mini"
                            checked={selectedAction === 'Attach Existing Mini'}
                            onChange={handleActionChange}
                            className='text-text-color mr-3'
                        /> Attach Existing Mini
                    </div>

                    {/* <div className="mb-4 text-text-color flex items-center gap-2">
                        <input
                            type="radio"
                            value="Open URL"
                            checked={selectedAction === 'Open URL'}
                            onChange={handleActionChange}
                            className=' text-text-color mr-3'
                        /> Open URL
                        {selectedAction === 'Open URL' && (
                            <input type="text" placeholder="Enter URL" onChange={handleLinkUrlChange}
                                className="mt-1 block w-full px-3 py-2 border border-border-color rounded-md  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        )}
                    </div> */}

                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={closeTheModal}
                            className="px-4 py-2 text-text-color rounded-md"
                        >
                            Close
                        </button>
                        <Button
                            isLinearBtn={true}
                            onClick={() => saveAction({})}
                        >
                            Save changes
                        </Button>
                    </div>
                </div>
            </div>

            {openTrimmerModal && (
                <TrimmerModal
                    videoSrc={videoPath as string}
                    closeModal={toggleOpenTrimmerModal}
                    modalTitle='Trim Video'
                    saveModal={saveAction}
                    handleNext={handleNext}
                    maxDuration={maxDuration}
                    playerRef={playerRef}
                    setEndTime={setEndTime}
                    setStartTime={setStartTime}
                    setVideoDuration={setVideoDuration}
                    setVideoKey={setVideoKey}
                    videoIndex={videoIndex}
                />
            )}

            {openSelectSnipModal && (
                <SelectSnipModal
                    onClose={() => setOpenSelectSnipModal(false)}
                    onSelect={handleSnipSelect}
                />
            )}

            {openSelectMiniModal && (
                <SelectMiniModal
                    onClose={() => setOpenSelectMiniModal(false)}
                    onSelect={handleMiniSelect}
                />
            )}
        </>
    );
};

export default ActionButtonModal;