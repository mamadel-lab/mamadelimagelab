// Backend integration point: This tool is entirely client-side.
// All image processing uses the Canvas API in the browser.
// No server calls are made at any point.
import React from 'react';
import AppHeader from '@/components/AppHeader';
import ImageProcessingTool from '@/app/components/ImageProcessingTool';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <AppHeader />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-4 sm:py-6">
        <ImageProcessingTool />
      </main>
    </div>
  );
}