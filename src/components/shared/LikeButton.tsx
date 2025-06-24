import React from "react";
import { MdStar, MdStarOutline } from "react-icons/md";

interface LikeButtonProps {
    isLiked: number;
    isSuperLiked?: boolean;
    onClick: () => void;
    size: string;
    className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
    isLiked,
    isSuperLiked = false,
    onClick,
    size = 25,
    className = "",
}) => {
    return(
        <button className={`flex items-center justify-center ${className}`} onClick={onClick}>
            {isLiked || isSuperLiked ?
                <MdStar
                    className={`text-text-color text-yellow-500 mb-[2px] animate-bounce-star ${size}`}
                />
                :
                <MdStarOutline
                    className={`text-text-color hover:text-yellow-500 mb-[2px] ${size}`}
                />
            }
        </button>
    )
};

export default LikeButton;