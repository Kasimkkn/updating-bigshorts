import React from 'react';
import CommonModalLayer from '../modal/CommonModalLayer';
import Button from '../shared/Button';


interface FeedBackModalProps {
    setOpenFeedbackModal: React.Dispatch<React.SetStateAction<boolean>>;
    formData: {
        description: string;
        email: string;
        phone: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleFeedBackSend: () => void
}
const FeedBackModal = ({ setOpenFeedbackModal, formData, handleInputChange, handleFeedBackSend }: FeedBackModalProps) => {
    return (
        <CommonModalLayer
            width='w-max'
            height='h-max'
            onClose={() => setOpenFeedbackModal(false)}
            isModal={false}
            hideCloseButtonOnMobile={true}
        >
            <div id='feedbackModal' className="bg-primary-bg-color md:rounded-lg overflow-y-scroll h-[70vh] p-4">
                <div
                    className="overflow-y-scroll h-[70vh] flex flex-col gap-4"
                >
                    <h2 className='text-text-color text-xl font-bold'>Have Suggestions? We&apos;re all ears! Tell us how we can server you better</h2>
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-text-color"
                        >
                            Your Feedback *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Please write your concern here..."
                            maxLength={500}
                            className="mt-1 linearInput bg-primary-bg-color w-full px-4 py-3 border text-text-color rounded-md focus:outline-none"
                            required
                        />
                        <div className="text-right text-sm text-text-color my-1">
                            {formData.description.length}/500
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-text-color"
                        >
                            Email ID
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter Your Email ID"
                            className="mt-1 linearInput w-full bg-primary-bg-color px-4 py-3 border text-text-color rounded-md focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-text-color"
                        >
                            Phone No.
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter Your Phone No."
                            maxLength={10}
                            className="mt-1 linearInput w-full bg-primary-bg-color text-text-color px-4 py-3 border rounded-md focus:outline-none"
                        />
                    </div>
                    <Button
                        isLinearBtn={true}
                        onClick={handleFeedBackSend}
                    >
                        Submit
                    </Button>

                </div>
            </div>
        </CommonModalLayer>
    )
}

export default FeedBackModal