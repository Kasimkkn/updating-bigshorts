import React from "react";
import CommonModalLayer from "./CommonModalLayer";
import { IoClose } from "react-icons/io5";

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title, }) => {
    return (
        <CommonModalLayer isModal={false} hideCloseButtonOnMobile={true} width="max-w-lg w-full" height="h-max" onClose={onClose}>

            <div className="bg-bg-color md:rounded-lg text-text-color max-w-lg w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 -right-4 z-50 p-2 rounded-full bg-secondary-bg-color focus:outline-none hover:rotate-90 transition-all cursor-pointer"
                >
                    <IoClose className='text-xl text-text-color' />
                </button>
                <div className="flex justify-between items-center border-b border-b-border-color pb-2">
                    <h2 className="text-xl  font-semibold">{title}</h2>
                </div>
                <div className="mt-2">{children}</div>
            </div>
        </CommonModalLayer>
    );
};

export default Modal;
