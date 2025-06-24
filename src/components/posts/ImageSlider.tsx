import { canvasHeight, canvasWidth } from '@/constants/interactivityConstants';
import { ContainerText } from '@/models/textcontainerdesign';
import { VideoList } from '@/models/videolist';
import { useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ImageWidget from '../Interactive/ImageWidget';
import TextWidget from '../Interactive/TextWidget';
import SafeImage from '../shared/SafeImage';

const ImageSlider = ({ images }: { images: string | Array<VideoList> }) => {
    const parentRef = useRef<HTMLImageElement>(null); //ref for calculating the size of the parent div
    const [parentSize, setParentSize] = useState({ width: canvasWidth, height: canvasHeight })
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const imageArray: VideoList[] = JSON.parse(images.toString());
    const currentImage = imageArray[currentIndex];
    const containerTexts = currentImage?.functionality_datas?.list_of_container_text;
    const containerImages = currentImage?.functionality_datas?.list_of_images;
    const aspectRatio = imageArray.length > 1 ? imageArray[currentIndex]?.aspect_ratio || null : 0.75

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % imageArray.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? imageArray.length - 1 : prev - 1
        );
    }

    const moveToSlide = (index: number) => {
        setCurrentIndex(index);
    }

    const onImageLoad = () => {
        setParentSize({
            width: parentRef.current?.width || canvasWidth,
            height: parentRef.current?.height || canvasHeight,
        })
    }

    return (
        <div className="relative w-full">

            {/* Container for image and elements */}
            <div
                className="flex justify-center items-center relative overflow-hidden w-full max-h-full"
                ref={parentRef}
                style={{ aspectRatio: imageArray[0]?.aspect_ratio || 1 }}
            >
               <SafeImage
                    onContextMenu={(e) => e.preventDefault()}
                    src={imageArray[currentIndex]?.path}
                    alt={`Post content ${currentIndex + 1}`}
                    className="rounded-lg object-cover w-full h-full"
                    onLoad={onImageLoad}
                />


                {containerTexts && containerTexts.map((text: ContainerText, i: number) => {
                    return (
                        <TextWidget
                            key={`${currentIndex}-text-${i}`}
                            index={i}
                            videoDuration={0}
                            currentIndex={currentIndex}
                            currentVideoIndex={currentIndex}
                            forHomeTrendingList={false}
                            allText={
                                containerTexts || []
                            }
                            postListDataModel={currentImage}
                            listOfVideosData={imageArray}
                            parentWidth={parentSize.width}
                        />
                    )
                })}

                {containerImages && containerImages.map((image, i: number) => {
                    return (
                        <ImageWidget
                            key={`${currentIndex}-image-${i}`}
                            currentTime={0}
                            goToPosition={() => { }}
                            i={i}
                            playPauseController={() => { }}
                            updateCurrentIndex={() => { }}
                            videoDuration={0}
                            currentIndex={currentIndex}
                            currentVideoIndex={currentIndex}
                            forHomeTrendingList={false}
                            allImages={
                                containerImages || []
                            }
                            listOfVideosData={imageArray}
                            parentWidth={parentSize.width}
                        />
                    )
                })}
            </div>

            {/* slide controls (prev, next and jump) */}
            {imageArray.length !== 1 && (
                <>
                    <button
                        className={`absolute left-1 top-1/2 -translate-y-1/2 bg-bg-color/50 hover:bg-bg-color text-primary-text-color rounded-full p-2 ${currentIndex === 0 ? 'hidden' : ''}`}
                        onClick={prevSlide}
                        disabled={currentIndex === 0}
                    >
                        <FaChevronLeft />
                    </button>

                    <button
                        className={`absolute right-1 top-1/2 -translate-y-1/2 bg-bg-color/50 hover:bg-bg-color text-primary-text-color rounded-full p-2 ${currentIndex === imageArray.length - 1 ? 'hidden' : ''}`}
                        onClick={nextSlide}
                        disabled={currentIndex === imageArray.length - 1}
                    >
                        <FaChevronRight />
                    </button>

                    <div className="absolute flex justify-center bottom-2 left-1/2 -translate-x-1/2">
                        {imageArray.map((_, index: any) => (
                            <span
                                key={index}
                                className={`w-2 h-1 mx-1 rounded-full cursor-pointer ${index === currentIndex ? "bg-blue-500 w-4" : "bg-bg-color"} transition-all duration-2000`}
                                onClick={() => moveToSlide(index)}
                            />
                        ))}
                    </div>

                    <div className="absolute top-2 right-2 px-2 bg-black/20 rounded-full">
                        <p className="font-light text-white">{currentIndex + 1}/{imageArray.length}</p>
                    </div>
                </>
            )}
        </div>
    )
}

export default ImageSlider