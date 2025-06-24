import React, { useEffect, useRef, useState } from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";

interface AudioMessageProps {
    audioUrl: string;
    duration: number;
    time: string;
    isLoggedInUser: boolean;
    isFor: "reply" | "showReply" | "basic"
}

const formatAudioTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const AudioMessage = React.memo(function AudioMessage({
    audioUrl, duration, time, isLoggedInUser, isFor
}: AudioMessageProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragTime, setDragTime] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const handleGlobalAudioPlay = (e: CustomEvent) => {
            if (e.detail !== audioRef.current) {
                setIsPlaying(false);
            }
        };
        window.addEventListener("audio-play", handleGlobalAudioPlay as EventListener);
        return () => window.removeEventListener("audio-play", handleGlobalAudioPlay as EventListener);
    }, []);

    useEffect(() => {
        if (!isPlaying || isDragging) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            return;
        }

        const update = () => {
            if (audioRef.current && !isDragging) {
                setCurrentTime(audioRef.current.currentTime);
                animationFrameRef.current = requestAnimationFrame(update);
            }
        };
        animationFrameRef.current = requestAnimationFrame(update);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, isDragging]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying && !isDragging) {
            if (audioRef.current.paused) {
                audioRef.current.play().catch((error) => {});
                window.dispatchEvent(new CustomEvent("audio-play", { detail: audioRef.current }));
            }
        } else {
            if (!audioRef.current.paused) {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, isDragging]);

    const handlePlayPause = () => setIsPlaying(p => !p);

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        setCurrentTime(e.currentTarget.currentTime);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        if(audioRef.current) audioRef.current.currentTime = 0;
        setCurrentTime(0);
    };

    const handleDrag = (clientX: number) => {
        if (!progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1);
        const seekTime = percent * duration;
        setDragTime(seekTime);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleDrag(e.clientX);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        handleDrag(e.clientX);
    };

    const handleMouseUp = (e: MouseEvent) => {
        setIsDragging(false);
        if (audioRef.current && dragTime !== null) {
            audioRef.current.currentTime = dragTime;
            setCurrentTime(dragTime);
        }
        setDragTime(null);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleBarClick = (e: React.MouseEvent) => {
        if (!audioRef.current || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
        const seekTime = percent * duration;
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const progress = isDragging && dragTime !== null ? dragTime : currentTime;
        if (isFor !== "basic") {
        return (
            <div className={`flex flex-col items-center w-full ${isLoggedInUser ? "text-message-text-color" : "text-message-primary-text-color"}`}>
                <div className="flex items-center w-full mb-[-5px]">
                    {/* Icon, not interactive */}
                    <span className="text-2xl select-none">
                        <MdPlayArrow size={28}/>
                    </span>
                    <div 
                        className={`w-full h-[4px] relative rounded-full ml-1 ${isLoggedInUser ? "bg-message-text-color" : "bg-message-primary-text-color"}`}
                    >
                        <div
                            className={`h-[10px] aspect-square absolute -top-[3px] rounded-full ${isLoggedInUser ? "bg-message-text-color" : "bg-message-primary-text-color"}`}
                        />
                    </div>
                </div>
                <div className="flex items-center w-full">
                    <div className="flex justify-between w-full text-[10px] pl-[32px]">
                        <span>{formatAudioTime(duration)}</span>
                        <p className="text-[10px] text-right">{time}</p>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className={`flex flex-col items-center w-full ${isLoggedInUser ? "text-message-text-color" : "text-message-primary-text-color"}`}>
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                preload="metadata"
                style={{ display: "none" }}
            />

            <div className="flex items-center w-full mb-[-5px]">
                <button onClick={handlePlayPause} className="text-2xl hover:opacity-80">
                    {isPlaying ? <MdPause size={28}/> : <MdPlayArrow size={28}/>}
                </button>

                <div 
                    ref={progressBarRef}
                    className={`w-full h-[4px] relative rounded-full ml-1 cursor-pointer ${isLoggedInUser ? "bg-message-text-color" : "bg-message-primary-text-color"}`}
                    onClick={handleBarClick}
                >
                    <div
                        className={`h-[6px] absolute -top-[1px] rounded-full ${isLoggedInUser ? "bg-message-primary-text-color" : "bg-message-text-color"}`}
                        style={{
                            width: `${(progress / duration) * 100 || 0}%`
                        }}
                    >
                        <div
                            className={`w-[10px] h-[10px] rounded-full -top-[2px] absolute right-[-3px] cursor-pointer ${isLoggedInUser ? isPlaying ?  "bg-message-primary-text-color" : "bg-message-text-color" : isPlaying ? "bg-message-text-color" : "bg-message-primary-text-color"}`}
                            style={{ touchAction: "none" }}
                            onMouseDown={handleMouseDown}
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center w-full">
                <div className="flex justify-between w-full text-[10px] pl-[32px]">
                    <span>
                        {isPlaying ? formatAudioTime(currentTime) : formatAudioTime(duration)}
                    </span>
                    <p className="text-[10px] text-right">
                        {time}
                    </p>
                </div>
            </div>
        </div>
    );
});

export default AudioMessage;