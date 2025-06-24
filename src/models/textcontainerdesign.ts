import { CommonColorPickervariables } from './colorpickervariables';
import { OnAction } from './onaction';

// Interface for ContainerText
export interface ContainerText {
  type?: number;
  radius?: number;
  bgShadow?: string | null;
  txtShadow?: string | null;
  isBorder?: boolean | null;
  id?: number;
  text: string | null;
  font_size: number;
  rotation: number;
  txtFamily?: string | null;
  color_for_txt_bg: CommonColorPickervariables;
  on_action: OnAction;
  containerAlignment?: string | null;
  is_selected: boolean | null;
  height?: number;
  width?: number;
  top?: number;
  left?: number;
  starting_time: number;
  ending_time: number;
  isPng?: number | null;
  album_model_id: string | null;
  isShow?: boolean | null;
  noOfLines?: number;
  noOfLinesForCloud?: number;
  lastNextVideoJumpDuration?: number;
  text_container_style?: number;
  img_path?: string | null;
}

// Standalone function to convert JSON to ContainerText interface
export function containerTextFromJson(json: any): ContainerText {
  return {
    type: json.type,
    radius: json.radius,
    bgShadow: json.bgShadow,
    txtShadow: json.txtShadow,
    isBorder: json.isBorder,
    id: json.id,
    text: json.txt,
    font_size: json.font_size,
    rotation: json.rotation,
    txtFamily: json.txtFamily,
    color_for_txt_bg: json.colorPickervariables as CommonColorPickervariables,
    on_action: json.onAction as OnAction,
    containerAlignment: json.containerAlignment,
    is_selected: json.isSelected,
    height: json.height,
    width: json.width,
    top: json.top,
    left: json.left,
    starting_time: json.startingTime,
    ending_time: json.endingTime,
    isPng: json.isPng,
    album_model_id: json.albumeModelId,
    isShow: json.isShow,
    noOfLines: json.noOfLines,
    noOfLinesForCloud: json.noOfLinesForCloud,
    lastNextVideoJumpDuration: json.lastNextVideoJumpDuration,
    text_container_style: json.textContainerStyle,
  };
}
