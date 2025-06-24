import buttons from '@/data/buttons.json';
import { convertStringToColor } from '@/utils/features';

interface InteractiveButtonTypesModalProps {
    addButton: (style: any) => void;
}

const InteractiveButtonTypesModal = ({ addButton }: InteractiveButtonTypesModalProps) => {
    return (
        <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md border-none bg-slate-800 bg-opacity-70 p-4 z-50'>
            <div className='grid grid-cols-2 gap-6'>
                {buttons.buttons.map((btn, index) => (
                    <div key={index} className='flex justify-center items-center'>
                        <button
                            className="styledBtn"
                            style={{
                                borderRadius: btn.radius || '4px',
                                borderColor: btn.border_color || 'none',
                                fontFamily: btn.text_family || 'Arial',
                                backgroundColor: convertStringToColor(btn.color_for_txt_bg?.background_color || '') || 'transparent',
                                color: convertStringToColor(btn.color_for_txt_bg?.text_color) || 'black',
                                width: btn.width || 'auto',
                                height: btn.height || 'auto',
                                padding: "5px",
                                boxShadow: btn.background_shadow || 'none',
                                textShadow: btn.text_shadow || 'none',
                                display: 'block', // Ensure buttons are displayed as block elements
                            }}
                            onClick={() => addButton(btn)}
                        >
                            Button
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default InteractiveButtonTypesModal;
