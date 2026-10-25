import React, { useState } from 'react';
import {
  ImageAdjustments,
  AdjustmentPreset,
  ResampleAlgorithm,
  BwToningOption,
  DEFAULT_ADJUSTMENTS,
} from '../types';
import { AdjustmentSlider } from './AdjustmentSlider';
import { AdjustmentPresetsBar } from './AdjustmentPresetsBar';
import {
  Sun,
  Palette,
  Eye,
  Sliders,
  Sparkles,
  RotateCcw,
  Aperture,
  Film,
  Cpu,
  Layers,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface AdjustmentsWorkspaceProps {
  adjustments: ImageAdjustments;
  algorithm: ResampleAlgorithm;
  onUpdateAdjustments: (adjustments: ImageAdjustments) => void;
  onUpdateAlgorithm: (algorithm: ResampleAlgorithm) => void;
  presets: AdjustmentPreset[];
  activePresetId?: string | null;
  onApplyPreset: (preset: AdjustmentPreset) => void;
  onToggleFavoritePreset: (presetId: string) => void;
  onOpenSavePresetModal: (presetToEdit?: AdjustmentPreset) => void;
  onDeletePreset: (presetId: string) => void;
}

export const AdjustmentsWorkspace: React.FC<AdjustmentsWorkspaceProps> = ({
  adjustments,
  algorithm,
  onUpdateAdjustments,
  onUpdateAlgorithm,
  presets,
  activePresetId,
  onApplyPreset,
  onToggleFavoritePreset,
  onOpenSavePresetModal,
  onDeletePreset,
}) => {
  // Collapsible section states (all open by default for effortless discovery)
  const [openSections, setOpenSections] = useState({
    tone: true,
    color: true,
    presence: true,
    channels: false,
    blackAndWhite: false,
    effects: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to update individual adjustment
  const update = (key: keyof ImageAdjustments, value: any) => {
    onUpdateAdjustments({
      ...adjustments,
      [key]: value,
    });
  };

  // Reset Tone section
  const resetTone = () => {
    onUpdateAdjustments({
      ...adjustments,
      exposure: DEFAULT_ADJUSTMENTS.exposure,
      contrast: DEFAULT_ADJUSTMENTS.contrast,
      highlights: DEFAULT_ADJUSTMENTS.highlights,
      shadows: DEFAULT_ADJUSTMENTS.shadows,
      whites: DEFAULT_ADJUSTMENTS.whites,
      blacks: DEFAULT_ADJUSTMENTS.blacks,
      brightness: DEFAULT_ADJUSTMENTS.brightness,
    });
  };

  // Reset Color section
  const resetColor = () => {
    onUpdateAdjustments({
      ...adjustments,
      temperature: DEFAULT_ADJUSTMENTS.temperature,
      tint: DEFAULT_ADJUSTMENTS.tint,
      vibrance: DEFAULT_ADJUSTMENTS.vibrance,
      saturation: DEFAULT_ADJUSTMENTS.saturation,
    });
  };

  // Reset Presence / Detail section
  const resetPresence = () => {
    onUpdateAdjustments({
      ...adjustments,
      sharpness: DEFAULT_ADJUSTMENTS.sharpness,
      clarity: DEFAULT_ADJUSTMENTS.clarity,
      texture: DEFAULT_ADJUSTMENTS.texture,
      dehaze: DEFAULT_ADJUSTMENTS.dehaze,
      denoise: DEFAULT_ADJUSTMENTS.denoise,
    });
  };

  // Reset Channels section
  const resetChannels = () => {
    onUpdateAdjustments({
      ...adjustments,
      colorBalanceRed: DEFAULT_ADJUSTMENTS.colorBalanceRed,
      colorBalanceGreen: DEFAULT_ADJUSTMENTS.colorBalanceGreen,
      colorBalanceBlue: DEFAULT_ADJUSTMENTS.colorBalanceBlue,
    });
  };

  // Reset B&W section
  const resetBW = () => {
    onUpdateAdjustments({
      ...adjustments,
      blackAndWhite: false,
      bwRedFilter: DEFAULT_ADJUSTMENTS.bwRedFilter,
      bwGreenFilter: DEFAULT_ADJUSTMENTS.bwGreenFilter,
      bwBlueFilter: DEFAULT_ADJUSTMENTS.bwBlueFilter,
      bwTone: 'none',
    });
  };

  // Reset Effects section
  const resetEffects = () => {
    onUpdateAdjustments({
      ...adjustments,
      vignette: DEFAULT_ADJUSTMENTS.vignette,
      grain: DEFAULT_ADJUSTMENTS.grain,
    });
  };

  // Reset All Adjustments
  const resetAll = () => {
    onUpdateAdjustments({ ...DEFAULT_ADJUSTMENTS });
  };

  return (
    <div className="space-y-4">
      {/* 1. Adjustment Presets System Bar */}
      <AdjustmentPresetsBar
        presets={presets}
        activeAdjustments={adjustments}
        activePresetId={activePresetId}
        onApplyPreset={onApplyPreset}
        onToggleFavorite={onToggleFavoritePreset}
        onOpenSaveModal={onOpenSavePresetModal}
        onDeletePreset={onDeletePreset}
        onResetAllAdjustments={resetAll}
      />

      {/* 2. SECTION: LIGHT & TONE */}
      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-850/60 shadow-2xs">
        <div
          className="flex items-center justify-between px-3.5 py-2.5 bg-stone-50/90 dark:bg-stone-850 cursor-pointer select-none hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors"
          onClick={() => toggleSection('tone')}
        >
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Light & Tone
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              id="reset-tone-section-btn"
              onClick={resetTone}
              title="Reset Tone adjustments"
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => toggleSection('tone')}
              className="p-0.5 text-stone-400 dark:text-stone-500"
            >
              {openSections.tone ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {openSections.tone && (
          <div className="p-3.5 space-y-3.5">
            <AdjustmentSlider
              id="adj-exposure"
              label="Exposure"
              hint="Overall luminance"
              value={adjustments.exposure}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('exposure', v)}
            />
            <AdjustmentSlider
              id="adj-contrast"
              label="Contrast"
              hint="Tonal separation"
              value={adjustments.contrast}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('contrast', v)}
            />
            <AdjustmentSlider
              id="adj-highlights"
              label="Highlights"
              hint="Recovers bright zones"
              value={adjustments.highlights}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('highlights', v)}
            />
            <AdjustmentSlider
              id="adj-shadows"
              label="Shadows"
              hint="Lifts deep tones"
              value={adjustments.shadows}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('shadows', v)}
            />
            <AdjustmentSlider
              id="adj-whites"
              label="Whites"
              hint="Top clipping threshold"
              value={adjustments.whites}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('whites', v)}
            />
            <AdjustmentSlider
              id="adj-blacks"
              label="Blacks / Black Point"
              hint="Anchor deepest darks"
              value={adjustments.blacks}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('blacks', v)}
            />
            <AdjustmentSlider
              id="adj-brightness"
              label="Brightness"
              hint="Midtone bias"
              value={adjustments.brightness}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('brightness', v)}
            />
          </div>
        )}
      </div>

      {/* 3. SECTION: COLOR & WHITE BALANCE */}
      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-850/60 shadow-2xs">
        <div
          className="flex items-center justify-between px-3.5 py-2.5 bg-stone-50/90 dark:bg-stone-850 cursor-pointer select-none hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors"
          onClick={() => toggleSection('color')}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Color & White Balance
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              id="reset-color-section-btn"
              onClick={resetColor}
              title="Reset Color adjustments"
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => toggleSection('color')}
              className="p-0.5 text-stone-400 dark:text-stone-500"
            >
              {openSections.color ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {openSections.color && (
          <div className="p-3.5 space-y-3.5">
            <AdjustmentSlider
              id="adj-temp"
              label="Temperature"
              hint="Cool ↔ Warm"
              value={adjustments.temperature}
              min={-100}
              max={100}
              defaultValue={0}
              gradientTrack="linear-gradient(to right, #38bdf8, #cbd5e1, #fbbf24)"
              onChange={(v) => update('temperature', v)}
            />
            <AdjustmentSlider
              id="adj-tint"
              label="Tint"
              hint="Green ↔ Magenta"
              value={adjustments.tint}
              min={-100}
              max={100}
              defaultValue={0}
              gradientTrack="linear-gradient(to right, #4ade80, #cbd5e1, #f43f5e)"
              onChange={(v) => update('tint', v)}
            />
            <AdjustmentSlider
              id="adj-vibrance"
              label="Vibrance"
              hint="Boosts muted tones, preserves skin"
              value={adjustments.vibrance}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('vibrance', v)}
            />
            <AdjustmentSlider
              id="adj-saturation"
              label="Saturation"
              hint="Global color intensity"
              value={adjustments.saturation}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('saturation', v)}
            />
          </div>
        )}
      </div>

      {/* 4. SECTION: PRESENCE, DETAIL & RESAMPLING (Preserves Resampling, Upscale Sharpness, Clarity, Denoise) */}
      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-850/60 shadow-2xs">
        <div
          className="flex items-center justify-between px-3.5 py-2.5 bg-stone-50/90 dark:bg-stone-850 cursor-pointer select-none hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors"
          onClick={() => toggleSection('presence')}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Presence, Detail & Resampling
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              id="reset-presence-section-btn"
              onClick={resetPresence}
              title="Reset Presence adjustments"
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => toggleSection('presence')}
              className="p-0.5 text-stone-400 dark:text-stone-500"
            >
              {openSections.presence ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {openSections.presence && (
          <div className="p-3.5 space-y-3.5">
            {/* Resampling Interpolation Algorithm Dropdown */}
            <div className="space-y-1 text-xs">
              <label
                htmlFor="select-resample-algorithm"
                className="font-medium text-stone-700 dark:text-stone-300 block mb-1"
              >
                Resampling Interpolation Engine
              </label>
              <select
                id="select-resample-algorithm"
                value={algorithm}
                onChange={(e) => onUpdateAlgorithm(e.target.value as ResampleAlgorithm)}
                className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
              >
                <option value="lanczos3">Lanczos3 (Pro Studio 3-Lobe Sinc Filter)</option>
                <option value="bicubic">Bicubic (Smooth High-Precision Curves)</option>
                <option value="bilinear">Bilinear (Standard Balanced Interpolation)</option>
                <option value="pixelated">Nearest Neighbor (Pixel Art / Hard Edges)</option>
              </select>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 pt-0.5">
                Lanczos3 sinc windowing delivers the highest optical edge fidelity when scaling.
              </p>
            </div>

            <AdjustmentSlider
              id="adj-sharpness"
              label="Upscale Sharpness (Unsharp Mask)"
              hint="Edge acutance"
              value={adjustments.sharpness}
              min={0}
              max={100}
              defaultValue={0}
              displayPlusSign={false}
              unit="%"
              onChange={(v) => update('sharpness', v)}
            />
            <AdjustmentSlider
              id="adj-clarity"
              label="Clarity"
              hint="Mid-tone local contrast pop"
              value={adjustments.clarity}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('clarity', v)}
            />
            <AdjustmentSlider
              id="adj-texture"
              label="Texture"
              hint="Surface micro-detail & fabric"
              value={adjustments.texture}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('texture', v)}
            />
            <AdjustmentSlider
              id="adj-dehaze"
              label="Dehaze"
              hint="Atmospheric haze removal"
              value={adjustments.dehaze}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('dehaze', v)}
            />
            <AdjustmentSlider
              id="adj-denoise"
              label="Denoise / Artifact Removal"
              hint="High-ISO noise reduction"
              value={adjustments.denoise}
              min={0}
              max={100}
              defaultValue={0}
              displayPlusSign={false}
              unit="%"
              onChange={(v) => update('denoise', v)}
            />
          </div>
        )}
      </div>

      {/* 5. SECTION: COLOR BALANCE / RGB CHANNELS */}
      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-850/60 shadow-2xs">
        <div
          className="flex items-center justify-between px-3.5 py-2.5 bg-stone-50/90 dark:bg-stone-850 cursor-pointer select-none hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors"
          onClick={() => toggleSection('channels')}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Color Balance (RGB Channels)
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              id="reset-channels-section-btn"
              onClick={resetChannels}
              title="Reset RGB Channels"
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => toggleSection('channels')}
              className="p-0.5 text-stone-400 dark:text-stone-500"
            >
              {openSections.channels ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {openSections.channels && (
          <div className="p-3.5 space-y-3.5">
            <AdjustmentSlider
              id="adj-cb-red"
              label="Red Channel"
              hint="Cyan ↔ Red"
              value={adjustments.colorBalanceRed}
              min={-100}
              max={100}
              defaultValue={0}
              gradientTrack="linear-gradient(to right, #06b6d4, #cbd5e1, #ef4444)"
              onChange={(v) => update('colorBalanceRed', v)}
            />
            <AdjustmentSlider
              id="adj-cb-green"
              label="Green Channel"
              hint="Magenta ↔ Green"
              value={adjustments.colorBalanceGreen}
              min={-100}
              max={100}
              defaultValue={0}
              gradientTrack="linear-gradient(to right, #d946ef, #cbd5e1, #22c55e)"
              onChange={(v) => update('colorBalanceGreen', v)}
            />
            <AdjustmentSlider
              id="adj-cb-blue"
              label="Blue Channel"
              hint="Yellow ↔ Blue"
              value={adjustments.colorBalanceBlue}
              min={-100}
              max={100}
              defaultValue={0}
              gradientTrack="linear-gradient(to right, #eab308, #cbd5e1, #3b82f6)"
              onChange={(v) => update('colorBalanceBlue', v)}
            />
          </div>
        )}
      </div>

      {/* 6. SECTION: BLACK & WHITE AND TONING */}
      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-850/60 shadow-2xs">
        <div
          className="flex items-center justify-between px-3.5 py-2.5 bg-stone-50/90 dark:bg-stone-850 cursor-pointer select-none hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors"
          onClick={() => toggleSection('blackAndWhite')}
        >
          <div className="flex items-center gap-2">
            <Aperture className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Black & White / Monochrome
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              id="reset-bw-section-btn"
              onClick={resetBW}
              title="Reset Black & White settings"
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => toggleSection('blackAndWhite')}
              className="p-0.5 text-stone-400 dark:text-stone-500"
            >
              {openSections.blackAndWhite ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {openSections.blackAndWhite && (
          <div className="p-3.5 space-y-3.5">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-750">
              <div>
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                  Enable Black & White Mode
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  Custom channel filtration & archival toning
                </span>
              </div>
              <button
                type="button"
                id="toggle-bw-mode-switch"
                onClick={() => update('blackAndWhite', !adjustments.blackAndWhite)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  adjustments.blackAndWhite
                    ? 'bg-stone-900 dark:bg-stone-100'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`bg-white dark:bg-stone-900 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    adjustments.blackAndWhite ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {adjustments.blackAndWhite && (
              <>
                {/* Toning Selector */}
                <div className="space-y-1 text-xs">
                  <label
                    htmlFor="select-bw-tone"
                    className="font-medium text-stone-700 dark:text-stone-300 block mb-1"
                  >
                    Monochrome Archival Toning
                  </label>
                  <select
                    id="select-bw-tone"
                    value={adjustments.bwTone}
                    onChange={(e) => update('bwTone', e.target.value as BwToningOption)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                  >
                    <option value="none">Pure Neutral Monochrome</option>
                    <option value="sepia">Warm Sepia Tone</option>
                    <option value="cyanotype">Cyanotype (Rich Architectural Blue)</option>
                    <option value="platinum">Platinum / Palladium (Deep Velvet)</option>
                    <option value="cool">Cool Silver Print</option>
                    <option value="warm">Warm Selenium Tint</option>
                  </select>
                </div>

                {/* Color Filtration (Simulating Physical Glass Camera Filters) */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-3">
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                    Lens Color Filter Mix:
                  </span>
                  <AdjustmentSlider
                    id="adj-bw-red"
                    label="Red Filter"
                    hint="Lightens reds, darkens skies"
                    value={adjustments.bwRedFilter}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(v) => update('bwRedFilter', v)}
                  />
                  <AdjustmentSlider
                    id="adj-bw-green"
                    label="Green Filter"
                    hint="Lightens foliage, balances skin"
                    value={adjustments.bwGreenFilter}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(v) => update('bwGreenFilter', v)}
                  />
                  <AdjustmentSlider
                    id="adj-bw-blue"
                    label="Blue Filter"
                    hint="Enhances haze, darkens warm tones"
                    value={adjustments.bwBlueFilter}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(v) => update('bwBlueFilter', v)}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 7. SECTION: EFFECTS & OPTICS (Vignette & Film Grain) */}
      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-850/60 shadow-2xs">
        <div
          className="flex items-center justify-between px-3.5 py-2.5 bg-stone-50/90 dark:bg-stone-850 cursor-pointer select-none hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors"
          onClick={() => toggleSection('effects')}
        >
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Effects & Optics (Vignette & Film Grain)
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              id="reset-effects-section-btn"
              onClick={resetEffects}
              title="Reset Effects"
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => toggleSection('effects')}
              className="p-0.5 text-stone-400 dark:text-stone-500"
            >
              {openSections.effects ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {openSections.effects && (
          <div className="p-3.5 space-y-3.5">
            <AdjustmentSlider
              id="adj-vignette"
              label="Post-Crop Vignette"
              hint="Dark ↔ Light perimeter"
              value={adjustments.vignette}
              min={-100}
              max={100}
              defaultValue={0}
              onChange={(v) => update('vignette', v)}
            />
            <AdjustmentSlider
              id="adj-grain"
              label="Film Grain"
              hint="Analog luminance-weighted grain"
              value={adjustments.grain}
              min={0}
              max={100}
              defaultValue={0}
              displayPlusSign={false}
              unit="%"
              onChange={(v) => update('grain', v)}
            />
          </div>
        )}
      </div>

      {/* Bottom Global Reset Adjustments bar */}
      <div className="pt-1 flex items-center justify-between">
        <button
          type="button"
          id="btn-bottom-reset-all-adjustments"
          onClick={resetAll}
          className="w-full py-2 px-3 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Photo Adjustments</span>
        </button>
      </div>
    </div>
  );
};
