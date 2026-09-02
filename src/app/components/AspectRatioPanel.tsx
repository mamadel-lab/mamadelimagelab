'use client';
import React, { useCallback, useState } from 'react';
import type { ProcessingConfig, CustomDimensions } from '@/types/image';

interface AspectRatioPanelProps {
  config: ProcessingConfig;
  onChange: (patch: Partial<ProcessingConfig>) => void;
}

// SVG icons for each ratio
const icons: Record<string, React.ReactNode> = {
  '1:1': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  '3:4': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="8" y="3" width="16" height="26" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  '4:5': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="7" y="4" width="18" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  '9:16': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="11" y="3" width="10" height="26" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  '16:9': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="3" y="9" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  '4:3': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="3" y="7" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  '3:2': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="8" width="28" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  '2:3': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="9" y="2" width="14" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  '5:4': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="3" y="8" width="26" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  '21:9': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="1" y="11" width="30" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  'auto': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
      <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'custom': (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
      <path d="M12 16h8M16 12v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

const PRESET_GROUPS = [
  {
    group: 'POPULAR',
    presets: [
      { id: '1:1',  label: 'Square',           sub: '1:1 · universal format' },
      { id: '3:4',  label: 'Product Card',      sub: '3:4 · WB / marketplaces' },
      { id: '4:5',  label: 'Vertical Card',     sub: '4:5 · goods / social' },
      { id: '9:16', label: 'Stories / Reels',   sub: '9:16 · mobile format' },
      { id: '16:9', label: 'Wide',              sub: '16:9 · banners / covers' },
    ],
  },
  {
    group: 'STANDARD',
    presets: [
      { id: '4:3',  label: 'Classic',           sub: '4:3' },
      { id: '3:2',  label: 'Photo',             sub: '3:2' },
      { id: '2:3',  label: 'Portrait',          sub: '2:3' },
      { id: '5:4',  label: 'Classic',           sub: '5:4' },
    ],
  },
  {
    group: 'WIDE',
    presets: [
      { id: '21:9', label: 'Cinema',            sub: '21:9' },
    ],
  },
  {
    group: 'AUTO',
    presets: [
      { id: 'auto', label: 'Auto',              sub: 'Auto · model decides' },
    ],
  },
] as const;

type PresetId = '1:1' | '3:4' | '4:5' | '9:16' | '16:9' | '4:3' | '3:2' | '2:3' | '5:4' | '21:9' | 'auto' | 'custom' | 'original';

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

  const showBlurOption = config.aspectRatio !== 'original' && config.aspectRatio !== 'auto';

  return (
    <div className="flex flex-col gap-4">
      {PRESET_GROUPS.map((group) => (
        <div key={group.group}>
          {/* Group header */}
          <p
            className="text-[10px] font-bold tracking-widest mb-2 px-0.5"
            style={{ color: 'var(--muted-foreground)', letterSpacing: '0.12em' }}
          >
            {group.group}
          </p>

          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {group.presets.map((preset) => {
              const isActive = config.aspectRatio === preset.id;
              return (
                <button
                  key={`preset-${preset.id}`}
                  type="button"
                  onClick={() => handleSelect(preset.id)}
                  aria-pressed={isActive}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                  style={{
                    background: isActive ? 'rgba(13,148,136,0.15)' : 'var(--secondary)',
                    border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  }}
                >
                  {/* Icon */}
                  <span
                    className="shrink-0"
                    style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
                  >
                    {icons[preset.id] ?? icons['custom']}
                  </span>

                  {/* Text */}
                  <div className="flex flex-col min-w-0">
                    <span
                      className="text-xs font-semibold leading-tight truncate"
                      style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)' }}
                    >
                      {preset.label}
                    </span>
                    <span
                      className="text-[10px] leading-tight truncate mt-0.5"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {preset.sub}
                    </span>
                  </div>

                  {/* Checkmark */}
                  {isActive && (
                    <div
                      className="ml-auto w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                      style={{ background: 'var(--primary)' }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom size option */}
      <div>
        <p
          className="text-[10px] font-bold tracking-widest mb-2 px-0.5"
          style={{ color: 'var(--muted-foreground)', letterSpacing: '0.12em' }}
        >
          CUSTOM
        </p>
        <button
          type="button"
          onClick={() => handleSelect('custom')}
          aria-pressed={config.aspectRatio === 'custom'}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
          style={{
            background: config.aspectRatio === 'custom' ? 'rgba(13,148,136,0.15)' : 'var(--secondary)',
            border: config.aspectRatio === 'custom' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
          }}
        >
          <span style={{ color: config.aspectRatio === 'custom' ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {icons['custom']}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold leading-tight" style={{ color: config.aspectRatio === 'custom' ? 'var(--primary)' : 'var(--foreground)' }}>
              Custom Size
            </span>
            <span className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Set exact pixel dimensions
            </span>
          </div>
          {config.aspectRatio === 'custom' && (
            <div className="ml-auto w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </button>

        {config.aspectRatio === 'custom' && (
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