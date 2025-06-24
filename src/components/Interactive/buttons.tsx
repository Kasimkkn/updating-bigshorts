import { AppConfig } from "@/config/appConfig";
import { canvasHeight, canvasWidth } from "@/constants/interactivityConstants";
import { SingleButtons } from "@/models/designofbuttons";
import { PostlistItem } from "@/models/postlistResponse";
import { VideoList } from "@/models/videolist";
import { convertStringToColor } from "@/utils/features";
import React, { useMemo } from "react";

export interface ButtonProps {
  i: number;
  currentTime: number;
  updateCurrentIndex: (
    time: number,
    indexOfButton: number,
    type: number
  ) => void;
  videoDuration?: number;
  currentIndex: number;
  currentVideoIndex: number;
  forHomeTrendingList?: boolean;
  postListDataModel: PostlistItem;
  allButtons: SingleButtons[];
  listOfVideosData: VideoList[];
  playPauseController: React.Dispatch<React.SetStateAction<boolean>> | (() => void);
  goToPosition: (time: number) => void | (() => void);
  parentHeight?: number;
  parentWidth?: number;
  containerWidth?: number; // Added prop for container width percentage
  containerHeight?: number; // Added prop for container height percentage
  navigateToLinkedContent?: (contentType: 'post' | 'flix', contentId: number) => void;
}

