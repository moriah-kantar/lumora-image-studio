import { GradientConfig, GradientColorStop } from '../types';

export const DEFAULT_GRADIENT: GradientConfig = {
  id: 'preset-sunset',
  name: 'Sunset Glow',
  type: 'linear',
  angle: 90,
  stops: [
    { id: 'stop-1', color: '#ff512f', position: 0 },
    { id: 'stop-2', color: '#dd2476', position: 100 },
  ],
};

export const BUILTIN_GRADIENTS: GradientConfig[] = [
  {
    id: 'builtin-rainbow',
    name: 'Rainbow Spectrum',
    type: 'linear',
    angle: 90,
    stops: [
      { id: 'rb-1', color: '#ff0000', position: 0 },
      { id: 'rb-2', color: '#ff7f00', position: 17 },
      { id: 'rb-3', color: '#ffff00', position: 33 },
      { id: 'rb-4', color: '#00e676', position: 50 },
      { id: 'rb-5', color: '#00b0ff', position: 67 },
      { id: 'rb-6', color: '#3d5afe', position: 83 },
      { id: 'rb-7', color: '#d500f9', position: 100 },
    ],
  },
  {
    id: 'builtin-sunset',
    name: 'Sunset Warmth',
    type: 'linear',
    angle: 90,
    stops: [
      { id: 'ss-1', color: '#4a00e0', position: 0 },
      { id: 'ss-2', color: '#8e2de2', position: 50 },
      { id: 'ss-3', color: '#f12711', position: 100 },
    ],
  },
  {
    id: 'builtin-ocean',
    name: 'Ocean Depth',
    type: 'linear',
    angle: 90,
    stops: [
      { id: 'oc-1', color: '#00c6ff', position: 0 },
      { id: 'oc-2', color: '#0072ff', position: 100 },
    ],
  },
  {
    id: 'builtin-aurora',
    name: 'Aurora Borealis',
    type: 'linear',
    angle: 45,
    stops: [
      { id: 'au-1', color: '#00f260', position: 0 },
      { id: 'au-2', color: '#0575e6', position: 50 },
      { id: 'au-3', color: '#642b73', position: 100 },
    ],
  },
  {
    id: 'builtin-neon',
    name: 'Cyberpunk Neon',
    type: 'linear',
    angle: 90,
    stops: [
      { id: 'ne-1', color: '#f72585', position: 0 },
      { id: 'ne-2', color: '#7209b7', position: 50 },
      { id: 'ne-3', color: '#4cc9f0', position: 100 },
    ],
  },
  {
    id: 'builtin-peach',
    name: 'Pastel Peach',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 'pe-1', color: '#ff9a9e', position: 0 },
      { id: 'pe-2', color: '#fecfef', position: 55 },
      { id: 'pe-3', color: '#a1c4fd', position: 100 },
    ],
  },
  {
    id: 'builtin-midnight',
    name: 'Midnight Slate',
    type: 'linear',
    angle: 180,
    stops: [
      { id: 'mn-1', color: '#0f2027', position: 0 },
      { id: 'mn-2', color: '#203a43', position: 50 },
      { id: 'mn-3', color: '#2c5364', position: 100 },
    ],
  },
  {
    id: 'builtin-mono',
    name: 'Clean Monochrome',
    type: 'linear',
    angle: 90,
    stops: [
      { id: 'mo-1', color: '#111827', position: 0 },
      { id: 'mo-2', color: '#f3f4f6', position: 100 },
    ],
  },
];

/**
 * Parse hex string to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to 6-char hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Linearly interpolate between two hex colors
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const f = Math.min(1, Math.max(0, factor));
  const r = c1.r + (c2.r - c1.r) * f;
  const g = c1.g + (c2.g - c1.g) * f;
  const b = c1.b + (c2.b - c1.b) * f;
  return rgbToHex(r, g, b);
}

/**
 * Sample the exact blended color along gradient stops at given percentage [0..100]
 */
export function sampleGradientColorAt(stops: GradientColorStop[], position: number): string {
  if (!stops || stops.length === 0) return '#ffffff';
  if (stops.length === 1) return stops[0].color;

  const sorted = [...stops].sort((a, b) => a.position - b.position);
  if (position <= sorted[0].position) return sorted[0].color;
  if (position >= sorted[sorted.length - 1].position) return sorted[sorted.length - 1].color;

  for (let i = 0; i < sorted.length - 1; i++) {
    const s1 = sorted[i];
    const s2 = sorted[i + 1];
    if (position >= s1.position && position <= s2.position) {
      const range = s2.position - s1.position;
      const factor = range > 0 ? (position - s1.position) / range : 0;
      return interpolateColor(s1.color, s2.color, factor);
    }
  }

  return sorted[0].color;
}

/**
 * Generate CSS gradient string for preview rendering
 */
