import { useEffect, useRef, useState } from "react";
import { MdError, MdPerson } from "react-icons/md";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    videoUrl?: string;
    type?: "dummyUser" | "errorWidget"
}

const SafeImage = ({ src, alt, videoUrl, type="errorWidget", ...props }: SafeImageProps) => {
    const [showError, setShowError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const initialSrc = src && src.endsWith(".webp") ? src : `${src}.webp`;

    // Reset error state when src or videoUrl changes
    useEffect(() => {
        setShowError(false);
        if (imgRef.current) {
            imgRef.current.dataset.fallbackStep = "0";
        }
    }, [src, videoUrl]);

    const errorHandler = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const img = e.currentTarget;
        const step = Number(img.dataset.fallbackStep || "0");
        if (step === 0) {
            img.src = (src as string).replace(/\.webp$/, "");
            img.dataset.fallbackStep = "1";
        } else if (step === 1 && videoUrl) {
            img.src = videoUrl.replaceAll('/hls/master.m3u8', '/Thumbnail.jpg.webp');
            img.dataset.fallbackStep = "2";
        } else {
            setShowError(true);
        }
    }

    return (
        !showError || !src ? 
            <img
                ref={imgRef}
                {...props}
                src={initialSrc}
                alt={alt}
                className={`object-cover ${props.className || ''}`}
                onError={errorHandler}
                data-fallback-step="0"
            />
        : type === "errorWidget" ?
            <div 
                className={`flex items-center justify-center bg-black text-white w-full object-cover ${props.className || ''}`}
                style={{...props.style}}
            >
                <MdError size={25}/>
            </div>
        : 
            <div className={`flex items-center justify-center bg-gray-300 text-white w-full object-cover ${props.className || ''}`}>
                <MdPerson size={40}/>
            </div>
    );
};
export default SafeImage;