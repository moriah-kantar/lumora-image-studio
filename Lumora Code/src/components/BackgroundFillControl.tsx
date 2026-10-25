import React, { useState, useEffect, useCallback } from 'react';
import {
  ProcessingSettings,
  BackgroundFillType,
  GradientConfig,
} from '../types';
import {
  DEFAULT_GRADIENT,
  getSavedCustomColors,
  saveCustomColor,
  removeCustomColor,
} from '../utils/gradientUtils';
import { GradientEditor } from './GradientEditor';
import {
  Palette,
  Sparkles,
  Plus,
  Trash2,
  Bookmark,
  Check,
  Layers,
} from 'lucide-react';

interface BackgroundFillControlProps {
  settings: ProcessingSettings;
  onUpdateSettings: (updates: Partial<ProcessingSettings>) => void;
  hasAlphaDetected?: boolean;
}

export const BackgroundFillControl: React.FC<BackgroundFillControlProps> = ({
  settings,
  onUpdateSettings,
  hasAlphaDetected = false,
}) => {
  // Fill Mode: 'solid' or 'gradient'
  const activeMode: BackgroundFillType = settings.backgroundType || 'solid';

  // Saved solid colors from localStorage
  const [savedColors, setSavedColors] = useState<string[]>(() =>
    getSavedCustomColors()
  );

  // Gradient configuration
  const activeGradient: GradientConfig =
    settings.backgroundGradient || DEFAULT_GRADIENT;

  // Solid color presets (kept identical to original options)
  const defaultSolidPresets = ['#ffffff', '#000000', '#f8fafc', '#0f172a'];

  const handleSelectMode = (mode: BackgroundFillType) => {
    onUpdateSettings({
      backgroundType: mode,
      // If switching to gradient for the first time, ensure gradient config exists
      backgroundGradient: settings.backgroundGradient || DEFAULT_GRADIENT,
      fillTransparency: true,
    });
  };

  const handleSelectSolidColor = (color: string) => {
    onUpdateSettings({
      backgroundColor: color,
      backgroundType: 'solid',
      fillTransparency: true,
    });
  };

  const handleSaveCurrentColor = () => {
    const currentColor = settings.backgroundColor || '#ffffff';
    const updated = saveCustomColor(currentColor);
    setSavedColors(updated);
  };

  const handleRemoveSavedColor = (color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeCustomColor(color);
    setSavedColors(updated);
  };

  const handleGradientChange = (newGradient: GradientConfig) => {
    onUpdateSettings({
      backgroundType: 'gradient',
      backgroundGradient: newGradient,
      fillTransparency: true,
    });
  };

  // Check if current solid color is already in saved colors or defaults
  const isColorAlreadySaved =
    defaultSolidPresets.includes(settings.backgroundColor?.toLowerCase() || '') ||
    savedColors.includes(settings.backgroundColor?.toLowerCase() || '');

  const isJpeg = settings.format === 'image/jpeg';
  const isFillEnabled = isJpeg || Boolean(settings.fillTransparency);

  return (
    <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
      {/* Header with Title & Transparency Notice */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
          <span>Background Fill (For Transparent Areas)</span>
        </label>
        {hasAlphaDetected && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800/60">
            Transparency Detected
          </span>
        )}
      </div>

      {/* Non-JPEG Format: Transparency Fill Toggle */}
      {!isJpeg && (
        <div className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span className="text-xs text-stone-700 dark:text-stone-300">Apply fill to transparent areas</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.fillTransparency)}
              onChange={(e) =>
                onUpdateSettings({ fillTransparency: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-stone-200 dark:bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-stone-900 dark:peer-checked:bg-amber-500" />
          </label>
        </div>
      )}

      {/* Sub-Tabs: Solid Color vs Gradient */}
      <div className="grid grid-cols-2 gap-1 p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
        <button
          type="button"
          onClick={() => handleSelectMode('solid')}
          className={`py-1.5 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMode === 'solid'
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-700'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <div
            className="w-3 h-3 rounded-full border border-stone-400 dark:border-stone-600"
            style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}
          />
          <span>Solid Color</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode('gradient')}
          className={`py-1.5 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMode === 'gradient'
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-700'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-indigo-500" />
          <span className="flex items-center gap-1">
            <span>Gradient</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </span>
        </button>
      </div>

      {/* MODE 1: SOLID COLOR FILL */}
      {activeMode === 'solid' && (
        <div className="space-y-3">
          {/* Default Solid Swatches + Custom Picker (Exact same options & functionality preserved) */}
          <div>
            <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Standard Colors
            </span>
            <div className="flex items-center gap-2">
              {defaultSolidPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelectSolidColor(color)}
                  className={`w-7 h-7 rounded-lg border border-stone-300 dark:border-stone-600 shadow-xs transition-transform cursor-pointer ${
                    settings.backgroundColor?.toLowerCase() === color.toLowerCase()
                      ? 'ring-2 ring-stone-900 dark:ring-stone-100 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Fill with ${color}`}
                />
              ))}

              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[10px] text-stone-500 dark:text-stone-400">Custom:</span>
                <input
                  type="color"
                  value={settings.backgroundColor || '#ffffff'}
                  onChange={(e) => handleSelectSolidColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border border-stone-200 dark:border-stone-700 p-0.5 bg-transparent"
                  title="Choose custom color"
                />

                {/* Save Custom Color Button */}
                <button
                  type="button"
                  onClick={handleSaveCurrentColor}
                  disabled={isColorAlreadySaved}
                  className="px-2 py-1 text-[11px] font-medium rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-transparent text-stone-700 dark:text-stone-300 flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title={
                    isColorAlreadySaved
                      ? 'Color is already in presets'
                      : 'Save this color for future use'
                  }
                >
                  <Plus className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Saved Custom Colors Library */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-amber-500" />
                <span>Saved Custom Colors</span>
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">
                {savedColors.length} saved
              </span>
            </div>

            {savedColors.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {savedColors.map((color) => {
                  const isSelected =
                    settings.backgroundColor?.toLowerCase() === color.toLowerCase();
                  return (
                    <div
                      key={color}
                      className="group relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectSolidColor(color)}
                        className={`w-6 h-6 rounded-md border border-stone-300 dark:border-stone-600 shadow-2xs transition-transform cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'ring-2 ring-stone-900 dark:ring-stone-100 scale-105'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Fill with ${color}`}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3 h-3 ${
                              color.toLowerCase() === '#ffffff' ||
                              color.toLowerCase() === '#f8fafc'
                                ? 'text-stone-900'
                                : 'text-white drop-shadow-xs'
                            }`}
                          />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSavedColor(color, e)}
                        className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-stone-900 dark:bg-stone-700 text-white hover:bg-red-600 rounded-full flex items-center justify-center text-[8px] transition-opacity shadow-xs cursor-pointer"
                        title="Delete saved color"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-stone-400 dark:text-stone-500 italic">
                Pick any custom color and click "Save" to save it here for future use.
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: GRADIENT FILL (Photoshop-style Gradient Tool) */}
      {activeMode === 'gradient' && (
        <GradientEditor
          value={activeGradient}
          onChange={handleGradientChange}
          onApply={() => {
            onUpdateSettings({
              backgroundType: 'gradient',
              backgroundGradient: activeGradient,
              fillTransparency: true,
            });
          }}
        />
      )}
    </div>
  );
};
