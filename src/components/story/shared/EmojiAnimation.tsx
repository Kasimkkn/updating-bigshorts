import React, { useEffect, useState } from 'react';

interface EmojiAnimationProps {
    emoji: string;
}

const EmojiAnimation: React.FC<EmojiAnimationProps> = ({ emoji }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="relative flex gap-10">
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className={`absolute text-5xl animate-float-from-bottom opacity-0 animation-fade-out`}
                        style={{
                            animationDuration: '2s',
                            animationFillMode: 'forwards',
                            top: `${index % 2 === 0 ? index * 30 : -index * 30}px`, // Alternate vertical positions
                            left: `${index * 60 - 90}px`, // Increased horizontal spacing
                            transform: `rotate(${index * 15}deg)`, // Slight rotation for variation
                        }}
                    >
                        {emoji}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmojiAnimation;
