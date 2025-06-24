import { fontFamily } from '@/data/fonFamily'
import React from 'react'

interface FontFamilyModalProps {
    setFontFamily: React.Dispatch<React.SetStateAction<string>>;
    setopenFontFamily: React.Dispatch<React.SetStateAction<boolean>>
}

const FontFamilyModal: React.FC<FontFamilyModalProps> = ({ setFontFamily, setopenFontFamily }) => {
    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md bg-bg-color bg-primary-bg-color p-4 z-50">
            <div className="grid grid-cols-3 gap-4">
                {fontFamily.map((font, index) => (
                    <button
                        key={index}
                        className="w-[150px] h-[45px] border text-text-color text-text-color border-border-color rounded-md"
                        style={{ fontFamily: font }}
                        onClick={() => {
                            setFontFamily(font)
                            setopenFontFamily(false)
                        }}
                    >
                        {font}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default FontFamilyModal
