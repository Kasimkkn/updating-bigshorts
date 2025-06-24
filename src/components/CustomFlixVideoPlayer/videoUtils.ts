export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const getQualityUrl = (src: string, quality: string): string => {
    if (src.includes('master.m3u8')) {
        if (quality === 'auto') return src;
        if (quality === 'high') return src.replace('master.m3u8', 'high/index.m3u8');
        if (quality === 'medium') return src.replace('master.m3u8', 'medium/index.m3u8');
        if (quality === 'low') return src.replace('master.m3u8', 'low/index.m3u8');
    }
    return src;
};