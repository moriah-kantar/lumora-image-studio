import { AdjustmentPreset, AdjustmentPresetCategory, ImageAdjustments } from '../types';
import { BUILTIN_ADJUSTMENT_PRESETS } from '../data/adjustmentPresets';

const CUSTOM_ADJ_PRESETS_KEY = 'image_scaler_custom_adj_presets_v1';
const FAVORITES_ADJ_KEY = 'image_scaler_fav_adj_presets_v1';

export function getStoredFavoriteIds(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_ADJ_KEY);
    if (!raw) {
      // Default favorites from built-in
      return new Set(
        BUILTIN_ADJUSTMENT_PRESETS.filter((p) => p.isFavorite).map((p) => p.id)
      );
    }
    return new Set(JSON.parse(raw));
  } catch {
    return new Set(
      BUILTIN_ADJUSTMENT_PRESETS.filter((p) => p.isFavorite).map((p) => p.id)
    );
  }
}

export function saveStoredFavoriteIds(favSet: Set<string>): void {
  try {
    localStorage.setItem(FAVORITES_ADJ_KEY, JSON.stringify(Array.from(favSet)));
  } catch (err) {
    console.error('Failed to save adjustment favorites', err);
  }
}

export function getStoredCustomAdjustmentPresets(): AdjustmentPreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ADJ_PRESETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load custom adjustment presets', err);
    return [];
  }
}

export function saveStoredCustomAdjustmentPresets(presets: AdjustmentPreset[]): void {
  try {
    localStorage.setItem(CUSTOM_ADJ_PRESETS_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save custom adjustment presets', err);
  }
}

export function loadAllAdjustmentPresets(): AdjustmentPreset[] {
  const custom = getStoredCustomAdjustmentPresets();
  const favSet = getStoredFavoriteIds();

  const builtIns = BUILTIN_ADJUSTMENT_PRESETS.map((p) => ({
    ...p,
    isFavorite: favSet.has(p.id),
  }));

  const customsWithFavs = custom.map((p) => ({
    ...p,
    isFavorite: favSet.has(p.id),
  }));

  return [...builtIns, ...customsWithFavs];
}

export function createCustomAdjustmentPreset(
  name: string,
  adjustments: ImageAdjustments,
  category: AdjustmentPresetCategory = 'Custom',
  description?: string,
  isFavorite: boolean = false
): AdjustmentPreset {
  const id = `adj-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newPreset: AdjustmentPreset = {
    id,
    name: name.trim(),
    description: description?.trim() || undefined,
    category,
    isFavorite,
    isBuiltIn: false,
    createdAt: Date.now(),
    adjustments: { ...adjustments },
  };

  const current = getStoredCustomAdjustmentPresets();
  const updated = [newPreset, ...current];
  saveStoredCustomAdjustmentPresets(updated);

  if (isFavorite) {
    const favSet = getStoredFavoriteIds();
    favSet.add(id);
    saveStoredFavoriteIds(favSet);
  }

  return newPreset;
}

export function updateCustomAdjustmentPreset(
  id: string,
  updates: Partial<Omit<AdjustmentPreset, 'id' | 'createdAt' | 'isBuiltIn'>>
): AdjustmentPreset | null {
  const current = getStoredCustomAdjustmentPresets();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = current[index];
  const updated: AdjustmentPreset = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  current[index] = updated;
  saveStoredCustomAdjustmentPresets(current);

  if (updates.isFavorite !== undefined) {
    const favSet = getStoredFavoriteIds();
    if (updates.isFavorite) {
      favSet.add(id);
    } else {
      favSet.delete(id);
    }
    saveStoredFavoriteIds(favSet);
  }

  return updated;
}

export function deleteCustomAdjustmentPreset(id: string): boolean {
  const current = getStoredCustomAdjustmentPresets();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredCustomAdjustmentPresets(filtered);

  const favSet = getStoredFavoriteIds();
  favSet.delete(id);
  saveStoredFavoriteIds(favSet);

  return true;
}

export function toggleAdjustmentPresetFavorite(id: string): boolean {
  const favSet = getStoredFavoriteIds();
  const isNowFav = !favSet.has(id);
  if (isNowFav) {
    favSet.add(id);
  } else {
    favSet.delete(id);
  }
  saveStoredFavoriteIds(favSet);
  return isNowFav;
}
