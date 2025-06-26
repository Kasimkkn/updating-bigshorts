
export const VideoCardSkeleton = () => (
    <div className="shadow-md shadow-shadow-color rounded-md w-full border border-border-color animate-pulse">
        <div className="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-t-md"></div>
        <div className="p-2">
            <div className="flex gap-2">

                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-md flex-shrink-0"></div>
                <div className="flex justify-between w-[calc(100%-40px)] items-start">
                    <div className="flex flex-col w-[calc(100%-24px)] space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="flex justify-between w-full">
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                    </div>
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);
export const StickerLoadMoreSpinner = () => (
    <div className="flex justify-center items-center p-4 animate-pulse">
        <div className="inline-block w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

export const SeriesCardSkeleton = () => (
    <div
        className="shadow-md shadow-shadow-color rounded-md shrink-0 border border-border-color animate-pulse"
        style={{ width: 'calc(100% / 4 - 18px)', minWidth: '280px' }}
    >
        <div className="relative">
            <div className="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-t-md"></div>
            <div className="absolute top-2 right-2">
                <div className="bg-gray-400 dark:bg-gray-600 rounded-md p-1">
                    <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
        <div className="p-2">
            <div className="flex gap-2">
                <div className="w-8 h-8 rounded-md bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
                <div className="flex justify-between w-[calc(100%-40px)] items-start">
                    <div className="flex flex-col w-[calc(100%-24px)] space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);

export const PlaylistCardSkeleton = () => (
    <div
        className="shadow-md shadow-shadow-color rounded-md shrink-0 border border-border-color animate-pulse"
        style={{ width: 'calc(100% / 4 - 18px)', minWidth: '280px' }}
    >
        <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-md"></div>
        <div className="p-2">
            <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-md flex-shrink-0"></div>
                <div className="flex justify-between w-[calc(100%-40px)] items-start">
                    <div className="flex flex-col w-[calc(100%-24px)] space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const WatchHistoryCardSkeleton = () => (
    <div
        className="shadow-md shadow-shadow-color rounded-md shrink-0 border border-border-color overflow-hidden animate-pulse"
        style={{ width: 'calc(100% / 4 - 18px)', minWidth: '280px' }}
    >
        <div className="relative">
            {/* Image skeleton */}
            <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-md"></div>

            {/* Overlay content skeleton */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent z-10 px-3 py-2 flex flex-col justify-end space-y-1">
                {/* Title skeleton */}
                <div className="h-4 bg-gray-400 rounded w-4/5"></div>

                {/* Details skeleton */}
                <div className="flex justify-between">
                    <div className="h-3 bg-gray-400 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-400 rounded w-1/4"></div>
                </div>
            </div>

            {/* Progress bar skeleton */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 z-20">
                <div className="h-full bg-gray-400 w-1/3"></div>
            </div>
        </div>
    </div>
);

export const VideoGridSkeleton = ({ count = 8 }: { count?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-4">
        {Array.from({ length: count }).map((_, index) => (
            <VideoCardSkeleton key={index} />
        ))}
    </div>
);

// Horizontal Scroll Skeletons
export const HorizontalSeriesSkeleton = ({ count = 4 }: { count?: number }) => (
    <div className="flex gap-6 w-full overflow-x-auto mb-2 p-3 md:pl-4">
        {Array.from({ length: count }).map((_, index) => (
            <SeriesCardSkeleton key={index} />
        ))}
    </div>
);

export const HorizontalPlaylistSkeleton = ({ count = 4 }: { count?: number }) => (
    <div className="flex gap-6 w-full overflow-x-auto mb-2 p-3 md:pl-4">
        {Array.from({ length: count }).map((_, index) => (
            <PlaylistCardSkeleton key={index} />
        ))}
    </div>
);

export const HorizontalWatchHistorySkeleton = ({ count = 4 }: { count?: number }) => (
    <div className="flex gap-6 w-full overflow-x-auto mb-2 p-3 md:pl-4">
        {Array.from({ length: count }).map((_, index) => (
            <WatchHistoryCardSkeleton key={index} />
        ))}
    </div>
);

// Season Info Skeleton (for series page)
export const SeasonInfoSkeleton = () => (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:px-5 animate-pulse">
        {/* Mobile title skeleton */}
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 md:hidden mb-4"></div>

        {/* Image skeleton */}
        <div className="relative w-full md:w-1/3 aspect-[5/3] rounded-lg bg-gray-300 dark:bg-gray-700"></div>

        {/* Content skeleton */}
        <div className="md:w-2/3 space-y-4">
            {/* Desktop title skeleton */}
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 max-md:hidden"></div>

            {/* Description skeletons */}
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
        </div>
    </div>
);

// Episode Item Skeleton (for episodes list)
export const EpisodeItemSkeleton = () => (
    <div className="flex gap-4 rounded-md p-2 mb-4 animate-pulse">
        {/* Thumbnail skeleton */}
        <div className="relative w-1/3 h-16 rounded-md bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>

        {/* Content skeleton */}
        <div className="w-2/3 min-w-0 space-y-2">
            {/* Title skeleton */}
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>

            {/* Description skeletons */}
            <div className="space-y-1">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
        </div>

        {/* Duration skeleton */}
        <div className="w-12 h-4 bg-gray-300 dark:bg-gray-700 rounded flex-shrink-0"></div>
    </div>
);

// Recommended Videos Skeleton (for series page)
export const RecommendedVideosSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex gap-4 rounded-md p-2 animate-pulse">
                {/* Thumbnail skeleton */}
                <div className="relative w-1/3 h-16 rounded-md bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>

                {/* Content skeleton */}
                <div className="w-2/3 min-w-0">
                    {/* Title skeleton */}
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
                </div>
            </div>
        ))}
    </div>
);

export const EpisodeLoadingSkeleton = () => (
    <div className="lg:w-3/4 h-screen flex justify-center items-center">
        <div className="w-full max-w-4xl p-8 space-y-6 animate-pulse">
            {/* Video player skeleton */}
            <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg"></div>

            {/* Title and controls skeleton */}
            <div className="space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="flex gap-4">
                    <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
        </div>
    </div>
);

export const FollowRequestItemSkeleton = () => (
    <div className="flex justify-between p-2 border-b border-border-color animate-pulse">
        <div className="flex items-center">
            {/* Avatar skeleton */}
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-md flex-shrink-0 max-md:w-8 max-md:h-8"></div>

            {/* User info skeleton */}
            <div className="ml-4 flex flex-col space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2 items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        </div>
    </div>
);

// Notification Item Skeleton
export const NotificationItemSkeleton = () => (
    <div className="flex justify-between p-2 border-b border-border-color animate-pulse">
        <div className="flex items-center">
            {/* Avatar skeleton */}
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-md flex-shrink-0"></div>

            {/* Notification content skeleton */}
            <div className="ml-4 flex flex-col mr-4 space-y-2">
                <div className="space-y-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                </div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
        </div>

        {/* Action/Image skeleton */}
        <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        </div>
    </div>
);

export const NotificationLoadingSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="space-y-0">
        {Array.from({ length: count }).map((_, index) => (
            <NotificationItemSkeleton key={index} />
        ))}
    </div>
);

