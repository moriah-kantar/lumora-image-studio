import { ImagePreset, ProcessingSettings, PresetCategory, DEFAULT_ADJUSTMENTS } from '../types';
import { DEFAULT_PRESETS } from '../data/defaultPresets';

const STORAGE_KEY = 'image_scaler_custom_presets_v1';

/**
 * Load all presets from localStorage, falling back to default presets.
 */
export function getSavedPresets(): ImagePreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First run: save and return defaults
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESETS));
      return DEFAULT_PRESETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PRESETS;
  } catch (err) {
    console.error('Error loading presets from storage:', err);
    return DEFAULT_PRESETS;
  }
}

/**
 * Save preset list to localStorage.
 */
export function persistPresets(presets: ImagePreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Error saving presets to storage:', err);
  }
}

/**
 * Create a new preset based on current workspace settings.
 */
export function createPresetFromSettings(
  name: string,
  category: PresetCategory,
  settings: ProcessingSettings,
  isFavorite: boolean = false,
  description?: string
): ImagePreset {
  return {
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'Untitled Preset',
    description: description?.trim() || undefined,
    category,
    isFavorite,
    isBuiltIn: false,
    createdAt: Date.now(),
    settings: {
      scaleMode: settings.scaleMode,
      scaleFactor: settings.scaleFactor,
      targetWidth: settings.targetWidth,
      targetHeight: settings.targetHeight,
      maintainAspectRatio: settings.maintainAspectRatio,
      aspectRatio: settings.aspectRatio,
      presetId: settings.presetId,
      algorithm: settings.algorithm,
      format: settings.format,
      quality: settings.quality,
      backgroundColor: settings.backgroundColor,
      backgroundType: settings.backgroundType,
      backgroundGradient: settings.backgroundGradient,
      fillTransparency: settings.fillTransparency,
      adjustments: { ...settings.adjustments },
    },
  };
}

/**
 * Apply a preset to an active image, returning an updated ProcessingSettings object.
 */
export function applyPresetToSettings(
  preset: ImagePreset,
  originalWidth: number,
  originalHeight: number
): ProcessingSettings {
  const origW = originalWidth > 0 ? originalWidth : 800;
  const origH = originalHeight > 0 ? originalHeight : 600;
  const origAspect = origW / origH;

  const s = preset.settings;
  let targetWidth = s.targetWidth || origW;
  let targetHeight = s.targetHeight || origH;
  let scaleFactor = s.scaleFactor || 1.0;

  if (s.scaleMode === 'factor' || s.scaleMode === 'percentage') {
    targetWidth = Math.round(origW * scaleFactor);
    targetHeight = s.maintainAspectRatio
      ? Math.round(targetWidth / origAspect)
      : Math.round(origH * scaleFactor);
  } else if (s.scaleMode === 'dimensions' || s.scaleMode === 'preset') {
    if (s.targetWidth && s.targetHeight) {
      targetWidth = s.targetWidth;
      targetHeight = s.targetHeight;
    }
    scaleFactor = Number((targetWidth / origW).toFixed(2));
  }

  return {
    scaleMode: s.scaleMode,
    scaleFactor,
    targetWidth,
    targetHeight,
    maintainAspectRatio: s.maintainAspectRatio,
    aspectRatio: s.aspectRatio || origAspect,
    presetId: s.presetId,
    algorithm: s.algorithm,
    format: s.format,
    quality: s.quality,
    backgroundColor: s.backgroundColor || '#ffffff',
    backgroundType: s.backgroundType || 'solid',
    backgroundGradient: s.backgroundGradient,
    fillTransparency: s.fillTransparency,
    adjustments: { ...DEFAULT_ADJUSTMENTS, ...s.adjustments },
  };
}

/**
 * Export presets as a downloadable JSON file.
 */
export function exportPresetsToJson(presets: ImagePreset[]): void {
  const data = JSON.stringify(presets, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `image_scaler_presets_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate and import presets from JSON string.
 */
export function parseImportedPresets(jsonString: string): ImagePreset[] | null {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) return null;

    const validPresets: ImagePreset[] = [];
    for (const item of data) {
      if (
        item &&
        typeof item.name === 'string' &&
        item.settings &&
        typeof item.settings.algorithm === 'string' &&
        typeof item.settings.format === 'string'
      ) {
        validPresets.push({
          ...item,
          id: item.id || `preset-import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          isBuiltIn: false,
          createdAt: item.createdAt || Date.now(),
        });
      }
    }
    return validPresets.length > 0 ? validPresets : null;
  } catch (err) {
    console.error('Failed to parse imported presets JSON:', err);
    return null;
  }
}
