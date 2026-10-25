import React, { useState } from 'react';
import {
  Star,
  Check,
  Edit2,
  Trash2,
  Maximize,
  Sliders,
  Sparkles,
  ArrowRight,
  MoreVertical,
  RotateCcw
} from 'lucide-react';
import { ImagePreset, PresetCategory } from '../types';

interface PresetItemCardProps {
  preset: ImagePreset;
  isActive: boolean;
  onApply: (preset: ImagePreset) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (preset: ImagePreset) => void;
  onDelete: (id: string) => void;
  onOverwriteWithCurrent?: (preset: ImagePreset) => void;
}

const CATEGORY_COLORS: Record<PresetCategory, string> = {
  Social: 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/60',
  Web: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
  Display: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
  Print: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
  Custom: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700',
};

export const PresetItemCard: React.FC<PresetItemCardProps> = ({
  preset,
  isActive,
  onApply,
  onToggleFavorite,
  onEdit,
  onDelete,
  onOverwriteWithCurrent,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const s = preset.settings;

  // Format description
  const scaleText =
    s.scaleMode === 'factor'
      ? `${s.scaleFactor}x`
      : s.scaleMode === 'percentage'
      ? `${Math.round(s.scaleFactor * 100)}%`
      : s.targetWidth && s.targetHeight
      ? `${s.targetWidth}×${s.targetHeight}`
      : `${s.scaleFactor}x`;

  const formatText =
    s.format === 'image/webp'
      ? `WebP ${Math.round(s.quality * 100)}%`
      : s.format === 'image/jpeg'
      ? `JPEG ${Math.round(s.quality * 100)}%`
      : 'PNG Lossless';

  const hasAdjustments =
    s.adjustments.sharpness > 0 ||
    s.adjustments.clarity !== 0 ||
    s.adjustments.denoise > 0;

  return (
    <div
      id={`preset-card-${preset.id}`}
      className={`relative p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
        isActive
          ? 'bg-amber-50/40 dark:bg-amber-950/30 border-amber-400/80 dark:border-amber-600 ring-1 ring-amber-400 shadow-xs'
          : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xs'
      }`}
    >
      {/* Top row: Title, Star, and Category */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              id={`preset-star-${preset.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(preset.id);
              }}
              className={`p-1 -ml-1 rounded-md transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer ${
                preset.isFavorite ? 'text-amber-500' : 'text-stone-300 dark:text-stone-600 hover:text-stone-400'
              }`}
              title={preset.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Star
                className={`w-4 h-4 ${preset.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`}
              />
            </button>
            <h3
              className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate"
              title={preset.name}
            >
              {preset.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                CATEGORY_COLORS[preset.category] || CATEGORY_COLORS.Custom
              }`}
            >
              {preset.category}
            </span>

            {/* Menu trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                title="Preset options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => {
                      setShowMenu(false);
                      setIsConfirmingDelete(false);
                    }}
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg py-1 z-30 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(preset);
                      }}
                      className="w-full text-left px-3 py-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-750 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                      <span>Edit Details</span>
                    </button>

                    {onOverwriteWithCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onOverwriteWithCurrent(preset);
                        }}
                        className="w-full text-left px-3 py-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-750 flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Overwrite with Current</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-stone-100 dark:border-stone-750" />

                    {isConfirmingDelete ? (
                      <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 space-y-1">
                        <p className="text-[10px] font-medium">Delete this preset?</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowMenu(false);
                              onDelete(preset.id);
                            }}
                            className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(false)}
                            className="text-[10px] text-stone-500 dark:text-stone-400 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(true)}
                        className="w-full text-left px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Preset</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {preset.description && (
          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mb-2 pl-6">
            {preset.description}
          </p>
        )}

        {/* Specs Badges */}
        <div className="flex flex-wrap gap-1.5 my-2 pl-6">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-750">
            <Maximize className="w-3 h-3 text-stone-500 dark:text-stone-400" />
            {scaleText}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-750 capitalize">
            <Sliders className="w-3 h-3 text-stone-500 dark:text-stone-400" />
            {s.algorithm}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-750">
            {formatText}
          </span>
          {hasAdjustments && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              Enhanced
            </span>
          )}
        </div>
      </div>

      {/* Bottom Apply Action */}
      <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between pl-6">
        <span className="text-[10px] text-stone-400 dark:text-stone-500">
          {preset.isBuiltIn ? 'Built-in Template' : 'User Preset'}
        </span>

        <button
          type="button"
          id={`btn-apply-preset-${preset.id}`}
          onClick={() => onApply(preset)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
            isActive
              ? 'bg-amber-500 text-stone-900 shadow-xs'
              : 'bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 shadow-xs'
          }`}
        >
          {isActive ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Applied</span>
            </>
          ) : (
            <>
              <span>Apply</span>
              <ArrowRight className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
