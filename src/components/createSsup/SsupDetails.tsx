import React from 'react'
interface SsupDetailsProps {
    selectedDuration: string | undefined;
    handleDurationChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const SsupDetails = ({ selectedDuration, handleDurationChange }: SsupDetailsProps) => {
    return (
        <div className="h-full flex flex-col gap-4 max-md:text-xl bg-secondary-bg-color p-3 col-span-4">
            <div className="flex flex-col gap-2">
                <h3 className="text-text-color  font-semibold">Who can see this?</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="radio"
                        id="everyone"
                        name="access"
                        value="Everyone"
                        className="cursor-pointer"
                        checked
                    />
                    <label htmlFor="everyone" className=" text-text-color cursor-pointer">
                        Everyone
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="radio"
                        id="myFollowers"
                        name="access"
                        value="My Followers"
                        className="cursor-pointer"
                    />
                    <label htmlFor="myFollowers" className="text-text-color cursor-pointer">
                        My Followers
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-text-color  font-semibold">Ssup Duration (Hours)</h3>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="sixHours"
                            name="duration"
                            value="6"
                            checked={selectedDuration === '6'}
                            onChange={handleDurationChange}
                            className="cursor-pointer"
                        />
                        <label htmlFor="sixHours" className=" text-text-color cursor-pointer">
                            6
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="twelveHours"
                            name="duration"
                            value="12"
                            checked={selectedDuration === '12'}
                            onChange={handleDurationChange}
                            className="cursor-pointer"
                        />
                        <label htmlFor="twelveHours" className=" text-text-color cursor-pointer">
                            12
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="twentyFourHours"
                            name="duration"
                            value="24"
                            checked={selectedDuration === '24'}
                            onChange={handleDurationChange}
                            className="cursor-pointer"
                        />
                        <label htmlFor="twentyFourHours" className="text-text-color cursor-pointer">
                            24
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="fortyEightHours"
                            name="duration"
                            value="48"
                            checked={selectedDuration === '48'}
                            onChange={handleDurationChange}
                            className="cursor-pointer"

                        />
                        <label htmlFor="fortyEightHours" className=" text-text-color cursor-pointer">
                            48
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SsupDetails