import { getSearchedStickers } from '@/services/getSearchedStickers';
import { getTrendingStickers } from '@/services/getTrendingStickers';
import React, { useEffect, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import CommonModalLayer from '../modal/CommonModalLayer';
import { StickerLoadMoreSpinner } from '../Skeletons/Skeletons';
import Input from './Input';
import SafeImage from './SafeImage';

interface StickerModalProps {
    onClose: () => void;
    handleStickerUpload: (sticker: string) => void
}

const giphyApiKey = process.env.NEXT_PUBLIC_GIPHY_KEY

const StickerModal: React.FC<StickerModalProps> = ({
    onClose,
    handleStickerUpload,
}) => {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [stickers, setStickers] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

    const limit = 18; // keep multiple of 3 for grid layout, or whatever number of columns the grid has

    useEffect(()=>{
        const offset = page * limit;
        if (search) {
            fetchSearchedStickers(offset);
        } else {
            fetchTrendingStickers(offset);
        }
    },[search, page])

    const fetchTrendingStickers = async (offset: number) => {
        setLoading(true);
        try {
            const res = await getTrendingStickers(limit, offset)
            if (!res) {
                throw new Error(`Failed to fetch stickers: ${res}`);
            }
            const stickerUrls = res.data.map((sticker: any) => sticker.images.original.url);
            if (page === 0) {
                setStickers(stickerUrls);
            } else {
                setStickers((prev) => [...prev, ...stickerUrls]);
            }

            if (stickerUrls.length < limit) {
                setHasMore(false); // No more data to fetch
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error('Error fetching stickers:', error);
        }
        finally {
            setLoading(false);
        }
    };

    const fetchSearchedStickers = async (offset: number) => {
        setLoading(true);
        try {
            const res = await getSearchedStickers(search, limit, offset);

            if (!res) {
                throw new Error(`Failed to fetch stickers: ${res.status}`);
            }
            const stickerUrls = res.data.map((sticker: any) => sticker.images.original.url);
            if (page === 0) {
                setStickers(stickerUrls);
            } else {
                setStickers((prev) => [...prev, ...stickerUrls]);
            }

            if (stickerUrls.length < limit) {
                setHasMore(false); // No more data to fetch
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error('Error fetching stickers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if(loading || !hasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(0);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    };

    return (
        <CommonModalLayer width='max-w-md' height='h-max' onClose={onClose}>
            <div className='w-full h-[50vh] flex flex-col shadow-md'>

                <div className="flex items-center justify-between m-4">
                    <h2 className="text-xl font-semibold">Add Sticker</h2>
                </div>

                <div className="relative mb-4 mx-1">
                    <Input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search places..."
                        className="w-full p-2 pl-10"
                    />
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-color" />
                </div>

                <div onScroll={handleScroll} ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                    <div className="w-full grid grid-cols-3">
                        {stickers.map((sticker, index) => {
                            return (
                                <div className="w-full aspect-square relative p-2 cursor-pointer"
                                    key={index}
                                    onClick={() => { handleStickerUpload(sticker) }}
                                >
                                  <SafeImage
                                        src={sticker}
                                        alt={`sticker-${index}`}
                                        className='w-full h-full object-contain'
                                    />
                                </div>
                            )
                        })}
                    </div>
                    <div className='flex justify-center items-center w-full h-12'>
                        {loading ? <StickerLoadMoreSpinner /> : ""}
                    </div>
                </div>
            </div>
        </CommonModalLayer>
    );
};

export default StickerModal