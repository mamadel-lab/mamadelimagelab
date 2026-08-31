'use client';
import React, { useState, useCallback } from 'react';
import { Download, Archive, Loader2, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ImageFile, ProcessingConfig } from '@/types/image';

interface ExportBarProps {
  files: ImageFile[];
  doneCount: number;
  totalCount: number;
  isProcessing: boolean;
  onProcessAll: () => void;
  config: ProcessingConfig;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ExportBar({ files, doneCount, totalCount, isProcessing, onProcessAll, config }: ExportBarProps) {
  const [isZipping, setIsZipping] = useState(false);
  const [zipDone, setZipDone] = useState(false);

  const doneFiles = files.filter(f => f.status === 'done' && f.outputBlob);
  const errorCount = files.filter(f => f.status === 'error').length;
  const queuedCount = files.filter(f => f.status === 'queued' || f.status === 'idle').length;

  const totalOriginalSize = files.reduce((acc, f) => acc + f.originalSize, 0);
  const totalOutputSize = doneFiles.reduce((acc, f) => acc + (f.outputSize ?? 0), 0);
  const overallSaving = totalOriginalSize > 0 && totalOutputSize > 0
    ? Math.round((1 - totalOutputSize / totalOriginalSize) * 100)
    : null;

  const handleDownloadZip = useCallback(async () => {
    if (doneFiles.length === 0) return;
    setIsZipping(true);
    setZipDone(false);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder('mamadel-processed') ?? zip;

      for (const f of doneFiles) {
        const baseName = f.name.replace(/\.[^.]+$/, '');
        const fileName = `${baseName}.${config.outputFormat}`;
        folder.file(fileName, f.outputBlob!);
      }

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mamadel-processed-${Date.now()}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setZipDone(true);
      setTimeout(() => setZipDone(false), 3000);
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsZipping(false);
    }
  }, [doneFiles, config.outputFormat]);

  if (totalCount === 0) return null;

  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div
      className="card-elevated sticky bottom-4 z-30 fade-in"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px var(--border)' }}
    >
      <div className="p-3 sm:p-4">
        {/* Progress row */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                  {isProcessing ? 'Processing…' : doneCount === totalCount && totalCount > 0 ? 'All done!' : 'Ready to process'}
                </span>
                <span className="text-xs numeric-tabular shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  {doneCount} / {totalCount}
                </span>
                {errorCount > 0 && (
                  <span className="hidden sm:flex items-center gap-1 text-xs shrink-0" style={{ color: 'var(--status-error)' }}>
                    <AlertCircle size={11} /> {errorCount} failed
                  </span>
                )}
              </div>
              <span className="text-xs font-bold numeric-tabular shrink-0 ml-2" style={{ color: 'var(--primary)' }}>
                {progressPct}%
              </span>
            </div>
            <div className="progress-bar-track h-2">
              <div
                className="progress-bar-fill h-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap mb-3">
          <div>
            <p className="panel-header">Original</p>
            <p className="text-sm font-bold numeric-tabular mt-0.5" style={{ color: 'var(--foreground)' }}>
              {formatBytes(totalOriginalSize)}
            </p>
          </div>
          {totalOutputSize > 0 && (
            <>
              <div className="text-lg" style={{ color: 'var(--border)' }}>→</div>
              <div>
                <p className="panel-header">Output</p>
                <p className="text-sm font-bold numeric-tabular mt-0.5" style={{ color: 'var(--status-done)' }}>
                  {formatBytes(totalOutputSize)}
                </p>
              </div>
              {overallSaving !== null && overallSaving > 0 && (
                <div
                  className="px-2 sm:px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <p className="panel-header">Saved</p>
                  <p className="text-sm font-bold numeric-tabular mt-0.5" style={{ color: '#10B981' }}>
                    {overallSaving}%
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action buttons row — wraps on mobile */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Process / Reprocess */}
          {(queuedCount > 0 || doneCount === 0) && (
            <button
              type="button"
              onClick={onProcessAll}
              disabled={isProcessing || totalCount === 0}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm flex-1 sm:flex-none justify-center"
              aria-label="Process all images"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={15} className="animate-spin-slow" />
                  <span className="hidden xs:inline">Processing…</span>
                  <span className="xs:hidden">…</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Process {totalCount > 0 ? `${queuedCount || totalCount}` : ''}</span>
                </>
              )}
            </button>
          )}

          {/* Reprocess if all done */}
          {doneCount === totalCount && totalCount > 0 && !isProcessing && (
            <button
              type="button"
              onClick={onProcessAll}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm flex-1 sm:flex-none justify-center"
              aria-label="Reprocess all images with current settings"
            >
              <Play size={14} />
              Reprocess
            </button>
          )}

          {/* Download individual files */}
          <button
            type="button"
            onClick={() => {
              doneFiles.forEach((f) => {
                const baseName = f.name.replace(/\.[^.]+$/, '');
                const fileName = `${baseName}.${config.outputFormat}`;
                const url = URL.createObjectURL(f.outputBlob!);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1500);
              });
            }}
            disabled={doneFiles.length === 0}
            className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm flex-1 sm:flex-none justify-center"
            aria-label={`Download ${doneFiles.length} files individually`}
          >
            <Download size={15} />
            <span className="hidden sm:inline">Download All</span>
            <span className="sm:hidden">Download</span>
            {doneFiles.length > 0 && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                {doneFiles.length}
              </span>
            )}
          </button>

          {/* Download ZIP */}
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={doneFiles.length === 0 || isZipping}
            className="btn-accent flex items-center gap-2 px-4 py-2.5 text-sm flex-1 sm:flex-none justify-center"
            aria-label={`Download ${doneFiles.length} processed images as ZIP`}
          >
            {isZipping ? (
              <>
                <Loader2 size={15} className="animate-spin-slow" />
                <span>Zipping…</span>
              </>
            ) : zipDone ? (
              <>
                <CheckCircle2 size={15} />
                <span>Done!</span>
              </>
            ) : (
              <>
                <Archive size={15} />
                <span>ZIP</span>
                {doneFiles.length > 0 && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    {doneFiles.length}
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {/* Format reminder */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded font-mono"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          >
            {config.outputFormat.toUpperCase()}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Q{config.quality}
          </span>
        </div>
      </div>
    </div>
  );
}