export const FollowRequestLoadingSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="space-y-0">
        {Array.from({ length: count }).map((_, index) => (
            <FollowRequestItemSkeleton key={index} />
        ))}
    </div>
);

export const PlaylistDetailSkeleton = () => (
    <div className='w-full flex flex-col bg-bg-color h-[90vh] overflow-y-auto animate-pulse'>
        {/* Banner area skeleton */}
        <div className='relative text-text-color flex flex-col'>
            {/* Cover image skeleton */}
            <div className="relative h-[30vh] md:h-[50vh] w-full">
                <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-bg-color to-transparent" />
                <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-bg-color-70 to-transparent" />
            </div>

            {/* Playlist info skeleton */}
            <div className="md:absolute bottom-0 left-0 z-10 flex flex-col justify-end md:p-12 px-2 space-y-4">
                {/* Title skeleton */}
                <div className="h-12 md:h-16 bg-gray-400 dark:bg-gray-600 rounded w-3/4 mb-4"></div>

                {/* Creator info skeleton */}
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
                    <div className="ml-2 flex flex-col space-y-1">
                        <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-24"></div>
                        <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-16 ml-2"></div>
                </div>

                {/* Description skeleton */}
                <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-full"></div>
                    <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-4/5"></div>
                </div>

                {/* Play button skeleton */}
                <div className="flex items-center gap-4">
                    <div className="h-10 w-24 bg-gray-400 dark:bg-gray-600 rounded"></div>
                </div>
            </div>
        </div>

        {/* Videos section skeleton */}
        <div className="w-full p-5 space-y-4">
            {/* Section header skeleton */}
            <div className='flex justify-between items-center mb-4'>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>

            {/* Video list skeleton */}
            <div className='w-full max-h-[50vh] overflow-y-auto space-y-2'>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 rounded-md p-2">
                        {/* Index number skeleton */}
                        <div className="w-8 h-6 bg-gray-300 dark:bg-gray-700 rounded text-center"></div>

                        {/* Video thumbnail skeleton */}
                        <div className="relative w-1/3 aspect-video rounded-md bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>

                        {/* Video info skeleton */}
                        <div className="w-2/3 min-w-0 space-y-2">
                            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const SnipsPageSkeleton = () => (
    <div className="flex md:items-center md:justify-center w-full h-screen sm:px-4 animate-pulse">
        <div className="flex flex-col md:items-center md:justify-center relative rounded-lg">
            {/* Main video player skeleton */}
            <div className="w-full aspect-[9/15] md:aspect-[9/16] md:max-h-[90vh] sm:w-[25rem] relative md:rounded-lg bg-gray-300 dark:bg-gray-700 overflow-hidden">

                {/* Snips text overlay skeleton */}
                <div className="absolute top-4 left-4 z-20">
                    <div className="h-8 w-16 bg-gray-400 dark:bg-gray-600 rounded"></div>
                </div>

                {/* Interactive badge skeleton */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="h-8 w-24 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-10">
                    <div className="animate-spin mb-2">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                    </div>
                    <div className="text-white text-xs">Loading...</div>
                </div>

                {/* Bottom user info skeleton */}
                <div className="absolute bottom-0 left-0 p-3 w-full">
                    <div className="absolute bottom-0 left-0 pointer-events-none p-3 bg-gradient-to-t from-[#101012] to-transparent w-full h-full" />
                    <div className="flex flex-col relative z-[15] space-y-3">
                        {/* User details skeleton */}
                        <div className="flex gap-2 items-center">
                            <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
                            <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-20"></div>
                            <div className="h-6 w-16 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
                        </div>

                        {/* Post title skeleton */}
                        <div className="space-y-1">
                            <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>

                        {/* Audio info skeleton */}
                        <div className="flex gap-2 items-center">
                            <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded"></div>
                            <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-24"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side controls skeleton */}
            <div className="absolute rounded-r-md h-full flex flex-col items-center right-0 max-sm:bg-gradient-to-l from-black/50 to-transparent sm:translate-x-full z-10">
                <div className="flex flex-col items-center justify-center md:justify-end h-full pb-6 pl-4 space-y-6">

                    {/* Mute/Volume button skeleton */}
                    <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-md"></div>

                    {/* Navigation arrows skeleton */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-md border border-gray-500"></div>
                        <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-md border border-gray-500"></div>
                    </div>

                    {/* Like button group skeleton */}
                    <div className="flex flex-col items-center space-y-1">
                        <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
                        <div className="h-3 w-6 bg-gray-400 dark:bg-gray-600 rounded"></div>
                    </div>

                    {/* Comment button group skeleton */}
                    <div className="flex flex-col items-center space-y-1">
                        <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
                        <div className="h-3 w-4 bg-gray-400 dark:bg-gray-600 rounded"></div>
                    </div>

                    {/* Share button group skeleton */}
                    <div className="flex flex-col items-center space-y-1">
                        <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
                        <div className="h-3 w-8 bg-gray-400 dark:bg-gray-600 rounded"></div>
                    </div>

                    {/* More options button group skeleton */}
                    <div className="flex flex-col items-center space-y-1">
                        <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
                        <div className="h-3 w-6 bg-gray-400 dark:bg-gray-600 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const SearchSnipsSkeleton = () => (
    <div className="grid grid-cols-3 mt-1 animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
            <div
                key={index}
                className="border border-border-color"
            >
                <div className="relative w-full h-60 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden">
                    {/* Thumbnail skeleton */}
                    <div className="w-full h-full bg-gray-400 dark:bg-gray-600"></div>

                    {/* Bottom content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                        <div className="space-y-1">
                            <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// Search Minis Skeleton (for SearchMinis list layout)
export const SearchMinisSkeleton = () => (
    <div className="max-h-[600px] overflow-y-auto custom-scrollbar divide-y divide-border-color animate-pulse">
        {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3">
                {/* Thumbnail skeleton */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>

                {/* Content skeleton */}
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

// Search Users Skeleton (for SearchUsers list layout)
export const SearchUsersSkeleton = () => (
    <div className="max-h-[600px] overflow-y-auto custom-scrollbar divide-y divide-border-color animate-pulse">
        {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3">
                {/* Profile image skeleton */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                </div>

                {/* User info skeleton */}
                <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                </div>
            </div>
        ))}
    </div>
);

export const SuggestedProfilesSkeleton = () => (
    <div className='max-w-[60rem] max-xl:max-w-[50rem] flex flex-col gap-2 max-lg:max-w-[40rem] max-md:max-w-[24rem] animate-pulse'>
        {/* Title skeleton */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>

        {/* Horizontal scrolling profiles skeleton */}
        <div className='flex md:gap-5 gap-3 overflow-x-auto scrollbar-hide'>
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className='flex gap-2 flex-col items-center md:min-w-[100px] min-w-[90px] overflow-hidden relative'
                >
                    {/* Avatar skeleton */}
                    <div className="w-20 h-28 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>

                    {/* Username skeleton */}
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>

                    {/* Follow/Add button skeleton */}
                    <div className='absolute z-40 bottom-4 w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-md border border-gray-500'></div>
                </div>
            ))}
        </div>
    </div>
);

export const HighlightCardSkeleton = () => (
    <div className="relative w-[350px] h-[80vh] max-md:w-[70%] max-md:h-[75%] bg-gray-300 dark:bg-gray-800 rounded-lg transition-all mx-2 shadow-md animate-pulse">

        {/* Progress Bar skeleton */}
        <div className="absolute top-3 left-2 right-2 flex space-x-1">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="flex-1 h-[2px] bg-gray-400 dark:bg-gray-600 rounded-md"
                />
            ))}
        </div>

        <div className="absolute top-1 left-0 right-0 flex items-center justify-start px-2 py-4 z-30">
            <div className="flex items-center space-x-2 w-full">
                {/* Avatar skeleton */}
                <div className="w-10 h-10 bg-gray-400 dark:bg-gray-600 rounded-lg"></div>
                {/* Username skeleton */}
                <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-20"></div>
            </div>
        </div>
        <div className="absolute top-6 right-2 z-50">
            <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
        </div>
        <div className="absolute top-1/2 left-0 right-0 flex justify-between">
            <div className="relative right-10 w-10 h-10 bg-gray-400 dark:bg-gray-600 rounded-md z-50"></div>
            <div className="relative left-10 w-10 h-10 bg-gray-400 dark:bg-gray-600 rounded-md z-50"></div>
        </div>
        <div className="w-full h-full rounded-lg bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
                <div className="text-white text-sm">Loading story...</div>
            </div>
        </div>
    </div>
);

