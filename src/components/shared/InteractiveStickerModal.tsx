import { useEffect, useRef, useState } from 'react';
import Input from './Input';
import CommonModalLayer from '../modal/CommonModalLayer';
import SafeImage from './SafeImage';

interface InteractiveStickerModalProps {
    addSticker: (style: any) => void;
    closeModal: () => void;
}

interface Sticker {
    id: string;
    url: string;
    title: string;
    images: {
        original: {
            url: string;
        };
    }
}

const InteractiveStickerModal = ({ addSticker, closeModal }: InteractiveStickerModalProps) => {
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 20;
    const containerRef = useRef<HTMLDivElement>(null);
    const giphyApiKey = 'Rey6dMTyTfBQd2ZX1kZMytI3ef2lH4Bk';
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchStickers = async (query = '', resetList = true) => {
        if (loading) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);

        try {
            const currentOffset = resetList ? 0 : offset;
            const searchParam = query.trim();

            const apiUrl = searchParam === ''
                ? `https://api.giphy.com/v1/stickers/trending?api_key=${giphyApiKey}&limit=${limit}&offset=${currentOffset}&rating=g&bundle=messaging_non_clips`
                : `https://api.giphy.com/v1/stickers/search?api_key=${giphyApiKey}&q=${encodeURIComponent(searchParam)}&limit=${limit}&offset=${currentOffset}&rating=g&lang=en&bundle=messaging_non_clips`;

            const response = await fetch(apiUrl, { signal: abortControllerRef.current.signal });

            if (!response.ok) {
                throw new Error('Failed to fetch stickers');
            }

            const data = await response.json();
            const fetchedStickers = data.data.map((sticker: any) => ({
                id: sticker.id,
                url: sticker.images.original.url,
                title: sticker.title,
                images: sticker.images
            }));

            setHasMore(fetchedStickers.length === limit);
            setOffset(currentOffset + limit);
            setStickers(prev => resetList ? fetchedStickers : [...prev, ...fetchedStickers]);

            if (fetchedStickers.length === 0 && searchParam !== '' && resetList) {
                setSearchText('');
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching stickers:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !loading) {
                    fetchStickers(searchText, false);
                }
            },
            { root: null, rootMargin: '20px', threshold: 0.1 }
        );

        const sentinelElement = container.querySelector('.sentinel');
        if (sentinelElement) {
            observer.observe(sentinelElement);
        }

        return () => {
            if (sentinelElement) {
                observer.unobserve(sentinelElement);
            }
            observer.disconnect();
        };
    }, [stickers, hasMore, loading, searchText]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchText !== null) {
                setOffset(0);
                fetchStickers(searchText, true);
            }
        }, 500);

        return () => {
            clearTimeout(debounceTimer);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [searchText]);

    useEffect(() => {
        fetchStickers('', true);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return (
        <CommonModalLayer height='h-[50vh]' width='max-w-xl' onClose={closeModal}>
            <div className='flex flex-col gap-4 bg-primary-bg-color max-w-xl w-full p-4'>
                <div className="mb-4">
                    <Input
                        type="text"
                        placeholder="Search for stickers..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <div
                    ref={containerRef}
                    className="max-h-[50vh] flex-1 overflow-y-auto pr-1"
                >
                    {stickers.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stickers.map((sticker, index) => (
                                <div key={`${sticker.id}-${index}`} className="flex justify-center items-center">
                                    <SafeImage
                                        src={sticker?.images?.original?.url || sticker.url}
                                        alt={sticker.title}
                                        width={100}
                                        height={100}
                                        className="cursor-pointer hover:opacity-80 transition-opacity rounded w-20"
                                        onClick={() => addSticker(sticker)}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                            <div className="sentinel h-4 w-full col-span-full"></div>
                        </div>
                    ) : !loading && (
                        <div className="text-center py-4 text-primary-text-color">
                            {searchText.trim() !== '' ? 'No stickers found. Showing trending stickers instead.' : 'No trending stickers available.'}
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-4 text-primary-text-color">
                            Loading stickers...
                        </div>
                    )}
                </div>
            </div>
        </CommonModalLayer>
    );
};

export default InteractiveStickerModal;