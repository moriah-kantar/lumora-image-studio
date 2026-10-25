import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  SplitSquareVertical,
  Columns,
  Eye,
  Sparkles,
  Loader2,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { UploadedImage, ProcessedResult } from '../types';
import { formatBytes, getAspectRatioLabel } from '../utils/imageProcessing';

interface ImagePreviewComparisonProps {
  originalImage: UploadedImage;
  processedResult: ProcessedResult | null;
  isProcessing: boolean;
}

type ViewMode = 'split' | 'side-by-side' | 'processed' | 'original';

export const ImagePreviewComparison: React.FC<ImagePreviewComparisonProps> = ({
  originalImage,
  processedResult,
  isProcessing,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0-100
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSplit = useRef(false);

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSplitPos(50);
  }, [originalImage.id]);

  // Handle Split Slider Dragging
  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingSplit.current = true;
  };

  const handleContainerMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingSplit.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSplitPos(percentage);
    }
  }, []);

  const handleContainerMouseUp = useCallback(() => {
    isDraggingSplit.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleContainerMouseMove);
    window.addEventListener('mouseup', handleContainerMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleContainerMouseMove);
      window.removeEventListener('mouseup', handleContainerMouseUp);
    };
  }, [handleContainerMouseMove, handleContainerMouseUp]);

  // Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1 && !isDraggingSplit.current) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.3, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.3, 0.25));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || containerRef.current?.contains(e.target as Node)) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.15 : 0.85;
      setZoom((z) => Math.max(0.2, Math.min(6, z * delta)));
    }
  };

  // Compute stats
  const origW = originalImage.width;
  const origH = originalImage.height;
  const procW = processedResult?.width || origW;
  const procH = processedResult?.height || origH;
  const origSize = originalImage.sizeBytes;
  const procSize = processedResult?.sizeBytes || 0;

  const sizeDeltaPercent = origSize > 0 && procSize > 0
    ? Math.round(((procSize - origSize) / origSize) * 100)
    : 0;

  const origMp = ((origW * origH) / 1000000).toFixed(2);
  const procMp = ((procW * procH) / 1000000).toFixed(2);

  return (
    <div className="flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Top Bar: View Mode Tabs & Zoom Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950/80 border-b border-stone-800 text-stone-300 text-xs">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
          <button
            id="view-mode-split"
            type="button"
            onClick={() => setViewMode('split')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'split' ? 'bg-stone-800 text-white font-medium shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Split comparison slider"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Slider</span>
          </button>

          <button
            id="view-mode-side"
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'side-by-side' ? 'bg-stone-800 text-white font-medium shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Side by side comparison"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side by Side</span>
          </button>

          <button
            id="view-mode-processed"
            type="button"
            onClick={() => setViewMode('processed')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'processed' ? 'bg-stone-800 text-white font-medium shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Show processed image only"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Output</span>
          </button>

          <button
            id="view-mode-original"
            type="button"
            onClick={() => setViewMode('original')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'original' ? 'bg-stone-800 text-white font-medium shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Show original image only"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1">
          <button
            id="zoom-out-btn"
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1 text-[11px] text-stone-400 font-mono w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            id="zoom-in-btn"
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            id="zoom-fit-btn"
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title="Fit to frame (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Preview Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center overflow-hidden select-none bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] bg-stone-950 ${
          zoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* Processing Indicator Overlay */}
        {isProcessing && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900/90 text-stone-200 border border-stone-700 backdrop-blur-md shadow-lg text-xs font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Processing...</span>
          </div>
        )}

        {/* Checkerboard backdrop for transparency */}
        <div
          className="relative max-w-full max-h-full transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Transparent Grid Pattern Canvas */}
          <div className="relative shadow-2xl rounded-sm overflow-hidden border border-stone-800/80 bg-[repeating-conic-gradient(#1c1917_0%_25%,#292524_0%_50%)] [background-size:20px_20px]">
            {/* View Mode 1: Split Slider */}
            {viewMode === 'split' && (
              <div className="relative inline-block max-h-[360px] sm:max-h-[460px] lg:max-h-[500px]">
                {/* Processed Image (Full background layer) */}
                <img
                  src={processedResult?.dataUrl || originalImage.previewUrl}
                  alt="Processed"
                  className="max-h-[360px] sm:max-h-[460px] lg:max-h-[500px] w-auto block pointer-events-none object-contain"
                />

                {/* Original Image (Clipped overlay on the left) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${splitPos}%` }}
                >
                  <img
                    src={originalImage.previewUrl}
                    alt="Original"
                    className="max-h-[360px] sm:max-h-[460px] lg:max-h-[500px] w-auto block object-contain"
                    style={{ maxWidth: 'none' }}
                  />
                </div>

                {/* Draggable Vertical Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                  style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
                  onMouseDown={handleSplitMouseDown}
                >
                  <div className="w-7 h-7 rounded-full bg-white text-stone-900 border border-stone-300 shadow-md flex items-center justify-center text-[10px] font-bold">
                    ↔
                  </div>
                </div>

                {/* On-canvas Badges */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-stone-300 pointer-events-none">
                  Original
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-amber-300 pointer-events-none">
                  Processed
                </div>
              </div>
            )}

            {/* View Mode 2: Side by Side */}
            {viewMode === 'side-by-side' && (
              <div className="flex items-center gap-2 p-2">
                <div className="relative">
                  <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-stone-300">
                    Original
                  </span>
                  <img
                    src={originalImage.previewUrl}
                    alt="Original"
                    className="max-h-[340px] sm:max-h-[420px] w-auto block object-contain rounded"
                  />
                </div>
                <div className="relative">
                  <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-amber-300">
                    Processed
                  </span>
                  <img
                    src={processedResult?.dataUrl || originalImage.previewUrl}
                    alt="Processed"
                    className="max-h-[340px] sm:max-h-[420px] w-auto block object-contain rounded"
                  />
                </div>
              </div>
            )}

            {/* View Mode 3: Processed Only */}
            {viewMode === 'processed' && (
              <div className="relative">
                <img
                  src={processedResult?.dataUrl || originalImage.previewUrl}
                  alt="Processed Only"
                  className="max-h-[360px] sm:max-h-[460px] lg:max-h-[500px] w-auto block object-contain"
                />
                <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-amber-300">
                  Output Preview
                </span>
              </div>
            )}

            {/* View Mode 4: Original Only */}
            {viewMode === 'original' && (
              <div className="relative">
                <img
                  src={originalImage.previewUrl}
                  alt="Original Only"
                  className="max-h-[360px] sm:max-h-[460px] lg:max-h-[500px] w-auto block object-contain"
                />
                <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-stone-300">
                  Original Source
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Floating Stats Bar */}
      <div className="px-4 py-3 bg-stone-950 border-t border-stone-800 text-stone-300">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Dimensions */}
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 font-medium">Resolution</span>
            <div className="flex items-center gap-1.5 font-mono text-stone-200 mt-0.5">
              <span>{origW}×{origH}</span>
              <ArrowRight className="w-3 h-3 text-stone-400" />
              <span className="text-amber-400 font-semibold">{procW}×{procH}</span>
            </div>
          </div>

          {/* Megapixels & Aspect Ratio */}
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 font-medium">Megapixels & Ratio</span>
            <div className="flex items-center gap-1.5 text-stone-200 mt-0.5">
              <span>{origMp} MP</span>
              <ArrowRight className="w-3 h-3 text-stone-400" />
              <span className="text-stone-100 font-semibold">{procMp} MP</span>
              <span className="text-stone-400 text-[10px]">({getAspectRatioLabel(procW, procH)})</span>
            </div>
          </div>

          {/* File Size & Reduction/Increase */}
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 font-medium">File Size</span>
            <div className="flex items-center gap-1.5 font-mono mt-0.5">
              <span>{formatBytes(origSize)}</span>
              <ArrowRight className="w-3 h-3 text-stone-400" />
              <span className="text-stone-100 font-semibold">
                {procSize > 0 ? formatBytes(procSize) : 'Estimating...'}
              </span>
              {procSize > 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded font-sans font-medium ${
                    sizeDeltaPercent <= 0
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {sizeDeltaPercent <= 0 ? (
                    <TrendingDown className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingUp className="w-2.5 h-2.5" />
                  )}
                  {sizeDeltaPercent <= 0 ? `${sizeDeltaPercent}%` : `+${sizeDeltaPercent}%`}
                </span>
              )}
            </div>
          </div>

          {/* Format & Render Time */}
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 font-medium">Format & Engine</span>
            <div className="flex items-center gap-1.5 text-stone-200 mt-0.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-200 uppercase">
                {processedResult?.format.replace('image/', '') || 'PNG'}
              </span>
              {processedResult?.processingTimeMs !== undefined && (
                <span className="text-[10px] text-stone-400">
                  in {processedResult.processingTimeMs}ms
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
