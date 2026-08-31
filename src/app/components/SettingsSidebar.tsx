'use client';
import React, { useState, useEffect } from 'react';
import { Zap, Crop, Stamp, X } from 'lucide-react';
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

const TABS: { id: 'compression' | 'aspect' | 'watermark'; label: string; icon: React.ReactNode; step: number }[] = [
  { id: 'compression', label: 'Resize', icon: <Zap size={14} />, step: 1 },
  { id: 'aspect', label: 'Aspect Ratio', icon: <Crop size={14} />, step: 2 },
  { id: 'watermark', label: 'Watermark', icon: <Stamp size={14} />, step: 3 },
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
          {/* Arrow pointing down to tabs */}
          <span style={{ color: 'var(--accent)', fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>💡</span>
          <span style={{ lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--accent)' }}>3 steps</strong> to perfect your image — explore each tab above!
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

      {/* Tab bar */}
      <div
        className="flex border-b p-1 gap-1 relative"
        style={{ borderColor: 'var(--border)', background: 'rgba(0,0,0,0.2)' }}
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
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs font-semibold rounded-lg transition-all duration-150 relative ${
                isActive ? 'tab-active' : 'tab-inactive'
              } ${isAspect && !isActive ? 'aspect-tab-pulse' : ''}`}
            >
              {/* Step badge */}
              <span
                className="absolute top-1 right-1.5 text-[8px] font-bold leading-none"
                style={{
                  color: isActive ? 'var(--accent)' : 'rgba(6,182,212,0.5)',
                }}
              >
                {tab.step}
              </span>
              {tab.icon}
              <span className="text-[10px] leading-none">{tab.label}</span>
              {/* Pulsing dot for Aspect Ratio when not active */}
              {isAspect && !isActive && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
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