'use client';
import React, { useState, useCallback } from 'react';
import UploadZone from './UploadZone';
import FileQueue from './FileQueue';
import SettingsSidebar from './SettingsSidebar';
import ExportBar from './ExportBar';
import type { ImageFile, ProcessingConfig } from '@/types/image';

const DEFAULT_CONFIG: ProcessingConfig = {
  outputFormat: 'webp',
  quality: 82,
  outputWidth: 'original',
  aspectRatio: 'original',
  enableBlurBackground: true,
  customDimensions: { width: 1080, height: 1080 },
  flipHorizontal: false,
  flipVertical: false,
  pngBackground: 'transparent',
  watermark: {
    enabled: false,
    type: 'text',
    text: '© MamadelImageLab',
    logoFile: null,
    logoPreviewUrl: null,
    placement: 'bottom-right',
    style: 'corner',
    opacity: 0.75,
    fontSize: 18,
    color: '#ffffff',
  },
};

export default function ImageProcessingTool() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [config, setConfig] = useState<ProcessingConfig>(DEFAULT_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'compression' | 'aspect' | 'watermark'>('compression');

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const imageFiles: ImageFile[] = newFiles.map((f, i) => ({
      id: `img-${Date.now()}-${i}`,
      file: f,
      name: f.name,
      originalSize: f.size,
      previewUrl: URL.createObjectURL(f),
      status: 'queued',
      outputSize: null,
      outputBlob: null,
      compressionRatio: null,
      error: null,
    }));
    setFiles(prev => [...prev, ...imageFiles].slice(0, 20));
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
    setFiles([]);
  }, [files]);

  const handleConfigChange = useCallback((patch: Partial<ProcessingConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  const handleProcessAll = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const queued = files.filter(f => f.status === 'queued' || f.status === 'idle');
    if (queued.length === 0) {
      // re-process all
      setFiles(prev => prev.map(f => ({ ...f, status: 'queued', outputBlob: null, outputSize: null, compressionRatio: null, error: null })));
    }

    for (const imgFile of queued.length > 0 ? queued : files) {
      setFiles(prev =>
        prev.map(f => f.id === imgFile.id ? { ...f, status: 'processing' } : f)
      );

      try {
        const result = await processImage(imgFile.file, config);
        setFiles(prev =>
          prev.map(f =>
            f.id === imgFile.id
              ? {
                  ...f,
                  status: 'done',
                  outputBlob: result.blob,
                  outputSize: result.blob.size,
                  compressionRatio: Math.round((1 - result.blob.size / f.originalSize) * 100),
                }
              : f
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Processing failed';
        setFiles(prev =>
          prev.map(f => f.id === imgFile.id ? { ...f, status: 'error', error: msg } : f)
        );
      }
    }

    setIsProcessing(false);
  }, [files, config]);

  const doneFiles = files.filter(f => f.status === 'done');

  return (
    <div className="flex flex-col gap-6 fade-in">
      {/* Page title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Image Processing Tool
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Compress, resize &amp; watermark images — entirely in your browser.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <span
            className="px-2 py-1 rounded"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Canvas API
          </span>
          <span
            className="px-2 py-1 rounded"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            WEBP · AVIF
          </span>
          <span
            className="px-2 py-1 rounded"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            ZIP Export
          </span>
        </div>
      </div>

      {/* Upload zone */}
      <UploadZone onFilesAdded={handleFilesAdded} />

      {/* Main layout: file queue + settings sidebar */}
      {files.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 slide-up">
          {/* File queue */}
          <div className="flex-1 min-w-0">
            <FileQueue
              files={files}
              onRemove={handleRemoveFile}
              onClearAll={handleClearAll}
              config={config}
            />
          </div>

          {/* Settings sidebar */}
          <div className="lg:w-[360px] xl:w-[380px] 2xl:w-[420px] shrink-0">
            <SettingsSidebar
              config={config}
              onChange={handleConfigChange}
              activeTab={activeSettingsTab}
              onTabChange={setActiveSettingsTab}
            />
          </div>
        </div>
      )}

      {/* Export bar */}
      <ExportBar
        files={files}
        doneCount={doneFiles.length}
        totalCount={files.length}
        isProcessing={isProcessing}
        onProcessAll={handleProcessAll}
        config={config}
      />
    </div>
  );
}

