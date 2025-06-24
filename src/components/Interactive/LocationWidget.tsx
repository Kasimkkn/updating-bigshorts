import { LocationInteractiveResponse } from '@/models/locationInteractiveResponse';
import React from 'react'
import { canvasHeight, canvasWidth } from './../../constants/interactivityConstants';
import { AppConfig } from '@/config/appConfig';
import { FaLocationDot } from 'react-icons/fa6';

interface LocationWidgetProps {
    i: number;
    playPauseController: React.Dispatch<React.SetStateAction<boolean>>;
    location: LocationInteractiveResponse;
    parentHeight?: number;
    parentWidth?: number;
}
const LocationWidget = ({
    i, 
    playPauseController, 
    location,
    parentHeight= canvasHeight,
    parentWidth= canvasWidth,
}:LocationWidgetProps) => {
    const appConfig = new AppConfig();

    const top = location.top ? location.top : 0;
    const left = location.left ? location.left + 30 : 30; // Adding 30px to left

    // Calculate the top and left positions based on parent size
    const calculatedTop = appConfig.deviceHeight(top, parentHeight);
    const calculatedLeft = appConfig.deviceWidth(left, parentWidth);

    // Calculate the link dimensions
    const linkWidth = appConfig.deviceWidth(location.width || 0, parentWidth);
    const linkHeight = appConfig.deviceHeight(location.height || 0, parentHeight);

    // Adjust the position to ensure the link does not overflow the parent
    const { top: finalTop, left: finalLeft } = appConfig.checkPosition(
        calculatedTop,
        calculatedLeft,
        linkWidth,
        linkHeight,
        parentWidth,
        parentHeight
    );

    const handleLocationClick = async () => {
};

    function convertStringToColor(color: string | null | undefined): string {
        if (!color || color.trim() === "") {
          return "transparent";
        }
      
        // Remove 0x or # prefix
        const cleaned = color.replace(/^0x|#/i, "");
      
        // Should be 8 characters: AARRGGBB
        if (cleaned.length !== 8) {
          console.warn("Invalid color format:", color);
          return "transparent";
        }
      
        //App uses #AARRGGBB format, nedd to check what we use when posting from web
        const aa = cleaned.slice(0, 2);
        const rr = cleaned.slice(2, 4);
        const gg = cleaned.slice(4, 6);
        const bb = cleaned.slice(6, 8);
      
        const alpha = parseInt(aa, 16) / 255;
      
        return `rgba(${parseInt(rr, 16)}, ${parseInt(gg, 16)}, ${parseInt(bb, 16)}, ${alpha.toFixed(2)})`;
    }

    const renderlinkContent = (location: LocationInteractiveResponse) => {
        return (
            <div
                style={{
                    position: 'relative',
                    width: 'max-content',
                    height: `${linkHeight}px`,
                    borderRadius: `${8}px`,
                    background: `linear-gradient(to bottom right, 
                        ${convertStringToColor(location.color_for_txt_bg.background_color)}, 
                        ${convertStringToColor(location.color_for_txt_bg.background_color)} 70%, 
                        rgba(255,255,255,0.7))`,
                    boxShadow: `0px ${4}px ${4}px rgba(0, 0, 0, 0.5)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    padding: '5px',
                    overflow: 'hidden',
                    zIndex: 1,
                }}
            >
                <FaLocationDot style={{color:convertStringToColor(location.color_for_txt_bg.text_color) || "#000000", zIndex: 2}}/>
                <span
                    style={{
                        color: convertStringToColor(location.color_for_txt_bg.text_color) || "#000000",
                        fontFamily: location.text_family || 'Arial',
                        zIndex: 2
                    }}
                >
                    {location.label}
                </span>
            </div>
        );
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: `${finalTop}px`,
                left: `${finalLeft}px`,
                cursor: 'pointer',
                zIndex: 10,
                pointerEvents: 'auto',
                transform: 'translate(-50%, -50%)',
            }}
            onClick={() => {
                handleLocationClick();
            }}
        >
            {renderlinkContent(location)}
        </div>
    )
}

export default LocationWidget