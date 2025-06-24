import { OnAction } from "./onaction";
import { CommonColorPickervariables } from "./colorpickervariables";

export interface LinkInteractiveResponse {
    album_model_id: string;
    background_shadow: string;
    border_color: string;
    btn_alignment: string;
    color_for_txt_bg: CommonColorPickervariables;
    ending_time: number;
    font_size: number;
    height: number;
    id: number;
    image_type: number;
    isForHotspot: number;
    img_path: string;
    is_border: boolean;
    is_selected: boolean;
    is_show: boolean | null;
    label: string;
    left: number;
    link: string;
    link_alignment: string
    medium_type: string;
    on_action: OnAction;
    radius: number;
    rotation: number;
    starting_time: number;
    text: string;
    text_family: string | null;
    text_shadow: string;
    top: number;
    video_id: string;
    type: number;
    width: number;
}


export function LinkInteractiveResponseJson(json: any): LinkInteractiveResponse {
    return {
        album_model_id: json.album_model_id,
        background_shadow: json.bgShadow,
        border_color: json.borderColor,
        btn_alignment: json.btnAlignment,
        color_for_txt_bg: json.colorPickervariables as CommonColorPickervariables,
        ending_time: json.endingTime,
        font_size: json.fontSize,
        is_border: json.isBorder,
        isForHotspot: json.isForHotspot,
        label: json.label,
        link: json.link,
        link_alignment: json.linkAlignment,
        radius: json.radius,
        text_shadow: json.txtShadow,
        height: json.height,
        id: json.id,
        image_type: json.imageType,
        img_path: json.imgPath,
        is_selected: json.isSelected,
        is_show: json.isShow,
        left: json.left,
        medium_type: json.mediumType,
        on_action: json.onAction as OnAction,
        rotation: json.rotation,
        starting_time: json.startingTime,
        text: json.text,
        text_family: json.textFamily,
        top: json.top,
        type: json.type,
        video_id: json.videoId,
        width: json.width
    }
}