export function getCssGradient(gradient: GradientConfig, overrideAngle?: number): string {
  if (!gradient || !gradient.stops || gradient.stops.length === 0) {
    return 'linear-gradient(90deg, #ffffff 0%, #000000 100%)';
  }

  const sorted = [...gradient.stops].sort((a, b) => a.position - b.position);
  const stopsStr = sorted
    .map((s) => `${s.color} ${Math.round(s.position)}%`)
    .join(', ');

  if (gradient.type === 'radial') {
    return `radial-gradient(circle at center, ${stopsStr})`;
  }

  const angle = overrideAngle !== undefined ? overrideAngle : gradient.angle;
  return `linear-gradient(${angle}deg, ${stopsStr})`;
}

/**
 * Generate horizontal (90deg) CSS string specifically for the gradient bar track
 */
export function getBarTrackCssGradient(stops: GradientColorStop[]): string {
  if (!stops || stops.length === 0) {
    return 'linear-gradient(90deg, #ffffff 0%, #000000 100%)';
  }
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopsStr = sorted
    .map((s) => `${s.color} ${Math.round(s.position)}%`)
    .join(', ');
  return `linear-gradient(90deg, ${stopsStr})`;
}

/**
 * Render the gradient on an HTML5 CanvasRenderingContext2D
 */
export function createCanvasGradient(
  ctx: CanvasRenderingContext2D,
  gradient: GradientConfig,
  width: number,
  height: number
): CanvasGradient {
  let canvasGrad: CanvasGradient;

  if (gradient.type === 'radial') {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(width, height) / 2;
    canvasGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  } else {
    // In CSS:
    // 0deg = to top
    // 90deg = to right
    // 180deg = to bottom
    // 270deg = to left
    const rad = ((gradient.angle - 90) * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const length = Math.hypot(width, height) / 2;
    const x0 = cx - Math.cos(rad) * length;
    const y0 = cy - Math.sin(rad) * length;
    const x1 = cx + Math.cos(rad) * length;
    const y1 = cy + Math.sin(rad) * length;
    canvasGrad = ctx.createLinearGradient(x0, y0, x1, y1);
  }

  const sorted = [...gradient.stops].sort((a, b) => a.position - b.position);
  if (sorted.length === 0) {
    canvasGrad.addColorStop(0, '#ffffff');
    canvasGrad.addColorStop(1, '#000000');
  } else if (sorted.length === 1) {
    canvasGrad.addColorStop(0, sorted[0].color);
    canvasGrad.addColorStop(1, sorted[0].color);
  } else {
    sorted.forEach((stop) => {
      const pos = Math.min(1, Math.max(0, stop.position / 100));
      canvasGrad.addColorStop(pos, stop.color);
    });
  }

  return canvasGrad;
}

// ---------------- LOCAL STORAGE PERSISTENCE ----------------

const SAVED_COLORS_KEY = 'image_scaler_saved_custom_colors_v1';
const SAVED_GRADIENTS_KEY = 'image_scaler_saved_custom_gradients_v1';

export const DEFAULT_SAVED_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

/**
 * Load saved custom colors from localStorage
 */
export function getSavedCustomColors(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_COLORS_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(DEFAULT_SAVED_COLORS));
      return DEFAULT_SAVED_COLORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SAVED_COLORS;
  } catch (err) {
    console.warn('Failed to load saved custom colors', err);
    return DEFAULT_SAVED_COLORS;
  }
}

/**
 * Save a new custom color to localStorage
 */
export function saveCustomColor(colorHex: string): string[] {
  try {
    const current = getSavedCustomColors();
    const normalized = colorHex.toLowerCase().trim();
    if (!current.includes(normalized)) {
      const updated = [normalized, ...current].slice(0, 32); // keep up to 32 colors
      localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch (err) {
    console.warn('Failed to save custom color', err);
    return getSavedCustomColors();
  }
}

/**
 * Remove a custom color from localStorage
 */
export function removeCustomColor(colorHex: string): string[] {
  try {
    const current = getSavedCustomColors();
    const normalized = colorHex.toLowerCase().trim();
    const updated = current.filter((c) => c.toLowerCase() !== normalized);
    localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to remove custom color', err);
    return getSavedCustomColors();
  }
}

/**
 * Load saved custom gradients from localStorage
 */
export function getSavedCustomGradients(): GradientConfig[] {
  try {
    const raw = localStorage.getItem(SAVED_GRADIENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Failed to load saved custom gradients', err);
    return [];
  }
}

/**
 * Save a custom gradient to localStorage
 */
export function saveCustomGradient(gradient: GradientConfig): GradientConfig[] {
  try {
    const current = getSavedCustomGradients();
    const newGrad: GradientConfig = {
      ...gradient,
      id: gradient.id || `custom-grad-${Date.now()}`,
      name: gradient.name?.trim() || `Custom Gradient ${current.length + 1}`,
    };
    const updated = [newGrad, ...current.filter((g) => g.id !== newGrad.id)].slice(0, 30);
    localStorage.setItem(SAVED_GRADIENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save custom gradient', err);
    return getSavedCustomGradients();
  }
}

/**
 * Remove a custom gradient from localStorage
 */
export function removeCustomGradient(id: string): GradientConfig[] {
  try {
    const current = getSavedCustomGradients();
    const updated = current.filter((g) => g.id !== id);
    localStorage.setItem(SAVED_GRADIENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to remove custom gradient', err);
    return getSavedCustomGradients();
  }
}
