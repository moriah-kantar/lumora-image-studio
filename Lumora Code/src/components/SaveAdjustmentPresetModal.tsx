import React, { useState, useEffect } from 'react';
import {
  ImageAdjustments,
  AdjustmentPreset,
  AdjustmentPresetCategory,
  DEFAULT_ADJUSTMENTS,
} from '../types';
import {
  X,
  Sparkles,
  Star,
  Check,
  Tag,
  FileText,
  Sliders,
} from 'lucide-react';

interface SaveAdjustmentPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdjustments: ImageAdjustments;
  onSavePreset: (
    name: string,
    category: AdjustmentPresetCategory,
    adjustments: ImageAdjustments,
    isFavorite: boolean,
    description?: string,
    existingId?: string
  ) => void;
  editingPreset?: AdjustmentPreset | null;
  existingCustomPresets?: AdjustmentPreset[];
}

const PRESET_CATEGORIES: AdjustmentPresetCategory[] = [
  'General',
  'Cinematic',
  'Portrait',
  'Landscape',
  'B&W',
  'Vintage',
  'Creative',
  'Custom',
];

export const SaveAdjustmentPresetModal: React.FC<SaveAdjustmentPresetModalProps> = ({
  isOpen,
  onClose,
  currentAdjustments,
  onSavePreset,
  editingPreset,
  existingCustomPresets = [],
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AdjustmentPresetCategory>('Custom');
  const [description, setDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [overwriteId, setOverwriteId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (editingPreset) {
      setName(editingPreset.name);
      setCategory(editingPreset.category);
      setDescription(editingPreset.description || '');
      setIsFavorite(editingPreset.isFavorite);
      setOverwriteId(editingPreset.id);
    } else {
      setName('');
      setCategory('Custom');
      setDescription('');
      setIsFavorite(false);
      setOverwriteId(undefined);
    }
  }, [editingPreset, isOpen]);

  if (!isOpen) return null;

  // Find non-zero adjustments to display as summary chips
  const activeAdjustmentChips: { label: string; value: string }[] = [];
  const keys: (keyof ImageAdjustments)[] = [
    'exposure',
    'brightness',
    'contrast',
    'highlights',
    'shadows',
    'whites',
    'blacks',
    'temperature',
    'tint',
    'vibrance',
    'saturation',
    'sharpness',
    'clarity',
    'texture',
    'dehaze',
    'denoise',
    'colorBalanceRed',
    'colorBalanceGreen',
    'colorBalanceBlue',
    'vignette',
    'grain',
  ];

  keys.forEach((k) => {
    const val = currentAdjustments[k];
    if (typeof val === 'number' && val !== (DEFAULT_ADJUSTMENTS[k] || 0)) {
      const sign = val > 0 ? `+${val}` : `${val}`;
      const label = k
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
      activeAdjustmentChips.push({ label, value: sign });
    }
  });

  if (currentAdjustments.blackAndWhite) {
    activeAdjustmentChips.push({
      label: 'B&W Mode',
      value: currentAdjustments.bwTone !== 'none' ? currentAdjustments.bwTone : 'Active',
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSavePreset(
      name.trim(),
      category,
      currentAdjustments,
      isFavorite,
      description.trim() || undefined,
      overwriteId
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {editingPreset ? 'Edit Adjustment Preset' : 'Save Adjustment Preset'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Save your active photo adjustments for one-click re-use
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-save-adjustment-preset-modal"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Preset Name */}
          <div>
            <label
              htmlFor="adjustment-preset-name-input"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
            >
              Preset Name <span className="text-red-500">*</span>
            </label>
            <input
              id="adjustment-preset-name-input"
              type="text"
              required
              placeholder="e.g., Warm Sunset Portrait, Moody Film Look..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              autoFocus
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="adjustment-preset-category-select"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
            >
              Category
            </label>
            <select
              id="adjustment-preset-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as AdjustmentPresetCategory)}
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 cursor-pointer"
            >
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Overwrite Existing Preset Selection */}
          {!editingPreset && existingCustomPresets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="adjustment-overwrite-select"
                  className="text-xs font-medium text-stone-600 dark:text-stone-400"
                >
                  Or overwrite existing custom preset:
                </label>
                {overwriteId && (
                  <button
                    type="button"
                    onClick={() => setOverwriteId(undefined)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Save as new
                  </button>
                )}
              </div>
              <select
                id="adjustment-overwrite-select"
                value={overwriteId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setOverwriteId(val || undefined);
                  if (val) {
                    const match = existingCustomPresets.find((p) => p.id === val);
                    if (match) {
                      setName(match.name);
                      setCategory(match.category);
                      setIsFavorite(match.isFavorite);
                      if (match.description) setDescription(match.description);
                    }
                  }
                }}
                className="w-full px-3 py-1.5 text-xs border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 cursor-pointer"
              >
                <option value="">-- Create as Brand New Preset --</option>
                {existingCustomPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    Update: {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description (Optional) */}
          <div>
            <label
              htmlFor="adjustment-preset-description-input"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
            >
              Description <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              id="adjustment-preset-description-input"
              type="text"
              placeholder="e.g., Soft highlights, rich film grain, warm temperature..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Star
                className={`w-4 h-4 ${
                  isFavorite
                    ? 'text-amber-500 fill-amber-400'
                    : 'text-stone-400 dark:text-stone-500'
                }`}
              />
              <div>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                  Add to Favorites
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Pins this preset to the top quick-access bar
                </span>
              </div>
            </div>
            <button
              type="button"
              id="btn-toggle-favorite-in-modal"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
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

          {/* Active Adjustments Included Snapshot */}
          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3 h-3" />
                <span>Adjustments Captured ({activeAdjustmentChips.length}):</span>
              </span>
            </div>

            {activeAdjustmentChips.length === 0 ? (
              <p className="text-[11px] text-stone-400 italic">
                All adjustment sliders are currently at neutral / default values.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {activeAdjustmentChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 shadow-2xs"
                  >
                    <span>{chip.label}:</span>
                    <strong className="text-amber-600 dark:text-amber-400 font-mono">
                      {chip.value}
                    </strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              id="cancel-save-adjustment-preset"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-save-adjustment-preset"
              disabled={!name.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-40 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingPreset || overwriteId ? 'Update Preset' : 'Save Preset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