export const FollowModalSkeleton = ({ title }: { title: string }) => (
    <div className="bg-primary-bg-color md:rounded-xl w-full max-w-4xl animate-pulse">
        <div className="w-full">
            <div className="flex items-center justify-start p-4 border-b border-border-color">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="px-3 pb-2 pt-4">
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            </div>
            <div className="px-3 max-md:pb-14" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-border-color last:border-b-0"
                    >
                        <div className="flex items-center space-x-2">
                            {/* Avatar skeleton */}
                            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                            <div className="flex flex-col space-y-1">
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                            {title === "Followers" && (
                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                            )}
                        </div>
                    </div>
                ))}
                <div className="text-center py-4">
                    <div className="inline-block w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-md animate-spin"></div>
                </div>
            </div>
        </div>
    </div>
);

export const HashtagPageSkeleton = () => (
    <div className="min-h-screen px-4 py-6 animate-pulse">
        <div className="flex justify-center mb-6">
            <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
        </div>
        <div className="w-[600px] mx-auto flex flex-wrap gap-4 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            {Array.from({ length: 12 }).map((_, index) => (
                <div
                    key={index}
                    className="w-[180px] h-[300px] border border-border-color rounded overflow-hidden"
                >
                    <div className="relative w-full h-full bg-gray-300 dark:bg-gray-700">
                        <div className="w-full h-full bg-gray-400 dark:bg-gray-600"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="space-y-1">
                                <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ProfilePageSkeleton = () => (
    <div className='flex flex-col justify-center md:items-center w-full overflow-hidden px-4 animate-pulse'>
        <div className='py-2 flex flex-col gap-3 w-[90%] max-md:w-[100%] px-36 max-xl:px-20 max-lg:px-14 max-md:px-0'>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-8 mb-1"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                            </div>
                            <div className="text-center">
                                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-8 mb-1"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                            <div className="text-center">
                                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-8 mb-1"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-40"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 max-md:justify-between">
                <div className="flex-1 min-w-[100px] h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 min-w-[100px] h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="flex gap-2">
                    <div className="max-md:hidden w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center min-w-[80px]">
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-md mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                ))}
            </div>
            <div className="w-full h-12 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            <div className='w-full flex border-t border-b border-border-color p-2'>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex-1 text-center p-2 flex gap-2 items-center justify-center">
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12 max-md:hidden"></div>
                    </div>
                ))}
            </div>
            <div className='md:mt-4'>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, index) => (
                        <div key={index} className="aspect-square bg-gray-300 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const ProfileContentSkeleton = () => (
    <div className='flex items-center justify-center animate-pulse'>
        <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

export const ProfileHighlightsSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center min-w-[80px]">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-lg mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
            </div>
        ))}
    </div>
);

