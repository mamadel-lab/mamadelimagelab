'use client';
import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Clock, ChevronDown, ChevronUp, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { ImageFile, ProcessingConfig } from '@/types/image';

interface FileQueueProps {
  files: ImageFile[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  config: ProcessingConfig;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function StatusBadge({ status, error }: { status: ImageFile['status']; error: string | null }) {
  if (status === 'done') return (
    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--status-done)', border: '1px solid rgba(16,185,129,0.25)' }}>
      <CheckCircle2 size={11} /> Done
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--status-error)', border: '1px solid rgba(239,68,68,0.25)' }}
      title={error || 'Processing failed'}>
      <AlertCircle size={11} /> Error
    </span>
  );
  if (status === 'processing') return (
    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full animate-pulse-glow"
      style={{ background: 'rgba(6,182,212,0.12)', color: 'var(--status-processing)', border: '1px solid rgba(6,182,212,0.3)' }}>
      <Loader2 size={11} className="animate-spin-slow" /> Processing
    </span>
  );
  if (status === 'queued') return (
    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--status-queued)', border: '1px solid rgba(245,158,11,0.25)' }}>
      <Clock size={11} /> Queued
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
      Idle
    </span>
  );
}

function FileRow({ file, onRemove, config }: { file: ImageFile; onRemove: (id: string) => void; config: ProcessingConfig }) {
  const [expanded, setExpanded] = useState(false);
  const rowClass = file.status === 'done' ? 'file-row file-row-done'
    : file.status === 'error' ? 'file-row file-row-error'
    : file.status === 'processing'? 'file-row file-row-processing' :'file-row';

  const ext = config.outputFormat.toUpperCase();
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const outputName = `${baseName}.${config.outputFormat}`;

  return (
    <div className={`${rowClass} p-3 transition-all duration-150`}>
      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div
          className="w-11 h-11 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
        >
          {file.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.previewUrl}
              alt={`Preview of ${file.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={18} style={{ color: 'var(--muted-foreground)' }} />
          )}
        </div>

        {/* Name + output */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }} title={file.name}>
            {file.name}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
            {outputName} &middot; {ext}
          </p>
        </div>

        {/* Sizes */}
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span className="text-xs numeric-tabular" style={{ color: 'var(--muted-foreground)' }}>
            {formatBytes(file.originalSize)}
          </span>
          {file.outputSize !== null && (
            <span
              className="text-xs numeric-tabular font-semibold mt-0.5"
              style={{ color: file.compressionRatio && file.compressionRatio > 0 ? 'var(--status-done)' : 'var(--status-error)' }}
            >
              {formatBytes(file.outputSize)}
              {file.compressionRatio !== null && (
                <span className="ml-1 text-xs">
                  {file.compressionRatio > 0 ? `-${file.compressionRatio}%` : `+${Math.abs(file.compressionRatio)}%`}
                </span>
              )}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="shrink-0">
          <StatusBadge status={file.status} error={file.error} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {file.outputBlob && (
            <button
              type="button"
              onClick={() => {
                const url = URL.createObjectURL(file.outputBlob!);
                const a = document.createElement('a');
                a.href = url;
                a.download = outputName;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
              className="p-1.5 rounded-md transition-all duration-150"
              style={{ color: 'var(--accent)' }}
              title="Download this file"
              aria-label={`Download ${outputName}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-md transition-all duration-150"
            style={{ color: 'var(--muted-foreground)' }}
            title="Toggle details"
            aria-label="Toggle file details"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="p-1.5 rounded-md transition-all duration-150 hover:text-red-400"
            style={{ color: 'var(--muted-foreground)' }}
            title="Remove this file"
            aria-label={`Remove ${file.name}`}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Processing progress bar */}
      {file.status === 'processing' && (
        <div className="mt-2.5 progress-bar-track h-1">
          <div className="progress-bar-fill h-full w-full" style={{ animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div
          className="mt-3 pt-3 section-divider grid grid-cols-2 sm:grid-cols-4 gap-3 fade-in"
        >
          <div>
            <p className="panel-header mb-1">Original</p>
            <p className="text-sm numeric-tabular font-semibold" style={{ color: 'var(--foreground)' }}>
              {formatBytes(file.originalSize)}
            </p>
          </div>
          <div>
            <p className="panel-header mb-1">Output</p>
            <p className="text-sm numeric-tabular font-semibold" style={{ color: file.outputSize !== null ? 'var(--status-done)' : 'var(--muted-foreground)' }}>
              {file.outputSize !== null ? formatBytes(file.outputSize) : '—'}
            </p>
          </div>
          <div>
            <p className="panel-header mb-1">Saved</p>
            <p className="text-sm numeric-tabular font-semibold" style={{ color: 'var(--status-done)' }}>
              {file.compressionRatio !== null ? `${file.compressionRatio > 0 ? file.compressionRatio : 0}%` : '—'}
            </p>
          </div>
          <div>
            <p className="panel-header mb-1">Format</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              {config.outputFormat.toUpperCase()}
            </p>
          </div>
          {file.error && (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-xs" style={{ color: 'var(--status-error)' }}>
                {file.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FileQueue({ files, onRemove, onClearAll, config }: FileQueueProps) {
  const doneCount = files.filter(f => f.status === 'done').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const processingCount = files.filter(f => f.status === 'processing').length;

  return (
    <div className="card-surface flex flex-col" style={{ minHeight: '320px' }}>
      {/* Queue header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            File Queue
          </h2>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full numeric-tabular"
            style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--secondary-foreground)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            {files.length}
          </span>
          {processingCount > 0 && (
            <span className="text-xs" style={{ color: 'var(--status-processing)' }}>
              Processing {processingCount}…
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          {doneCount > 0 && (
            <span className="text-xs numeric-tabular" style={{ color: 'var(--status-done)' }}>
              ✓ {doneCount} done
            </span>
          )}
          {errorCount > 0 && (
            <span className="text-xs numeric-tabular" style={{ color: 'var(--status-error)' }}>
              ✗ {errorCount} error{errorCount > 1 ? 's' : ''}
            </span>
          )}
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs btn-danger px-2.5 py-1.5"
            aria-label="Clear all files from queue"
          >
            <Trash2 size={12} />
            Clear All
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ maxHeight: '520px' }}>
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon size={32} style={{ color: 'var(--muted-foreground)' }} className="mb-3 opacity-40" />
            <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              No images in queue
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
              Drop images on the upload zone above to get started
            </p>
          </div>
        ) : (
          files.map((file) => (
            <FileRow key={file.id} file={file} onRemove={onRemove} config={config} />
          ))
        )}
      </div>
    </div>
  );
}