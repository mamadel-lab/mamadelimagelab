'use client';
import React, { useCallback, useState } from 'react';
import type { ProcessingConfig, CustomDimensions } from '@/types/image';

interface AspectRatioPanelProps {
  config: ProcessingConfig;
  onChange: (patch: Partial<ProcessingConfig>) => void;
}

const PRESET_GROUPS = [
  {
    group: 'Basic',
    presets: [
      {
        id: 'original',
        label: 'Original',
        description: 'Keep source dimensions',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
        platform: 'No resize',
        ratio: '—',
      },
      {
        id: '1:1',
        label: 'Square',
        description: 'Instagram Feed, Twitter',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        platform: 'Instagram · Twitter',
        ratio: '1:1',
      },
    ],
  },
  {
    group: 'Social Media',
    presets: [
      {
        id: '9:16',
        label: 'Stories',
        description: 'Instagram/TikTok Stories',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="11" y="3" width="10" height="26" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        platform: 'Instagram · TikTok · Reels',
        ratio: '9:16',
      },
      {
        id: '4:5',
        label: 'Portrait',
        description: 'Instagram Portrait Post',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="7" y="4" width="18" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        platform: 'Instagram Feed',
        ratio: '4:5',
      },
      {
        id: '16:9',
        label: 'Landscape',
        description: 'YouTube, Twitter Banner',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="3" y="9" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        platform: 'YouTube · Twitter · LinkedIn',
        ratio: '16:9',
      },
      {
        id: '4:3',
        label: 'Classic',
        description: 'Facebook post, presentations',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="3" y="7" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        platform: 'Facebook · Slides',
        ratio: '4:3',
      },
      {
        id: '3:4',
        label: 'Tall Classic',
        description: 'Pinterest, mobile',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="8" y="3" width="16" height="26" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        platform: 'Pinterest · Mobile',
        ratio: '3:4',
      },
    ],
  },
  {
    group: 'Photography',
    presets: [
      {
        id: '3:2',
        label: 'Photo Wide',
        description: 'Standard DSLR landscape',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="8" width="28" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        platform: 'DSLR · Flickr',
        ratio: '3:2',
      },
      {
        id: '2:3',
        label: 'Photo Portrait',
        description: 'Standard DSLR portrait',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="9" y="2" width="14" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        platform: 'DSLR · Print',
        ratio: '2:3',
      },
      {
        id: '21:9',
        label: 'Ultrawide',
        description: 'Cinematic / banner',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="1" y="11" width="30" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        platform: 'Cinema · Banner',
        ratio: '21:9',
      },
    ],
  },
  {
    group: 'Custom',
    presets: [
      {
        id: 'custom',
        label: 'Custom Size',
        description: 'Set exact pixel dimensions',
        icon: (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
            <path d="M12 16h8M16 12v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
        platform: 'Any resolution',
        ratio: 'W×H',
      },
    ],
  },
] as const;

export default function AspectRatioPanel({ config, onChange }: AspectRatioPanelProps) {
  const [customW, setCustomW] = useState(String(config.customDimensions?.width ?? 1080));
  const [customH, setCustomH] = useState(String(config.customDimensions?.height ?? 1080));

  const handleSelect = useCallback((id: string) => {
    onChange({ aspectRatio: id as ProcessingConfig['aspectRatio'] });
  }, [onChange]);

  const handleBlurToggle = useCallback(() => {
    onChange({ enableBlurBackground: !config.enableBlurBackground });
  }, [config.enableBlurBackground, onChange]);

  const handleCustomDimChange = useCallback((field: keyof CustomDimensions, raw: string) => {
    const val = parseInt(raw, 10);
    if (field === 'width') setCustomW(raw);
    else setCustomH(raw);
    if (!isNaN(val) && val >= 1 && val <= 8000) {
      onChange({
        customDimensions: {
          ...config.customDimensions,
          [field]: val,
        },
      });
    }
  }, [config.customDimensions, onChange]);

  const showBlurOption = config.aspectRatio !== 'original';

  const QUICK_PRESETS = [
    { id: 'original', label: 'Original', ratio: '—' },
    { id: '1:1', label: 'Square', ratio: '1:1' },
    { id: '9:16', label: 'Stories', ratio: '9:16' },
    { id: '4:5', label: 'Portrait', ratio: '4:5' },
    { id: '16:9', label: 'Wide', ratio: '16:9' },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* Quick Presets */}
      <div>
        <p className="panel-header mb-2">Quick Presets</p>
        <div className="grid grid-cols-5 gap-1.5">
          {QUICK_PRESETS.map((qp) => {
            const isActive = config.aspectRatio === qp.id;
            return (
              <button
                key={`quick-${qp.id}`}
                type="button"
                onClick={() => handleSelect(qp.id)}
                aria-pressed={isActive}
                className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all duration-150"
                style={{
                  background: isActive ? 'rgba(13,148,136,0.15)' : 'var(--secondary)',
                  border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                }}
              >
                <span
                  className="text-xs font-mono leading-none"
                  style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: '10px' }}
                >
                  {qp.ratio}
                </span>
                <span
                  className="text-xs font-semibold leading-none text-center"
                  style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)', fontSize: '11px' }}
                >
                  {qp.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {PRESET_GROUPS.map((group) => (
        <div key={group.group}>
          <p className="panel-header mb-2">{group.group}</p>
          <div className="flex flex-col gap-1.5">
            {group.presets.map((preset) => (
              <button
                key={`preset-${preset.id}`}
                type="button"
                onClick={() => handleSelect(preset.id)}
                className={`preset-card text-left p-2.5 flex items-center gap-3 transition-all duration-150 ${
                  config.aspectRatio === preset.id ? 'preset-card-active' : ''
                }`}
                aria-pressed={config.aspectRatio === preset.id}
              >
                {/* Aspect ratio visual */}
                <div
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{
                    background: config.aspectRatio === preset.id
                      ? 'rgba(124,58,237,0.25)'
                      : 'var(--secondary)',
                    color: config.aspectRatio === preset.id
                      ? 'var(--secondary-foreground)'
                      : 'var(--muted-foreground)',
                    transition: 'all 150ms ease',
                  }}
                >
                  {preset.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {preset.label}
                    </span>
                    {preset.ratio !== '—' && (
                      <span
                        className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}
                      >
                        {preset.ratio}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                    {preset.platform || preset.description}
                  </p>
                </div>

                {config.aspectRatio === preset.id && (
                  <div
                    className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--primary)' }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Custom dimensions input — shown when custom is selected */}
          {group.group === 'Custom' && config.aspectRatio === 'custom' && (
            <div
              className="mt-2 p-3 rounded-xl fade-in"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)' }}
            >
              <p className="text-xs font-semibold mb-2.5" style={{ color: 'var(--secondary-foreground)' }}>
                Output Dimensions (px)
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="panel-header block mb-1">Width</label>
                  <input
                    type="number"
                    min={1}
                    max={8000}
                    value={customW}
                    onChange={(e) => handleCustomDimChange('width', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm font-mono numeric-tabular"
                    style={{
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      outline: 'none',
                    }}
                    placeholder="1080"
                  />
                </div>
                <div className="mt-4 text-lg" style={{ color: 'var(--border)' }}>×</div>
                <div className="flex-1">
                  <label className="panel-header block mb-1">Height</label>
                  <input
                    type="number"
                    min={1}
                    max={8000}
                    value={customH}
                    onChange={(e) => handleCustomDimChange('height', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm font-mono numeric-tabular"
                    style={{
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      outline: 'none',
                    }}
                    placeholder="1080"
                  />
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                Canvas will be exactly {customW || '?'} × {customH || '?'} px. Image is fitted inside.
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Blur background toggle */}
      {showBlurOption && (
        <div className="section-divider pt-4 fade-in">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Smart Blur Background
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Auto-fills empty areas with a blurred copy of the original image. No cropping — content stays fully visible.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBlurToggle}
              role="switch"
              aria-checked={config.enableBlurBackground}
              aria-label="Toggle smart blur background"
              className="mt-0.5 shrink-0 relative w-10 h-6 rounded-full transition-all duration-200"
              style={{
                background: config.enableBlurBackground ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200"
                style={{
                  left: config.enableBlurBackground ? '18px' : '2px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}
              />
            </button>
          </div>

          {/* Preview illustration */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ enableBlurBackground: false })}
              className="rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 py-2 transition-all duration-150"
              style={{
                background: !config.enableBlurBackground ? 'rgba(13,148,136,0.12)' : 'var(--secondary)',
                border: !config.enableBlurBackground ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                height: '80px',
              }}
            >
              <div style={{ width: '40px', height: '54px', background: 'var(--border)', borderRadius: '3px', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 0.6, borderRadius: '3px' }} />
                <div style={{ position: 'absolute', left: '4px', right: '4px', top: '50%', transform: 'translateY(-50%)', height: '30px', background: 'rgba(13,148,136,0.5)', borderRadius: '2px' }} />
              </div>
              <p className="text-xs font-medium" style={{ color: !config.enableBlurBackground ? 'var(--primary)' : 'var(--muted-foreground)' }}>Letterbox</p>
            </button>
            <button
              type="button"
              onClick={() => onChange({ enableBlurBackground: true })}
              className="rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 py-2 transition-all duration-150"
              style={{
                background: config.enableBlurBackground ? 'rgba(13,148,136,0.12)' : 'var(--secondary)',
                border: config.enableBlurBackground ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                height: '80px',
              }}
            >
              <div style={{ width: '40px', height: '54px', position: 'relative', overflow: 'hidden', borderRadius: '3px' }}>
                <div style={{ position: 'absolute', inset: '-4px', background: 'rgba(13,148,136,0.3)', filter: 'blur(4px)' }} />
                <div style={{ position: 'absolute', left: '4px', right: '4px', top: '50%', transform: 'translateY(-50%)', height: '30px', background: 'rgba(13,148,136,0.7)', borderRadius: '2px' }} />
              </div>
              <p className="text-xs font-medium" style={{ color: config.enableBlurBackground ? 'var(--primary)' : 'var(--muted-foreground)' }}>Blur Fill ✓</p>
            </button>
          </div>
        </div>
      )}

      {/* Mirror / Flip section */}
      <div className="section-divider pt-4">
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Mirror &amp; Flip</p>
        <div className="grid grid-cols-2 gap-2">
          {/* Flip Horizontal */}
          <button
            type="button"
            onClick={() => onChange({ flipHorizontal: !(config.flipHorizontal ?? false) })}
            className="flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-150"
            style={{
              background: (config.flipHorizontal ?? false) ? 'rgba(13,148,136,0.12)' : 'var(--secondary)',
              border: (config.flipHorizontal ?? false) ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            }}
            aria-pressed={config.flipHorizontal ?? false}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: (config.flipHorizontal ?? false) ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              <path d="M14 4v20M4 9l6 5-6 5M24 9l-6 5 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: (config.flipHorizontal ?? false) ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              Flip H
            </span>
          </button>

          {/* Flip Vertical */}
          <button
            type="button"
            onClick={() => onChange({ flipVertical: !(config.flipVertical ?? false) })}
            className="flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-150"
            style={{
              background: (config.flipVertical ?? false) ? 'rgba(13,148,136,0.12)' : 'var(--secondary)',
              border: (config.flipVertical ?? false) ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            }}
            aria-pressed={config.flipVertical ?? false}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: (config.flipVertical ?? false) ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              <path d="M4 14h20M9 4l5 6 5-6M9 24l5-6 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: (config.flipVertical ?? false) ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              Flip V
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}