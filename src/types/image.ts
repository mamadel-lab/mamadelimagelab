export type ImageStatus = 'idle' | 'queued' | 'processing' | 'done' | 'error';

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  previewUrl: string;
  status: ImageStatus;
  outputSize: number | null;
  outputBlob: Blob | null;
  compressionRatio: number | null;
  error: string | null;
}

export type OutputFormat = 'webp' | 'avif' | 'jpeg' | 'png';

export type AspectRatio = 'original' | '1:1' | '9:16' | '4:5' | '16:9' | '3:2' | '2:3' | '4:3' | '3:4' | '21:9' | 'custom';

export type WatermarkPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export type WatermarkStyle = 'corner' | 'grid';

export type PngBackground = 'transparent' | 'white' | 'black';

export interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'logo';
  text: string;
  logoFile: File | null;
  logoPreviewUrl: string | null;
  placement: WatermarkPlacement;
  style: WatermarkStyle;
  opacity: number;
  fontSize: number;
  color: string;
}

export interface CustomDimensions {
  width: number;
  height: number;
}

export interface ProcessingConfig {
  outputFormat: OutputFormat;
  quality: number;
  outputWidth: string;
  aspectRatio: AspectRatio;
  enableBlurBackground: boolean;
  customDimensions: CustomDimensions;
  watermark: WatermarkConfig;
  flipHorizontal: boolean;
  flipVertical: boolean;
  pngBackground: PngBackground;
}