import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Maximize,
  Sparkles,
  Download,
  Copy,
  Check,
  Link,
  Unlink,
  RotateCw,
  Archive,
  RefreshCw,
  Palette,
  FileDown,
  Bookmark,
  Star,
  Plus,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  ProcessingSettings,
  ScaleMode,
  ResampleAlgorithm,
  OutputFormat,
  UploadedImage,
  ProcessedResult,
  ImagePreset,
  AdjustmentPreset,
  AdjustmentPresetCategory,
  ImageAdjustments,
  DEFAULT_ADJUSTMENTS,
} from '../types';
import { DIMENSION_PRESETS } from '../data/presets';
import { formatBytes } from '../utils/imageProcessing';
import {
  SUPPORTED_FORMATS,
  FormatDescriptor,
  getFormatExtension,
} from '../utils/formatEncoders';
import { PresetItemCard } from './PresetItemCard';
import { BackgroundFillControl } from './BackgroundFillControl';
import { AdjustmentsWorkspace } from './AdjustmentsWorkspace';
import { SaveAdjustmentPresetModal } from './SaveAdjustmentPresetModal';
import {
  loadAllAdjustmentPresets,
  createCustomAdjustmentPreset,
  updateCustomAdjustmentPreset,
  deleteCustomAdjustmentPreset,
  toggleAdjustmentPresetFavorite,
} from '../utils/adjustmentPresetsStorage';