// ─── Canvas Processing Engine ─────────────────────────────────────────────────
// Backend integration point: replace with server-side processing if needed
async function processImage(file: File, config: ProcessingConfig): Promise<{ blob: Blob }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      try {
        URL.revokeObjectURL(url);

        const { targetW, targetH } = getTargetDimensions(img.naturalWidth, img.naturalHeight, config.aspectRatio, config.customDimensions);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d')!;

        // Apply flip transform if needed
        const flipH = config.flipHorizontal ?? false;
        const flipV = config.flipVertical ?? false;
        if (flipH || flipV) {
          ctx.save();
          ctx.translate(flipH ? targetW : 0, flipV ? targetH : 0);
          ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        }

        // Draw background (blur fill or letterbox if aspect ratio changes)
        if (config.aspectRatio !== 'original') {
          if (config.enableBlurBackground) {
            // Use an offscreen canvas to apply blur via CSS filter trick
            const offscreen = document.createElement('canvas');
            // Scale down for performance, blur will hide pixelation
            const blurScale = Math.min(1, 400 / Math.max(img.naturalWidth, img.naturalHeight));
            offscreen.width = Math.round(img.naturalWidth * blurScale);
            offscreen.height = Math.round(img.naturalHeight * blurScale);
            const offCtx = offscreen.getContext('2d')!;
            offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);

            // Draw blurred background: scale-up the small canvas to cover the target canvas
            const blurRadius = 40;
            const scale = Math.max(
              (targetW + blurRadius * 2) / offscreen.width,
              (targetH + blurRadius * 2) / offscreen.height
            );
            const bw = offscreen.width * scale;
            const bh = offscreen.height * scale;
            const bx = (targetW - bw) / 2;
            const by = (targetH - bh) / 2;

            ctx.filter = 'blur(20px)';
            ctx.drawImage(offscreen, bx, by, bw, bh);
            ctx.filter = 'none';

            // Darken slightly
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fillRect(0, 0, targetW, targetH);
          } else {
            // Letterbox: solid black bars
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, targetW, targetH);
          }
        }

        // Draw main image centered/fitted (contain — never crop)
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = targetW / targetH;
        let drawW: number, drawH: number, drawX: number, drawY: number;
        if (imgAspect > canvasAspect) {
          // Image is wider than canvas — fit by width
          drawW = targetW;
          drawH = drawW / imgAspect;
        } else {
          // Image is taller than canvas — fit by height
          drawH = targetH;
          drawW = drawH * imgAspect;
        }
        drawX = (targetW - drawW) / 2;
        drawY = (targetH - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        if (flipH || flipV) {
          ctx.restore();
        }

        // Apply watermark
        if (config.watermark.enabled) {
          await applyWatermark(ctx, canvas, config, img);
        }

        // Encode
        const mimeType =
          config.outputFormat === 'avif' ? 'image/avif' :
          config.outputFormat === 'jpeg' ? 'image/jpeg' :
          config.outputFormat === 'png'? 'image/png' : 'image/webp';
        const quality = config.quality / 100;

        // For PNG with non-transparent background, fill canvas before drawing
        if (config.outputFormat === 'png' && config.pngBackground !== 'transparent') {
          // Create a new canvas with the background color applied underneath
          const bgCanvas = document.createElement('canvas');
          bgCanvas.width = canvas.width;
          bgCanvas.height = canvas.height;
          const bgCtx = bgCanvas.getContext('2d')!;
          bgCtx.fillStyle = config.pngBackground === 'white' ? '#ffffff' : '#000000';
          bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
          bgCtx.drawImage(canvas, 0, 0);
          bgCanvas.toBlob(
            (blob) => {
              if (blob) resolve({ blob });
              else reject(new Error('Canvas toBlob returned null — format may not be supported'));
            },
            mimeType,
            quality
          );
        } else {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve({ blob });
              else reject(new Error('Canvas toBlob returned null — format may not be supported'));
            },
            mimeType,
            quality
          );
        }
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

