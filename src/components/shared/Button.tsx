import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isLinearBtn?: boolean;
    isLinearBorder?: boolean;
    onCLick?: () => void;
    className?: string;
    isPadding?: boolean
}
const Button = ({ isPadding = true, children, onCLick, isLinearBtn, isLinearBorder, className, ...props }: ButtonProps) => {
    return (
        <button onClick={onCLick} {...props}
            className={`${isLinearBtn ? 'linearBtn' : ''} ${isLinearBorder && 'linearBorder'} outline-none focus:outline-none text-text-color ${isPadding && 'px-4 py-2'} rounded-md flex justify-center items-center gap-2 text-sm
            ${className}
            `}
        >
            {children}
        </button>
    )
}

export default Button