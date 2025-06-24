// Import the necessary interfaces
import { CommonColorPickervariables } from './colorpickervariables';
import { OnAction } from './onaction';

export interface LinkModel {
  link: string;
  label?: string;
  imgUrl?: string;
  linkAlignment?: string;
  isSelected: boolean;
  colorPickervariables: CommonColorPickervariables;
  onAction: OnAction;
  height?: number;
  width?: number;
  top?: number;
  left?: number;
  rotation: number;
  fontsize: number;
  startingTime: number;
  endingTime: number;
  albumeModelId: string;
  isShow?: boolean;
  id?: number;
  type?: number;
  radius?: number;
  bgShadow?: string;
  txtShadow?: string;
  borderColor?: string;
  isBorder?: boolean;
  txt?: string;
  txtFamily?: string;
  btnAlignment?: string;
  isForHotspot?: number;
}