const ButtonWidget: React.FC<ButtonProps> = React.memo(
  function ButtonWidget({
    i,
    currentTime,
    updateCurrentIndex,
    videoDuration,
    currentIndex,
    currentVideoIndex,
    forHomeTrendingList = false,
    postListDataModel,
    allButtons,
    listOfVideosData,
    playPauseController,
    goToPosition,
    parentWidth = canvasWidth,
    containerWidth, // New prop
    containerHeight, // New prop
    navigateToLinkedContent
  }) {
    const button = allButtons[i];
    const appConfig = useMemo(() => new AppConfig(), []);
    const parentHeight = parentWidth * 16 / 9;

    // Determine if we should use container-based positioning or original calculations
    const useContainerLogic = containerWidth !== undefined && containerHeight !== undefined;

    // Only calculate these if not using container logic
    const leftAdjust = useContainerLogic ? 0 : (10 * parentWidth / 100); //10% of parent width
    const topAdjust = useContainerLogic ? 0 : (4.3 * parentHeight / 100); //4.3% of parent height

    const top = button.top ? Math.round(button.top) : 30;
    const left = button.left ? Math.round(button.left) : 30;

    const calculatedTop = useContainerLogic ? 0 : appConfig.deviceHeight(top, parentHeight) + topAdjust;
    const calculatedLeft = useContainerLogic ? 0 : appConfig.deviceWidth(left, parentWidth) + leftAdjust;

    const buttonWidth = useContainerLogic ? '100%' : appConfig.deviceWidth(button.width!, parentWidth);
    const buttonHeight = useContainerLogic ? '100%' : appConfig.deviceHeight(button.height!, parentHeight) + 10;

    // Calculate font size as a percentage of button width
    const getFontSize = () => {
      const fontSizePercentage = button.font_size || 20; // Font size as percentage value

      if (useContainerLogic) {
        // In container mode, convert container width to actual pixels first
        // containerWidth is a percentage of parentWidth
        const containerWidthPx = (containerWidth || 0) * parentWidth / 70;

        // Then apply the font size percentage to the container's actual width
        return (fontSizePercentage * containerWidthPx) / 100;
      } else {
        // In non-container mode, use the calculated button width directly
        const buttonWidthPx = typeof buttonWidth === 'string'
          ? parseInt(buttonWidth)
          : buttonWidth;

        // Apply the percentage to calculate the actual font size in pixels
        return (fontSizePercentage * buttonWidthPx) / 100;
      }
    };

    // Only apply position adjustment if not using container logic
    const { top: finalTop, left: finalLeft } = useContainerLogic
      ? { top: 0, left: 0 }
      : appConfig.checkPosition(
        calculatedTop,
        calculatedLeft,
        typeof buttonWidth === 'string' ? parseInt(buttonWidth) : buttonWidth,
        typeof buttonHeight === 'string' ? parseInt(buttonHeight) : buttonHeight,
        parentWidth,
        parentHeight
      );

      const handleButtonClick = async () => {
        if (!button.on_action || button.on_action == null) {
          return;
        } else if (button.on_action.linked_post_id) {
          // Navigate to the linked post using a dedicated handler for Snips
          // Pass the postId to a specific function rather than reusing updateCurrentIndex
          const postId = button.on_action.linked_post_id;
          navigateToLinkedContent!('post', postId);
        } else if (button.on_action.linked_flix_id) {
          // Handle linked flix id case
          const flixId = button.on_action.linked_flix_id;
          navigateToLinkedContent!('flix', flixId);
        } else if (
          button.on_action.link_url == null &&
          button.on_action.video_path !== null
        ) {
          let index = button.on_action.id_of_video_list!;
          updateCurrentIndex(index, i, 1);
        } else if (
          button.on_action.link_url !== null &&
          button.on_action.video_path == null
        ) {
          window.open(button.on_action.link_url, "_blank");
        } else {
          // Default case
        }
    };

    const renderButtonContent = (button: SingleButtons) => {
      // Calculate font size once for all button types
      const fontSize = getFontSize();

      switch (button.is_png) {
        case 0:
          return (
            <div>
              <SimpleButton
                height={buttonHeight}
                width={buttonWidth}
                radius={button.radius}
                textColor={convertStringToColor(
                  button.color_for_txt_bg.text_color!
                )}
                borderColor={convertStringToColor(button.border_color || "")}
                text={button.text}
                fontsize={fontSize}
                fontFamily={button.text_family ? button.text_family : "Arial"}
                textShadowColor={button.background_shadow || ""}
                top={useContainerLogic ? undefined : top}
                left={useContainerLogic ? undefined : left}
              />
            </div>
          );

        case 1:
          return (
            <canvas
              style={{
                width: typeof buttonWidth === 'string' ? buttonWidth : `${buttonWidth}px`,
                height: typeof buttonHeight === 'string' ? buttonHeight : `${buttonHeight}px`,
                borderRadius: `${button.radius}px`,
                background: `${button.color_for_txt_bg.background_color
                  ? convertStringToColor(
                    button.color_for_txt_bg.background_color
                  )
                  : "transparent"
                  }`,
              }}
              ref={(canvas) => {
                if (canvas) {
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    const painter = new BrushStrokeEffectPainter(
                      `${convertStringToColor(
                        button.color_for_txt_bg.background_color!
                      )}`,
                      5
                    );
                    painter.paint(ctx, {
                      width: typeof buttonWidth === 'string' ? parseInt(buttonWidth) : buttonWidth,
                      height: typeof buttonHeight === 'string' ? parseInt(buttonHeight) : buttonHeight,
                    });

                    ctx.fillStyle = `${convertStringToColor(
                      button.color_for_txt_bg.text_color!
                    )}`;
                    ctx.font = `${fontSize}px ${button.text_family || 'Arial'}`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    // Calculate the center position for the text
                    const textX = canvas.width / 2;
                    const textY = canvas.height / 2;

                    ctx.fillText(button.text || "", textX, textY);
                  }
                }
              }}
            />
          );

        case 2:
          const txtshadow = convertStringToColor(
            button.color_for_txt_bg.background_color!
          );
          return (
            <div
              style={{
                position: "relative",
                width: typeof buttonWidth === 'string' ? buttonWidth : `${buttonWidth}px`,
                height: typeof buttonHeight === 'string' ? buttonHeight : `${buttonHeight}px`,
                borderRadius: `${7}px`,
                border: `${5}px solid ${txtshadow}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                padding: "5px",
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: `${5}px`,
                  left: `${5}px`,
                  right: `${5}px`,
                  bottom: `${5}px`,
                  borderRadius: `${button.radius}px`,
                  border: `${1}px solid ${txtshadow}`,
                  boxSizing: "border-box",
                  padding: "5px",
                }}
              ></div>
              <span
                style={{
                  color:
                    convertStringToColor(button.color_for_txt_bg.text_color!) ||
                    "black",
                  fontFamily: button.text_family ? button.text_family : "Arial",
                  fontSize: `${fontSize}px`,
                }}
              >
                {button.text}
              </span>
            </div>
          );

        case 5:
          return (
            <div
              style={{
                position: "relative",
                width: typeof buttonWidth === 'string' ? buttonWidth : `${buttonWidth}px`,
                height: typeof buttonHeight === 'string' ? buttonHeight : `${buttonHeight}px`,
                borderRadius: `${8}px`,
                background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0)),
                           linear-gradient(to top, ${convertStringToColor(button.color_for_txt_bg.background_color!)}, rgba(0, 0, 0, 0.5))`,
                boxShadow: `0px ${6}px ${6}px rgba(0, 0, 0, 0.5)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                overflow: "hidden",
                padding: "5px",
                zIndex: 1,
              }}
            >
              <span
                style={{
                  color:
                    convertStringToColor(button.color_for_txt_bg.text_color!) ||
                    "black",
                  fontFamily: button.text_family || "Arial",
                  fontSize: `${fontSize}px`,
                }}
              >
                {button.text}
              </span>
            </div>
          );

        case 7:
          return (
            <div
              style={{
                position: "relative",
                width: typeof buttonWidth === 'string' ? buttonWidth : `${buttonWidth}px`,
                height: typeof buttonHeight === 'string' ? buttonHeight : `${buttonHeight}px`,
                borderRadius: `${8}px`,
                background: `linear-gradient(to bottom right, 
                ${convertStringToColor(
                  button.color_for_txt_bg.background_color!
                )}, 
                ${convertStringToColor(
                  button.color_for_txt_bg.background_color!
                )} 70%, 
                rgba(255,255,255,0.7))`,
                boxShadow: `0px ${4}px ${4}px rgba(0, 0, 0, 0.5)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                padding: "5px",
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              <span
                style={{
                  color: convertStringToColor(
                    button.color_for_txt_bg.text_color!
                  ),
                  fontFamily: button.text_family || "Arial",
                  fontSize: `${fontSize}px`,
                }}
              >
                {button.text}
              </span>
            </div>
          );

        case 9:
          return (
            <DoubleBorderButton
              height={buttonHeight}
              width={buttonWidth}
              radius={25}
              textColor={convertStringToColor(
                button.color_for_txt_bg.text_color!
              )}
              borderColor="black"
              backgroundColor={convertStringToColor(
                button.color_for_txt_bg.background_color!
              )}
              shadowColor={convertStringToColor(
                button.color_for_txt_bg.background_color!
              )}
              text={button.text}
              fontsize={fontSize}
              fontFamily={button.text_family ? button.text_family : "Arial"}
            />
          );

        case 10:
          return (
            <NeonHighContrastButton
              height={buttonHeight}
              width={buttonWidth}
              radius={6}
              textColor={convertStringToColor(
                button.color_for_txt_bg.text_color!
              )}
              outerBorderColor="white"
              innerBorderColor="black"
              backgroundColor={convertStringToColor(
                button.color_for_txt_bg.background_color!
              )}
              text={button.text}
              fontsize={fontSize}
              fontFamily={button.text_family ? button.text_family : "Arial"}
            />
          );

        case 12:
          return (
            <GlossyButton
              height={buttonHeight}
              width={buttonWidth}
              radius={30}
              textColor={convertStringToColor(
                button.color_for_txt_bg.text_color!
              )}
              backgroundColor={convertStringToColor(
                button.color_for_txt_bg.background_color!
              )}
              text={button.text}
              fontsize={fontSize}
              fontFamily={button.text_family ? button.text_family : "Arial"}
            />
          );

        default:
          return (
            <SimpleButton
              height={buttonHeight}
              width={buttonWidth}
              radius={button.radius || 5}
              textColor={convertStringToColor(
                button.color_for_txt_bg?.text_color || "white"
              )}
              borderColor={convertStringToColor(button.border_color || "transparent")}
              text={button.text}
              fontsize={fontSize}
              fontFamily={button.text_family ? button.text_family : "Arial"}
            />
          );
      }
    };

    // For container-based rendering, use a simpler structure
    if (useContainerLogic) {
      return (
        <div
          className="w-full h-full"
          onClick={handleButtonClick}
          style={{
            position: 'relative',
            cursor: 'pointer',
            zIndex: 10,
            pointerEvents: 'auto',
            overflow: 'hidden',
          }}
        >
          {renderButtonContent(button)}
        </div>
      );
    }

    // Original rendering for backward compatibility
    return (
      <div
        style={{
          position: "absolute",
          top: `${finalTop}px`,
          left: `${finalLeft}px`,
          cursor: "pointer",
          zIndex: 10,
          width: typeof buttonWidth === 'string' ? buttonWidth : `${buttonWidth}px`,
          height: typeof buttonHeight === 'string' ? buttonHeight : `${buttonHeight}px`,
          pointerEvents: "auto",
        }}
        onClick={handleButtonClick}
      >
        {renderButtonContent(button)}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Memoization: Avoid re-render if these props have not changed
    return (
      prevProps.i === nextProps.i &&
      prevProps.videoDuration === nextProps.videoDuration &&
      prevProps.currentIndex === nextProps.currentIndex &&
      prevProps.currentTime === nextProps.currentTime &&
      prevProps.currentVideoIndex === nextProps.currentVideoIndex &&
      prevProps.containerWidth === nextProps.containerWidth &&
      prevProps.containerHeight === nextProps.containerHeight &&
      JSON.stringify(prevProps.allButtons) ===
      JSON.stringify(nextProps.allButtons)
    );
  }
);

ButtonWidget.displayName = "ButtonWidget";

export default ButtonWidget;

class BrushStrokeEffectPainter {
  private color: string;
  private numberOfLines: number;

  constructor(color: string, numberOfLines: number) {
    this.color = color;
    this.numberOfLines = numberOfLines;
  }

  paint(
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) {
    const path = new Path2D();
    ctx.fillStyle = this.color;

    // Start from the top left corner
    path.moveTo(0, size.height / 2);
    // Draw left brush stroke
    this.addBrushStroke(path, { x: 0, y: size.height / 2 }, size.height, true);

    // Draw top edge
    path.lineTo(size.width, 0);

    // Draw right brush stroke
    this.addBrushStroke(path, { x: size.width, y: 0 }, size.height, false);

    // Draw bottom edge
    path.lineTo(0, size.height);

    ctx.fill(path);
  }

  private addBrushStroke(
    path: Path2D,
    start: { x: number; y: number },
    length: number,
    isLeftSide: boolean
  ) {
    const baseStrokeDepths = [
      5, -10, -15, -25, 20, 0, 15, 12, 25, 18, 10, 5, 20, -20, 10, -5, 5, 12,
    ];

    const segmentLength = length / baseStrokeDepths.length;
    let currentY = start.y;

    baseStrokeDepths.forEach((depth, i) => {
      const nextY = currentY + segmentLength;
      const controlX = isLeftSide ? start.x + depth : start.x - depth;

      path.quadraticCurveTo(
        controlX,
        currentY + segmentLength / 2,
        start.x,
        nextY
      );
      currentY = nextY;
    });
  }
}

interface SimpleButtonProps {
  height: number | string;
  width: number | string;
  radius: number;
  textColor: string;
  borderColor: string;
  text?: string;
  child?: React.ReactNode;
  fontsize?: number;
  fontFamily?: string;
  textShadowColor?: string;
  top?: number;
  left?: number;
}

const SimpleButton: React.FC<SimpleButtonProps> = ({
  height,
  width,
  radius,
  textColor,
  borderColor,
  text,
  child,
  fontsize = 6,
  fontFamily = "Arial",
  textShadowColor,
  top,
  left,
}) => {
  return (
    <div
      style={{
        height: typeof height === "string" ? height : `${height}px`,
        width: typeof width === "string" ? width : `${width}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: `${radius || 5}px`,
        border: `2px solid ${borderColor}`,
        backgroundColor: "transparent",
        boxShadow: textShadowColor ? `0px 0px 5px 5px ${textColor}` : undefined,
        position: "relative",
        overflow: "hidden",
        padding: "5px",
        top: top ? `${top}px` : undefined,
        left: left ? `${left}px` : undefined,
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          borderRadius: `${radius}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          backdropFilter: "blur(0px)",
          overflow: "hidden",
        }}
      >
        {text ? (
          <span
            style={{
              textAlign: "center",
              fontSize: `${fontsize}px`, // Using properly calculated font size
              fontFamily: fontFamily ? fontFamily : "Arial",
              fontWeight: 600,
              color: textColor,
              textShadow: textShadowColor ? `0px 0px 10px ${textShadowColor}` : undefined,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              backgroundColor: "transparent",
              padding: "0",
              margin: "0",
              display: "inline-block",
            }}
          >
            {text}
          </span>
        ) : (
          child
        )}
      </div>
    </div>
  );
};

interface DoubleBorderButtonProps {
  height: number | string;
  width: number | string;
  radius: number;
  textColor: string;
  borderColor: string;
  backgroundColor: string;
  shadowColor: string;
  fontsize?: number;
  fontFamily?: string;
  text?: string;
  top?: number;
  left?: number;
}

const DoubleBorderButton: React.FC<DoubleBorderButtonProps> = ({
  text,
  height,
  width,
  radius,
  textColor,
  borderColor,
  backgroundColor,
  shadowColor,
  fontsize = 16,
  fontFamily = "Arial",
}) => {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        backgroundColor: backgroundColor,
        borderRadius: `${radius}px`,
        border: `3px solid ${borderColor}`,
        boxShadow: `4px 4px ${shadowColor}`,
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          textAlign: "center",
          fontSize: `${fontsize}px`, // Using pixel value
          fontFamily: fontFamily,
          fontWeight: 600,
          color: textColor,
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};

interface NeonHighContrastButtonProps {
  height: number | string;
  width: number | string;
  radius: number;
  textColor: string;
  outerBorderColor: string;
  innerBorderColor: string;
  backgroundColor: string;
  outerBorderWidth?: number;
  innerBorderWidth?: number;
  fontsize?: number;
  fontFamily?: string;
  text?: string;
  top?: number;
  left?: number;
}
const NeonHighContrastButton: React.FC<NeonHighContrastButtonProps> = ({
  text,
  height,
  width,
  radius,
  textColor,
  outerBorderColor,
  innerBorderColor,
  backgroundColor,
  outerBorderWidth = 3,
  innerBorderWidth = 1,
  fontsize = 16,
  fontFamily = "Arial",
}) => {
  const buttonWidth = typeof width === "string" ? width : `${width}px`;
  const buttonHeight = typeof height === "string" ? height : `${height}px`;

  return (
    <div
      style={{
        width: buttonWidth,
        height: buttonHeight,
        position: "relative",
        borderRadius: `${radius}px`,
        backgroundColor: backgroundColor,
        border: `${outerBorderWidth}px solid ${outerBorderColor}`,
        padding: `${innerBorderWidth}px`,
        boxSizing: "border-box",
        boxShadow: `0 0 5px ${outerBorderColor}`,
      }}
    >
      <div
        style={{
          borderRadius: `${radius - outerBorderWidth}px`,
          backgroundColor: backgroundColor,
          border: `${innerBorderWidth}px solid ${innerBorderColor}`,
          textAlign: "center",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${fontsize}px`,
          fontFamily: fontFamily,
          fontWeight: 600,
          color: textColor,
          padding: "5px"
        }}
      >
        {text}
      </div>
    </div>
  );
};

interface GlossyButtonProps {
  height: number | string;
  width: number | string;
  radius: number;
  textColor: string;
  backgroundColor: string;
  shadowOffset?: number;
  shadowBlurRadius?: number;
  fontsize?: number;
  fontFamily?: string;
  text?: string;
  top?: number;
  left?: number;
}
const GlossyButton: React.FC<GlossyButtonProps> = ({
  text,
  height,
  width,
  radius,
  textColor,
  backgroundColor,
  shadowOffset = 10,
  shadowBlurRadius = 4,
  fontsize = 16,
  fontFamily = "Arial",
}) => {
  const buttonWidth = typeof width === "string" ? width : `${width}px`;
  const buttonHeight = typeof height === "string" ? height : `${height}px`;

  return (
    <div
      style={{
        width: buttonWidth,
        height: buttonHeight,
        position: "relative",
        backgroundColor: backgroundColor,
        borderRadius: `${radius}px`,
        boxShadow: `${shadowOffset}px ${shadowOffset}px ${shadowBlurRadius}px rgba(0, 0, 0, 0.25)`,
        backgroundImage: `linear-gradient(to bottom right, ${backgroundColor}95, ${backgroundColor})`,
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: `${fontsize}px`,
          fontFamily: fontFamily,
          fontWeight: 600,
          color: textColor,
          padding: "5px"
        }}
      >
        {text}
      </div>
    </div>
  );
};