export interface CommonColorPickervariables {
  background_color?: string | null; // Optional background color.
  background_color_hsv_hue?: number;       // Changed to snake_case for consistency.
  background_color_hsv_saturation?: number; // Changed to snake_case for consistency.
  background_color_hsv_value?: number;      // Changed to snake_case for consistency.
  background_color_hsv_alpha?: number;      // Changed to snake_case for consistency.
  text_color: string | null;         // Required text color.
  text_color_hsv_hue?: number;       // Changed to snake_case for consistency.
  text_color_hsv_saturation?: number; // Changed to snake_case for consistency.
  text_color_hsv_value?: number;     // Changed to snake_case for consistency.
  text_color_hsv_alpha?: number;     // Changed to snake_case for consistency.
}