export const SeriesDetailsSkeleton = () => (
    <div className='w-full flex bg-bg-color h-[90vh] items-center justify-center animate-pulse'>
        <div className='w-full flex flex-col bg-bg-color h-[90vh] overflow-y-auto'>
            <div className='relative text-text-color flex flex-col'>
                <div className="absolute top-4 right-4 z-20">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                </div>
                <div className="relative h-[30vh] md:h-[40vh] w-full">
                    <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700">
                        <div className="absolute flex flex-col justify-end bottom-0 left-0 right-0 bg-gradient-to-t from-bg-color to-transparent p-4 h-1/2">
                            <div className="h-8 md:h-12 bg-gray-400 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-2">
                    <div className="flex items-center gap-4">
                        <div className="relative w-1/3 md:w-1/4 aspect-video rounded-md overflow-hidden bg-gray-300 dark:bg-gray-700"></div>
                        <div className="flex-1">
                            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-4 flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                </div>
            </div>
            <div className="w-full p-4">
                <div className='flex justify-between items-center mb-4'>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                </div>

                <div className='w-full max-h-[50vh] overflow-y-auto space-y-4'>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 rounded-md p-2">
                            <div className="relative w-1/3 rounded-md overflow-hidden flex-shrink-0 aspect-video bg-gray-300 dark:bg-gray-700"></div>
                            <div className="w-2/3 min-w-0 space-y-2">
                                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const PostUsersModalSkeleton = () => (
    <div className="w-full h-full flex items-center justify-center animate-pulse">
        <div className="w-full space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex justify-between items-center w-full">
                    <div className='flex items-center gap-2'>
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                        <div className="flex flex-col space-y-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                    </div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
            ))}
        </div>
    </div>
);

