
import { AppConfig } from '@/config/appConfig';
import { canvasHeight, canvasWidth } from '@/constants/interactivityConstants';
import { ContainerText } from '@/models/textcontainerdesign';
import { convertStringToColor } from '@/utils/features';
import React, { useEffect, useRef, useMemo } from 'react';

interface TextWidgetProps {
  index: number;
  videoDuration?: number;
  currentIndex?: number;
  currentVideoIndex?: number;
  forHomeTrendingList?: boolean;
  allText: Array<ContainerText>;
  postListDataModel?: any;
  listOfVideosData?: Array<any>;
  parentWidth?: number;
  containerWidth?: number; // Added prop for container width percentage
  containerHeight?: number; // Added prop for container height percentage
}

const TextWidget: React.FC<TextWidgetProps> = React.memo(
  function TextWidget({
    index,
    videoDuration,
    currentIndex,
    currentVideoIndex,
    forHomeTrendingList = false,
    allText,
    postListDataModel,
    listOfVideosData,
    parentWidth = canvasWidth,
    containerWidth, // New prop
    containerHeight, // New prop
  }) {
    const appConfig = useMemo(() => new AppConfig(), []);
    const parentHeight = parentWidth * 16 / 9;
    // Determine if we should use container-based positioning or original calculations
    const useContainerLogic = containerWidth !== undefined && containerHeight !== undefined;

    const containerText = allText[index];

    // Only calculate these if not using container logic
    const leftAdjust = useContainerLogic ? 0 : (10 * parentWidth / 100); //10% of parent width
    const topAdjust = useContainerLogic ? 0 : (4.3 * parentHeight / 100); //4.3% of parent height

    const textWidth = useContainerLogic ? '100%' : appConfig.deviceWidth(containerText.width || 10, parentWidth);
    const textHeight = useContainerLogic ? '100%' : appConfig.deviceHeight(containerText.height || 5, parentHeight);

    const calculatedTop = useContainerLogic ? 0 : appConfig.calculatedTop(containerText?.top || 0,
      typeof textHeight === 'string' ? parseInt(textHeight) : textHeight,
      containerText.height || 5) + topAdjust;

    const calculatedLeft = useContainerLogic ? 0 : appConfig.calculatedLeft(containerText?.left || 0,
      typeof textWidth === 'string' ? parseInt(textWidth) : textWidth,
      containerText.width || 10) + leftAdjust;

    // Only apply position adjustment if not using container logic
    const { top: finalTop, left: finalLeft } = useContainerLogic
      ? { top: 0, left: 0 }
      : appConfig.checkPosition(
        calculatedTop,
        calculatedLeft,
        typeof textWidth === 'string' ? parseInt(textWidth) : textWidth,
        typeof textHeight === 'string' ? parseInt(textHeight) : textHeight,
        parentWidth,
        parentHeight
      );

    const renderText = (text: string | null)=>{
      if(!text) return null;
      return(
        text.split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            {idx < text.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))
      )
    }
    const renderIcon = (containerText: ContainerText) => {
      switch (containerText.text_container_style) {
        case 1:
          // this case is for text tpye 4 in mobile dev
          return (
            <div
              style={{
                width: typeof textWidth === 'string' ? parseInt(textWidth) : textWidth,
                height: typeof textHeight === 'string' ? parseInt(textHeight) : textHeight,
                backgroundColor: `#ffffff`,
                color: convertStringToColor(containerText.color_for_txt_bg.text_color!),
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid white',
                // Add speech bubble tail
                position: 'relative',
              }}
            >
              <span
                style={{
                  color: convertStringToColor(containerText.color_for_txt_bg.text_color!),
                  padding: '0 8px',
                }}
              >{renderText(containerText.text)}</span>
            </div>
          );
        case 2:
          // this case is for text tpye 8 in mobile dev
          return (
            <div
              style={{
                width: typeof textWidth === 'string' ? (parseInt(textWidth) - 25) : textWidth - 25,
                height: typeof textWidth === 'string' ? (parseInt(textWidth) - 25) : textWidth - 25,
                backgroundColor: containerText.color_for_txt_bg?.background_color
                  ? convertStringToColor(containerText.color_for_txt_bg.background_color)
                  : '#4caf50', // Default to bright green if color not provided
                color: convertStringToColor(containerText.color_for_txt_bg.text_color!),
                borderRadius: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <span
                style={{
                  color: convertStringToColor(containerText.color_for_txt_bg.text_color!),
                  fontWeight: 'bold',
                  textShadow: '0 1px 1px rgba(0,0,0,0.1)',
                }}
              >{renderText(containerText.text)}</span>
            </div>
          );
        case 3:
          // this case is for text tpye 6 in mobile dev
          return (
            <div
              style={{
                width: typeof textWidth === 'string' ? parseInt(textWidth) : textWidth,
                height: typeof textHeight === 'string' ? parseInt(textHeight) : textHeight,
                backgroundColor: convertStringToColor(containerText.color_for_txt_bg.background_color!) || '#6a1b9a',
                color: convertStringToColor(containerText.color_for_txt_bg.text_color!),
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              <span
                style={{
                  color: convertStringToColor(containerText.color_for_txt_bg.text_color!),
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  padding: '0 8px',
                }}
              >{renderText(containerText.text)}</span>
            </div>
          );
        case 4:
          // this case is for text tpye 5 in mobile dev
          return (
            <Type5Widget
              color={convertStringToColor(containerText.color_for_txt_bg.background_color!) || '#4caf50'}
              width={typeof textWidth === 'string' ? parseInt(textWidth) : textWidth}
              height={typeof textHeight === 'string' ? parseInt(textHeight) : textHeight}
            >
              <span style={getTextStyles(containerText, containerWidth, containerHeight)}>
                {renderText(containerText.text)}
              </span>
            </Type5Widget>
          );
        case 5:
          // this case is for type 3 from mobile dev
          return (
            <Type3Widget
              color={convertStringToColor(containerText.color_for_txt_bg.background_color!) || '#0000ff'}
              width={typeof textWidth === 'string' ? parseInt(textWidth) : textWidth}
              height={typeof textHeight === 'string' ? parseInt(textHeight) : textHeight}
            >
              <span style={getTextStyles(containerText, containerWidth, containerHeight)}>
                {renderText(containerText.text)}
              </span>
            </Type3Widget>
          );
        case 6:
          // this case is for type 7 from mobile dev
          return <Type7Widget
            containerText={containerText}
            width={typeof textWidth === 'string' ? parseInt(textWidth) : textWidth}
            height={typeof textHeight === 'string' ? parseInt(textHeight) : textHeight}
            color={convertStringToColor(containerText.color_for_txt_bg?.background_color!) || "#ffeb3b"}

          />;
        case 7:
          // this case is for type 9 from mobile dev
          return (
            <Type9Widget
              color={convertStringToColor(containerText.color_for_txt_bg?.background_color!) || "#ff5722"}
              width={typeof textWidth === 'string' ? parseInt(textWidth) : textWidth}
              height={typeof textHeight === 'string' ? parseInt(textHeight) : textHeight}
            >
              <span style={getTextStyles(containerText, containerWidth, containerHeight)}>
                {renderText(containerText.text)}
              </span>
            </Type9Widget>
          );
        case 8:
          // this case is for type 10 from mobile dev
          return (
            <Type10Widget
              color={convertStringToColor(containerText.color_for_txt_bg?.background_color!) || "#ffeb3b"}
              width={typeof textWidth === 'string' ? parseInt(textWidth) : textWidth}
              height={typeof textHeight === 'string' ? parseInt(textHeight) : textHeight}
            >
              <span style={getTextStyles(containerText, containerWidth, containerHeight)}>
                {renderText(containerText.text)}
              </span>
            </Type10Widget>
          );
        case 9:
          // this case is for type 2 from mobile dev
          return (
            <Type2Widget
              color={convertStringToColor(containerText.color_for_txt_bg?.background_color!) || "#00bcd4"}
              width={typeof textWidth === 'string' ? parseInt(textWidth) : textWidth}
              height={typeof textHeight === 'string' ? parseInt(textHeight) : textHeight}
            >
              <span style={getTextStyles(containerText, containerWidth, containerHeight)}>
                {renderText(containerText.text)}
              </span>
            </Type2Widget>
          );
        default:
          // this case is for type 1 from mobile dev
          return (
            <Type1Widget
              color={convertStringToColor(containerText.color_for_txt_bg?.background_color!) || "#4000FF"}
              textColor={convertStringToColor(containerText.color_for_txt_bg?.text_color!) || "#FFFF00"}
              width={typeof textWidth === 'string' ? parseInt(textWidth) : textWidth}
              height={typeof textHeight === 'string' ? parseInt(textHeight) : textHeight}
            >
              <span style={{
                ...getTextStyles(containerText, containerWidth, containerHeight),
              }}>
                {renderText(containerText.text)}
              </span>
            </Type1Widget>
          );
      }
    };

    const icon = renderIcon(containerText);

    // For container-based rendering, use a simpler structure
    if (useContainerLogic) {
      return (
        <div
          className="w-full h-full"
          style={{
            position: 'relative',
            zIndex: 10,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon && (
            <div style={{ marginBottom: '2px', display: 'flex', alignItems: 'center' }}>
              {icon}
            </div>
          )}

          {!icon && containerText.text && (
            <div
              style={{
                borderRadius: `${containerText.radius ?? 10}px`,
                backgroundColor: containerText.color_for_txt_bg?.background_color
                  ? convertStringToColor(containerText.color_for_txt_bg.background_color)
                  : 'transparent',
                border: containerText.isBorder ? '1px solid' : 'none',
                padding: '2px',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={getTextStyles(containerText, containerWidth, containerHeight)}>
                {renderText(containerText.text)}
              </span>
            </div>
          )}
        </div>
      );
    }

    // Original rendering for backward compatibility
    return (
      <div
        style={{
          position: 'absolute',
          top: `${finalTop}px`,
          left: `${finalLeft}px`,
          width: typeof textWidth === 'string' ? textWidth : `${textWidth}px`,
          height: typeof textHeight === 'string' ? textHeight : `${textHeight}px`,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon && (
          <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
            {icon}
          </div>
        )}

        {!icon && containerText.text && (
          <div
            style={{
              borderRadius: `${containerText.radius ?? 10}px`,
              backgroundColor: containerText.color_for_txt_bg?.background_color
                ? convertStringToColor(containerText.color_for_txt_bg.background_color)
                : 'transparent',
              border: containerText.isBorder ? '1px solid' : 'none',
              padding: '5px',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={getTextStyles(containerText, parentWidth)}>
              {renderText(containerText.text)}
            </span>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.index === nextProps.index &&
      prevProps.currentIndex === nextProps.currentIndex &&
      prevProps.currentVideoIndex === nextProps.currentVideoIndex &&
      prevProps.parentWidth === nextProps.parentWidth &&
      prevProps.containerWidth === nextProps.containerWidth &&
      prevProps.containerHeight === nextProps.containerHeight &&
      JSON.stringify(prevProps.allText) === JSON.stringify(nextProps.allText)
    );
  }
);

TextWidget.displayName = 'TextWidget';
export default TextWidget;


function getTextStyles(containerText: ContainerText, containerWidth?: number, containerHeight?: number): React.CSSProperties {
  const appConfig = new AppConfig();

  let fontSize = appConfig.deviceWidth(containerText.font_size || 14, canvasWidth);

  if (containerWidth && containerHeight) {
    fontSize = fontSize * (containerWidth / 100);
  }

  return {
    fontFamily: containerText.txtFamily || 'Arial',
    color: convertStringToColor(containerText.color_for_txt_bg?.text_color!) || "green",
    fontSize: `${fontSize}px`,
    fontWeight: 'bold', // Make text bold for better visibility
    textShadow: containerText.txtShadow ? `0px 0px 10px ${convertStringToColor(containerText.txtShadow)}` : '0 1px 1px rgba(0,0,0,0.15)',
    whiteSpace: containerWidth ? 'normal' : 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    padding: containerWidth && containerHeight ? '2px' : '4px',
    boxSizing: 'border-box',
    lineHeight: containerWidth && containerHeight ? '1.1' : '1.2',
  };
}

interface Type7WidgetProps {
  containerText: ContainerText;
  width: number;
  color: string;
  height: number;
}

const Type7Widget: React.FC<Type7WidgetProps> = ({
  containerText,
  width,
  color,
  height,
}) => {

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
        viewBox='0 0 130 70'
        width={width} height={height}>
        <path d="M0 0 C1.98 0.99 1.98 0.99 4 2 C4.99 2 5.98 2 7 2 C7.33 1.34 7.66 0.68 8 0 C8.5775 0.33 9.155 0.66 9.75 1 C12.19883862 2.27075898 12.19883862 2.27075898 16 2 C16 1.34 16 0.68 16 0 C16.598125 0.33 17.19625 0.66 17.8125 1 C20.05386471 2.20787988 20.05386471 2.20787988 23 2 C23.99 1.34 24.98 0.68 26 0 C27.32 0.99 28.64 1.98 30 3 C30.45375 2.505 30.9075 2.01 31.375 1.5 C33 0 33 0 35 0 C35 0.66 35 1.32 35 2 C39.04622502 2.36980013 39.04622502 2.36980013 42 0 C43.32 0.99 44.64 1.98 46 3 C46.99 2.01 47.98 1.02 49 0 C49.928125 0.495 49.928125 0.495 50.875 1 C52.91018344 2.14193235 52.91018344 2.14193235 55 2 C56.34882408 1.36525925 57.6846659 0.70151152 59 0 C59.99 0.99 60.98 1.98 62 3 C62.99 2.67 63.98 2.34 65 2 C65 1.34 65 0.68 65 0 C65.598125 0.33 66.19625 0.66 66.8125 1 C69.05386471 2.20787988 69.05386471 2.20787988 72 2 C72.99 1.34 73.98 0.68 75 0 C76.32 0.99 77.64 1.98 79 3 C79.66 2.01 80.32 1.02 81 0 C81.598125 0.33 82.19625 0.66 82.8125 1 C85.05386471 2.20787988 85.05386471 2.20787988 88 2 C88.99 1.34 89.98 0.68 91 0 C92.32 0.99 93.64 1.98 95 3 C95.99 2.01 96.98 1.02 98 0 C98.61875 0.33 99.2375 0.66 99.875 1 C101.91018344 2.14193235 101.91018344 2.14193235 104 2 C104.99 1.34 105.98 0.68 107 0 C107.598125 0.515625 108.19625 1.03125 108.8125 1.5625 C109.8953125 2.2740625 109.8953125 2.2740625 111 3 C111.99 2.67 112.98 2.34 114 2 C114 1.34 114 0.68 114 0 C115.36125 0.556875 115.36125 0.556875 116.75 1.125 C119.88097015 2.30359299 119.88097015 2.30359299 122.375 1.125 C122.91125 0.75375 123.4475 0.3825 124 0 C124.99 0.99 125.98 1.98 127 3 C127.99 2.67 128.98 2.34 130 2 C130 1.34 130 0.68 130 0 C133.875 1.875 133.875 1.875 135 3 C137.32817964 3.36760731 139.6618385 3.70241581 142 4 C141.835 4.598125 141.67 5.19625 141.5 5.8125 C140.8885876 8.11344336 140.8885876 8.11344336 141 11 C141 13.66666667 141 16.33333333 141 19 C141.20625 19.680625 141.4125 20.36125 141.625 21.0625 C142 23 142 23 140 26 C140.37125 26.5775 140.7425 27.155 141.125 27.75 C142 30 142 30 141.125 32.25 C140.568125 33.11625 140.568125 33.11625 140 34 C140.66 34.66 141.32 35.32 142 36 C141.6875 37.875 141.6875 37.875 141 40 C140.814375 40.7425 140.62875 41.485 140.4375 42.25 C140.293125 42.8275 140.14875 43.405 140 44 C140.66 44 141.32 44 142 44 C141.835 44.5775 141.67 45.155 141.5 45.75 C140.8530923 48.66108467 140.75495075 51.19133747 141.625 54.0625 C142 56 142 56 140 59 C140.99 60.98 140.99 60.98 142 63 C95.14 63 48.28 63 0 63 C0 42.21 0 21.42 0 0 Z " fill={color} transform="translate(4,5)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {containerText.text && <span style={{ color: convertStringToColor(containerText.color_for_txt_bg.text_color!) }}>{containerText.text}</span>}
      </div>
    </div >
  );
};

class BrushStrokeEffectPainter {
  private readonly color: string;
  private readonly numberOfLines: number;

  constructor(color: string, numberOfLines: number) {
    this.color = color;
    this.numberOfLines = numberOfLines;
  }

  paint(ctx: CanvasRenderingContext2D, size: { width: number; height: number }) {
    ctx.clearRect(0, 0, size.width, size.height);

    const path = new Path2D();
    ctx.fillStyle = this.color;

    path.moveTo(0, 0);
    path.lineTo(size.width, 0);
    this.addManualGrooves(path, { x: size.width, y: 0 }, size.height, true);
    path.lineTo(0, size.height);
    this.addManualGrooves(path, { x: 0, y: size.height }, size.height, false);

    ctx.fill(path);
  }

  private addManualGrooves(
    path: Path2D,
    start: { x: number; y: number },
    length: number,
    rightSide: boolean
  ) {
    const baseGrooveDepths = [
      5, -5, -15, -25, -25, 20, 0, 5, 12, 12, 20, 25, 18, 10, 15, 5, 20, 10, -10, -20, 10,
    ];

    let grooveDepths: number[] = [];
    for (let i = 0; i < this.numberOfLines; i++) {
      grooveDepths = grooveDepths.concat(baseGrooveDepths);
    }

    const segmentLength = length / grooveDepths.length;
    let totalLengthCovered = 0;

    for (const element of grooveDepths) {
      const segmentStart = totalLengthCovered;
      const midPoint = segmentStart + segmentLength / 2;
      const segmentEnd = segmentStart + segmentLength;
      const depth = element;

      const midPointOffset = {
        x: start.x + (rightSide ? depth : -depth),
        y: start.y + midPoint,
      };

      const segmentEndOffset = {
        x: start.x,
        y: start.y + segmentEnd,
      };

      path.quadraticCurveTo(midPointOffset.x, midPointOffset.y, segmentEndOffset.x, segmentEndOffset.y);
      totalLengthCovered += segmentLength;
    }
  }
}

interface Type5WidgetProps {
  color: string;
  width: number;
  height: number;
  children?: React.ReactNode;
}

const Type5Widget: React.FC<Type5WidgetProps> = ({
  color,
  width,
  height,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = color;

        // Function to draw a circle
        const drawCircle = (centerX: number, centerY: number, radius: number) => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        };

        // Calculate base dimensions for the cloud shape
        // Increase the base radius to make the cloud larger
        const baseRadius = Math.min(width, height) * 0.5; // Increased from 0.4 to 0.5

        // Position multiple overlapping circles to create the cloud-like shape
        // Based on the image, we need 3 overlapping circles arranged horizontally
        // Spread the circles out more to create a wider cloud
        const circles = [
          { x: width * 0.25, y: height / 2, radius: baseRadius },   // Left circle (moved further left)
          { x: width * 0.5, y: height / 2, radius: baseRadius * 1.1 },  // Middle circle (made larger)
          { x: width * 0.75, y: height / 2, radius: baseRadius }    // Right circle (moved further right)
        ];

        // Draw the circles
        circles.forEach(circle => {
          drawCircle(circle.x, circle.y, circle.radius);
        });

        // Add subtle highlights to give it more dimension
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';

        // Small highlight on the top-left of the left circle
        drawCircle(circles[0].x - baseRadius * 0.3, circles[0].y - baseRadius * 0.3, baseRadius * 0.2);

        // Small highlight on the top-middle
        drawCircle(circles[1].x - baseRadius * 0.2, circles[1].y - baseRadius * 0.2, baseRadius * 0.25);
      }
    }
  }, [color, width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};
interface Type3WidgetProps {
  color: string;
  width: number;
  height: number;
  children?: React.ReactNode;
}

const Type3Widget: React.FC<Type3WidgetProps> = ({
  color,
  width,
  height,
  children,
}) => {


  return (
    <div style={{ position: 'relative', width, height }}>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
        viewBox='0 0 130 50'
        width={width} height={height}>
        <path d="M0 0 C3.96670899 0.44074544 6.68811135 1.82361603 10 4 C10.556875 3.319375 11.11375 2.63875 11.6875 1.9375 C14 0 14 0 16.4375 0.0625 C19.21206633 1.07758524 21.53450143 2.37981523 24 4 C24.556875 3.319375 25.11375 2.63875 25.6875 1.9375 C28 0 28 0 30.5625 0.0625 C33.076023 1.02923961 34.30143878 1.94384695 36 4 C38.46800047 2.84826645 40.04783565 1.95216435 42 0 C45.84177074 0.30329769 48.09427672 1.52475424 51 4 C51.556875 3.34 52.11375 2.68 52.6875 2 C55 0 55 0 57.4375 -0.5 C60.78324793 0.15282886 62.51564068 1.72858576 65 4 C65.556875 3.34 66.11375 2.68 66.6875 2 C69 -0 69 -0 71.5625 -0.4375 C74.43385963 0.07787224 75.0378708 0.95256084 77 3 C78.32 3 79.64 3 81 3 C81 2.34 81 1.68 81 1 C84.465 0.505 84.465 0.505 88 0 C88 0.66 88 1.32 88 2 C92.7897321 2.23428313 92.7897321 2.23428313 97 0 C98.67654729 0.27942455 100.34259285 0.62331656 102 1 C104.33203812 1.0777346 106.66839059 1.08967728 109 1 C109.33 0.67 109.66 0.34 110 0 C112.5 -0.125 112.5 -0.125 115 0 C115.495 0.495 115.495 0.495 116 1 C119.5 1.16666667 119.5 1.16666667 123 1 C123.33 0.67 123.66 0.34 124 0 C126.5 -0.125 126.5 -0.125 129 0 C129.33 0.33 129.66 0.66 130 1 C132.32817964 1.36760731 134.6618385 1.70241581 137 2 C136.649375 2.598125 136.29875 3.19625 135.9375 3.8125 C134.66695302 6.10813214 134.66695302 6.10813214 136 9 C131.05 9.495 131.05 9.495 126 10 C126 10.66 126 11.32 126 12 C128.64 12.33 131.28 12.66 134 13 C134.33 14.65 134.66 16.3 135 18 C134.34 18 133.68 18 133 18 C133 18.66 133 19.32 133 20 C129.04 20.33 125.08 20.66 121 21 C125.29 21.33 129.58 21.66 134 22 C133.01 25.465 133.01 25.465 132 29 C129.03 29.495 129.03 29.495 126 30 C126 30.66 126 31.32 126 32 C127.093125 31.979375 128.18625 31.95875 129.3125 31.9375 C133 32 133 32 136 33 C136 33.66 136 34.32 136 35 C134.68 35 133.36 35 132 35 C132 35.66 132 36.32 132 37 C132.99 37.33 133.98 37.66 135 38 C134.67 38.99 134.34 39.98 134 41 C134.87914688 43.6569191 134.87914688 43.6569191 136 46 C132.535 46.495 132.535 46.495 129 47 C129 47.66 129 48.32 129 49 C131.97 49.495 131.97 49.495 135 50 C135.99088067 53.08273985 135.92482533 54.91724891 135 58 C135 58.66 135 59.32 135 60 C117.17196223 60.02333619 99.34392841 60.04098273 81.51587868 60.05181217 C73.23844518 60.05697359 64.96102116 60.06401338 56.68359375 60.07543945 C49.47095972 60.08539097 42.25833255 60.09185455 35.04569185 60.09408849 C31.22488644 60.0953948 27.40410067 60.09847564 23.58330154 60.10573006 C19.98993139 60.11249764 16.39658904 60.11461545 12.80321312 60.11310768 C10.84981813 60.11351566 8.89642619 60.11890703 6.94303894 60.12442017 C5.78755051 60.1230455 4.63206207 60.12167084 3.44155884 60.12025452 C2.43311731 60.12117631 1.42467579 60.1220981 0.38567543 60.12304783 C-2 60 -2 60 -4 59 C-4 58.01 -4 57.02 -4 56 C-2.515 55.505 -2.515 55.505 -1 55 C-1.99 54.34 -2.98 53.68 -4 53 C-4 52.01 -4 51.02 -4 50 C-2.68 50 -1.36 50 0 50 C0 49.34 0 48.68 0 48 C-1.32 48 -2.64 48 -4 48 C-3.625 46.0625 -3.625 46.0625 -3 44 C-2.01 43.505 -2.01 43.505 -1 43 C-1.99 42.67 -2.98 42.34 -4 42 C-4 41.01 -4 40.02 -4 39 C-2.515 38.505 -2.515 38.505 -1 38 C-1.99 37.34 -2.98 36.68 -4 36 C-3.67 35.01 -3.34 34.02 -3 33 C-2.01 33 -1.02 33 0 33 C0 32.34 0 31.68 0 31 C-1.32 31 -2.64 31 -4 31 C-4 30.01 -4 29.02 -4 28 C-3.01 27.34 -2.02 26.68 -1 26 C-1.99 25.67 -2.98 25.34 -4 25 C-3.505 23.515 -3.505 23.515 -3 22 C-2.34 21.67 -1.68 21.34 -1 21 C-1.99 20.34 -2.98 19.68 -4 19 C-3.505 17.515 -3.505 17.515 -3 16 C-2.34 15.67 -1.68 15.34 -1 15 C-1.99 14.67 -2.98 14.34 -4 14 C-4 13.01 -4 12.02 -4 11 C-3.01 10.67 -2.02 10.34 -1 10 C-1.99 9.34 -2.98 8.68 -4 8 C-3.67 7.01 -3.34 6.02 -3 5 C-2.01 5 -1.02 5 0 5 C-0.2784375 4.0409375 -0.2784375 4.0409375 -0.5625 3.0625 C-0.706875 2.381875 -0.85125 1.70125 -1 1 C-0.67 0.67 -0.34 0.34 0 0 Z M95 4 C95 4.33 95 4.66 95 5 C97.64 5 100.28 5 103 5 C103 4.67 103 4.34 103 4 C100.36 4 97.72 4 95 4 Z M109 4 C109 4.33 109 4.66 109 5 C111.64 5 114.28 5 117 5 C117 4.67 117 4.34 117 4 C114.36 4 111.72 4 109 4 Z M122 4 C122 4.33 122 4.66 122 5 C124.97 5 127.94 5 131 5 C131 4.67 131 4.34 131 4 C128.03 4 125.06 4 122 4 Z M82 15 C82 15.33 82 15.66 82 16 C95.2 16 108.4 16 122 16 C122 15.67 122 15.34 122 15 C108.8 15 95.6 15 82 15 Z M91 23 C91 23.33 91 23.66 91 24 C98.26 24 105.52 24 113 24 C113 23.67 113 23.34 113 23 C105.74 23 98.48 23 91 23 Z M114 23 C114 23.33 114 23.66 114 24 C118.29 24 122.58 24 127 24 C127 23.67 127 23.34 127 23 C122.71 23 118.42 23 114 23 Z M107 38 C107 38.33 107 38.66 107 39 C108.65 39 110.3 39 112 39 C112 38.67 112 38.34 112 38 C110.35 38 108.7 38 107 38 Z M84 40 C84 40.33 84 40.66 84 41 C95.55 41 107.1 41 119 41 C119 40.67 119 40.34 119 40 C107.45 40 95.9 40 84 40 Z M76 43 C76 43.33 76 43.66 76 44 C94.15 44 112.3 44 131 44 C131 43.67 131 43.34 131 43 C112.85 43 94.7 43 76 43 Z M73 46 C73 46.33 73 46.66 73 47 C83.89 47 94.78 47 106 47 C106 46.67 106 46.34 106 46 C95.11 46 84.22 46 73 46 Z M94 49 C94 49.33 94 49.66 94 50 C105.55 50 117.1 50 129 50 C129 49.67 129 49.34 129 49 C117.45 49 105.9 49 94 49 Z M87 51 C87 51.33 87 51.66 87 52 C96.24 52 105.48 52 115 52 C115 51.67 115 51.34 115 51 C105.76 51 96.52 51 87 51 Z M117 51 C117 51.33 117 51.66 117 52 C121.95 52 126.9 52 132 52 C132 51.67 132 51.34 132 51 C127.05 51 122.1 51 117 51 Z " fill={color} transform="translate(8,4)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};
interface Type2WidgetProps {
  color: string;
  width: number;
  height: number;
  children?: React.ReactNode;
}

const Type2Widget: React.FC<Type2WidgetProps> = ({
  color,
  width,
  height,
  children,
}) => {

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
        viewBox='0 0 140 70'
        width={width} height={height}>
        <path d="M0 0 C0 0.66 0 1.32 0 2 C0.99 1.34 1.98 0.68 3 0 C3.99 0 4.98 0 6 0 C6.495 1.485 6.495 1.485 7 3 C9.00016466 4.20882096 9.00016466 4.20882096 11 5 C11 4.01 11 3.02 11 2 C19.57142857 1.71428571 19.57142857 1.71428571 23 4 C23.33 3.34 23.66 2.68 24 2 C34.06373576 -0.25920599 46.21862808 0.94332128 56 4 C56.33 3.34 56.66 2.68 57 2 C61.75 3.875 61.75 3.875 64 5 C64 4.01 64 3.02 64 2 C66.64 1.67 69.28 1.34 72 1 C72 1.66 72 2.32 72 3 C73.65 3.33 75.3 3.66 77 4 C77 3.34 77 2.68 77 2 C85.03501094 0.54704595 85.03501094 0.54704595 89.0625 2.4375 C89.701875 2.953125 90.34125 3.46875 91 4 C91 3.34 91 2.68 91 2 C93.90600261 0.74335022 95.79604584 0 99 0 C99.99 3.465 99.99 3.465 101 7 C100.01 7.33 99.02 7.66 98 8 C98.495 8.928125 98.99 9.85625 99.5 10.8125 C101 14 101 14 101 17 C100.34 17.33 99.68 17.66 99 18 C98.80185739 24.08408472 98.80185739 24.08408472 100 30 C99.34 30 98.68 30 98 30 C98.495 30.61875 98.99 31.2375 99.5 31.875 C101 34 101 34 101 36 C100.01 36 99.02 36 98 36 C98 36.99 98 37.98 98 39 C98.66 39 99.32 39 100 39 C100.33 40.32 100.66 41.64 101 43 C100.01 43.33 99.02 43.66 98 44 C98.33 44.33 98.66 44.66 99 45 C98.979375 45.969375 98.95875 46.93875 98.9375 47.9375 C98.64862426 51.11031214 98.64862426 51.11031214 101 53 C101 53.99 101 54.98 101 56 C100.34 56 99.68 56 99 56 C99 59.3 99 62.6 99 66 C98.34 66 97.68 66 97 66 C96.67 66.99 96.34 67.98 96 69 C88.25 68.125 88.25 68.125 86 67 C85.505 68.485 85.505 68.485 85 70 C82.36 70 79.72 70 77 70 C77 69.34 77 68.68 77 68 C75.0412957 68.14076315 73.08303907 68.2877676 71.125 68.4375 C70.03445312 68.51871094 68.94390625 68.59992188 67.8203125 68.68359375 C65.05271029 68.83001703 65.05271029 68.83001703 63 70 C61.00039988 70.039992 58.99952758 70.04346799 57 70 C57 69.34 57 68.68 57 68 C55.2984375 68.2784375 55.2984375 68.2784375 53.5625 68.5625 C50.34970117 68.98329135 47.57764696 68.90511908 44.375 68.4375 C40.3268407 67.88579175 37.87774793 68.65465888 34 70 C30.65870266 70.22479676 27.33942696 70.27042441 24 70 C23.67 69.67 23.34 69.34 23 69 C21.6302983 68.93756292 20.25746512 68.9404764 18.88671875 68.97265625 C18.05076172 68.98490234 17.21480469 68.99714844 16.35351562 69.00976562 C14.58780396 69.04469179 12.82216793 69.08369967 11.05664062 69.12695312 C9.7969043 69.14338867 9.7969043 69.14338867 8.51171875 69.16015625 C7.35869263 69.18541382 7.35869263 69.18541382 6.18237305 69.21118164 C3.7218032 68.97307974 2.17467039 68.12852537 0 67 C-1.6777567 67.27206865 -3.34450469 67.61500109 -5 68 C-7.3329866 68.04022391 -9.66706666 68.04320247 -12 68 C-12.99 68 -13.98 68 -15 68 C-16.423125 67.7215625 -16.423125 67.7215625 -17.875 67.4375 C-20.97128919 67.00401951 -22.99090937 67.33131319 -26 68 C-26.66 67.67 -27.32 67.34 -28 67 C-28.495 67.99 -28.495 67.99 -29 69 C-31.64860427 69.59355614 -34.29197322 69.74209269 -37 70 C-36.814375 69.360625 -36.62875 68.72125 -36.4375 68.0625 C-36.293125 67.381875 -36.14875 66.70125 -36 66 C-36.33 65.67 -36.66 65.34 -37 65 C-37.03145807 62.70356092 -36.9319221 60.42349871 -36.83984375 58.12890625 C-36.78376056 55.78152676 -36.78376056 55.78152676 -39 54 C-39 53.01 -39 52.02 -39 51 C-38.01 50.505 -38.01 50.505 -37 50 C-37.66 48.35 -38.32 46.7 -39 45 C-38.01 44.34 -37.02 43.68 -36 43 C-36.2475 41.8553125 -36.2475 41.8553125 -36.5 40.6875 C-37 38 -37 38 -37 35 C-37.66 34.67 -38.32 34.34 -39 34 C-39 33.34 -39 32.68 -39 32 C-38.01 31.67 -37.02 31.34 -36 31 C-36.33 30.67 -36.66 30.34 -37 30 C-37.07357767 27.01274655 -37.09225006 24.04894809 -37.0625 21.0625 C-37.05798828 20.22525391 -37.05347656 19.38800781 -37.04882812 18.52539062 C-37.04007689 16.97142135 -37.02928417 15.4174614 -37.01586914 13.86352539 C-37.00490263 12.57571942 -37 11.28785266 -37 10 C-37.66 9.67 -38.32 9.34 -39 9 C-39 6.69 -39 4.38 -39 2 C-35.89591193 1.94192957 -32.7919636 1.90638086 -29.6875 1.875 C-28.80642578 1.85824219 -27.92535156 1.84148438 -27.01757812 1.82421875 C-26.17001953 1.81777344 -25.32246094 1.81132813 -24.44921875 1.8046875 C-23.27879028 1.78897705 -23.27879028 1.78897705 -22.0847168 1.77294922 C-20 2 -20 2 -17 4 C-16.67 3.34 -16.34 2.68 -16 2 C-13.78515625 1.62109375 -13.78515625 1.62109375 -11.0625 1.4375 C-7.09844079 1.15801957 -3.94501733 0 0 0 Z " fill={color} transform="translate(43,2)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};
interface Type9WidgetProps {
  color: string;
  width: number;
  height: number;
  children?: React.ReactNode;
}

const Type9Widget: React.FC<Type3WidgetProps> = ({
  color,
  width,
  height,
  children,
}) => {

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
        viewBox='0 0 130 40'
        width={width} height={height}>
        <path d="M0 0 C0.28875 1.11375 0.5775 2.2275 0.875 3.375 C1.69241329 7.00291092 1.69241329 7.00291092 4 9 C4.04125 8.443125 4.0825 7.88625 4.125 7.3125 C5.48977108 3.705605 7.91080176 2.26961504 11 0 C11.66 0 12.32 0 13 0 C13.28875 1.11375 13.5775 2.2275 13.875 3.375 C14.69241329 7.00291092 14.69241329 7.00291092 17 9 C17.2475 8.2575 17.495 7.515 17.75 6.75 C19.1135157 3.75026545 20.45872215 2.07922733 23 0 C23.99 0 24.98 0 26 0 C26.28875 1.11375 26.5775 2.2275 26.875 3.375 C27.69241329 7.00291092 27.69241329 7.00291092 30 9 C30.04125 8.443125 30.0825 7.88625 30.125 7.3125 C31.48977108 3.705605 33.91080176 2.26961504 37 0 C37.66 0 38.32 0 39 0 C39.28875 1.134375 39.5775 2.26875 39.875 3.4375 C40.24625 4.613125 40.6175 5.78875 41 7 C41.66 7.33 42.32 7.66 43 8 C43.433125 7.236875 43.86625 6.47375 44.3125 5.6875 C45.75275799 3.39375579 46.89000295 1.67041433 49 0 C49.99 0 50.98 0 52 0 C52.28875 1.11375 52.5775 2.2275 52.875 3.375 C53.69241329 7.00291092 53.69241329 7.00291092 56 9 C56.04125 8.443125 56.0825 7.88625 56.125 7.3125 C57.48977108 3.705605 59.91080176 2.26961504 63 0 C63.66 0 64.32 0 65 0 C65.28875 1.11375 65.5775 2.2275 65.875 3.375 C66.69241329 7.00291092 66.69241329 7.00291092 69 9 C69.37125 7.88625 69.37125 7.88625 69.75 6.75 C71.1135157 3.75026545 72.45872215 2.07922733 75 0 C75.99 0 76.98 0 78 0 C78.28875 1.11375 78.5775 2.2275 78.875 3.375 C79.69241329 7.00291092 79.69241329 7.00291092 82 9 C82.04125 8.443125 82.0825 7.88625 82.125 7.3125 C83.48977108 3.705605 85.91080176 2.26961504 89 0 C89.66 0 90.32 0 91 0 C91.103125 0.94875 91.20625 1.8975 91.3125 2.875 C91.68539295 6.29107501 91.68539295 6.29107501 95 8 C95.433125 7.236875 95.86625 6.47375 96.3125 5.6875 C97.75275799 3.39375579 98.89000295 1.67041433 101 0 C101.99 0 102.98 0 104 0 C104.28875 1.11375 104.5775 2.2275 104.875 3.375 C105.69241329 7.00291092 105.69241329 7.00291092 108 9 C108.04125 8.443125 108.0825 7.88625 108.125 7.3125 C109.48977108 3.705605 111.91080176 2.26961504 115 0 C115.66 0 116.32 0 117 0 C117.0825 0.78375 117.165 1.5675 117.25 2.375 C117.72806339 5.14749104 117.72806339 5.14749104 120.0625 6.3125 C120.701875 6.539375 121.34125 6.76625 122 7 C122 7.66 122 8.32 122 9 C120.02 9.33 118.04 9.66 116 10 C117.98 10.99 119.96 11.98 122 13 C122 13.66 122 14.32 122 15 C120.35 15.33 118.7 15.66 117 16 C118.65 16.66 120.3 17.32 122 18 C122 18.66 122 19.32 122 20 C119.03 20.495 119.03 20.495 116 21 C117.98 21.99 119.96 22.98 122 24 C122 24.66 122 25.32 122 26 C120.35 26.33 118.7 26.66 117 27 C118.65 27.66 120.3 28.32 122 29 C122 29.99 122 30.98 122 32 C120.68 32.33 119.36 32.66 118 33 C119.32 33.66 120.64 34.32 122 35 C122 35.66 122 36.32 122 37 C119.525 37.495 119.525 37.495 117 38 C119.475 39.485 119.475 39.485 122 41 C121.67 41.66 121.34 42.32 121 43 C119.35 43 117.7 43 116 43 C117.98 43.99 119.96 44.98 122 46 C122 46.66 122 47.32 122 48 C119.525 48.495 119.525 48.495 117 49 C117.825 49.45375 118.65 49.9075 119.5 50.375 C120.325 50.91125 121.15 51.4475 122 52 C122 52.66 122 53.32 122 54 C120.68 54.33 119.36 54.66 118 55 C119.32 55.66 120.64 56.32 122 57 C122 57.66 122 58.32 122 59 C119.03 59.495 119.03 59.495 116 60 C116.33 60.99 116.66 61.98 117 63 C114.6875 65.5 114.6875 65.5 112 68 C111.01 68 110.02 68 109 68 C108.896875 66.906875 108.79375 65.81375 108.6875 64.6875 C108.02692273 61.14440371 107.7972908 60.06756277 105 58 C104.773125 58.721875 104.54625 59.44375 104.3125 60.1875 C102.73664872 63.56432417 100.79123384 65.55767039 98 68 C97.34 68 96.68 68 96 68 C95.896875 66.906875 95.79375 65.81375 95.6875 64.6875 C95.02692273 61.14440371 94.7972908 60.06756277 92 58 C91.773125 58.721875 91.54625 59.44375 91.3125 60.1875 C89.73664872 63.56432417 87.79123384 65.55767039 85 68 C84.34 68 83.68 68 83 68 C82.9175 66.906875 82.835 65.81375 82.75 64.6875 C82.36310791 60.96723336 82.36310791 60.96723336 79.9375 59.0625 C79.298125 58.711875 78.65875 58.36125 78 58 C77.938125 58.721875 77.87625 59.44375 77.8125 60.1875 C76.7446249 63.88399074 74.89180184 65.53138868 72 68 C71.34 68 70.68 68 70 68 C69.896875 66.906875 69.79375 65.81375 69.6875 64.6875 C69.02692273 61.14440371 68.7972908 60.06756277 66 58 C65.773125 58.721875 65.54625 59.44375 65.3125 60.1875 C63.73664872 63.56432417 61.79123384 65.55767039 59 68 C58.34 68 57.68 68 57 68 C56.9175 66.906875 56.835 65.81375 56.75 64.6875 C56.36310791 60.96723336 56.36310791 60.96723336 53.9375 59.0625 C53.298125 58.711875 52.65875 58.36125 52 58 C51.938125 58.721875 51.87625 59.44375 51.8125 60.1875 C50.7446249 63.88399074 48.89180184 65.53138868 46 68 C45.34 68 44.68 68 44 68 C43.8453125 66.3603125 43.8453125 66.3603125 43.6875 64.6875 C43.02692273 61.14440371 42.7972908 60.06756277 40 58 C39.814375 58.721875 39.62875 59.44375 39.4375 60.1875 C37.46665159 64.04350775 34.60201985 65.73669876 31 68 C30.87625 66.88625 30.7525 65.7725 30.625 64.625 C30.3534187 60.96896323 30.3534187 60.96896323 28 59 C27.52949219 59.56589844 27.05898438 60.13179687 26.57421875 60.71484375 C25.95160156 61.44832031 25.32898437 62.18179688 24.6875 62.9375 C24.07261719 63.66839844 23.45773438 64.39929688 22.82421875 65.15234375 C21 67 21 67 18 68 C17.8453125 66.3603125 17.8453125 66.3603125 17.6875 64.6875 C17.02692273 61.14440371 16.7972908 60.06756277 14 58 C13.9071875 58.86625 13.9071875 58.86625 13.8125 59.75 C12.6812921 62.88257571 10.62052199 64.03460851 8 66 C7.67 66.66 7.34 67.32 7 68 C6.34 68 5.68 68 5 68 C4.896875 66.906875 4.79375 65.81375 4.6875 64.6875 C4.02692273 61.14440371 3.7972908 60.06756277 1 58 C0.773125 58.721875 0.54625 59.44375 0.3125 60.1875 C-1.26335128 63.56432417 -3.20876616 65.55767039 -6 68 C-6.66 68 -7.32 68 -8 68 C-8.33 65.69 -8.66 63.38 -9 61 C-11.97 61.495 -11.97 61.495 -15 62 C-15 60.68 -15 59.36 -15 58 C-16.65 57.67 -18.3 57.34 -20 57 C-20 56.34 -20 55.68 -20 55 C-16.535 54.505 -16.535 54.505 -13 54 C-16.465 52.515 -16.465 52.515 -20 51 C-20 50.34 -20 49.68 -20 49 C-17.525 48.505 -17.525 48.505 -15 48 C-15.825 47.54625 -16.65 47.0925 -17.5 46.625 C-18.325 46.08875 -19.15 45.5525 -20 45 C-20 44.34 -20 43.68 -20 43 C-18.02 42.505 -18.02 42.505 -16 42 C-17.32 41.34 -18.64 40.68 -20 40 C-20 39.34 -20 38.68 -20 38 C-17.03 37.505 -17.03 37.505 -14 37 C-15.98 36.01 -17.96 35.02 -20 34 C-19.67 33.34 -19.34 32.68 -19 32 C-17.35 32 -15.7 32 -14 32 C-15.98 31.01 -17.96 30.02 -20 29 C-20 28.34 -20 27.68 -20 27 C-18.35 26.67 -16.7 26.34 -15 26 C-17.475 25.01 -17.475 25.01 -20 24 C-20 23.34 -20 22.68 -20 22 C-18.02 21.67 -16.04 21.34 -14 21 C-15.98 20.01 -17.96 19.02 -20 18 C-20 17.34 -20 16.68 -20 16 C-18.02 15.67 -16.04 15.34 -14 15 C-15.98 14.01 -17.96 13.02 -20 12 C-20 11.34 -20 10.68 -20 10 C-18.35 9.67 -16.7 9.34 -15 9 C-17.475 8.01 -17.475 8.01 -20 7 C-20 6.34 -20 5.68 -20 5 C-14.97745369 4.7045561 -12.10457614 5.01485372 -8 8 C-7.9175 7.4225 -7.835 6.845 -7.75 6.25 C-6.39368324 2.18104973 -4.31919078 0 0 0 Z " fill={color} transform="translate(22,0)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface Type10WidgetProps {
  color: string;
  width: number;
  height: number;
  children?: React.ReactNode;
}

const Type10Widget: React.FC<Type10WidgetProps> = ({
  color,
  width,
  height,
  children,
}) => {

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
        viewBox='0 0 130 40'
        width={width} height={height}>
        <path d="M0 0 C1.44921875 1.52734375 1.44921875 1.52734375 2.9375 3.4375 C4.99309154 6.00830374 5.91998423 6.9633261 9 8.375 C12.57668228 7.92791471 12.84485101 7.34138571 15 4.625 C15.49371094 3.98175781 15.98742188 3.33851562 16.49609375 2.67578125 C18 1 18 1 21.0625 -0.1875 C24.93388258 0.05960953 26.28584803 1.28584803 29 4 C30.8125 6.25 30.8125 6.25 32 8 C34.9079227 7.91188113 36.59427918 7.38446437 38.71484375 5.375 C39.30394531 4.735625 39.89304687 4.09625 40.5 3.4375 C43.69015581 0.08852691 43.69015581 0.08852691 46.625 -0.75 C50.66842604 0.52687138 52.91660088 3.6457511 55.5 6.875 C57.00438445 8.22936138 57.00438445 8.22936138 59.375 8.0625 C62.29954495 7.12459759 62.29954495 7.12459759 64.4375 4 C67 1 67 1 70 -0.1875 C73 0 73 0 75.6875 2.25 C76.97337232 3.77914546 78.25189846 5.31487308 79.5 6.875 C80.98844375 8.20801257 80.98844375 8.20801257 83.25 8.125 C86.24533617 6.8996352 87.2541711 5.75261088 89.375 3.375 C92.5199393 0.02360954 92.5199393 0.02360954 96.8125 -0.1875 C100 1 100 1 101.125 3 C101.41375 3.66 101.7025 4.32 102 5 C104.55519921 5.81171228 104.55519921 5.81171228 107 6 C106.67 7.32 106.34 8.64 106 10 C103.36 10.66 100.72 11.32 98 12 C98 12.66 98 13.32 98 14 C100.64 14.66 103.28 15.32 106 16 C106 17.32 106 18.64 106 20 C103.69 20.99 101.38 21.98 99 23 C99.5775 23.28875 100.155 23.5775 100.75 23.875 C102.83333333 24.91666667 104.91666667 25.95833333 107 27 C107 27.99 107 28.98 107 30 C104.36 31.32 101.72 32.64 99 34 C101.64 35.32 104.28 36.64 107 38 C106.67 38.99 106.34 39.98 106 41 C102.4375 42.6875 102.4375 42.6875 99 44 C101.64 45.32 104.28 46.64 107 48 C105 52 105 52 101.875 53.25 C100.92625 53.4975 99.9775 53.745 99 54 C99.99 55.98 99.99 55.98 101 58 C60.41 58 19.82 58 -22 58 C-22 57.34 -22 56.68 -22 56 C-20.02 55.505 -20.02 55.505 -18 55 C-20.64 53.68 -23.28 52.36 -26 51 C-25.67 49.68 -25.34 48.36 -25 47 C-22.69 46.34 -20.38 45.68 -18 45 C-18 44.34 -18 43.68 -18 43 C-18.94875 42.855625 -19.8975 42.71125 -20.875 42.5625 C-24 42 -24 42 -26 41 C-26 39.68 -26 38.36 -26 37 C-23.09399739 35.74335022 -21.20395416 35 -18 35 C-19.62366466 31.75267068 -22.75387839 31.29844864 -26 30 C-25.875 28.125 -25.875 28.125 -25 26 C-22 24.875 -22 24.875 -19 24 C-18.67 23.34 -18.34 22.68 -18 22 C-18.94875 21.855625 -19.8975 21.71125 -20.875 21.5625 C-24 21 -24 21 -26 20 C-25.67 18.68 -25.34 17.36 -25 16 C-22.69 15.34 -20.38 14.68 -18 14 C-19.62366466 10.75267068 -22.75387839 10.29844864 -26 9 C-25.67 7.68 -25.34 6.36 -25 5 C-23.25 4.25 -23.25 4.25 -21 4 C-20.360625 4.66 -19.72125 5.32 -19.0625 6 C-17.18616821 8.25865788 -17.18616821 8.25865788 -14.5625 8.125 C-10.89992156 6.51703874 -9.43638523 4.16071597 -7 1 C-4.26760135 -0.36619933 -3.04371875 -0.55340341 0 0 Z " fill={color} transform="translate(26,4)" />
        <path d="M0 0 C0.99 0.33 1.98 0.66 3 1 C3 2.98 3 4.96 3 7 C2.01 7.33 1.02 7.66 0 8 C-0.66 7.67 -1.32 7.34 -2 7 C-2 5.02 -2 3.04 -2 1 C-1.34 0.67 -0.68 0.34 0 0 Z " fill="#FEFEFE" transform="translate(136,39)" />
        <path d="M0 0 C1.32 0 2.64 0 4 0 C4 2.31 4 4.62 4 7 C2.35 6.67 0.7 6.34 -1 6 C-1.042721 4.33388095 -1.04063832 2.66617115 -1 1 C-0.67 0.67 -0.34 0.34 0 0 Z " fill="#FEFEFE" transform="translate(135,50)" />
        <path d="M0 0 C2.0625 0.4375 2.0625 0.4375 4 1 C4 2.98 4 4.96 4 7 C2.35 6.67 0.7 6.34 -1 6 C-1.042721 4.33388095 -1.04063832 2.66617115 -1 1 C-0.67 0.67 -0.34 0.34 0 0 Z " fill="#FEFEFE" transform="translate(135,29)" />
        <path d="M0 0 C1.32 0 2.64 0 4 0 C4 1.98 4 3.96 4 6 C3.01 6.33 2.02 6.66 1 7 C0.34 6.67 -0.32 6.34 -1 6 C-1.042721 4.33388095 -1.04063832 2.66617115 -1 1 C-0.67 0.67 -0.34 0.34 0 0 Z " fill="#FEFEFE" transform="translate(135,19)" />
        <path d="M0 0 C0.99 0 1.98 0 3 0 C3 2.31 3 4.62 3 7 C1.35 6.67 -0.3 6.34 -2 6 C-1.125 1.125 -1.125 1.125 0 0 Z " fill="#FBFBFB" transform="translate(136,8)" />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface Type1WidgetProps {
  color: string;
  textColor?: string; // Only keeping the original props
  width: number;
  height: number;
  text?: string;
  children?: React.ReactNode;
}

const Type1Widget: React.FC<Type1WidgetProps> = ({
  color,
  textColor = "#FFFF00", // Keeping yellow as default but using original prop structure
  width,
  height,
  text,
  children,
}) => {

  return (
    <div style={{ position: 'relative', width, height }}>

      <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 130 40"
        width={width} height={height}>
        <path d="M0 0 C41.58 0 83.16 0 126 0 C126 0.99 126 1.98 126 3 C125.01 3.33 124.02 3.66 123 4 C123 5.65 123 7.3 123 9 C122.01 9.33 121.02 9.66 120 10 C120 10.66 120 11.32 120 12 C121.15628906 12.09087891 121.15628906 12.09087891 122.3359375 12.18359375 C123.33882812 12.26738281 124.34171875 12.35117187 125.375 12.4375 C126.87160156 12.55931641 126.87160156 12.55931641 128.3984375 12.68359375 C131 13 131 13 133 14 C133 14.66 133 15.32 133 16 C130.03 16 127.06 16 124 16 C124 16.99 124 17.98 124 19 C124.66 19 125.32 19 126 19 C126 19.99 126 20.98 126 22 C126.99 22 127.98 22 129 22 C129 23.65 129 25.3 129 27 C130.32 27.33 131.64 27.66 133 28 C133 28.66 133 29.32 133 30 C133.66 30 134.32 30 135 30 C135 30.66 135 31.32 135 32 C134.01 32 133.02 32 132 32 C132 32.99 132 33.98 132 35 C130.68 35.33 129.36 35.66 128 36 C128 36.66 128 37.32 128 38 C128.99 38 129.98 38 131 38 C130.67 38.99 130.34 39.98 130 41 C128.68 41 127.36 41 126 41 C126 41.66 126 42.32 126 43 C128.31 43.33 130.62 43.66 133 44 C133 44.66 133 45.32 133 46 C130.525 46.495 130.525 46.495 128 47 C128 47.66 128 48.32 128 49 C126.2984375 49.433125 126.2984375 49.433125 124.5625 49.875 C123.386875 50.24625 122.21125 50.6175 121 51 C120.505 51.99 120.505 51.99 120 53 C122.64 53.33 125.28 53.66 128 54 C128 54.99 128 55.98 128 57 C86.42 57 44.84 57 2 57 C2 56.01 2 55.02 2 54 C3.98 53.505 3.98 53.505 6 53 C6.33 50.36 6.66 47.72 7 45 C3.04 44.34 -0.92 43.68 -5 43 C-5 42.34 -5 41.68 -5 41 C-2.03 41 0.94 41 4 41 C4 40.01 4 39.02 4 38 C3.34 38 2.68 38 2 38 C0.375 36.75 0.375 36.75 -1 35 C-1 33.68 -1 32.36 -1 31 C-1.99 30.67 -2.98 30.34 -4 30 C-4 29.34 -4 28.68 -4 28 C-4.99 27.67 -5.98 27.34 -7 27 C-7 26.34 -7 25.68 -7 25 C-6.01 24.67 -5.02 24.34 -4 24 C-4 23.34 -4 22.68 -4 22 C-2.68 21.34 -1.36 20.68 0 20 C-0.66 19.67 -1.32 19.34 -2 19 C-1.67 18.01 -1.34 17.02 -1 16 C0.32 16 1.64 16 3 16 C3 15.34 3 14.68 3 14 C2.05125 14.020625 1.1025 14.04125 0.125 14.0625 C-3 14 -3 14 -5 13 C-5 12.34 -5 11.68 -5 11 C-3.35 11 -1.7 11 0 11 C0 10.01 0 9.02 0 8 C0.763125 7.71125 1.52625 7.4225 2.3125 7.125 C5.15029308 6.03730987 5.15029308 6.03730987 8 4 C5.36 3.67 2.72 3.34 0 3 C0 2.01 0 1.02 0 0 Z " fill={color} />
      </svg>
      {children && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            color: textColor,
            fontWeight: 'bold',
            fontSize: `${Math.min(height * 0.6, width * 0.12)}px`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
