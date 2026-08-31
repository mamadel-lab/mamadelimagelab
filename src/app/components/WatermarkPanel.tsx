'use client';
import React, { useCallback, useRef } from 'react';
import { Type, Image as ImageIcon, Upload } from 'lucide-react';
import type { ProcessingConfig, WatermarkConfig } from '@/types/image';

interface WatermarkPanelProps {
  config: ProcessingConfig;
  onChange: (patch: Partial<ProcessingConfig>) => void;
}

const PLACEMENTS = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'center', label: 'Center' },
] as const;

const STYLES = [
  { id: 'corner', label: 'Corner', description: 'Single mark at selected position' },
  { id: 'grid', label: '45° Grid', description: 'Repeating diagonal protective pattern' },
] as const;

export default function WatermarkPanel({ config, onChange }: WatermarkPanelProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const wm = config.watermark;

  const patchWm = useCallback((patch: Partial<WatermarkConfig>) => {
    onChange({ watermark: { ...wm, ...patch } });
  }, [wm, onChange]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    patchWm({ logoFile: file, logoPreviewUrl: url });
    e.target.value = '';
  }, [patchWm]);

  return (
    <div className="flex flex-col gap-5">
      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Watermark
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Overlay text or logo on all images
          </p>
        </div>
        <button
          type="button"
          onClick={() => patchWm({ enabled: !wm.enabled })}
          role="switch"
          aria-checked={wm.enabled}
          aria-label="Toggle watermark"
          className="shrink-0 relative w-10 h-6 rounded-full transition-all duration-200"
          style={{ background: wm.enabled ? 'var(--primary)' : 'var(--border)' }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200"
            style={{ left: wm.enabled ? '18px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          />
        </button>
      </div>

      {wm.enabled && (
        <div className="flex flex-col gap-4 fade-in">
          {/* Type: Text or Logo */}
          <div>
            <p className="panel-header mb-2">Type</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => patchWm({ type: 'text' })}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                  wm.type === 'text' ? 'tab-active' : 'tab-inactive'
                }`}
                style={{ border: '1px solid var(--border)' }}
                aria-pressed={wm.type === 'text'}
              >
                <Type size={14} /> Text
              </button>
              <button
                type="button"
                onClick={() => patchWm({ type: 'logo' })}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                  wm.type === 'logo' ? 'tab-active' : 'tab-inactive'
                }`}
                style={{ border: '1px solid var(--border)' }}
                aria-pressed={wm.type === 'logo'}
              >
                <ImageIcon size={14} /> Logo
              </button>
            </div>
          </div>

          {/* Text input */}
          {wm.type === 'text' && (
            <div className="fade-in">
              <label className="panel-header block mb-1.5" htmlFor="wm-text">
                Watermark Text
              </label>
              <input
                id="wm-text"
                type="text"
                value={wm.text}
                onChange={(e) => patchWm({ text: e.target.value })}
                className="input-field w-full px-3 py-2"
                placeholder="© Your Brand"
                maxLength={80}
              />
            </div>
          )}

          {/* Logo upload */}
          {wm.type === 'logo' && (
            <div className="fade-in">
              <p className="panel-header mb-2">Logo File</p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                aria-label="Upload watermark logo"
              />
              {wm.logoPreviewUrl ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={wm.logoPreviewUrl}
                    alt="Watermark logo preview"
                    className="w-12 h-12 object-contain rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: 'var(--foreground)' }}>
                      {wm.logoFile?.name ?? 'Logo'}
                    </p>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-xs mt-1"
                      style={{ color: 'var(--accent)' }}
                    >
                      Change logo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background: 'var(--muted)',
                    border: '1px dashed var(--border)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <Upload size={15} />
                  Upload PNG / JPG logo
                </button>
              )}
            </div>
          )}

          {/* Style: corner vs grid */}
          <div>
            <p className="panel-header mb-2">Style</p>
            <div className="flex flex-col gap-2">
              {STYLES.map((style) => (
                <button
                  key={`wm-style-${style.id}`}
                  type="button"
                  onClick={() => patchWm({ style: style.id })}
                  className={`preset-card text-left p-3 flex items-center gap-3 ${
                    wm.style === style.id ? 'preset-card-active' : ''
                  }`}
                  aria-pressed={wm.style === style.id}
                >
                  {/* Visual preview */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                    style={{
                      background: wm.style === style.id ? 'rgba(124,58,237,0.2)' : 'var(--secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {style.id === 'corner' ? (
                      <div className="relative w-8 h-8">
                        <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '1px', opacity: 0.8 }} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 watermark-grid-preview rounded" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {style.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {style.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Placement (only for corner style) */}
          {wm.style === 'corner' && (
            <div className="fade-in">
              <p className="panel-header mb-2">Placement</p>
              <div className="grid grid-cols-3 gap-1.5">
                {PLACEMENTS.map((p) => (
                  <button
                    key={`wm-placement-${p.id}`}
                    type="button"
                    onClick={() => patchWm({ placement: p.id })}
                    className={`text-xs py-1.5 px-2 rounded-md font-medium transition-all duration-150 ${
                      wm.placement === p.id ? 'tab-active' : 'tab-inactive'
                    }`}
                    style={{ border: '1px solid var(--border)' }}
                    aria-pressed={wm.placement === p.id}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opacity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="panel-header">Opacity</p>
              <span className="text-sm font-bold numeric-tabular" style={{ color: 'var(--primary)' }}>
                {Math.round(wm.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={Math.round(wm.opacity * 100)}
              onChange={(e) => patchWm({ opacity: Number(e.target.value) / 100 })}
              className="slider-thumb w-full"
              style={{ '--val': `${wm.opacity * 100}%` } as React.CSSProperties}
              aria-label="Watermark opacity"
            />
          </div>

          {/* Font size (text only) */}
          {wm.type === 'text' && (
            <div className="fade-in">
              <div className="flex items-center justify-between mb-2">
                <p className="panel-header">Font Size</p>
                <span className="text-sm font-bold numeric-tabular" style={{ color: 'var(--primary)' }}>
                  {wm.fontSize}px
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={72}
                step={2}
                value={wm.fontSize}
                onChange={(e) => patchWm({ fontSize: Number(e.target.value) })}
                className="slider-thumb w-full"
                style={{ '--val': `${((wm.fontSize - 10) / 62) * 100}%` } as React.CSSProperties}
                aria-label="Watermark font size"
              />
            </div>
          )}

          {/* Color (text only) */}
          {wm.type === 'text' && (
            <div className="fade-in">
              <p className="panel-header mb-2">Color</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={wm.color}
                  onChange={(e) => patchWm({ color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  style={{ padding: '2px' }}
                  aria-label="Watermark text color"
                />
                <div className="flex gap-2">
                  {['#ffffff', '#000000', '#ffff00', '#ff6b6b', '#a78bfa'].map((c) => (
                    <button
                      key={`color-swatch-${c}`}
                      type="button"
                      onClick={() => patchWm({ color: c })}
                      className="w-7 h-7 rounded-full transition-all duration-150"
                      style={{
                        background: c,
                        border: wm.color === c ? '2px solid var(--primary)' : '2px solid var(--border)',
                        boxShadow: wm.color === c ? '0 0 0 2px rgba(124,58,237,0.4)' : 'none',
                      }}
                      aria-label={`Set color to ${c}`}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!wm.enabled && (
        <div
          className="rounded-lg p-4 text-center"
          style={{ background: 'var(--muted)', border: '1px dashed var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Enable watermark to overlay text or a logo on all processed images
          </p>
        </div>
      )}
    </div>
  );
}