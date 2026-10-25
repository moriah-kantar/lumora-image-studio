import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  GradientConfig,
  GradientColorStop,
  GradientType,
} from '../types';
import {
  DEFAULT_GRADIENT,
  BUILTIN_GRADIENTS,
  getBarTrackCssGradient,
  getCssGradient,
  sampleGradientColorAt,
  getSavedCustomGradients,
  saveCustomGradient,
  removeCustomGradient,
} from '../utils/gradientUtils';
import {
  RotateCw,
  ArrowLeftRight,
  Plus,
  Trash2,
  Bookmark,
  Check,
  Sparkles,
  Sliders,
  Eye,
} from 'lucide-react';

interface GradientEditorProps {
  value?: GradientConfig;
  onChange: (gradient: GradientConfig) => void;
  onApply?: () => void;
  autoApply?: boolean;
}

export const GradientEditor: React.FC<GradientEditorProps> = ({
  value,
  onChange,
  onApply,
  autoApply = true,
}) => {
  // Ensure we have a valid initial gradient configuration
  const gradient: GradientConfig = useMemo(() => {
    if (value && value.stops && value.stops.length >= 2) {
      return value;
    }
    return DEFAULT_GRADIENT;
  }, [value]);

  const [activeStopId, setActiveStopId] = useState<string>(() => {
    return gradient.stops[0]?.id || 'stop-1';
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedStopId, setDraggedStopId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Saved custom gradients
  const [savedGradients, setSavedGradients] = useState<GradientConfig[]>(() =>
    getSavedCustomGradients()
  );
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Keep active stop valid if stops change
  useEffect(() => {
    if (!gradient.stops.some((s) => s.id === activeStopId)) {
      if (gradient.stops.length > 0) {
        setActiveStopId(gradient.stops[0].id);
      }
    }
  }, [gradient.stops, activeStopId]);

  const activeStop = useMemo(() => {
    return (
      gradient.stops.find((s) => s.id === activeStopId) || gradient.stops[0]
    );
  }, [gradient.stops, activeStopId]);

  // Update a single stop's properties
  const updateStop = useCallback(
    (id: string, updates: Partial<GradientColorStop>) => {
      const newStops = gradient.stops.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );
      onChange({ ...gradient, stops: newStops });
    },
    [gradient, onChange]
  );

  // Add a new stop at a percentage [0..100]
  const handleAddStopAt = useCallback(
    (positionPercent: number) => {
      const pos = Math.max(0, Math.min(100, Math.round(positionPercent)));
      const sampledColor = sampleGradientColorAt(gradient.stops, pos);
      const newStop: GradientColorStop = {
        id: `stop-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        color: sampledColor,
        position: pos,
      };
      const newStops = [...gradient.stops, newStop].sort(
        (a, b) => a.position - b.position
      );
      onChange({ ...gradient, stops: newStops });
      setActiveStopId(newStop.id);
    },
    [gradient, onChange]
  );

  // Delete current active stop
  const handleDeleteStop = useCallback(
    (idToDelete: string) => {
      if (gradient.stops.length <= 2) return; // Minimum 2 stops for a gradient
      const newStops = gradient.stops.filter((s) => s.id !== idToDelete);
      onChange({ ...gradient, stops: newStops });
      if (activeStopId === idToDelete) {
        setActiveStopId(newStops[0].id);
      }
    },
    [gradient, onChange, activeStopId]
  );

  // Pointer drag logic for stops
  const handlePointerDownStop = (
    e: React.PointerEvent<HTMLDivElement>,
    stopId: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveStopId(stopId);
    setDraggedStopId(stopId);
    setIsDragging(true);

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const rawPct = ((moveEvt.clientX - rect.left) / rect.width) * 100;
      const clampedPct = Math.max(0, Math.min(100, Math.round(rawPct)));
      updateStop(stopId, { position: clampedPct });
    };

    const onPointerUp = (upEvt: PointerEvent) => {
      target.releasePointerCapture(upEvt.pointerId);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUp);
      setIsDragging(false);
      setDraggedStopId(null);
    };

    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);
  };

  // Click on the gradient bar to add a stop
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const rawPct = ((e.clientX - rect.left) / rect.width) * 100;
    handleAddStopAt(rawPct);
  };

  // Flip / Reverse gradient
  const handleReverseGradient = () => {
    const reversedStops = gradient.stops.map((s) => ({
      ...s,
      position: Math.round(100 - s.position),
    }));
    onChange({ ...gradient, stops: reversedStops });
  };

  // Save custom gradient to storage
  const handleSaveGradient = () => {
    const name = saveName.trim() || `Custom Gradient ${savedGradients.length + 1}`;
    const updated = saveCustomGradient({
      ...gradient,
      name,
    });
    setSavedGradients(updated);
    setSaveName('');
    setShowSaveInput(false);
  };

  const handleRemoveSavedGradient = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeCustomGradient(id);
    setSavedGradients(updated);
  };

  // Common quick colors to paint stops
  const quickColors = [
    '#ffffff',
    '#000000',
    '#ff0000',
    '#ff7f00',
    '#ffff00',
    '#00e676',
    '#00b0ff',
    '#3d5afe',
    '#d500f9',
    '#ec4899',
    '#f59e0b',
    '#06b6d4',
  ];

  return (
    <div className="space-y-3.5 bg-stone-50/80 dark:bg-stone-900/80 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
      {/* 1. Live Gradient Preview Banner & Real-time Indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>Gradient Live Preview</span>
          </span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
            {gradient.type.toUpperCase()} • {gradient.type === 'linear' ? `${gradient.angle}°` : 'CENTER'}
          </span>
        </div>

        <div
          className="w-full h-10 rounded-lg shadow-inner border border-stone-200/80 dark:border-stone-700/80 relative overflow-hidden transition-all"
          style={{ background: getCssGradient(gradient) }}
        />
      </div>

      {/* 2. Photoshop-style Gradient Bar & Draggable Color Stops */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Gradient Stops Bar</span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400">
            Click bar to add stop • Drag pins to position
          </span>
        </div>

        {/* Gradient Bar Track */}
        <div className="relative pt-1 pb-6 select-none">
          <div
            ref={trackRef}
            onClick={handleBarClick}
            className="w-full h-7 rounded-md cursor-crosshair shadow-inner border border-stone-300 dark:border-stone-600 relative"
            style={{ background: getBarTrackCssGradient(gradient.stops) }}
            title="Click anywhere to add a color stop"
          />

          {/* Interactive Stop Pins */}
          <div className="relative w-full h-0">
            {gradient.stops.map((stop) => {
              const isActive = stop.id === activeStopId;
              const isBeingDragged = isDragging && draggedStopId === stop.id;

              return (
                <div
                  key={stop.id}
                  onPointerDown={(e) => handlePointerDownStop(e, stop.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStopId(stop.id);
                  }}
                  className={`absolute top-0.5 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform ${
                    isBeingDragged ? 'scale-110 z-30' : isActive ? 'z-20 scale-105' : 'z-10 hover:scale-105'
                  }`}
                  style={{ left: `${stop.position}%` }}
                  title={`Stop at ${Math.round(stop.position)}%: ${stop.color}`}
                >
                  {/* Pin Arrow Tip pointing upward */}
                  <div
                    className={`w-0 h-0 border-x-[5px] border-x-transparent border-b-[6px] ${
                      isActive
                        ? 'border-b-stone-900 dark:border-b-stone-100'
                        : 'border-b-stone-600 dark:border-b-stone-400'
                    }`}
                  />
                  {/* Pin Color Swatch Square */}
                  <div
                    className={`w-4 h-4 rounded-xs border-2 shadow-sm ${
                      isActive
                        ? 'border-stone-900 dark:border-stone-100 ring-2 ring-stone-900/30 dark:ring-stone-100/30'
                        : 'border-white dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-500'
                    }`}
                    style={{ backgroundColor: stop.color }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Active Stop Controls Panel */}
      {activeStop && (
        <div className="p-2.5 bg-white dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md border border-stone-300 dark:border-stone-600 shadow-2xs"
                style={{ backgroundColor: activeStop.color }}
              />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Stop Color & Position
              </span>
            </div>

            {/* Delete Stop Button (min 2 stops) */}
            <button
              type="button"
              disabled={gradient.stops.length <= 2}
              onClick={() => handleDeleteStop(activeStop.id)}
              className="p-1 text-stone-400 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 disabled:hover:text-stone-400 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
              title={
                gradient.stops.length <= 2
                  ? 'Gradients require at least 2 stops'
                  : 'Delete this stop'
              }
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            {/* Color Picker & Hex Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                Color
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={activeStop.color}
                  onChange={(e) => updateStop(activeStop.id, { color: e.target.value })}
                  className="w-7 h-7 rounded border border-stone-200 dark:border-stone-700 p-0.5 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={activeStop.color.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      updateStop(activeStop.id, { color: val });
                    }
                  }}
                  className="w-20 px-2 py-1 text-xs font-mono border border-stone-200 dark:border-stone-700 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
                />
              </div>
            </div>

            {/* Position Slider & Number Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                <span>Position</span>
                <span className="font-mono text-stone-800 dark:text-stone-200">
                  {Math.round(activeStop.position)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(activeStop.position)}
                  onChange={(e) =>
                    updateStop(activeStop.id, { position: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-amber-500"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(activeStop.position)}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    if (!isNaN(num)) {
                      updateStop(activeStop.id, {
                        position: Math.max(0, Math.min(100, num)),
                      });
                    }
                  }}
                  className="w-12 px-1.5 py-1 text-xs font-mono text-center border border-stone-200 dark:border-stone-700 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
                />
              </div>
            </div>
          </div>

          {/* Quick Color Swatches for Active Stop */}
          <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">Quick:</span>
            {quickColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateStop(activeStop.id, { color })}
                className="w-4 h-4 rounded border border-stone-300 dark:border-stone-600 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: color }}
                title={`Set stop to ${color}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Gradient Geometry (Type & Angle Controls) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Type: Linear vs Radial */}
        <div>
          <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
            Gradient Style
          </label>
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-stone-200/70 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => onChange({ ...gradient, type: 'linear' })}
              className={`py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                gradient.type === 'linear'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Linear
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...gradient, type: 'radial' })}
              className={`py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                gradient.type === 'radial'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Radial
            </button>
          </div>
        </div>

        {/* Angle & Flip (for Linear) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              {gradient.type === 'linear' ? 'Angle & Direction' : 'Orientation'}
            </label>
            <button
              type="button"
              onClick={handleReverseGradient}
              className="text-[10px] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reverse gradient colors"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Flip</span>
            </button>
          </div>

          {gradient.type === 'linear' ? (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={gradient.angle}
                onChange={(e) =>
                  onChange({ ...gradient, angle: parseInt(e.target.value, 10) })
                }
                className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-amber-500"
              />
              <span className="w-10 text-xs font-mono font-medium text-stone-700 dark:text-stone-300 text-right">
                {gradient.angle}°
              </span>
            </div>
          ) : (
            <div className="py-1 px-2 text-[11px] text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-md text-center">
              Centered Radial
            </div>
          )}
        </div>
      </div>

      {/* Quick Angle Preset Buttons (for Linear) */}
      {gradient.type === 'linear' && (
        <div className="grid grid-cols-5 gap-1 pt-0.5">
          {[
            { label: '0° →', angle: 90 },
            { label: '90° ↓', angle: 180 },
            { label: '45° ↘', angle: 135 },
            { label: '180° ←', angle: 270 },
            { label: '270° ↑', angle: 0 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange({ ...gradient, angle: preset.angle })}
              className={`py-1 text-[10px] rounded border transition-colors cursor-pointer ${
                gradient.angle === preset.angle
                  ? 'border-stone-800 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium'
                  : 'border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* 5. Built-in Gradient Presets (Rainbow, Sunset, Aurora, etc.) */}
      <div className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-stone-800">
        <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
          Built-in Presets (Multicolor & Blends)
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {BUILTIN_GRADIENTS.map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => onChange(bg)}
              className="group relative h-7 rounded-md border border-stone-200 dark:border-stone-700 shadow-2xs hover:scale-102 transition-transform overflow-hidden cursor-pointer"
              style={{ background: getCssGradient(bg) }}
              title={bg.name}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <span className="opacity-0 group-hover:opacity-100 text-[9px] text-white font-medium drop-shadow-sm px-1 truncate">
                  {bg.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Saved Custom Gradients Section */}
      <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-amber-500" />
            <span>Saved Custom Gradients</span>
          </span>

          {!showSaveInput ? (
            <button
              type="button"
              onClick={() => setShowSaveInput(true)}
              className="text-[11px] text-stone-700 dark:text-stone-300 font-medium hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3 text-stone-600 dark:text-stone-400" />
              <span>Save Current</span>
            </button>
          ) : null}
        </div>

        {/* Save name prompt field */}
        {showSaveInput && (
          <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-700">
            <input
              type="text"
              placeholder="Gradient name (e.g. Neon Horizon)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveGradient()}
              className="flex-1 px-2 py-1 text-xs border border-stone-200 dark:border-stone-700 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveGradient}
              className="px-2.5 py-1 text-xs bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded font-medium hover:bg-stone-800 dark:hover:bg-white cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowSaveInput(false)}
              className="px-2 py-1 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Saved Custom Gradients Shelf */}
        {savedGradients.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5">
            {savedGradients.map((sg) => (
              <div
                key={sg.id}
                onClick={() => onChange(sg)}
                className="group relative h-8 rounded-md border border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs hover:border-stone-400 dark:hover:border-stone-500 transition-all overflow-hidden flex items-center justify-between px-2"
                style={{ background: getCssGradient(sg) }}
                title={sg.name}
              >
                <span className="text-[10px] text-white font-medium drop-shadow-md truncate max-w-[80%]">
                  {sg.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveSavedGradient(sg.id!, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 bg-black/50 text-white hover:bg-red-600 rounded transition-all cursor-pointer"
                  title="Remove saved gradient"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-stone-400 dark:text-stone-500 italic">
            No saved custom gradients yet. Configure any gradient above and click "Save Current".
          </p>
        )}
      </div>

      {/* 7. Action Button: Apply to Transparent Areas */}
      {onApply && (
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={onApply}
            className="w-full py-2 px-3 text-xs font-semibold text-white dark:text-stone-900 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Gradient to Transparent Areas</span>
          </button>
        </div>
      )}
    </div>
  );
};
