import React, { useCallback, useMemo } from 'react';
import { AppConfig } from '@/config/appConfig';
import { ImagesInteractiveResponse } from '@/models/ImagesInteractiveResponse';
import { PostlistItem } from '@/models/postlistResponse';
import { VideoList } from '@/models/videolist';
import { canvasHeight, canvasWidth } from '@/constants/interactivityConstants';
import { convertStringToColor } from '@/utils/features';
import SafeImage from '../shared/SafeImage';

export interface ImageProps {
  i: number;
  currentTime?: number;
  updateCurrentIndex?: (time: number, indexOfimage: number, type: number) => void;
  videoDuration?: number;
  currentIndex?: number;
  currentVideoIndex?: number;
  forHomeTrendingList?: boolean;
  postListDataModel?: PostlistItem;
  allImages: ImagesInteractiveResponse[];
  listOfVideosData?: VideoList[];
  playPauseController?: React.Dispatch<React.SetStateAction<boolean>> | (() => void);
  goToPosition: (time: number) => void | (() => void);
  parentWidth?: number;
  containerWidth?: number; // Added prop for container width percentage
  containerHeight?: number; // Added prop for container height percentage
}

const ImageWidget: React.FC<ImageProps> = React.memo(
  function ImageWidget({
    i,
    currentTime,
    updateCurrentIndex,
    videoDuration,
    currentIndex,
    currentVideoIndex,
    forHomeTrendingList = false,
    postListDataModel,
    allImages,
    listOfVideosData,
    playPauseController,
    goToPosition,
    parentWidth = canvasWidth,
    containerWidth, // Container width (optional)
    containerHeight, // Container height (optional)
  }) {
    const image = allImages[i];
    image.img_path = image.img_path?.replace(/\.webp$/, '');;
    const parentHeight = parentWidth * 16 / 9;
    const appConfig = useMemo(() => new AppConfig(), []);

    // Determine if we should use container-based positioning or original calculations
    const useContainerLogic = containerWidth !== undefined && containerHeight !== undefined;

    // Original position calculation logic (only used when containerWidth/Height not provided)
    const leftAdjust = useContainerLogic ? 0 : (10 * parentWidth / 100); // 10% of parent width
    const topAdjust = useContainerLogic ? 0 : (4.3 * parentHeight / 100); // 4.3% of parent height

    const top = image.top || 0;
    const left = image.left || 0;

    // Only calculate these if not using container logic
    const calculatedTop = useContainerLogic ? 0 : appConfig.deviceHeight(top, parentHeight) + topAdjust;
    const calculatedLeft = useContainerLogic ? 0 : appConfig.deviceWidth(left, parentWidth) + leftAdjust;

    const imageWidth = useContainerLogic ? '100%' : appConfig.deviceWidth(image.width!, parentWidth);
    const imageHeight = useContainerLogic ? '100%' : appConfig.deviceHeight(image.height!, parentHeight);

    // Only apply position adjustment if not using container logic
    const { top: finalTop, left: finalLeft } = useContainerLogic
      ? { top: 0, left: 0 }
      : appConfig.checkPosition(calculatedTop, calculatedLeft,
        typeof imageWidth === 'string' ? parseInt(imageWidth) : imageWidth,
        typeof imageHeight === 'string' ? parseInt(imageHeight) : imageHeight,
        parentWidth, parentHeight);

    const handleImageClick = useCallback(async () => {
      if (!image.on_action) return;
      if (image.on_action.link_url == null && image.on_action.video_path !== null) {
        let index = image.on_action.id_of_video_list!;
        updateCurrentIndex!(index, i, 2); // Using type 2 for images
      }
      if (image.on_action.link_url !== null && image.on_action.video_path == null) {
        window.open(image.on_action.link_url, '_blank');
      }
    }, [image.on_action, i, updateCurrentIndex]);

    const shapeClipPath = useMemo(() => {
      switch (image.image_type) {
        case 1:
          return 'circle(50% at 50% 50%)'; // Circle shape
        case 2:
          return 'polygon(-41% 0,50% 91%, 141% 0)'; // Heart shape
        case 3:
          return 'polygon(50% 0%, 0% 100%, 100% 100%)'; // Triangle shape
        case 4:
          return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; // Star shape
        default:
          return 'none'; // Rectangle shape
      }
    }, [image.image_type]);

    return useContainerLogic ? (
      // Container-based layout (simplified, fills parent container)
      <div
        className="w-full h-full"
        onClick={handleImageClick}
        style={{
          position: 'relative',
          cursor: 'pointer',
          zIndex: 10,
          pointerEvents: 'auto',
          overflow: 'hidden',
        }}
      >
        {image.image_type === 0 ? (
          // Simple image - use full container size
          <SafeImage
            src={image.img_path!}
            alt={image.text || ''}
            className="rounded-lg"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          // Shaped image
          <SafeImage
            src={image.img_path!}
            alt={image.text || ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              clipPath: shapeClipPath,
            }}
          />
        )}

        {/* Display text if provided */}
        {image.text && (
          <div
            style={{
              position: 'absolute',
              bottom: '5%',
              left: '0',
              width: '100%',
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '4px',
            }}
          >
            <span
              style={{
                color: convertStringToColor(image.color_for_txt_bg?.text_color || 'white'),
                fontFamily: image.text_family || 'Arial',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              {image.text}
            </span>
          </div>
        )}
      </div>
    ) : (
      // Original positioning logic
      <div
        style={{
          position: 'absolute',
          top: `${finalTop}px`,
          left: `${finalLeft}px`,
          cursor: 'pointer',
          zIndex: 10,
          pointerEvents: 'auto',
          width: typeof imageWidth === 'string' ? imageWidth : `${imageWidth}px`,
          height: typeof imageHeight === 'string' ? imageHeight : `${imageHeight}px`,
        }}
        onClick={handleImageClick}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            zIndex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          {image.image_type === 0 ? (
            <SafeImage
              src={image.img_path!}
              alt={image.text || ''}
              className="rounded-lg"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <SafeImage
              src={image.img_path!}
              alt={image.text || ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                clipPath: shapeClipPath,
              }}
            />
          )}

          {/* Display text if provided */}
          {image.text && (
            <div
              style={{
                position: 'absolute',
                bottom: '5%',
                left: '0',
                width: '100%',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '4px',
              }}
            >
              <span
                style={{
                  color: convertStringToColor(image.color_for_txt_bg?.text_color || 'white'),
                  fontFamily: image.text_family || 'Arial',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                {image.text}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.i === nextProps.i &&
      prevProps.videoDuration === nextProps.videoDuration &&
      prevProps.currentIndex === nextProps.currentIndex &&
      prevProps.currentTime === nextProps.currentTime &&
      prevProps.currentVideoIndex === nextProps.currentVideoIndex &&
      prevProps.parentWidth === nextProps.parentWidth &&
      prevProps.containerWidth === nextProps.containerWidth &&
      prevProps.containerHeight === nextProps.containerHeight &&
      JSON.stringify(prevProps.allImages) === JSON.stringify(nextProps.allImages)
    );
  }
);

ImageWidget.displayName = "ImageWidget";

export default ImageWidget;


interface SimpleImageProps {
  height: number | string;
  width: number | string;
  img_path?: string;
  textColor: string;
  borderColor: string;
  text?: string;
  child?: React.ReactNode;
  fontFamily?: string;
  top?: number;
  left?: number;
}

const SimpleImage: React.FC<SimpleImageProps> = ({
  height,
  width,
  textColor,
  img_path,
  borderColor,
  text,
  child,
  fontFamily = 'Arial',
  top,
  left,
}) => {
  if(img_path) img_path = img_path.replace(/\.webp$/, '');
  return (
    // <div
    //     style={{
    //         width: typeof width === 'string' ? width : `${width}px`,
    //         height: typeof height === 'string' ? height : `${height}px`,
    //         display: 'flex',
    //         alignItems: 'center',
    //         justifyContent: 'center',
    //         border: `2px solid ${borderColor}`,
    //         backgroundColor: 'transparent',
    //         position: 'relative',
    //         overflow: 'hidden',
    //         top: `${top || 0}px`,
    //         left: `${left || 0}px`,
    //     }}
    // >
    //     <div
    //         style={{
    //             height: '100%',
    //             width: '100%',
    //             display: 'flex',
    //             alignItems: 'center',
    //             justifyContent: 'center',
    //             backgroundColor: 'transparent',
    //             backdropFilter: 'blur(0px)',
    //             overflow: 'hidden',
    //         }}
    //     >
    // {text ? (
    //     <span
    //         style={{
    //             textAlign: 'center',
    //             fontFamily,
    //             fontWeight: 600,
    //             color: textColor,
    //             whiteSpace: 'nowrap',
    //             overflow: 'hidden',
    //             textOverflow: 'ellipsis',
    //             width: '100%',
    //             backgroundColor: 'transparent',
    //             padding: '0',
    //             margin: '0',
    //             display: 'inline-block',
    //         }}
    //     >
    //         {text}
    //     </span>
    // ) : (
    // child
    <SafeImage
      src={img_path!} alt='' className='rounded-lg'
      width={width}
      height={height}
      style={{
        top: top,
        left: left,
      }}
    />
    // )}
    //     </div>
    // </div>
  );
};