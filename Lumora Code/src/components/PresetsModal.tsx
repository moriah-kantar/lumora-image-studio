import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Bookmark,
  Star,
  Plus,
  Search,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Sliders,
  Filter
} from 'lucide-react';
import { ImagePreset, PresetCategory, ProcessingSettings } from '../types';
import { PresetItemCard } from './PresetItemCard';
import {
  exportPresetsToJson,
  parseImportedPresets,
} from '../utils/presetsStorage';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: ImagePreset[];
  activePresetId?: string | null;
  onApplyPreset: (preset: ImagePreset) => void;
  onToggleFavorite: (id: string) => void;
  onOpenSavePreset: (presetToEdit?: ImagePreset) => void;
  onDeletePreset: (id: string) => void;
  onOverwritePreset: (preset: ImagePreset) => void;
  onImportPresets: (presets: ImagePreset[]) => void;
  onResetDefaults: () => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  presets,
  activePresetId,
  onApplyPreset,
  onToggleFavorite,
  onOpenSavePreset,
  onDeletePreset,
  onOverwritePreset,
  onImportPresets,
  onResetDefaults,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Presets' },
    { id: 'Social', label: 'Social' },
    { id: 'Web', label: 'Web' },
    { id: 'Display', label: 'Display & 4K' },
    { id: 'Custom', label: 'Custom' },
  ];

  const filteredPresets = useMemo(() => {
    return presets.filter((p) => {
      if (favoritesOnly && !p.isFavorite) return false;
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'Custom') {
          const isStandard = ['Social', 'Web', 'Display', 'Print'].includes(p.category);
          if (isStandard && p.category !== 'Custom') return false;
        } else if (p.category !== selectedCategory) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query) || false;
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesFormat = p.settings.format.toLowerCase().includes(query);
        const matchesAlgo = p.settings.algorithm.toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesDesc &&
          !matchesCategory &&
          !matchesFormat &&
          !matchesAlgo
        ) {
          return false;
        }
      }
      return true;
    });
  }, [presets, favoritesOnly, selectedCategory, searchQuery]);

  const favoritesCount = useMemo(() => {
    return presets.filter((p) => p.isFavorite).length;
  }, [presets]);

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        const parsed = parseImportedPresets(content);
        if (parsed && parsed.length > 0) {
          onImportPresets(parsed);
        } else {
          alert('Invalid presets JSON format. Could not import.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col h-[85vh] max-h-[850px]"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  Image Presets & Favorites
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  {presets.length} Presets
                </span>
                {favoritesCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    {favoritesCount} Favorites
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Save, edit, and 1-click apply your favorite dimension, upscale, and format configurations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-modal-save-preset"
              onClick={() => onOpenSavePreset()}
              className="px-3 py-1.5 text-xs font-semibold text-white dark:text-stone-900 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400 dark:text-amber-600" />
              <span>Save Current as Preset</span>
            </button>

            <button
              type="button"
              id="button-close-presets-modal"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-wrap items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              id="filter-favorites-toggle"
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
                favoritesOnly
                  ? 'bg-amber-500 text-stone-900 border-amber-500 font-semibold shadow-xs'
                  : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  favoritesOnly ? 'fill-stone-900 text-stone-900' : 'text-amber-500 fill-amber-400'
                }`}
              />
              <span>Favorites Only</span>
              {favoritesCount > 0 && (
                <span className="text-[10px] bg-white/40 dark:bg-black/30 px-1.5 py-0.2 rounded-full font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>

            <div className="h-4 w-[1px] bg-stone-200 dark:bg-stone-800 mx-1" />

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                id={`filter-cat-${cat.id.toLowerCase()}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (favoritesOnly && cat.id !== 'all') {
                    // keep favoritesOnly
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat.id && !favoritesOnly
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-xs'
                    : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            <input
              id="search-presets-input"
              type="text"
              placeholder="Search by name, format, algorithm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400 focus:border-stone-900 dark:focus:border-stone-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Presets Grid */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50 dark:bg-stone-950/50">
          {filteredPresets.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800">
              <Bookmark className="w-10 h-10 text-stone-300 dark:text-stone-600 mb-2" />
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">No matching presets found</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mt-1 mb-4">
                {favoritesOnly
                  ? 'You haven’t starred any presets as favorites yet. Click the star icon on any preset to pin it here.'
                  : 'Try adjusting your search query or filter category.'}
              </p>
              {favoritesOnly && (
                <button
                  type="button"
                  onClick={() => setFavoritesOnly(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  View All Presets
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredPresets.map((preset) => (
                <PresetItemCard
                  key={preset.id}
                  preset={preset}
                  isActive={activePresetId === preset.id}
                  onApply={(p) => {
                    onApplyPreset(p);
                    onClose();
                  }}
                  onToggleFavorite={onToggleFavorite}
                  onEdit={(p) => onOpenSavePreset(p)}
                  onDelete={onDeletePreset}
                  onOverwriteWithCurrent={onOverwritePreset}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with Import / Export & Reset Defaults */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* Export JSON */}
            <button
              type="button"
              id="btn-export-presets-json"
              onClick={() => exportPresetsToJson(presets)}
              className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-750 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Backup presets as a JSON file"
            >
              <Download className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>Export Presets</span>
            </button>

            {/* Import JSON */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFileChange}
            />
            <button
              type="button"
              id="btn-import-presets-json"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-750 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Import presets from a JSON file"
            >
              <Upload className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>Import JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-reset-presets-default"
              onClick={() => {
                if (
                  window.confirm(
                    'Reset to default presets? Your custom presets will be replaced by the default template library.'
                  )
                ) {
                  onResetDefaults();
                }
              }}
              className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Defaults</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-750 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