export const SharePostModalSkeleton = () => (
    <div className='w-full h-full flex items-center justify-center animate-pulse'>
        <div className='grid grid-cols-3 sm:grid-cols-4 gap-3 w-full p-2'>
            {Array.from({ length: 12 }).map((_, index) => (
                <div
                    key={index}
                    className="flex flex-col gap-1 p-2 h-max w-full items-center justify-center"
                >
                    <div className="w-full aspect-[3/4] relative bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
            ))}
        </div>
    </div>
);

export const MutualsModalSkeleton = () => (
    <div className="w-full h-full flex items-center justify-center animate-pulse">
        <div className="w-full space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex justify-between items-center w-full">
                    <div className='flex items-center gap-2'>
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                        <div className="flex flex-col space-y-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                    </div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
            ))}
        </div>
    </div>
);

export const StickerModalSkeleton = () => (
    <div className="flex-1 overflow-y-auto animate-pulse">
        <div className="w-full grid grid-cols-3">
            {Array.from({ length: 12 }).map((_, index) => (
                <div
                    key={index}
                    className="w-full aspect-square relative p-2"
                >
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            ))}
        </div>
    </div>
);

export const StickerModalFullSkeleton = () => (
    <div className='w-full h-[50vh] flex flex-col shadow-md animate-pulse'>
        <div className="flex items-center justify-between m-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="relative mb-4 mx-1">
            <div className="w-full h-10 bg-gray-300 dark:bg-gray-700 rounded p-2 pl-10"></div>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="flex-1 overflow-y-auto">
            <div className="w-full grid grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                    <div
                        key={index}
                        className="w-full aspect-square relative p-2"
                    >
                        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const CollaboratorsSkeleton = () => (
    <div className="w-full h-full flex items-center justify-center animate-pulse">
        <div className="w-full space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="w-full flex items-center gap-2 p-2 rounded-md">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-md flex-shrink-0"></div>
                    <div className="flex flex-col flex-1 space-y-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const LocationPickerSkeleton = () => (
    <div className="flex justify-center items-center h-full animate-pulse">
        <div className="space-y-2 w-full">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="w-full flex items-center gap-4 py-2 px-4">
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded flex-shrink-0"></div>
                    <div className="flex flex-col min-w-0 flex-1 space-y-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const CurrentLocationSkeleton = () => (
    <div className="flex flex-col min-w-0 w-full bg-secondary-bg-color p-2 mb-4 border-border-color border-y animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
);

export const CommentsSectionSkeleton = () => (
    <div className="flex items-center justify-center h-full animate-pulse">
        <div className="w-full space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col p-2 rounded-lg mb-2">

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="pl-11 space-y-1">
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center pl-11 mt-2 space-x-3">
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-10"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-6"></div>
                    </div>
                    {index % 2 === 0 && (
                        <div className="ml-11 mt-2 space-y-2">

                            <div className="flex items-center gap-1">
                                <div className="w-5 h-px bg-gray-300 dark:bg-gray-700"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                            {Array.from({ length: 2 }).map((_, replyIndex) => (
                                <div key={replyIndex} className="flex flex-col p-1 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                                        </div>
                                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                    </div>
                                    <div className="pl-12 space-y-1">
                                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                    <div className="flex items-center pl-12 mt-1 space-x-2">
                                        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-6"></div>
                                        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
                                        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const AboutThisAccountSkeleton = () => (
    <div className="flex flex-col gap-3 animate-pulse">
        <div className="flex items-center gap-3">
            {/* Profile image skeleton */}
            <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>

            {/* User info skeleton */}
            <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
            </div>
        </div>

        <div>
            <div className="space-y-2">
                <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
        </div>

        <div>
            <div className="space-y-2">
                <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-2/5"></div>
            </div>
        </div>
    </div>
)
