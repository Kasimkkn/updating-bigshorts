
// Create a placeholder loading component for server-side rendering
function LoadingUI() {
    return (
        <div className='px-4 pt-2 max-md:pb-20'>
            {/* Story placeholder */}
            <div className="max-w-4xl ml-0 mr-auto mb-4">
                <div className="flex space-x-2 overflow-x-auto py-2">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-full bg-secondary-bg-color animate-pulse"></div>
                            <div className="w-12 h-3 mx-auto mt-2 bg-secondary-bg-color animate-pulse rounded"></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between px-2 md:px-4 py-2">
                <div className="flex-grow">
                    {/* Posts placeholders */}
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="mb-6 rounded-lg overflow-hidden">
                            <div className="h-8 flex items-center p-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-secondary-bg-color animate-pulse mr-2"></div>
                                <div className="h-4 bg-secondary-bg-color animate-pulse w-1/4 rounded"></div>
                            </div>
                            <div className="h-72 bg-secondary-bg-color animate-pulse"></div>
                            <div className="h-10 p-2">
                                <div className="h-4 bg-secondary-bg-color animate-pulse w-3/4 rounded mb-2"></div>
                                <div className="h-3 bg-secondary-bg-color animate-pulse w-1/2 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='w-80 max-md:hidden'>
                    {/* Suggestion placeholder */}
                    <div className="p-4 rounded-lg">
                        <div className="h-10 bg-secondary-bg-color animate-pulse w-1/2 rounded mb-6"></div>
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-secondary-bg-color animate-pulse mr-2"></div>
                                <div className="flex-grow">
                                    <div className="h-4 bg-secondary-bg-color animate-pulse w-2/3 rounded mb-1"></div>
                                    <div className="h-3 bg-secondary-bg-color animate-pulse w-1/3 rounded"></div>
                                </div>
                                <div className="w-20 h-8 bg-secondary-bg-color animate-pulse rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingUI