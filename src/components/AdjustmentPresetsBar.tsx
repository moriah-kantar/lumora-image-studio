import React, { useState, useMemo } from 'react';
import {
  AdjustmentPreset,
  AdjustmentPresetCategory,
  ImageAdjustments,
  DEFAULT_ADJUSTMENTS,
} from '../types';
import {
  Star,
  Plus,
  RotateCcw,
  Sparkles,
  Sliders,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';

interface AdjustmentPresetsBarProps {
  presets: AdjustmentPreset[];
  activeAdjustments: ImageAdjustments;
  activePresetId?: string | null;
  onApplyPreset: (preset: AdjustmentPreset) => void;
  onToggleFavorite: (presetId: string) => void;
  onOpenSaveModal: (presetToEdit?: AdjustmentPreset) => void;
  onDeletePreset: (presetId: string) => void;
  onResetAllAdjustments: () => void;
}

export const AdjustmentPresetsBar: React.FC<AdjustmentPresetsBarProps> = ({
  presets,
  activeAdjustments,
  activePresetId,
  onApplyPreset,
  onToggleFavorite,
  onOpenSaveModal,
  onDeletePreset,
  onResetAllAdjustments,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Count non-default adjustments currently applied
  const modifiedCount = useMemo(() => {
    let count = 0;
    const keys = Object.keys(DEFAULT_ADJUSTMENTS) as (keyof ImageAdjustments)[];
    for (const k of keys) {
      if (activeAdjustments[k] !== DEFAULT_ADJUSTMENTS[k]) {
        count++;
      }
    }
    return count;
  }, [activeAdjustments]);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: '★ Starred' },
    { id: 'Cinematic', label: 'Cinematic' },
    { id: 'Portrait', label: 'Portrait' },
    { id: 'Landscape', label: 'Landscape' },
    { id: 'B&W', label: 'B&W' },
    { id: 'Vintage', label: 'Vintage' },
    { id: 'Custom', label: 'Custom' },
  ];

  const filteredPresets = useMemo(() => {
    return presets.filter((p) => {
      if (selectedCategory === 'favorites') return p.isFavorite;
      if (selectedCategory === 'all') return true;
      return p.category === selectedCategory;
    });
  }, [presets, selectedCategory]);

  return (
    <div className="space-y-2.5 pb-3 border-b border-stone-200 dark:border-stone-800">
      {/* Top Header: Title, Reset All, and Save Preset */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
            Adjustment Presets
          </h3>
          {modifiedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              {modifiedCount} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {modifiedCount > 0 && (
            <button
              type="button"
              id="btn-reset-all-adjustments-top"
              onClick={onResetAllAdjustments}
              title="Reset all photo adjustments to defaults"
              className="px-2 py-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}

          <button
            type="button"
            id="btn-save-current-as-adjustment-preset"
            onClick={() => onOpenSaveModal()}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>Save Preset</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              id={`preset-category-${cat.id.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium border shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Preset Cards Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
        {filteredPresets.length === 0 ? (
          <div className="col-span-full py-4 px-3 text-center bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              No presets in this category.
            </p>
            {selectedCategory === 'favorites' && (
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                Click the star on any preset to save it here.
              </p>
            )}
          </div>
        ) : (
          filteredPresets.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                className={`relative group p-2 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer select-none ${
                  isActive
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-xs'
                    : 'bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                }`}
                onClick={() => onApplyPreset(preset)}
              >
                {/* Top Row: Name & Favorite button */}
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[11px] font-bold leading-snug line-clamp-1">
                    {preset.name}
                  </span>
                  <button
                    type="button"
                    title={preset.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(preset.id);
                    }}
                    className={`p-0.5 rounded transition-colors cursor-pointer ${
                      preset.isFavorite
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-stone-300 hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400'
                    }`}
                  >
                    <Star
                      className={`w-3 h-3 ${preset.isFavorite ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>

                {/* Bottom Row: Category & Badges / Actions */}
                <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-stone-100 dark:border-stone-800/80">
                  <span
                    className={`text-[9px] font-medium truncate ${
                      isActive
                        ? 'text-stone-300 dark:text-stone-700'
                        : 'text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {preset.category}
                  </span>

                  {/* Custom Preset Actions (Edit, Delete) */}
                  {!preset.isBuiltIn && (
                    <div
                      className="flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenSaveModal(preset)}
                        title="Edit preset"
                        className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePreset(preset.id)}
                        title="Delete preset"
                        className="p-1 rounded text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
