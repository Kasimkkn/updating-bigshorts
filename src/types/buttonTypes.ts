interface ColorForTxtBg {
    text_color: string;
    background_color: string;
    background_color_hsv_hue?: number | null;
    background_color_hsv_saturation?: number | null;
    background_color_hsv_value?: number | null;
    background_color_hsv_alpha?: number | null;
    text_color_hsv_hue?: number | null;
    text_color_hsv_saturation?: number | null;
    text_color_hsv_value?: number | null;
    text_color_hsv_alpha?: number | null;
}

interface OnAction {
    id_of_video_list: number | null; // Should be a number, not string, based on the provided JSON.
    video_path: string | null;
    ios_streaming_url?: string | null; // Added based on the mobile data structure.
    android_streaming_url?: string | null; // Added based on the mobile data structure.
    link_url: string | null;
    starting_time: number | null;
    ending_time: number | null;
    skip_time_on_same_video?: number | null; // Added for consistency.
    linked_post_id?: number | null; // Added to match the provided structure.
}

export interface ButtonModel {
    id: number;
    type: number;
    buttonval: number;
    radius: number;
    color_for_txt_bg: ColorForTxtBg;
    on_action: OnAction;
    background_shadow: string | null;
    text_shadow: string | null;
    is_border: boolean;
    is_png: number;
    border_color: string;
    text: string;
    font_size: number;
    is_selected: boolean;
    text_family: string;
    btn_alignment: string | null;
    height: number | null;
    width: number | null;
    top: number | null;
    left: number | null;
    starting_time: number;
    ending_time: number;
    album_model_id: string | null;
    isForHotspot: number;
    noOfLines: number;
    rotation?: number; // Added as it's present in the first dataset.
    last_next_video_jump_duration?: number | null; // Added based on the first dataset.
}
