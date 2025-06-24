import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import CommonModalLayer from '../modal/CommonModalLayer';
import { LoadingSpinner } from '../LoadingSpinner';
import SafeImage from '../shared/SafeImage';

interface SharedVideoModalProps {
    onClose: () => void;
    src: string;
}

const SharedVideoModal = ({ onClose, src }: SharedVideoModalProps) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<ReactPlayer>(null);

    const stopVideo = () => {
        setIsPlaying(!isPlaying);
    };

    const skipTime = (seconds: number) => {
        if (videoRef.current) {
            const currentTime = videoRef.current.getCurrentTime();
            videoRef.current.seekTo(currentTime + seconds, 'seconds');
        }
    };

    return (
        <CommonModalLayer onClose={onClose}>
            <div
                className="relative w-full h-full flex items-center justify-center bg-bg-color rounded-lg"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={stopVideo}
            >
                {isLoading && (
                    <SafeImage
                        src={src.replaceAll('/hls/master.m3u8', '/Thumbnail.jpg.webp')}
                        alt="Loading"
                        className="w-full h-full"
                    /> 
                )}

                <ReactPlayer
                    ref={videoRef}
                    url={src}
                    playing={isPlaying}
                    controls={false}
                    height={"100%"}
                    width={"100%"}
                    onReady={() => setIsLoading(false)}
                />

                {isHovered && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                        <button
                            className="bg-bg-color/50 text-primary-text-color p-2 rounded-full hover:bg-bg-color/70"
                            onClick={() => skipTime(-10)}
                        >
                            ⏪
                        </button>

                        <button
                            className="bg-bg-color/50 text-primary-text-color p-2 rounded-full hover:bg-bg-color/70"
                            onClick={() => skipTime(10)}
                        >
                            ⏩
                        </button>
                    </div>
                )}
            </div>
        </CommonModalLayer>
    );
};

export default SharedVideoModal;
