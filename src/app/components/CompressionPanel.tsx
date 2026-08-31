'use client';
import React, { useCallback } from 'react';
import { Info } from 'lucide-react';
import type { ProcessingConfig, PngBackground } from '@/types/image';

interface CompressionPanelProps {
  config: ProcessingConfig;
  onChange: (patch: Partial<ProcessingConfig>) => void;
}

const FORMATS = [
  {
    id: 'webp',
    label: 'WEBP',
    badge: 'Recommended',
    description: 'Best browser support, ~80% compression, lossless option',
    badgeColor: 'var(--accent)',
  },
  {
    id: 'avif',
    label: 'AVIF',
    badge: 'Smallest',
    description: 'Next-gen format, up to 50% smaller than WEBP, newer browsers',
    badgeColor: '#14B8A6',
  },
  {
    id: 'jpeg',
    label: 'JPEG',
    badge: 'Universal',
    description: 'Maximum compatibility, ideal for photos and print',
    badgeColor: '#F59E0B',
  },
  {
    id: 'png',
    label: 'PNG',
    badge: 'Lossless',
    description: 'Lossless compression, supports transparency, larger files',
    badgeColor: '#8B5CF6',
  },
] as const;

const OUTPUT_WIDTHS = [
  { value: 'original', label: 'Original', description: 'Keep source width' },
  { value: '3840', label: '4K', description: '3840 px' },
  { value: '2560', label: '2K', description: '2560 px' },
  { value: '1920', label: 'Full HD', description: '1920 px' },
  { value: '1280', label: 'HD', description: '1280 px' },
  { value: '1080', label: '1080', description: '1080 px' },
  { value: '800', label: '800', description: '800 px' },
  { value: '640', label: '640', description: '640 px' },
  { value: '480', label: '480', description: '480 px' },
  { value: '320', label: '320', description: '320 px' },
] as const;

const PNG_BACKGROUNDS: { id: PngBackground; label: string; description: string; icon: string }[] = [
  { id: 'transparent', label: 'Transparent', description: 'Keep alpha channel', icon: '⬜' },
  { id: 'white', label: 'White', description: 'Fill with white', icon: '🔳' },
  { id: 'black', label: 'Black', description: 'Fill with black', icon: '⬛' },
];

export default function CompressionPanel({ config, onChange }: CompressionPanelProps) {
  const handleQualityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ quality: Number(e.target.value) });
  }, [onChange]);

  const qualityLabel =
    config.quality >= 90 ? 'Maximum quality' :
    config.quality >= 75 ? 'High quality' :
    config.quality >= 60 ? 'Balanced' :
    config.quality >= 45 ? 'Smaller file' : 'Minimum size';

  const estimatedSaving =
    config.quality >= 90 ? '30–50%' :
    config.quality >= 75 ? '60–75%' :
    config.quality >= 60 ? '75–85%' :
    config.quality >= 45 ? '85–90%' : '90–95%';

  return (
    <div className="flex flex-col gap-5">
      {/* Output format */}
      <div>
        <p className="panel-header mb-3">Output Format</p>
        <div className="flex flex-col gap-2">
          {FORMATS.map((fmt) => (
            <button
              key={`format-${fmt.id}`}
              type="button"
              onClick={() => onChange({ outputFormat: fmt.id as ProcessingConfig['outputFormat'] })}
              className={`format-card text-left p-3 transition-all duration-150 ${
                config.outputFormat === fmt.id ? 'format-card-active' : ''
              }`}
              aria-pressed={config.outputFormat === fmt.id}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  {fmt.label}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${fmt.badgeColor}20`, color: fmt.badgeColor, border: `1px solid ${fmt.badgeColor}40` }}
                >
                  {fmt.badge}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {fmt.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* PNG background option */}
      {config.outputFormat === 'png' && (
        <div className="section-divider pt-5">
          <p className="panel-header mb-3">PNG Background</p>
          <div className="flex flex-col gap-2">
            {PNG_BACKGROUNDS.map((bg) => (
              <button
                key={`png-bg-${bg.id}`}
                type="button"
                onClick={() => onChange({ pngBackground: bg.id })}
                className={`format-card text-left p-3 transition-all duration-150 ${
                  config.pngBackground === bg.id ? 'format-card-active' : ''
                }`}
                aria-pressed={config.pngBackground === bg.id}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{bg.icon}</span>
                  <div>
                    <span className="text-sm font-bold block" style={{ color: 'var(--foreground)' }}>
                      {bg.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {bg.description}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Output width */}
      <div className="section-divider pt-5">
        <p className="panel-header mb-3">Output Width</p>
        <div className="grid grid-cols-2 gap-1.5">
          {OUTPUT_WIDTHS.map((w) => (
            <button
              key={`width-${w.value}`}
              type="button"
              onClick={() => onChange({ outputWidth: w.value as ProcessingConfig['outputWidth'] })}
              className={`preset-card text-left px-3 py-2 transition-all duration-150 ${
                config.outputWidth === w.value ? 'preset-card-active' : ''
              }`}
              aria-pressed={config.outputWidth === w.value}
            >
              <span className="text-xs font-bold block" style={{ color: 'var(--foreground)' }}>
                {w.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {w.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="section-divider pt-5">
        {/* Quality slider */}
        <div className="flex items-center justify-between mb-2">
          <p className="panel-header">Quality</p>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{qualityLabel}</span>
            <span
              className="text-sm font-bold numeric-tabular"
              style={{ color: 'var(--primary)', minWidth: '2.5rem', textAlign: 'right' }}
            >
              {config.quality}
            </span>
          </div>
        </div>
        <input
          type="range"
          min={20}
          max={100}
          step={1}
          value={config.quality}
          onChange={handleQualityChange}
          className="slider-thumb w-full"
          style={{ '--val': `${config.quality}%` } as React.CSSProperties}
          aria-label="Output quality"
          aria-valuemin={20}
          aria-valuemax={100}
          aria-valuenow={config.quality}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Smallest</span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Highest</span>
        </div>

        {/* Estimated saving */}
        <div
          className="mt-3 flex items-center gap-2 p-2.5 rounded-lg"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <Info size={13} style={{ color: '#10B981', flexShrink: 0 }} />
          <p className="text-xs" style={{ color: '#10B981' }}>
            Estimated file size reduction: <strong>{estimatedSaving}</strong>
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="section-divider pt-4">
        <p className="panel-header mb-2">Tips</p>
        <ul className="flex flex-col gap-1.5">
          {[
            'Quality 75–85 is optimal for web images',
            'AVIF is not supported in Safari 15 or older',
            'PNG preserves transparency; JPEG does not',
            'Use WEBP for best size/quality balance',
          ].map((tip, i) => (
            <li key={`tip-${i}`} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>›</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}