function getTargetDimensions(
  naturalW: number,
  naturalH: number,
  aspectRatio: string,
  customDimensions?: { width: number; height: number }
): { targetW: number; targetH: number } {
  if (aspectRatio === 'custom' && customDimensions) {
    return { targetW: customDimensions.width, targetH: customDimensions.height };
  }
  const ratioMap: Record<string, [number, number]> = {
    '1:1': [1, 1],
    '9:16': [9, 16],
    '4:5': [4, 5],
    '16:9': [16, 9],
    '3:2': [3, 2],
    '2:3': [2, 3],
    '4:3': [4, 3],
    '3:4': [3, 4],
    '21:9': [21, 9],
  };
  if (aspectRatio === 'original' || !ratioMap[aspectRatio]) {
    return { targetW: naturalW, targetH: naturalH };
  }
  const [rw, rh] = ratioMap[aspectRatio];
  const targetAspect = rw / rh;
  const currentAspect = naturalW / naturalH;
  // Always use the larger dimension as the base so the canvas is big enough to contain the image
  // This ensures letterbox bars appear correctly
  if (currentAspect > targetAspect) {
    // Image is wider — base on width, add bars on top/bottom
    const targetW = naturalW;
    const targetH = Math.round(targetW / targetAspect);
    return { targetW, targetH };
  } else {
    // Image is taller — base on height, add bars on left/right
    const targetH = naturalH;
    const targetW = Math.round(targetH * targetAspect);
    return { targetW, targetH };
  }
}

async function applyWatermark(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  config: ProcessingConfig,
  _img: HTMLImageElement
) {
  const wm = config.watermark;
  ctx.globalAlpha = wm.opacity;

  if (wm.style === 'grid') {
    // 45° protective grid
    ctx.save();
    ctx.globalAlpha = wm.opacity * 0.4;
    const step = Math.max(canvas.width, canvas.height) / 6;
    ctx.font = `${wm.fontSize}px IBM Plex Sans, sans-serif`;
    ctx.fillStyle = wm.type === 'text' ? wm.color : 'white';
    ctx.rotate(-Math.PI / 4);
    for (let x = -canvas.height; x < canvas.width + canvas.height; x += step) {
      for (let y = -canvas.width; y < canvas.height + canvas.width; y += step) {
        if (wm.type === 'text') {
          ctx.fillText(wm.text, x, y);
        }
      }
    }
    ctx.restore();
    ctx.globalAlpha = wm.opacity;
    return;
  }

  // Corner placement — use percentage-based padding for consistent margins
  const padX = Math.round(canvas.width * 0.04);
  const padY = Math.round(canvas.height * 0.04);
  const textStr = wm.type === 'text' ? wm.text : '';
  ctx.font = `${wm.fontSize}px IBM Plex Sans, sans-serif`;
  ctx.fillStyle = wm.color;

  const placement = wm.placement;
  const metrics = ctx.measureText(textStr);
  const tw = metrics.width;
  const th = wm.fontSize;

  let x = padX;
  let y = padY + th;

  if (placement === 'top-right') {
    x = canvas.width - tw - padX;
    y = padY + th;
  } else if (placement === 'bottom-left') {
    x = padX;
    y = canvas.height - padY;
  } else if (placement === 'bottom-right') {
    x = canvas.width - tw - padX;
    y = canvas.height - padY;
  } else if (placement === 'center') {
    x = (canvas.width - tw) / 2;
    y = (canvas.height + th) / 2;
  }

  if (wm.type === 'text') {
    // Shadow for readability
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText(textStr, x, y);
    ctx.shadowBlur = 0;
  } else if (wm.type === 'logo' && wm.logoFile) {
    // Logo watermark
    await new Promise<void>((res) => {
      const logoImg = new window.Image();
      const logoUrl = URL.createObjectURL(wm.logoFile!);
      logoImg.onload = () => {
        URL.revokeObjectURL(logoUrl);
        const maxSize = canvas.width * 0.18;
        const scale = Math.min(maxSize / logoImg.naturalWidth, maxSize / logoImg.naturalHeight);
        const lw = logoImg.naturalWidth * scale;
        const lh = logoImg.naturalHeight * scale;
        const logoPadX = Math.round(canvas.width * 0.04);
        const logoPadY = Math.round(canvas.height * 0.04);
        let lx = logoPadX, ly = logoPadY;
        if (placement === 'top-right') { lx = canvas.width - lw - logoPadX; ly = logoPadY; }
        else if (placement === 'bottom-left') { lx = logoPadX; ly = canvas.height - lh - logoPadY; }
        else if (placement === 'bottom-right') { lx = canvas.width - lw - logoPadX; ly = canvas.height - lh - logoPadY; }
        else if (placement === 'center') { lx = (canvas.width - lw) / 2; ly = (canvas.height - lh) / 2; }
        ctx.drawImage(logoImg, lx, ly, lw, lh);
        res();
      };
      logoImg.onerror = () => res();
      logoImg.src = logoUrl;
    });
  }

  ctx.globalAlpha = 1;
}