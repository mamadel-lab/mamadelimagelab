'use client';
import React, { useState, useEffect } from 'react';
import { Zap, Crop, Stamp, X, ChevronRight } from 'lucide-react';
import type { ProcessingConfig } from '@/types/image';
import CompressionPanel from './CompressionPanel';
import AspectRatioPanel from './AspectRatioPanel';
import WatermarkPanel from './WatermarkPanel';

interface SettingsSidebarProps {
  config: ProcessingConfig;
  onChange: (patch: Partial<ProcessingConfig>) => void;
  activeTab: 'compression' | 'aspect' | 'watermark';
  onTabChange: (tab: 'compression' | 'aspect' | 'watermark') => void;
}

const TABS: { id: 'compression' | 'aspect' | 'watermark'; label: string; sublabel: string; icon: React.ReactNode; step: number }[] = [
  { id: 'compression', label: 'Resize',       sublabel: 'Format & size',   icon: <Zap size={18} />,   step: 1 },
  { id: 'aspect',      label: 'Aspect Ratio', sublabel: 'Crop & ratio',    icon: <Crop size={18} />,  step: 2 },
  { id: 'watermark',   label: 'Watermark',    sublabel: 'Brand & protect', icon: <Stamp size={18} />, step: 3 },
];

export default function SettingsSidebar({ config, onChange, activeTab, onTabChange }: SettingsSidebarProps) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('tabs-hint-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShowHint(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem('tabs-hint-dismissed', '1');
  };

  return (
    <div className="card-surface flex flex-col">
      {/* Step flow header */}
      <div
        className="px-3 pt-3 pb-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.12em' }}>
          STEP-BY-STEP WORKFLOW
        </p>
        <div className="flex items-center gap-1">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isDone = TABS.findIndex(t => t.id === activeTab) > idx;
            return (
              <React.Fragment key={tab.id}>
                <button
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-150 flex-1 justify-center"
                  style={{
                    background: isActive
                      ? 'rgba(13,148,136,0.18)'
                      : isDone
                      ? 'rgba(13,148,136,0.07)'
                      : 'transparent',
                    border: isActive
                      ? '1px solid var(--primary)'
                      : '1px solid transparent',
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{
                      background: isActive
                        ? 'var(--primary)'
                        : isDone
                        ? 'rgba(13,148,136,0.4)'
                        : 'var(--border)',
                      color: isActive || isDone ? 'white' : 'var(--muted-foreground)',
                    }}
                  >
                    {tab.step}
                  </span>
                  <span
                    className="text-[10px] font-semibold hidden sm:block"
                    style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
                  >
                    {tab.label}
                  </span>
                </button>
                {idx < TABS.length - 1 && (
                  <ChevronRight size={10} style={{ color: 'var(--border)', flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Tooltip hint */}
      {showHint && (
        <div
          className="relative mx-2 mt-2 mb-1 rounded-lg px-3 py-2 text-xs flex items-start gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.08))',
            border: '1px solid rgba(6,182,212,0.4)',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ color: 'var(--accent)', fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>💡</span>
          <span style={{ lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--accent)' }}>3 steps</strong> to perfect your image — go through each tab in order!
          </span>
          <button
            onClick={dismissHint}
            className="ml-auto flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss hint"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Large Tab bar */}
      <div
        className="flex p-2 gap-1.5"
        style={{ background: 'rgba(0,0,0,0.15)' }}
        role="tablist"
        aria-label="Processing settings"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isAspect = tab.id === 'aspect';
          return (
            <button
              key={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl transition-all duration-200 relative ${
                isActive ? 'tab-active' : 'tab-inactive'
              } ${isAspect && !isActive ? 'aspect-tab-pulse' : ''}`}
              style={{
                minHeight: '72px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(13,148,136,0.25), rgba(13,148,136,0.12))'
                  : 'var(--secondary)',
                border: isActive
                  ? '1.5px solid var(--primary)'
                  : '1px solid var(--border)',
                boxShadow: isActive ? '0 2px 12px rgba(13,148,136,0.2)' : 'none',
              }}
            >
              {/* Step number badge */}
              <span
                className="absolute top-1.5 left-2 text-[9px] font-bold leading-none w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  background: isActive ? 'var(--primary)' : 'var(--border)',
                  color: isActive ? 'white' : 'var(--muted-foreground)',
                }}
              >
                {tab.step}
              </span>

              {/* Icon */}
              <span style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                {tab.icon}
              </span>

              {/* Label */}
              <span
                className="text-xs font-bold leading-tight text-center"
                style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)' }}
              >
                {tab.label}
              </span>

              {/* Sublabel */}
              <span
                className="text-[9px] leading-none text-center opacity-70"
                style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
              >
                {tab.sublabel}
              </span>

              {/* Pulsing dot for Aspect Ratio when not active */}
              {isAspect && !isActive && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: 'var(--accent)', animation: 'ping-dot 1.5s ease-in-out infinite' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <div className="p-4 flex-1">
        {activeTab === 'compression' && (
          <CompressionPanel config={config} onChange={onChange} />
        )}
        {activeTab === 'aspect' && (
          <AspectRatioPanel config={config} onChange={onChange} />
        )}
        {activeTab === 'watermark' && (
          <WatermarkPanel config={config} onChange={onChange} />
        )}
      </div>
    </div>
  );
}