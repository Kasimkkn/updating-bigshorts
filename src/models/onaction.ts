export interface OnAction {
  id_of_video_list?: number;
  video_path?: string | null;
  ios_streaming_url?: string | null;
  android_streaming_url?: string | null;
  link_url?: string | null;
  starting_time?: string | null;
  ending_time?: string | null;
  skip_time_on_same_video?: number | null;
  linked_post_id?: number | null;
  linked_flix_id?: number | null;
}
