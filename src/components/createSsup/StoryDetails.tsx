import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Button from '../shared/Button';

interface StoryDetailsProps {
    handleClose: () => void;
    onShare: () => void;
    setSelectedDuration: React.Dispatch<React.SetStateAction<string>>;
    selectedDuration: string
}

const StoryDetails = ({ handleClose, onShare, setSelectedDuration, selectedDuration }: StoryDetailsProps) => {

    const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDuration(event.target.value);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-color bg-opacity-50">
            <div className="flex flex-col gap-6 mt-3 bg-bg-color  p-3 rounded-lg w-1/3">
                <div className="flex justify-between">
                    <h2 className="text-lg font-bold text-text-color">Share</h2>
                    <button onClick={handleClose} className="text-text-color hover:rotate-90">
                        <AiOutlineClose className="text-2xl" />
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="myFollowers" className="text-text-color">
                        My followers
                    </label>
                    <input type="radio" id="myFollowers" name="myFollowers" />
                </div>
                <div className="flex flex-col gap-3">
                    <h3 className="text-text-color">Ssup Duration (Hours)</h3>
                    <div className="flex justify-between">
                        <div className="flex items-center justify-between gap-2">
                            <label htmlFor="sixHours" className="text-text-color">6</label>
                            <input
                                type="radio"
                                id="sixHours"
                                name="duration"
                                value="6"
                                checked={selectedDuration === '6'}
                                onChange={handleDurationChange}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <label htmlFor="twelveHours" className="text-text-color">12</label>
                            <input
                                type="radio"
                                id="twelveHours"
                                name="duration"
                                value="12"
                                checked={selectedDuration === '12'}
                                onChange={handleDurationChange}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <label htmlFor="twentyFourHours" className="text-text-color">24</label>
                            <input
                                type="radio"
                                id="twentyFourHours"
                                name="duration"
                                value="24"
                                checked={selectedDuration === '24'}
                                onChange={handleDurationChange}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <label htmlFor="fortyEightHours" className="text-text-color">48</label>
                            <input
                                type="radio"
                                id="fortyEightHours"
                                name="duration"
                                value="48"
                                checked={selectedDuration === '48'}
                                onChange={handleDurationChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4">

                    <Button
                        onCLick={onShare}
                        disabled={!selectedDuration}
                        isLinearBtn={true}
                    >
                        Share
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StoryDetails;
