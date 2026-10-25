import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Star,
  Sparkles,
  Maximize,
  Sliders,
  Check,
  Palette
} from 'lucide-react';
import { ProcessingSettings, PresetCategory, ImagePreset } from '../types';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ProcessingSettings;
  onSave?: (
    name: string,
    category: PresetCategory,
    isFavorite: boolean,
    description?: string,
    overwriteId?: string
  ) => void;
  onSavePreset?: (
    name: string,
    category: PresetCategory,
    isFavorite: boolean,
    description?: string,
    overwriteId?: string
  ) => void;
  existingPresets?: ImagePreset[];
  editingPreset?: ImagePreset | null;
  presetToEdit?: ImagePreset | null;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
  onSavePreset,
  existingPresets = [],
  editingPreset = null,
  presetToEdit = null,
}) => {
  const activeEditingPreset = editingPreset || presetToEdit || null;
  const saveCallback = onSavePreset || onSave;

  const isStandardCategory = (cat?: string): boolean =>
    cat === 'Social' || cat === 'Web' || cat === 'Display' || cat === 'Print';

  const [name, setName] = useState(activeEditingPreset ? activeEditingPreset.name : '');
  const [description, setDescription] = useState(activeEditingPreset?.description || '');
  const [selectedCategoryOption, setSelectedCategoryOption] = useState<string>(() => {
    if (activeEditingPreset) {
      return isStandardCategory(activeEditingPreset.category)
        ? activeEditingPreset.category
        : 'Custom';
    }
    return 'Custom';
  });
  const [customCategoryName, setCustomCategoryName] = useState<string>(() => {
    if (activeEditingPreset) {
      return isStandardCategory(activeEditingPreset.category)
        ? ''
        : activeEditingPreset.category === 'Custom'
        ? ''
        : activeEditingPreset.category;
    }
    return '';
  });
  const [isFavorite, setIsFavorite] = useState(
    activeEditingPreset ? activeEditingPreset.isFavorite : false
  );
  const [overwriteId, setOverwriteId] = useState<string | undefined>(
    activeEditingPreset ? activeEditingPreset.id : undefined
  );

  // Sync state when modal opens or activeEditingPreset changes
  React.useEffect(() => {
    if (isOpen) {
      if (activeEditingPreset) {
        setName(activeEditingPreset.name);
        setDescription(activeEditingPreset.description || '');
        if (isStandardCategory(activeEditingPreset.category)) {
          setSelectedCategoryOption(activeEditingPreset.category);
          setCustomCategoryName('');
        } else {
          setSelectedCategoryOption('Custom');
          setCustomCategoryName(
            activeEditingPreset.category === 'Custom' ? '' : activeEditingPreset.category
          );
        }
        setIsFavorite(activeEditingPreset.isFavorite);
        setOverwriteId(activeEditingPreset.id);
      } else {
        setName('');
        setDescription('');
        setSelectedCategoryOption('Custom');
        setCustomCategoryName('');
        setIsFavorite(false);
        setOverwriteId(undefined);
      }
    }
  }, [isOpen, activeEditingPreset]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory: PresetCategory =
      selectedCategoryOption === 'Custom'
        ? customCategoryName.trim() || 'Custom'
        : selectedCategoryOption;

    if (saveCallback) {
      saveCallback(
        name.trim(),
        finalCategory,
        isFavorite,
        description.trim() || undefined,
        overwriteId
      );
    }
    onClose();
  };

  const categories = ['Custom', 'Social', 'Web', 'Display', 'Print'] as const;

  // Format description of the settings being captured
  const formatLabel =
    currentSettings.format === 'image/webp'
      ? 'WebP'
      : currentSettings.format === 'image/png'
      ? 'PNG'
      : 'JPEG';

  const scaleDescription =
    currentSettings.scaleMode === 'factor'
      ? `${currentSettings.scaleFactor}x Scaling`
      : currentSettings.scaleMode === 'percentage'
      ? `${Math.round(currentSettings.scaleFactor * 100)}% Scaling`
      : `${currentSettings.targetWidth} × ${currentSettings.targetHeight} px`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {editingPreset ? 'Edit Preset' : 'Save Image Preset'}
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {editingPreset
                  ? 'Update preset details or capture current settings'
                  : 'Save current settings and parameters for fast reuse'}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="button-close-save-preset-modal"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Preset Name */}
          <div>
            <label
              htmlFor="input-preset-name"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              Preset Name <span className="text-red-500">*</span>
            </label>
            <input
              id="input-preset-name"
              type="text"
              required
              placeholder="e.g. Etsy Product Banner 2x, Instagram Portrait..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400 focus:border-stone-900 dark:focus:border-stone-400"
              autoFocus
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label
              htmlFor="input-preset-desc"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              Description / Notes (Optional)
            </label>
            <input
              id="input-preset-desc"
              type="text"
              placeholder="e.g. Optimized for high contrast, crisp text, social upload"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400 focus:border-stone-900 dark:focus:border-stone-400"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  id={`btn-cat-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategoryOption(cat)}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-colors cursor-pointer ${
                    selectedCategoryOption === cat
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium shadow-xs'
                      : 'border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Custom Category Text Input Field (appears directly below category options when Custom is selected) */}
            {selectedCategoryOption === 'Custom' && (
              <div className="mt-2.5">
                <label
                  htmlFor="input-custom-category"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Custom Category Name
                </label>
                <input
                  id="input-custom-category"
                  type="text"
                  placeholder="e.g. Photography, E-Commerce, Wallpapers, Mobile..."
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400 focus:border-stone-900 dark:focus:border-stone-400"
                />
              </div>
            )}
          </div>

          {/* Mark as Favorite Switch */}
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star
                className={`w-4 h-4 ${
                  isFavorite ? 'text-amber-500 fill-amber-400' : 'text-stone-400'
                }`}
              />
              <div>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Mark as Favorite
                </span>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                  Adds to the quick-access favorites strip for 1-click apply
                </p>
              </div>
            </div>
            <button
              type="button"
              id="toggle-preset-favorite"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                isFavorite ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isFavorite ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Overwrite existing preset selection (if not currently editing a specific one) */}
          {!activeEditingPreset && existingPresets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-stone-600 dark:text-stone-400">
                  Or overwrite an existing custom preset:
                </label>
                {overwriteId && (
                  <button
                    type="button"
                    onClick={() => setOverwriteId(undefined)}
                    className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer"
                  >
                    Create new instead
                  </button>
                )}
              </div>
              <select
                id="select-overwrite-preset"
                value={overwriteId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setOverwriteId(val || undefined);
                  if (val) {
                    const match = existingPresets.find((p) => p.id === val);
                    if (match) {
                      setName(match.name);
                      if (isStandardCategory(match.category)) {
                        setSelectedCategoryOption(match.category);
                        setCustomCategoryName('');
                      } else {
                        setSelectedCategoryOption('Custom');
                        setCustomCategoryName(match.category === 'Custom' ? '' : match.category);
                      }
                      setIsFavorite(match.isFavorite);
                      if (match.description) setDescription(match.description);
                    }
                  }
                }}
                className="w-full px-3 py-1.5 text-xs border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 cursor-pointer"
              >
                <option value="">-- Create as Brand New Preset --</option>
                {existingPresets
                  .filter((p) => !p.isBuiltIn)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      Update: {p.name} ({p.category})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Current Settings Preview Card */}
          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 text-xs space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
              Snapshot of Settings to be Saved:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                <Maximize className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">{scaleDescription}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                <Sliders className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  Algorithm:{' '}
                  <strong className="font-semibold text-stone-900 dark:text-stone-100 capitalize">
                    {currentSettings.algorithm}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-200 dark:bg-stone-750 text-stone-800 dark:text-stone-200">
                  {formatLabel}
                </span>
                <span>
                  Quality:{' '}
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {currentSettings.format === 'image/png'
                      ? 'Lossless'
                      : `${Math.round(currentSettings.quality * 100)}%`}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Sharp:{' '}
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {currentSettings.adjustments.sharpness}%
                  </strong>{' '}
                  · Clarity:{' '}
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {currentSettings.adjustments.clarity}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              id="button-cancel-save-preset"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="button-confirm-save-preset"
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-semibold text-white dark:text-stone-900 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white disabled:bg-stone-300 dark:disabled:bg-stone-700 dark:disabled:text-stone-500 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{activeEditingPreset ? 'Update Preset' : 'Save Preset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
