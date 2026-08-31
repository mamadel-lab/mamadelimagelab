'use client';
import React, { useCallback, useRef, useState } from 'react';
import { Upload, ImagePlus, FolderOpen } from 'lucide-react';

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/avif'];
const MAX_FILES = 20;

export default function UploadZone({ onFilesAdded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragError, setIsDragError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAdd = useCallback((fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    const valid = arr.filter(f => ACCEPTED_TYPES.includes(f.type)).slice(0, MAX_FILES);
    const invalid = arr.length - valid.length;
    if (valid.length > 0) onFilesAdded(valid);
    if (invalid > 0) {
      setIsDragError(true);
      setTimeout(() => setIsDragError(false), 2000);
    }
  }, [onFilesAdded]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndAdd(e.dataTransfer.files);
  }, [validateAndAdd]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAdd(e.target.files);
    e.target.value = '';
  }, [validateAndAdd]);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        isDragError
          ? 'border-red-500 bg-red-500/5'
          : isDragging
          ? 'drag-active' :'hover:border-primary/50 hover:bg-primary/5'
      }`}
      style={{
        borderColor: isDragError ? 'var(--status-error)' : isDragging ? 'var(--primary)' : 'var(--border)',
        background: isDragging ? 'rgba(124,58,237,0.06)' : 'var(--muted)',
        minHeight: '160px',
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload images — click or drag and drop"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={onFileChange}
        className="hidden"
        aria-hidden="true"
      />

      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {/* Max files notice */}
        <p className="text-xs font-medium mb-4 px-3 py-1.5 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--primary)', border: '1px solid rgba(124,58,237,0.2)' }}>
          Add up to 20 images maximum
        </p>

        {/* Icon cluster */}
        <div className="relative mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: isDragging
                ? 'rgba(124,58,237,0.2)'
                : 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              transition: 'all 200ms ease',
              boxShadow: isDragging ? '0 0 24px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            {isDragging ? (
              <ImagePlus size={28} style={{ color: 'var(--primary)' }} />
            ) : (
              <Upload size={28} style={{ color: 'var(--primary)' }} />
            )}
          </div>
          <div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 0 8px rgba(6,182,212,0.4)' }}
          >
            <span className="text-white text-xs font-bold leading-none">+</span>
          </div>
        </div>

        {isDragError ? (
          <p className="font-semibold text-base" style={{ color: 'var(--status-error)' }}>
            Some files are not supported — use JPG, PNG, WEBP, GIF, BMP, or AVIF
          </p>
        ) : isDragging ? (
          <p className="font-semibold text-base" style={{ color: 'var(--primary)' }}>
            Release to add images
          </p>
        ) : (
          <>
            <p className="font-semibold text-base mb-1" style={{ color: 'var(--foreground)' }}>
              Drop images here, or{' '}
              <span style={{ color: 'var(--primary)' }}>click to browse</span>
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              JPG, PNG, WEBP, GIF, BMP, AVIF &mdash; up to 20 images per batch
            </p>
          </>
        )}

        {/* Format chips */}
        <div className="flex flex-wrap gap-2 mt-5 justify-center">
          {['JPEG', 'PNG', 'WEBP', 'GIF', 'BMP', 'AVIF'].map((fmt) => (
            <span
              key={`fmt-chip-${fmt}`}
              className="px-2.5 py-1 text-xs font-medium rounded-full"
              style={{
                background: 'var(--secondary)',
                border: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
              }}
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Browse button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold btn-primary"
        >
          <FolderOpen size={15} />
          Browse Files
        </button>
      </div>
    </div>
  );
}