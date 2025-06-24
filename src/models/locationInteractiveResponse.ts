import { OnAction } from "./onaction";
import { CommonColorPickervariables } from "./colorpickervariables";

export interface LocationInteractiveResponse {
    link: string;
    label: string;
    image_url: string | null;
    link_alignment: string | null;
    is_selected: boolean;
    color_for_txt_bg: CommonColorPickervariables;
    on_action: OnAction;
    height: number;
    width: number;
    top: number;
    left: number;
    rotation: number;
    font_size: number;
    starting_time: number;
    ending_time: number;
    album_model_id: string;
    is_show: boolean | null;
    id: number | null;
    type: string | null;
    radius: number | null;
    background_shadow: string | null;
    text_shadow: string | null;
    border_color: string | null;
    is_border: boolean | null;
    text: string | null;
    text_family: string;
    btn_alignment: string | null;
    isForHotspot: boolean | null;
}