interface ControlsPanelProps {
  settings: ProcessingSettings;
  onUpdateSettings: (newSettings: Partial<ProcessingSettings>) => void;
  originalImage: UploadedImage;
  processedResult: ProcessedResult | null;
  isProcessing: boolean;
  onDownload: () => void;
  onCopyToClipboard: () => Promise<boolean>;
  allImagesCount: number;
  onDownloadBatchZip?: () => void;
  // Format preference
  defaultFormat?: OutputFormat;
  onSetDefaultFormat?: (format: OutputFormat) => void;
  // Presets & Favorites
  presets: ImagePreset[];
  activePresetId?: string | null;
  onApplyPreset: (preset: ImagePreset) => void;
  onToggleFavoritePreset: (id: string) => void;
  onOpenSavePresetModal: (presetToEdit?: ImagePreset) => void;
  onDeletePreset: (id: string) => void;
  onOverwritePresetWithCurrent: (preset: ImagePreset) => void;
  onOpenPresetsModal: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onUpdateSettings,
  originalImage,
  processedResult,
  isProcessing,
  onDownload,
  onCopyToClipboard,
  allImagesCount,
  onDownloadBatchZip,
  defaultFormat = 'image/webp',
  onSetDefaultFormat,
  presets,
  activePresetId,
  onApplyPreset,
  onToggleFavoritePreset,
  onOpenSavePresetModal,
  onDeletePreset,
  onOverwritePresetWithCurrent,
  onOpenPresetsModal,
}) => {
  const [activeTab, setActiveTab] = useState<'scale' | 'quality' | 'format' | 'presets'>('scale');
  const [copied, setCopied] = useState(false);
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('all');
  const [presetSearch, setPresetSearch] = useState<string>('');

  // Adjustment Presets Workspace State
  const [adjustmentPresets, setAdjustmentPresets] = useState<AdjustmentPreset[]>(() =>
    loadAllAdjustmentPresets()
  );
  const [activeAdjustmentPresetId, setActiveAdjustmentPresetId] = useState<string | null>(null);
  const [isSaveAdjModalOpen, setIsSaveAdjModalOpen] = useState(false);
  const [editingAdjPreset, setEditingAdjPreset] = useState<AdjustmentPreset | null>(null);

  const handleApplyAdjustmentPreset = (preset: AdjustmentPreset) => {
    setActiveAdjustmentPresetId(preset.id);
    onUpdateSettings({
      adjustments: { ...DEFAULT_ADJUSTMENTS, ...preset.adjustments },
    });
  };

  const handleToggleFavoriteAdjPreset = (presetId: string) => {
    toggleAdjustmentPresetFavorite(presetId);
    setAdjustmentPresets(loadAllAdjustmentPresets());
  };

  const handleOpenSaveAdjModal = (presetToEdit?: AdjustmentPreset) => {
    setEditingAdjPreset(presetToEdit || null);
    setIsSaveAdjModalOpen(true);
  };

  const handleDeleteAdjPreset = (presetId: string) => {
    deleteCustomAdjustmentPreset(presetId);
    setAdjustmentPresets(loadAllAdjustmentPresets());
    if (activeAdjustmentPresetId === presetId) {
      setActiveAdjustmentPresetId(null);
    }
  };

  const handleSaveAdjPreset = (
    name: string,
    category: AdjustmentPresetCategory,
    adjustments: ImageAdjustments,
    isFavorite: boolean,
    description?: string,
    existingId?: string
  ) => {
    if (existingId) {
      updateCustomAdjustmentPreset(existingId, {
        name,
        category,
        adjustments: { ...adjustments },
        isFavorite,
        description,
      });
    } else {
      createCustomAdjustmentPreset(name, adjustments, category, description, isFavorite);
    }
    setAdjustmentPresets(loadAllAdjustmentPresets());
    setIsSaveAdjModalOpen(false);
    setEditingAdjPreset(null);
  };

  const favoritePresets = useMemo(() => {
    return presets.filter((p) => p.isFavorite);
  }, [presets]);

  const filteredPresetsForPanel = useMemo(() => {
    return presets.filter((p) => {
      if (presetCategoryFilter === 'favorites' && !p.isFavorite) return false;
      if (presetCategoryFilter !== 'all' && presetCategoryFilter !== 'favorites') {
        if (presetCategoryFilter === 'Custom') {
          const isStandard = ['Social', 'Web', 'Display', 'Print'].includes(p.category);
          if (isStandard && p.category !== 'Custom') return false;
        } else if (p.category !== presetCategoryFilter) {
          return false;
        }
      }
      if (presetSearch.trim()) {
        const q = presetSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [presets, presetCategoryFilter, presetSearch]);

  const origW = originalImage.width;
  const origH = originalImage.height;

  // Handle Scale Factor Click
  const handleScaleFactorSelect = (factor: number) => {
    onUpdateSettings({
      scaleMode: 'factor',
      scaleFactor: factor,
      targetWidth: Math.round(origW * factor),
      targetHeight: Math.round(origH * factor),
    });
  };

  // Handle Width change
  const handleWidthChange = (w: number) => {
    if (w <= 0) return;
    if (settings.maintainAspectRatio) {
      const h = Math.round(w / (origW / origH));
      onUpdateSettings({
        targetWidth: w,
        targetHeight: h,
        scaleFactor: Number((w / origW).toFixed(2)),
      });
    } else {
      onUpdateSettings({
        targetWidth: w,
        scaleFactor: Number((w / origW).toFixed(2)),
      });
    }
  };

  // Handle Height change
  const handleHeightChange = (h: number) => {
    if (h <= 0) return;
    if (settings.maintainAspectRatio) {
      const w = Math.round(h * (origW / origH));
      onUpdateSettings({
        targetWidth: w,
        targetHeight: h,
        scaleFactor: Number((h / origH).toFixed(2)),
      });
    } else {
      onUpdateSettings({
        targetHeight: h,
      });
    }
  };

  // Swap Width and Height
  const handleSwapDimensions = () => {
    const curW = settings.targetWidth;
    const curH = settings.targetHeight;
    onUpdateSettings({
      targetWidth: curH,
      targetHeight: curW,
    });
  };

  // Preset Selection
  const handlePresetSelect = (presetId: string) => {
    const preset = DIMENSION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onUpdateSettings({
      presetId,
      scaleMode: 'preset',
      targetWidth: preset.width,
      targetHeight: preset.height,
      scaleFactor: Number((preset.width / origW).toFixed(2)),
    });
  };

  // Percentage change
  const handlePercentageChange = (pct: number) => {
    const factor = pct / 100;
    onUpdateSettings({
      scaleMode: 'percentage',
      scaleFactor: factor,
      targetWidth: Math.round(origW * factor),
      targetHeight: Math.round(origH * factor),
    });
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const success = await onCopyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reset image adjustments
  const handleResetAdjustments = () => {
    setActiveAdjustmentPresetId(null);
    onUpdateSettings({
      adjustments: { ...DEFAULT_ADJUSTMENTS },
    });
  };

  const scaleFactors = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

  // Active and default format descriptors
  const selectedFormatDescriptor = useMemo(() => {
    return (
      SUPPORTED_FORMATS.find((f) => f.id === settings.format) ||
      SUPPORTED_FORMATS[0]
    );
  }, [settings.format]);

  const defaultFormatDescriptor = useMemo(() => {
    return (
      SUPPORTED_FORMATS.find((f) => f.id === defaultFormat) ||
      SUPPORTED_FORMATS[0]
    );
  }, [defaultFormat]);

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden flex flex-col transition-colors">
      {/* Quick Favorites Bar */}
      <div className="px-3.5 py-2 bg-stone-50 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0 text-stone-500 dark:text-stone-400 text-[11px] font-medium">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Favorites:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 flex-1 min-w-0">
          {favoritePresets.length === 0 ? (
            <span className="text-[10px] text-stone-400 dark:text-stone-500 italic">
              Star presets below for instant 1-click access
            </span>
          ) : (
            favoritePresets.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  id={`quick-fav-${p.id}`}
                  onClick={() => onApplyPreset(p)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium border flex items-center gap-1 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold shadow-2xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                  title={`Apply "${p.name}"`}
                >
                  <span className="truncate max-w-[120px]">{p.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-amber-700 dark:text-amber-400" />}
                </button>
              );
            })
          )}
        </div>
        <button
          type="button"
          id="btn-quick-save-preset"
          onClick={() => onOpenSavePresetModal()}
          className="px-2 py-0.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-stone-800 rounded-md border border-stone-200/80 dark:border-stone-700 transition-colors shrink-0 text-[11px] font-medium flex items-center gap-1"
          title="Save current configuration as preset"
        >
          <Plus className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/50 p-1.5 gap-1 text-xs">
        <button
          id="tab-scale"
          type="button"
          onClick={() => setActiveTab('scale')}
          className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'scale'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-700 font-semibold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60'
          }`}
        >
          <Maximize className="w-3.5 h-3.5" />
          <span>Scale</span>
        </button>

        <button
          id="tab-quality"
          type="button"
          onClick={() => setActiveTab('quality')}
          className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'quality'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-700 font-semibold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Adjustments</span>
        </button>

        <button
          id="tab-format"
          type="button"
          onClick={() => setActiveTab('format')}
          className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'format'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-700 font-semibold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Format</span>
        </button>

        <button
          id="tab-presets"
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === 'presets'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-700 font-semibold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          <span>Presets</span>
          {favoritePresets.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300">
              {favoritePresets.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5 flex-1 space-y-5">
        {/* ===================== TAB 1: SCALE & DIMENSIONS ===================== */}
        {activeTab === 'scale' && (
          <div className="space-y-5">
            {/* Quick Scale Factor Buttons */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Multiplier Scale
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {scaleFactors.map((f) => {
                  const isSelected = settings.scaleFactor === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      id={`scale-factor-${f}x`}
                      onClick={() => handleScaleFactorSelect(f)}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all text-center whitespace-nowrap ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs font-semibold'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {f}x
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exact Dimension Inputs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700">
                  Target Dimensions (Pixels)
                </label>
                <button
                  type="button"
                  id="swap-dimensions-button"
                  onClick={handleSwapDimensions}
                  className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                  title="Swap Width and Height"
                >
                  <RotateCw className="w-3 h-3" />
                  Swap
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-stone-400 block mb-0.5">Width (px)</label>
                  <input
                    id="input-target-width"
                    type="number"
                    min="1"
                    max="16000"
                    value={Math.round(settings.targetWidth)}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
                  />
                </div>

                {/* Aspect ratio lock toggle */}
                <div className="pt-4">
                  <button
                    id="toggle-aspect-ratio"
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ maintainAspectRatio: !settings.maintainAspectRatio })
                    }
                    className={`p-2 rounded-lg border transition-colors ${
                      settings.maintainAspectRatio
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-400 hover:text-stone-700'
                    }`}
                    title={
                      settings.maintainAspectRatio
                        ? 'Aspect Ratio Locked'
                        : 'Aspect Ratio Unlocked (Free Transform)'
                    }
                  >
                    {settings.maintainAspectRatio ? (
                      <Link className="w-3.5 h-3.5" />
                    ) : (
                      <Unlink className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex-1">
                  <label className="text-[10px] text-stone-400 block mb-0.5">Height (px)</label>
                  <input
                    id="input-target-height"
                    type="number"
                    min="1"
                    max="16000"
                    value={Math.round(settings.targetHeight)}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Percentage Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-stone-700">Scaling Percentage</span>
                <span className="font-mono text-stone-900 font-medium">
                  {Math.round(settings.scaleFactor * 100)}%
                </span>
              </div>
              <input
                id="input-percentage-slider"
                type="range"
                min="10"
                max="400"
                step="5"
                value={Math.round(settings.scaleFactor * 100)}
                onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>10% (Micro)</span>
                <span>100% (Original)</span>
                <span>200% (2x)</span>
                <span>400% (4K)</span>
              </div>
            </div>

            {/* Dimension Presets Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Popular Presets & Formats
              </label>
              <select
                id="select-preset"
                value={settings.presetId || ''}
                onChange={(e) => handlePresetSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
              >
                <option value="">Choose a preset dimension...</option>
                <optgroup label="Display & Video">
                  {DIMENSION_PRESETS.filter((p) => p.category === 'Display').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.width} × {p.height})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Social Media">
                  {DIMENSION_PRESETS.filter((p) => p.category === 'Social').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.width} × {p.height})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Web & Icons">
                  {DIMENSION_PRESETS.filter(
                    (p) => p.category === 'Web' || p.category === 'Icon'
                  ).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.width} × {p.height})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: ADJUSTMENTS WORKSPACE ===================== */}
        {activeTab === 'quality' && (
          <AdjustmentsWorkspace
            adjustments={settings.adjustments}
            algorithm={settings.algorithm}
            onUpdateAdjustments={(newAdjustments) => {
              setActiveAdjustmentPresetId(null);
              onUpdateSettings({ adjustments: newAdjustments });
            }}
            onUpdateAlgorithm={(newAlgo) =>
              onUpdateSettings({ algorithm: newAlgo })
            }
            presets={adjustmentPresets}
            activePresetId={activeAdjustmentPresetId}
            onApplyPreset={handleApplyAdjustmentPreset}
            onToggleFavoritePreset={handleToggleFavoriteAdjPreset}
            onOpenSavePresetModal={handleOpenSaveAdjModal}
            onDeletePreset={handleDeleteAdjPreset}
          />
        )}

        {/* ===================== TAB 3: OUTPUT FORMAT & QUALITY ===================== */}
        {activeTab === 'format' && (
          <div className="space-y-4">
            {/* Format Selection Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-stone-500" />
                  <span>Output Format</span>
                </label>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                  {SUPPORTED_FORMATS.length} Formats Available
                </span>
              </div>

              {/* Grid of all supported formats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {SUPPORTED_FORMATS.map((fmt) => {
                  const isSelected = settings.format === fmt.id;
                  const isDefault = defaultFormat === fmt.id;

                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      id={`format-${fmt.label.toLowerCase()}`}
                      onClick={() =>
                        onUpdateSettings({ format: fmt.id as OutputFormat })
                      }
                      className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[74px] ${
                        isSelected
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/80 bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {/* Top row: Label + Badge/Default indicator */}
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="text-xs font-bold leading-none">
                          {fmt.label}
                        </span>

                        <div className="flex items-center gap-1">
                          {isDefault && (
                            <span
                              className={`inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded font-bold ${
                                isSelected
                                  ? 'bg-amber-400/30 text-amber-200 dark:bg-amber-500/20 dark:text-amber-800'
                                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                              }`}
                              title="Default output format"
                            >
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Def</span>
                            </span>
                          )}

                          {fmt.badge && !isDefault && (
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                                isSelected
                                  ? 'bg-white/20 text-stone-100 dark:bg-black/10 dark:text-stone-900'
                                  : 'bg-stone-100 dark:bg-stone-750 text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              {fmt.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom row: extension & note */}
                      <div className="mt-1">
                        <span
                          className={`block font-mono text-[10px] ${
                            isSelected
                              ? 'text-stone-300 dark:text-stone-600'
                              : 'text-stone-400 dark:text-stone-500'
                          }`}
                        >
                          .{fmt.extension}
                        </span>
                        <span
                          className={`block text-[10px] truncate leading-tight mt-0.5 ${
                            isSelected
                              ? 'text-stone-200 dark:text-stone-700'
                              : 'text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          {fmt.note}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Set as Default Format Section */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 sm:mt-0 ${
                    settings.format === defaultFormat
                      ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'
                      : 'bg-stone-200 dark:bg-stone-750 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      settings.format === defaultFormat
                        ? 'fill-amber-500 text-amber-500'
                        : ''
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                    {settings.format === defaultFormat ? (
                      <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <span>
                          {selectedFormatDescriptor.label} is your saved default
                        </span>
                      </span>
                    ) : (
                      <span>
                        Active: <strong>{selectedFormatDescriptor.label}</strong>{' '}
                        • Saved Default:{' '}
                        <strong>{defaultFormatDescriptor.label}</strong>
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {settings.format === defaultFormat
                      ? 'Automatically used whenever the app opens or a new image is loaded.'
                      : 'Using temporarily for this image. Click to save as your default preference.'}
                  </p>
                </div>
              </div>

              {settings.format !== defaultFormat && onSetDefaultFormat && (
                <button
                  id="btn-set-default-format"
                  type="button"
                  onClick={() => onSetDefaultFormat(settings.format)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                  title={`Make ${selectedFormatDescriptor.label} your default format`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Set as Default</span>
                </button>
              )}
            </div>

            {/* Quality Slider (for lossy formats: JPEG, WebP, AVIF) */}
            {selectedFormatDescriptor.hasQuality ? (
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    Compression Quality
                  </span>
                  <span className="font-mono text-stone-900 dark:text-stone-100 font-bold">
                    {Math.round(settings.quality * 100)}%
                  </span>
                </div>

                <input
                  id="slider-quality"
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={Math.round(settings.quality * 100)}
                  onChange={(e) =>
                    onUpdateSettings({ quality: parseInt(e.target.value) / 100 })
                  }
                  className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-amber-400"
                />

                {/* Quick Quality Preset Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: 'Low', val: 0.4 },
                    { label: 'Standard', val: 0.75 },
                    { label: 'High', val: 0.88 },
                    { label: 'Max', val: 0.98 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => onUpdateSettings({ quality: p.val })}
                      className={`py-1 text-[10px] rounded border transition-colors whitespace-nowrap cursor-pointer ${
                        Math.round(settings.quality * 100) ===
                        Math.round(p.val * 100)
                          ? 'border-stone-800 dark:border-stone-300 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                          : 'border-stone-200 dark:border-stone-750 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {p.label} ({Math.round(p.val * 100)}%)
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                  <span>
                    {selectedFormatDescriptor.label} (.
                    {selectedFormatDescriptor.extension})
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-750 text-stone-700 dark:text-stone-300">
                    {selectedFormatDescriptor.category}
                  </span>
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {selectedFormatDescriptor.description}
                </p>
              </div>
            )}

            {/* Background Fill (For Transparent Areas) - Solid & Photoshop-style Gradient */}
            <BackgroundFillControl
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              hasAlphaDetected={originalImage?.hasAlpha}
            />
          </div>
        )}

        {/* ===================== TAB 4: PRESETS & FAVORITES ===================== */}
        {activeTab === 'presets' && (
          <div className="space-y-3.5">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>Preset Library</span>
                </h3>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                  1-click apply, customize, and favorite
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="tab-btn-save-current-preset"
                  onClick={() => onOpenSavePresetModal()}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                  <span>Save Current</span>
                </button>
                <button
                  type="button"
                  id="tab-btn-open-presets-manager"
                  onClick={onOpenPresetsModal}
                  className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                  title="Open Full Presets Manager (Import/Export)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                type="button"
                id="panel-filter-favs"
                onClick={() =>
                  setPresetCategoryFilter(
                    presetCategoryFilter === 'favorites' ? 'all' : 'favorites'
                  )
                }
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                  presetCategoryFilter === 'favorites'
                    ? 'bg-amber-500 text-stone-900 border-amber-500 font-semibold shadow-2xs'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750'
                }`}
              >
                <Star
                  className={`w-3 h-3 ${
                    presetCategoryFilter === 'favorites'
                      ? 'fill-stone-900'
                      : 'text-amber-500 fill-amber-400'
                  }`}
                />
                <span>Favorites</span>
                {favoritePresets.length > 0 && (
                  <span className="text-[9px] bg-white/40 dark:bg-stone-900/40 px-1 py-0.2 rounded-full font-bold">
                    {favoritePresets.length}
                  </span>
                )}
              </button>

              {['all', 'Social', 'Web', 'Display', 'Custom'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  id={`panel-filter-${cat.toLowerCase()}`}
                  onClick={() => setPresetCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border shrink-0 transition-colors cursor-pointer ${
                    presetCategoryFilter === cat
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 font-semibold'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
              <input
                id="panel-search-presets-input"
                type="text"
                placeholder="Search presets by name or format..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
              />
            </div>

            {/* Preset Cards List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-0.5">
              {filteredPresetsForPanel.length === 0 ? (
                <div className="p-6 text-center bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400">
                  <Bookmark className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">No presets found</p>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 mb-3">
                    {presetCategoryFilter === 'favorites'
                      ? 'No favorite presets yet. Star any preset to pin it here.'
                      : 'Click "Save Current" to create your first custom preset.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenSavePresetModal()}
                    className="px-3 py-1 text-xs font-medium rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white cursor-pointer"
                  >
                    Save Current Configuration
                  </button>
                </div>
              ) : (
                filteredPresetsForPanel.map((preset) => (
                  <PresetItemCard
                    key={preset.id}
                    preset={preset}
                    isActive={activePresetId === preset.id}
                    onApply={onApplyPreset}
                    onToggleFavorite={onToggleFavoritePreset}
                    onEdit={onOpenSavePresetModal}
                    onDelete={onDeletePreset}
                    onOverwriteWithCurrent={onOverwritePresetWithCurrent}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================== BOTTOM EXPORT ACTIONS ===================== */}
      <div className="p-4 bg-stone-50 dark:bg-stone-950/70 border-t border-stone-200 dark:border-stone-800 space-y-2">
        {/* Main Download Button */}
        <button
          id="button-download-processed"
          type="button"
          onClick={onDownload}
          disabled={isProcessing || !processedResult}
          className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 disabled:bg-stone-300 dark:disabled:bg-stone-800 disabled:text-stone-500 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 text-amber-400 dark:text-amber-600" />
          <span>
            {isProcessing ? 'Processing Image...' : `Download ${selectedFormatDescriptor.label} File`}
          </span>
          {processedResult && !isProcessing && (
            <span className="text-[10px] text-stone-300 dark:text-stone-600 font-mono">
              ({formatBytes(processedResult.sizeBytes)})
            </span>
          )}
        </button>

        {/* Secondary Action: Copy to Clipboard */}
        <div className="flex items-center gap-2">
          <button
            id="button-copy-clipboard"
            type="button"
            onClick={handleCopy}
            disabled={isProcessing || !processedResult}
            className="flex-1 py-2 px-3 rounded-lg border border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Copied PNG!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          {/* Batch export if multiple images */}
          {allImagesCount > 1 && onDownloadBatchZip && (
            <button
              id="button-download-batch"
              type="button"
              onClick={onDownloadBatchZip}
              className="py-2 px-3 rounded-lg border border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Process and export all uploaded images as a ZIP archive"
            >
              <Archive className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>Export All ({allImagesCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Adjustment Preset Modal */}
      <SaveAdjustmentPresetModal
        isOpen={isSaveAdjModalOpen}
        onClose={() => {
          setIsSaveAdjModalOpen(false);
          setEditingAdjPreset(null);
        }}
        currentAdjustments={settings.adjustments}
        onSavePreset={handleSaveAdjPreset}
        editingPreset={editingAdjPreset}
        existingCustomPresets={adjustmentPresets.filter((p) => !p.isBuiltIn)}
      />
    </div>
  );
};
