import { texts } from '@/data/texts';
import Image from 'next/image';
import SafeImage from './SafeImage';

interface InteractvieTextTypesModalProps {
    addText: (style: any) => void;
}

const InteractvieTextTypesModal = ({ addText }: InteractvieTextTypesModalProps) => {
    return (
        <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md border-none bg-slate-800 bg-opacity-70 p-4 z-50'>
            <div className='grid grid-cols-2 gap-6'>
                {texts.text_containers.map((txt, index) => (
                    <div key={index} className='flex justify-center items-center'>
                        <SafeImage
                            src={txt.image as string}
                            alt={`Image ${index}`}
                            width={50}
                            height={50}
                            className='w-20 h-20'
                            onClick={() => addText(txt)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InteractvieTextTypesModal;
