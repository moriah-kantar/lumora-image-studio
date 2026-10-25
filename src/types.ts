export type ScaleMode = 'factor' | 'dimensions' | 'percentage' | 'preset';

export type ResampleAlgorithm = 'lanczos3' | 'bicubic' | 'bilinear' | 'browser' | 'pixelated';

export type OutputFormat =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/avif'
  | 'image/bmp'
  | 'image/tiff'
  | 'image/x-icon';

export type BackgroundFillType = 'solid' | 'gradient';

export interface GradientColorStop {
  id: string;
  color: string; // hex string e.g. '#ff0000'
  position: number; // 0 to 100 percentage
}

export type GradientType = 'linear' | 'radial';

export interface GradientConfig {
  id?: string;
  name?: string;
  type: GradientType;
  angle: number; // 0 to 360 degrees for linear
  stops: GradientColorStop[];
}

export interface DimensionPreset {
  id: string;
  name: string;
  category: 'Social' | 'Display' | 'Web' | 'Icon';
  width: number;
  height: number;
}

export type PresetCategory = 'Social' | 'Web' | 'Display' | 'Print' | 'Custom' | string;

export interface ImagePreset {
  id: string;
  name: string;
  description?: string;
  category: PresetCategory;
  isFavorite: boolean;
  isBuiltIn?: boolean;
  createdAt: number;
  updatedAt?: number;
  settings: {
    scaleMode: ScaleMode;
    scaleFactor: number;
    targetWidth?: number;
    targetHeight?: number;
    maintainAspectRatio: boolean;
    aspectRatio?: number;
    presetId?: string;
    algorithm: ResampleAlgorithm;
    format: OutputFormat;
    quality: number;
    backgroundColor: string;
    backgroundType?: BackgroundFillType;
    backgroundGradient?: GradientConfig;
    fillTransparency?: boolean;
    adjustments: ImageAdjustments;
  };
}

export type BwTone = 'none' | 'sepia' | 'cyanotype' | 'platinum' | 'cool' | 'warm';
export type BwToningOption = BwTone;

export interface ImageAdjustments {
  // Detail & Resampling
  sharpness: number; // 0 to 100
  clarity: number; // -100 to 100
  texture: number; // -100 to 100
  denoise: number; // 0 to 100
  dehaze: number; // -100 to 100

  // Light & Tone
  exposure: number; // -100 to 100
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  whites: number; // -100 to 100
  blacks: number; // -100 to 100

  // Color & White Balance
  temperature: number; // -100 to 100 (Cool <-> Warm)
  tint: number; // -100 to 100 (Green <-> Magenta)
  vibrance: number; // -100 to 100
  saturation: number; // -100 to 100

  // Color Balance (RGB Channels)
  colorBalanceRed: number; // -100 to 100
  colorBalanceGreen: number; // -100 to 100
  colorBalanceBlue: number; // -100 to 100

  // Black & White
  blackAndWhite: boolean;
  bwRedFilter: number; // -100 to 100
  bwGreenFilter: number; // -100 to 100
  bwBlueFilter: number; // -100 to 100
  bwTone: BwTone;

  // Effects
  vignette: number; // -100 to 100
  grain: number; // 0 to 100
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  sharpness: 0,
  clarity: 0,
  texture: 0,
  denoise: 0,
  dehaze: 0,
  exposure: 0,
  brightness: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
  colorBalanceRed: 0,
  colorBalanceGreen: 0,
  colorBalanceBlue: 0,
  blackAndWhite: false,
  bwRedFilter: 0,
  bwGreenFilter: 0,
  bwBlueFilter: 0,
  bwTone: 'none',
  vignette: 0,
  grain: 0,
};

export type AdjustmentPresetCategory =
  | 'All'
  | 'General'
  | 'Cinematic'
  | 'Portrait'
  | 'Landscape'
  | 'B&W'
  | 'Vintage'
  | 'Creative'
  | 'Custom';

export interface AdjustmentPreset {
  id: string;
  name: string;
  description?: string;
  category: AdjustmentPresetCategory;
  isFavorite: boolean;
  isBuiltIn?: boolean;
  createdAt: number;
  updatedAt?: number;
  adjustments: ImageAdjustments;
}

export interface ProcessingSettings {
  scaleMode: ScaleMode;
  scaleFactor: number; // 0.1 to 8.0
  targetWidth: number;
  targetHeight: number;
  maintainAspectRatio: boolean;
  aspectRatio: number;
  presetId?: string;
  algorithm: ResampleAlgorithm;
  format: OutputFormat;
  quality: number; // 0.05 to 1.0
  backgroundColor: string; // for jpeg fallback / solid fill
  backgroundType?: BackgroundFillType; // 'solid' | 'gradient'
  backgroundGradient?: GradientConfig; // gradient configuration
  fillTransparency?: boolean; // fill transparent areas in PNG/WebP (always on for JPEG)
  adjustments: ImageAdjustments;
}

export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  type: string;
  hasAlpha: boolean;
}

export interface ProcessedResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: OutputFormat;
  processingTimeMs: number;
}
