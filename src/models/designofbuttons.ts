import { CommonColorPickervariables } from './colorpickervariables';
import { OnAction } from './onaction';

// Define the SingleButtons interface
export interface SingleButtons {
  id?: number;
  type: number;
  radius: number;
  buttonval?: number;
  color_for_txt_bg: CommonColorPickervariables; // Assuming this is defined elsewhere.
  on_action: OnAction; // Assuming this interface is defined similarly to your previous definition.
  background_shadow?: string | null;
  text_shadow?: string | null;
  border_color?: string | null;
  is_border: boolean; // Changed from `isBorder` to maintain naming consistency.
  text: string;
  is_selected: boolean;
  text_family?: string | null;
  btn_alignment?: string | null;
  height?: number | null;
  width?: number | null;
  font_size?: number | null; // Changed from `fontSize` to `font_size` for consistency.
  top?: number | null;
  rotation?: number | null;
  left?: number | null;
  starting_time: number;
  ending_time: number;
  album_model_id: string; // Changed from `albumeModelId` to `album_model_id` for consistency.
  is_show?: boolean | null;
  is_png?: number | null;
  isForHotspot?: number | null;
  noOfLines?: number | null;
  last_next_video_jump_duration?: number | null;
}

// Standalone function to convert JSON to SingleButtons interface
export function singleButtonsFromJson(json: any): SingleButtons {
  return {
    id: json.id,
    type: json.type,
    radius: json.radius,
    buttonval: json.buttonval,
    color_for_txt_bg: json.colorPickervariables as CommonColorPickervariables,
    on_action: json.onAction as OnAction,
    background_shadow: json.bgShadow,
    text_shadow: json.txtShadow,
    border_color: json.borderColor,
    is_border: json.isBorder,
    text: json.txt,
    is_selected: json.isSelected,
    text_family: json.txtFamily,
    btn_alignment: json.btn_alignment,
    height: json.height,
    width: json.width,
    font_size: json.fontSize,
    top: json.top,
    rotation: json.rotation,
    left: json.left,
    starting_time: json.startingTime,
    ending_time: json.endingTime,
    album_model_id: json.albumeModelId,
    is_show: json.is_show,
    is_png: json.isPng,
    isForHotspot: json.isForHotspot,
    noOfLines: json.noOfLines,
    last_next_video_jump_duration: json.lastNextVideoJumpDuration,
  };
}
