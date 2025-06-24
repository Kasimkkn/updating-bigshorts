"use client";
import { useEffect, useRef, useState } from "react";
import { FiLoader } from "react-icons/fi";
import SafeImage from '../shared/SafeImage';

interface AvatarProps {
    src?: string;
    width?: string;
    height?: string;
    isMoreBorder?: boolean;
    name?: string;
}

const Avatar = ({ src, width = "w-10", height = "h-10", isMoreBorder }: AvatarProps) => {
    const loadedImagesRef = useRef<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(() => {
        return src ? !loadedImagesRef.current[src] : false;
    });
    useEffect(() => {
        if (!src) return;
        if (loadedImagesRef.current[src]) {
            setIsLoading(false);
        }
    }, [src]);

    const handleImageLoad = () => {
        if (src) loadedImagesRef.current[src] = true;
        setIsLoading(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
    };

    const imageProps = {
        alt: "avatar",
        width: 100,
        height: 100,
        onLoad: handleImageLoad,
        onError: handleImageError,
        className: `rounded-md object-cover ${width} ${height} ${isMoreBorder ? "linearBorder" : "border border-border-color"} ${isLoading ? "invisible" : "visible"}`,
    };

    return (
        <div className={`relative ${width} ${height} flex-shrink-0`}>
            {isLoading && (
                <div className="w-full h-full flex items-center justify-center rounded-md absolute z-10 bg-primary-bg-color/20 backdrop-blur-sm">
                    <div className="animate-spin">
                        <FiLoader size={25} className="text-purple-500" />
                    </div>
                </div>
            )}

            <SafeImage
                src={src}
                {...imageProps}
                type="dummyUser"
            />
        </div>
    );
};

export default Avatar;
