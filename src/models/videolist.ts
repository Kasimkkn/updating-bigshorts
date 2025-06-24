// Import necessary interfaces
import { CommonModel, commonModelFromJson } from './commonmodelforallfunctionality';

export interface VideoList {
  id: number;
  parent_id: number;
  path: string;
  iosStreamingUrl?: string | null;
  androidStreamingUrl?: string | null;
  duration: string;
  is_selcted: boolean;
  onVideoEnd?: string | null;
  timeOfVideElementoShow?: string | null;
  audioId?: number | null;
  audioFilePath?: string | null;
  audioName?: string | null;
  audioDuration?: string | null;
  functionality_datas?: CommonModel | null;
  postId?: number;
  video_id?: number;
  currentTime?: number;
  backdrop_gradient?: string | null;
  aspect_ratio: number;
}

// export interface VideoList {
//   id: number;
//   parent_id: number;
//   path: string;
//   ios_streaming_url?: string | null;
//   android_streaming_url?: string | null;
//   duration: string;
//   is_selcted: boolean;
//   onVideoEnd?: string | null;
//   time_of_video_element_show?: string | null;
//   audio_id?: number | null;
//   audio_file_path?: string | null;
//   audio_name?: string | null;
//   audioDuration?: string | null;
//   functionality_datas?: CommonModel | null;
//   post_id?: number;
//   video_id?: number;
//   currentTime?: number;
//   backdrop_gradient?: string | null;
//   aspect_ratio: number;
//   on_video_end?: string | null;
// }

export function homeFeedModelFromJson(str: string): VideoList[] {
  const jsonData = JSON.parse(str);
  return jsonData.map((item: any) => videoListFromJson(item));
}

export function videoListFromJson(json: any): VideoList {
  return {
    id: json.id,
    parent_id: json.parent_id,
    path: json.path,
    iosStreamingUrl: json.ios_streaming_url,
    androidStreamingUrl: json.android_streaming_url,
    duration: json.duration,
    is_selcted: json.is_selcted,
    onVideoEnd: json.on_video_end,
    timeOfVideElementoShow: json.time_of_video_element_show,
    audioId: json.audio_id,
    audioFilePath: json.audio_file_path,
    audioName: json.audio_name,
    audioDuration: json.audio_duration,
    functionality_datas: json.functionality_datas ? commonModelFromJson(json.functionality_datas) : undefined,
    postId: json.post_id,
    video_id: json.video_id,
    currentTime: json.currentTime,
    backdrop_gradient: json.backdrop_gradient,
    aspect_ratio: json.aspect_ratio
  };
}
export { commonModelFromJson };

