import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import PrivacyBadge from '@/app/components/PrivacyBadge';

export default function AppHeader() {
  return (
    <header
      className="w-full border-b sticky top-0 z-40"
      style={{
        background: 'rgba(10, 10, 20, 0.92)',
        backdropFilter: 'blur(16px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AppLogo size={32} />
          <div className="flex flex-col">
            <span
              className="font-bold text-sm sm:text-base leading-tight tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              MamadelImageLab
            </span>
            <span
              className="hidden sm:block text-xs leading-tight"
              style={{ color: 'var(--muted-foreground)', letterSpacing: '0.03em' }}
            >
              Client-Side Image Engine
            </span>
          </div>
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1">
          <a
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--secondary-foreground)' }}
          >
            Image Processing Tool
          </a>
        </nav>

        {/* Right: privacy badge */}
        <div className="flex items-center gap-3">
          <PrivacyBadge />
        </div>
      </div>
    </header>
  );
}