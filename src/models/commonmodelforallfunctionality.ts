import { SingleButtons, singleButtonsFromJson } from './designofbuttons';
import { ImagesInteractiveResponse, imagesInteractiveResponseFromJson } from './ImagesInteractiveResponse';
import { LinkInteractiveResponse, LinkInteractiveResponseJson } from './linkInteractiveResonse';
import { SnipPlayerInSsupModel } from './snipplayerinssupmodel';
import { SsupPlayerInSsupModel } from './ssupplayerinssupmodel';
import { ContainerText, containerTextFromJson } from './textcontainerdesign';

export interface CommonModel {
  list_of_buttons: SingleButtons[];
  list_of_container_text: ContainerText[];
  list_of_images: ImagesInteractiveResponse[];
  list_of_links: LinkInteractiveResponse[];
  list_of_polls: any[];
  list_of_locations?: any[]; //add type if known
  music?: any[]; //add type if known
  ssup_share?: SsupPlayerInSsupModel | null; //add type if known
  snip_share?: SnipPlayerInSsupModel;
}

// Function to map JSON object to CommonModel interface
export function commonModelFromJson(json: any): CommonModel {
  return {
    list_of_buttons: Array.isArray(json.functionality_datas) ? json.functionality_datas.map((item: any) => singleButtonsFromJson(item)) : [],
    list_of_container_text: Array.isArray(json.list_of_container_text) ? json.functionality_datas.map((item: any) => containerTextFromJson(item)) : [],
    list_of_images: Array.isArray(json.list_of_images) ? json.functionality_datas.map((item: any) => imagesInteractiveResponseFromJson(item)) : [],
    list_of_links: Array.isArray(json.list_of_links) ? json.functionality_datas.map((item: any) => LinkInteractiveResponseJson(item)) : [],
    list_of_polls: json.list_of_polls,
    snip_share: json.snip_share ? {
      snipItem: json.snip_share.snipItem,
      positionX: json.snip_share.positionX,
      positionY: json.snip_share.positionY,
      scale: json.snip_share.scale
  } : undefined
  };
}
