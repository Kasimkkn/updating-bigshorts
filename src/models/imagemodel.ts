// Import the necessary interfaces
import { CommonColorPickervariables } from './colorpickervariables';
import { OnAction } from './onaction';

export interface ImageModel {
  id: number;
  imgPath: string;
  videoId: string;
  mediumType?: string;
  txt: string;
  colorPickervariables: CommonColorPickervariables;
  onAction: OnAction;
  txtAndImageAlignment?: string;
  height?: number;
  width?: number;
  top?: number;
  left?: number;
  rotation: number;
  startingTime: number;
  endingTime: number;
  isSelected: boolean;
  txtFamily?: string;
  albumeModelId: string;
  isShow?: boolean;
  lastNextVideoJumpDuration?: number;
  imageType: number;
}
