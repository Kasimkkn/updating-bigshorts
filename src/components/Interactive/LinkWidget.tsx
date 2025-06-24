import { AppConfig } from '@/config/appConfig';
import { canvasHeight, canvasWidth } from '@/constants/interactivityConstants';
import { LinkInteractiveResponse } from '@/models/linkInteractiveResonse';
import { PostlistItem } from '@/models/postlistResponse';
import { VideoList } from '@/models/videolist';
import Link from 'next/link';
import React from 'react';


export interface LinkProps {
    i: number;
    currentTime?: number;
    updateCurrentIndex?: (time: number, indexOflink: number, type: number) => void;
    videoDuration?: number;
    currentIndex?: number;
    currentVideoIndex?: number;
    forHomeTrendingList?: boolean;
    postListDataModel?: PostlistItem;
    allLinks: LinkInteractiveResponse[];
    listOfVideosData?: VideoList[];
    playPauseController?: React.Dispatch<React.SetStateAction<boolean>>;
    goToPosition?: (time: number) => void;
}

const LinkWidget: React.FC<LinkProps> = React.memo(
    function LinkWidget({
        i,
        currentTime,
        updateCurrentIndex,
        videoDuration,
        currentIndex,
        currentVideoIndex,
        forHomeTrendingList = false,
        postListDataModel,
        allLinks,
        listOfVideosData,
        playPauseController,
        goToPosition,
    }) {
        const parentWidth = canvasWidth;
        const parentHeight = canvasHeight;
        const link = allLinks[i];
        const appConfig = new AppConfig();
        const top = link.top ? link.top : 0;
        const left = link.left ? link.left + 30 : 30; // Adding 30px to left

        // Calculate the top and left positions based on parent size
        const calculatedTop = appConfig.deviceHeight(top, parentHeight);
        const calculatedLeft = appConfig.deviceWidth(left, parentWidth);

        // Calculate the link dimensions
        const linkWidth = appConfig.deviceWidth(link.width || 0, parentWidth);
        const linkHeight = appConfig.deviceHeight(link.height || 0, parentHeight);

        // Adjust the position to ensure the link does not overflow the parent
        const { top: finalTop, left: finalLeft } = appConfig.checkPosition(
            calculatedTop,
            calculatedLeft,
            linkWidth,
            linkHeight,
            parentWidth,
            parentHeight
        );


        const handlelinkClick = async () => {
            if (!link.on_action || link.on_action == null) {
                return;
            }
            if (link.on_action.link_url == null && link.on_action.video_path !== null) {
                let index = link.on_action.id_of_video_list!
                updateCurrentIndex!(index, i, 1)
            } else if (link.on_action.link_url !== null && link.on_action.video_path == null) {
                window.open(link.on_action.link_url, '_blank');
            }
            else {
                return
            }
        };

        const renderlinkContent = (link: LinkInteractiveResponse) => {
            switch (link.type) {
                case 1:
                    return (
                        <canvas
                            style={{
                                width: `${linkWidth}px`,
                                height: `${linkHeight}px`,
                                background: `${link.color_for_txt_bg.background_color ? convertStringToColor(link.color_for_txt_bg.background_color) : 'transparent'}`,
                            }}
                            ref={(canvas) => {
                                if (canvas) {
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) {
                                        const painter = new BrushStrokeEffectPainter(`${convertStringToColor(link.color_for_txt_bg.background_color!)}`, 5);
                                        painter.paint(ctx, {
                                            width: linkWidth,
                                            height: linkHeight,
                                        });

                                        ctx.fillStyle = `${convertStringToColor(link.color_for_txt_bg.text_color!)}`; // Set the text color
                                        ctx.font = `${link.font_size ? link.font_size : 50}px ${link.text_family}`; // Set the font size and family
                                        ctx.textAlign = 'center'; // Center align the text
                                        ctx.textBaseline = 'middle'; // Middle align the text vertically

                                        // Calculate the center position for the text
                                        const textX = canvas.width / 2;
                                        const textY = canvas.height / 2;

                                        ctx.fillText(link.text || '', textX, textY);
                                    }
                                }
                            }}
                        />
                    );

                case 2:
                    return (
                        <div
                            style={{
                                position: 'relative',
                                width: 'max-content',
                                height: `${linkHeight}px`,
                                borderRadius: `${7}px`,
                                border: `${5}px solid ${convertStringToColor(link.color_for_txt_bg.background_color!)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxSizing: 'border-box',
                                padding: '5px',
                                overflow: 'hidden',
                                zIndex: 1,
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${5}px`,
                                    left: `${5}px`,
                                    right: `${5}px`,
                                    bottom: `${5}px`,
                                    borderRadius: `${7 - 5}px`,
                                    border: `${1}px solid ${convertStringToColor(link.color_for_txt_bg.background_color!)}`,
                                    boxSizing: 'border-box',
                                    padding: '5px',
                                }}
                            ></div>
                            <span
                                style={{
                                    color: convertStringToColor(link.color_for_txt_bg.text_color!) || 'black',
                                    fontFamily: link.text_family ? link.text_family : 'Arial',
                                }}
                            >
                                {link.text}
                            </span>
                        </div>
                    );

                case 5:
                    return (
                        <div
                            style={{
                                position: 'relative',
                                width: 'max-content',
                                height: `${linkHeight}px`,
                                borderRadius: `${8}px`,
                                background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0)),
                           linear-gradient(to top, ${convertStringToColor(link.color_for_txt_bg.background_color!)}, rgba(0, 0, 0, 0.5))`,
                                boxShadow: `0px ${6}px ${6}px rgba(0, 0, 0, 0.5)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxSizing: 'border-box',
                                overflow: 'hidden',
                                padding: '5px',
                                zIndex: 1,
                            }}
                        >
                            <span
                                style={{
                                    color: convertStringToColor(link.color_for_txt_bg.text_color!) || 'black',
                                    fontFamily: link.text_family || 'Arial',
                                }}
                            >
                                {link.text}
                            </span>
                        </div>
                    );

                case 7:
                    return (
                        <div
                            style={{
                                position: 'relative',
                                width: 'max-content',
                                height: `${linkHeight}px`,
                                borderRadius: `${8}px`,
                                background: `linear-gradient(to bottom right, 
                ${convertStringToColor(link.color_for_txt_bg.background_color!)}, 
                ${convertStringToColor(link.color_for_txt_bg.background_color!)} 70%, 
                rgba(255,255,255,0.7))`,
                                boxShadow: `0px ${4}px ${4}px rgba(0, 0, 0, 0.5)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxSizing: 'border-box',
                                padding: '5px',
                                overflow: 'hidden',
                                zIndex: 1,
                            }}
                        >
                            <span
                                style={{
                                    color: convertStringToColor(link.color_for_txt_bg.text_color!),
                                    fontFamily: link.text_family || 'Arial',
                                }}
                            >
                                {link.text}
                            </span>
                        </div>
                    );

                default:
                    if (!link.link || !link.label || !link.on_action) return;
                    return (
                        <div>
                            <Simplelink
                                height={linkHeight}
                                width={linkWidth}
                                radius={link.radius}
                                textColor={convertStringToColor(link.color_for_txt_bg.text_color!)}
                                borderColor={convertStringToColor(link.border_color)}
                                text={link.label}
                                backgroundColor={convertStringToColor(link.color_for_txt_bg.background_color!)}
                                link={link.link}
                                fontsize={link.font_size ? link.font_size : 20}
                                fontFamily={link.text_family ? link.text_family : 'Arial'}
                                textShadowColor={link.background_shadow}
                                top={0}
                                left={0}
                            />
                        </div>
                    );
            }
        };

        return (
            <div
                style={{
                    position: 'absolute',
                    top: `${finalTop}px`,
                    left: `${finalLeft}px`,
                    cursor: 'pointer',
                    zIndex: 10,
                    pointerEvents: 'auto',
                    transform: 'translate(-50%, -50%)',
                }}
                onClick={() => {
                    if (link.on_action.video_path !== null) {
                        handlelinkClick();
                    }
                }}
            >
                {renderlinkContent(link)}
            </div>
        );
    }, (prevProps, nextProps) => {
        return (
            prevProps.i === nextProps.i &&
            prevProps.videoDuration === nextProps.videoDuration &&
            prevProps.currentIndex === nextProps.currentIndex &&
            prevProps.currentTime === nextProps.currentTime &&
            prevProps.currentVideoIndex === nextProps.currentVideoIndex &&
            JSON.stringify(prevProps.allLinks) === JSON.stringify(nextProps.allLinks)
        );
    });

LinkWidget.displayName = 'LinkWidget';
export default LinkWidget;

class BrushStrokeEffectPainter {
    private readonly color: string;
    private readonly numberOfLines: number;

    constructor(color: string, numberOfLines: number) {
        this.color = color;
        this.numberOfLines = numberOfLines;
    }

    paint(ctx: CanvasRenderingContext2D, size: { width: number; height: number }) {
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

            path.quadraticCurveTo(controlX, currentY + segmentLength / 2, start.x, nextY);
            currentY = nextY;
        });
    }
}


interface SimpleLinkProps {
    height: number | string;
    width: number | string;
    radius: number;
    textColor: string;
    borderColor: string;
    backgroundColor?: string;
    text?: string;
    link?: string;
    fontsize?: number;
    fontFamily?: string;
    textShadowColor?: string;
    top?: number;
    left?: number;
}

const Simplelink: React.FC<SimpleLinkProps> = ({
    height,
    width,
    radius,
    textColor,
    borderColor,
    backgroundColor,
    text,
    link,
    fontsize = 16,
    fontFamily = 'Arial',
    textShadowColor,
    top,
    left,
}) => {

    return (
        <div
            style={{
                height: `${typeof height === 'string' ? height : height}px`,
                width: `${typeof width === 'string' ? width : width}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: `${radius}px`,
                border: `2px solid ${borderColor}`,
                backgroundColor: backgroundColor || 'transparent',
                position: 'relative',
                overflow: 'hidden',
                top: `${top || 0}px`,
                left: `${left || 0}px`,
            }}
        >
            <Link
                href={link!}
                target='_blank'
                style={{
                    textAlign: 'center',
                    fontSize: `${fontsize + 10}px`,
                    fontFamily: fontFamily || 'Arial',
                    fontWeight: 600,
                    color: textColor,
                    textShadow: `0px 0px 10px ${textShadowColor}`,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    padding: '0',
                    margin: '0',
                    display: 'inline-block',
                }}
            >
                {text}
            </Link>
        </div>
    );
};

/**
 * Converts a hex string to a Color object.
 * @param color - The hex string representing the color.
 * @returns A string representing the RGB color value.
 */
function convertStringToColor(color: string | undefined): string {
    if (!color || color.trim() === '') {
        return 'transparent'; // Default to transparent if color is empty or undefined
    }

    // Remove the "0x" prefix if it exists and take the last 6 characters (ignoring the alpha value)
    const colorString = color.replace('0x', '').slice(2);

    // Add the "#" prefix to make it a valid CSS color
    return `#${colorString}`;
}
