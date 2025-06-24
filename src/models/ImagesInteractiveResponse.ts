import { OnAction } from "./onaction";
import { CommonColorPickervariables } from "./colorpickervariables";

export interface ImagesInteractiveResponse {
    album_model_id?: string;
    color_for_txt_bg?: CommonColorPickervariables | null;
    ending_time?: number;
    height?: number;
    id?: number;
    image_type?: number;
    img_path?: string;
    is_selected?: boolean;
    is_show?: number | null;
    last_next_video_jump_duration?: number | null;
    left?: number;
    medium_type?: string;
    on_action?: OnAction | null;
    rotation?: number;
    starting_time?: number;
    text?: string;
    text_and_image_alignment?: string | null;
    text_family?: string | null;
    top?: number;
    video_id?: string;
    width?: number;
    is_Sticker?: boolean;
}


export function imagesInteractiveResponseFromJson(json: any): ImagesInteractiveResponse {
    return {
        album_model_id: json.album_model_id,
        color_for_txt_bg: json.colorPickervariables as CommonColorPickervariables,
        ending_time: json.endingTime,
        height: json.height,
        id: json.id,
        image_type: json.imageType,
        img_path: json.imgPath,
        is_selected: json.isSelected,
        is_show: json.isShow,
        last_next_video_jump_duration: json.lastNextVideoJumpDuration,
        left: json.left,
        medium_type: json.mediumType,
        on_action: json.onAction as OnAction,
        rotation: json.rotation,
        starting_time: json.startingTime,
        text: json.text,
        text_and_image_alignment: json.textAndImageAlignment,
        text_family: json.textFamily,
        top: json.top,
        video_id: json.videoId,
        width: json.width
    }
}