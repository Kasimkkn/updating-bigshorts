import { useEffect } from 'react';
declare const Hls: any;
export interface HLSConfig {
    src: string;
    isHlsSupported: boolean;
    containerRef: React.RefObject<HTMLDivElement>;
    videoElementRef: React.MutableRefObject<HTMLVideoElement | null>;
    hlsInstanceRef: React.MutableRefObject<any>;
    setHlsLoaded: (loaded: boolean) => void;
    setHlsError: (error: string | null) => void;
    setRetryCount: (count: number) => void;
    retryCount: number;
    initialSeekDoneRef: React.MutableRefObject<boolean>;
    onHlsLoaded?: () => void;
    onHlsError?: (error: string) => void;
}

export const useHLS = (config: HLSConfig) => {
    // Cleanup HLS on unmount
    useEffect(() => {
        return () => {
            if (config.hlsInstanceRef.current) {
                config.hlsInstanceRef.current.destroy();
                config.hlsInstanceRef.current = null;
            }
        };
    }, []);

    // Reset HLS state when source changes
    useEffect(() => {
        config.setHlsLoaded(false);
        config.setHlsError(null);
        config.setRetryCount(0);
        config.initialSeekDoneRef.current = false;
        if (config.hlsInstanceRef.current) {
            config.hlsInstanceRef.current.destroy();
            config.hlsInstanceRef.current = null;
        }
    }, [config.src]);

    // Initialize HLS
    useEffect(() => {
        if (!config.src || !config.isHlsSupported || typeof Hls === 'undefined' || !Hls.isSupported()) return;

        const initializeHls = () => {
            const videoElement = config.containerRef.current?.querySelector('video');
            if (!videoElement) {
                setTimeout(initializeHls, 100);
                return;
            }
            config.videoElementRef.current = videoElement;

            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                debug: true,
                xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                    xhr.addEventListener('error', () => console.error(`XHR error for: ${url}`));
                    xhr.addEventListener('timeout', () => console.error(`XHR timeout for: ${url}`));
                }
            });

            config.hlsInstanceRef.current = hls;

            try {
                hls.loadSource(config.src);
                hls.attachMedia(videoElement);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    config.setHlsLoaded(true);
                    config.onHlsLoaded?.();
                });

                hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
                    console.error("HLS error:", data);
                    const errorMessage = `HLS Error: ${data.type} - ${data.details}`;
                    config.setHlsError(errorMessage);
                    config.onHlsError?.(errorMessage);

                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                config.hlsInstanceRef.current = null;
                                if (config.retryCount < 3) {
                                    config.setRetryCount(config.retryCount + 1);
                                }
                                break;
                        }
                    }
                });
            } catch (error) {
                console.error("Error initializing HLS:", error);
                config.onHlsError?.(`Error initializing HLS: ${error}`);
            }
        };

        initializeHls();
    }, [config.src, config.isHlsSupported, config.retryCount, config.onHlsLoaded, config.onHlsError]);
};