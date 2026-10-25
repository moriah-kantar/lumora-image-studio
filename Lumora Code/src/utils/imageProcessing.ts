import { ProcessingSettings, ProcessedResult } from '../types';
import { createCanvasGradient } from './gradientUtils';
import { encodeBmp, encodeTiff, encodeIco } from './formatEncoders';

/**
 * Checks if an image has transparency (alpha channel < 255)
 */
export function checkImageHasAlpha(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  // Sample up to 1000 pixels across the canvas to be fast
  const w = canvas.width;
  const h = canvas.height;
  const stepX = Math.max(1, Math.floor(w / 40));
  const stepY = Math.max(1, Math.floor(h / 40));

  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let y = 0; y < h; y += stepY) {
      for (let x = 0; x < w; x += stepX) {
        const index = (y * w + x) * 4 + 3;
        if (data[index] < 250) {
          return true;
        }
      }
    }
  } catch (err) {
    console.warn('Could not inspect alpha channel', err);
  }
  return false;
}

/**
 * sinc function for Lanczos kernel
 */
function sinc(x: number): number {
  if (x === 0) return 1.0;
  const px = Math.PI * x;
  return Math.sin(px) / px;
}

/**
 * Lanczos windowed sinc kernel
 */
function lanczosKernel(x: number, a = 3): number {
  const ax = Math.abs(x);
  if (ax === 0) return 1.0;
  if (ax >= a) return 0;
  return sinc(ax) * sinc(ax / a);
}

/**
 * Catmull-Rom Bicubic kernel
 */
function bicubicKernel(x: number): number {
  const ax = Math.abs(x);
  if (ax < 1) {
    return 1.5 * ax * ax * ax - 2.5 * ax * ax + 1.0;
  }
  if (ax < 2) {
    return -0.5 * ax * ax * ax + 2.5 * ax * ax - 4.0 * ax + 2.0;
  }
  return 0;
}

/**
 * Fast Lanczos3 Resampling using 2-pass separable convolution
 */
export function resampleLanczos3(
  srcCtx: CanvasRenderingContext2D,
  srcW: number,
  srcH: number,
  destW: number,
  destH: number
): ImageData {
  const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;

  // Intermediate horizontal buffer (destW x srcH)
  const tmp = new Float32Array(destW * srcH * 4);
  const a = 3;

  // PASS 1: Horizontal
  const scaleX = destW / srcW;
  const filterRadiusX = scaleX < 1 ? a / scaleX : a;
  const normFactorX = scaleX < 1 ? scaleX : 1;

  for (let dy = 0; dy < srcH; dy++) {
    const srcRowOffset = dy * srcW * 4;
    const tmpRowOffset = dy * destW * 4;

    for (let dx = 0; dx < destW; dx++) {
      const center = (dx + 0.5) / scaleX - 0.5;
      const left = Math.max(0, Math.floor(center - filterRadiusX));
      const right = Math.min(srcW - 1, Math.ceil(center + filterRadiusX));

      let r = 0, g = 0, b = 0, alpha = 0, weightSum = 0;

      for (let sx = left; sx <= right; sx++) {
        const weight = lanczosKernel((sx - center) * normFactorX, a);
        if (weight === 0) continue;
        const idx = srcRowOffset + sx * 4;
        const sa = srcData[idx + 3] / 255;
        // premultiplied alpha
        r += srcData[idx] * sa * weight;
        g += srcData[idx + 1] * sa * weight;
        b += srcData[idx + 2] * sa * weight;
        alpha += srcData[idx + 3] * weight;
        weightSum += weight;
      }

      const outIdx = tmpRowOffset + dx * 4;
      if (weightSum > 0) {
        tmp[outIdx] = r / weightSum;
        tmp[outIdx + 1] = g / weightSum;
        tmp[outIdx + 2] = b / weightSum;
        tmp[outIdx + 3] = alpha / weightSum;
      }
    }
  }

  // PASS 2: Vertical
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = destW;
  finalCanvas.height = destH;
  const finalCtx = finalCanvas.getContext('2d')!;
  const finalImgData = finalCtx.createImageData(destW, destH);
  const destData = finalImgData.data;

  const scaleY = destH / srcH;
  const filterRadiusY = scaleY < 1 ? a / scaleY : a;
  const normFactorY = scaleY < 1 ? scaleY : 1;

  for (let dx = 0; dx < destW; dx++) {
    for (let dy = 0; dy < destH; dy++) {
      const center = (dy + 0.5) / scaleY - 0.5;
      const top = Math.max(0, Math.floor(center - filterRadiusY));
      const bottom = Math.min(srcH - 1, Math.ceil(center + filterRadiusY));

      let r = 0, g = 0, b = 0, alpha = 0, weightSum = 0;

      for (let sy = top; sy <= bottom; sy++) {
        const weight = lanczosKernel((sy - center) * normFactorY, a);
        if (weight === 0) continue;
        const idx = (sy * destW + dx) * 4;
        r += tmp[idx] * weight;
        g += tmp[idx + 1] * weight;
        b += tmp[idx + 2] * weight;
        alpha += tmp[idx + 3] * weight;
        weightSum += weight;
      }

      const outIdx = (dy * destW + dx) * 4;
      if (weightSum > 0) {
        const aNorm = alpha / weightSum;
        const aFactor = aNorm > 0 ? 255 / aNorm : 0;
        destData[outIdx] = Math.min(255, Math.max(0, Math.round((r / weightSum) * aFactor)));
        destData[outIdx + 1] = Math.min(255, Math.max(0, Math.round((g / weightSum) * aFactor)));
        destData[outIdx + 2] = Math.min(255, Math.max(0, Math.round((b / weightSum) * aFactor)));
        destData[outIdx + 3] = Math.min(255, Math.max(0, Math.round(aNorm)));
      }
    }
  }

  return finalImgData;
}

/**
 * Fast Bicubic Resampling
 */
export function resampleBicubic(
  srcCtx: CanvasRenderingContext2D,
  srcW: number,
  srcH: number,
  destW: number,
  destH: number
): ImageData {
  const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = destW;
  finalCanvas.height = destH;
  const finalCtx = finalCanvas.getContext('2d')!;
  const finalImgData = finalCtx.createImageData(destW, destH);
  const destData = finalImgData.data;

  const scaleX = srcW / destW;
  const scaleY = srcH / destH;

  for (let dy = 0; dy < destH; dy++) {
    const srcY = (dy + 0.5) * scaleY - 0.5;
    const yInt = Math.floor(srcY);
    const yFrac = srcY - yInt;

    for (let dx = 0; dx < destW; dx++) {
      const srcX = (dx + 0.5) * scaleX - 0.5;
      const xInt = Math.floor(srcX);
      const xFrac = srcX - xInt;

      let r = 0, g = 0, b = 0, a = 0, totalWeight = 0;

      for (let m = -1; m <= 2; m++) {
        const iy = Math.min(srcH - 1, Math.max(0, yInt + m));
        const wy = bicubicKernel(m - yFrac);

        for (let n = -1; n <= 2; n++) {
          const ix = Math.min(srcW - 1, Math.max(0, xInt + n));
          const wx = bicubicKernel(n - xFrac);
          const weight = wx * wy;

          const idx = (iy * srcW + ix) * 4;
          r += srcData[idx] * weight;
          g += srcData[idx + 1] * weight;
          b += srcData[idx + 2] * weight;
          a += srcData[idx + 3] * weight;
          totalWeight += weight;
        }
      }

      const outIdx = (dy * destW + dx) * 4;
      if (totalWeight > 0) {
        destData[outIdx] = Math.min(255, Math.max(0, Math.round(r / totalWeight)));
        destData[outIdx + 1] = Math.min(255, Math.max(0, Math.round(g / totalWeight)));
        destData[outIdx + 2] = Math.min(255, Math.max(0, Math.round(b / totalWeight)));
        destData[outIdx + 3] = Math.min(255, Math.max(0, Math.round(a / totalWeight)));
      }
    }
  }

  return finalImgData;
}

/**
 * Multi-step stepped canvas downsampling (produces super-crisp reduction)
 */
function multiStepDownscale(
  source: HTMLCanvasElement | HTMLImageElement,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  let curW = source.width;
  let curH = source.height;

  let curCanvas = document.createElement('canvas');
  curCanvas.width = curW;
  curCanvas.height = curH;
  let curCtx = curCanvas.getContext('2d')!;
  curCtx.imageSmoothingEnabled = true;
  curCtx.imageSmoothingQuality = 'high';
  curCtx.drawImage(source, 0, 0);

  // Halve iteratively until close to target
  while (curW / 2 >= targetW && curH / 2 >= targetH) {
    const nextW = Math.floor(curW / 2);
    const nextH = Math.floor(curH / 2);
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;
    const nextCtx = nextCanvas.getContext('2d')!;
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);

    curCanvas = nextCanvas;
    curW = nextW;
    curH = nextH;
  }

  // Final draw to exact target
  if (curW !== targetW || curH !== targetH) {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetW;
    finalCanvas.height = targetH;
    const finalCtx = finalCanvas.getContext('2d')!;
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, targetW, targetH);
    return finalCanvas;
  }

  return curCanvas;
}

/**
 * Applies Unsharp Masking filter to restore crisp edges and micro-details
 */
function applyUnsharpMask(imageData: ImageData, amount: number): void {
  if (amount <= 0) return;
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  // Simple 3x3 Gaussian-like blur kernel
  // [ 1  2  1 ]
  // [ 2  4  2 ] / 16
  // [ 1  2  1 ]
  const blurred = new Uint8ClampedArray(data.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let totalW = 0;

      for (let ky = -1; ky <= 1; ky++) {
        const py = Math.min(h - 1, Math.max(0, y + ky));
        const wy = ky === 0 ? 2 : 1;

        for (let kx = -1; kx <= 1; kx++) {
          const px = Math.min(w - 1, Math.max(0, x + kx));
          const wx = kx === 0 ? 2 : 1;
          const weight = wx * wy;

          const idx = (py * w + px) * 4;
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
          a += data[idx + 3] * weight;
          totalW += weight;
        }
      }

      const outIdx = (y * w + x) * 4;
      blurred[outIdx] = r / totalW;
      blurred[outIdx + 1] = g / totalW;
      blurred[outIdx + 2] = b / totalW;
      blurred[outIdx + 3] = a / totalW;
    }
  }

  // Unsharp mask formula: sharpened = original + (original - blurred) * factor
  const factor = amount / 35; // scaled 0..100 -> ~0..2.85
  for (let i = 0; i < data.length; i += 4) {
    const diffR = data[i] - blurred[i];
    const diffG = data[i + 1] - blurred[i + 1];
    const diffB = data[i + 2] - blurred[i + 2];

    data[i] = Math.min(255, Math.max(0, data[i] + diffR * factor));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + diffG * factor));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + diffB * factor));
  }
}

/**
 * 3x3 Median / Denoise filter for compression artifact reduction
 */
function applyDenoise(imageData: ImageData, strength: number): void {
  if (strength <= 0) return;
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const copy = new Uint8ClampedArray(data);
  const mix = Math.min(1.0, strength / 100);

  const rVals: number[] = new Array(9);
  const gVals: number[] = new Array(9);
  const bVals: number[] = new Array(9);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let count = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          rVals[count] = copy[idx];
          gVals[count] = copy[idx + 1];
          bVals[count] = copy[idx + 2];
          count++;
        }
      }

      // Quick partial sort to find median (element 4)
      rVals.sort((a, b) => a - b);
      gVals.sort((a, b) => a - b);
      bVals.sort((a, b) => a - b);

      const medianR = rVals[4];
      const medianG = gVals[4];
      const medianB = bVals[4];

      const outIdx = (y * w + x) * 4;
      data[outIdx] = Math.round(data[outIdx] * (1 - mix) + medianR * mix);
      data[outIdx + 1] = Math.round(data[outIdx + 1] * (1 - mix) + medianG * mix);
      data[outIdx + 2] = Math.round(data[outIdx + 2] * (1 - mix) + medianB * mix);
    }
  }
}

/**
 * 3x3 High-Pass Filter for Texture (micro-detail & surface structure)
 */
function applyTexture(imageData: ImageData, amount: number): void {
  if (amount === 0) return;
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  if (w < 3 || h < 3) return;

  const copy = new Uint8ClampedArray(data);
  const factor = (amount / 100) * 0.45;

  for (let y = 1; y < h - 1; y++) {
    const rowOffset = y * w;
    const upOffset = (y - 1) * w;
    const downOffset = (y + 1) * w;

    for (let x = 1; x < w - 1; x++) {
      const idx = (rowOffset + x) * 4;
      const up = (upOffset + x) * 4;
      const down = (downOffset + x) * 4;
      const left = (rowOffset + x - 1) * 4;
      const right = (rowOffset + x + 1) * 4;

      for (let c = 0; c < 3; c++) {
        const centerVal = copy[idx + c];
        // Laplacian edge contrast
        const laplacian =
          4 * centerVal - copy[up + c] - copy[down + c] - copy[left + c] - copy[right + c];
        data[idx + c] = Math.min(255, Math.max(0, centerVal + laplacian * factor));
      }
    }
  }
}

/**
 * Dehaze: adjusts low-frequency haze veil and atmospheric contrast
 */
function applyDehaze(imageData: ImageData, amount: number): void {
  if (amount === 0) return;
  const data = imageData.data;
  const factor = (amount / 100) * 0.65;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    if (factor > 0) {
      // Dehaze cuts through haze: pulls down washed-out black level and boosts saturation
      const hazeVeil = (luma / 255) * factor * 35;
      r = Math.max(0, r - hazeVeil);
      g = Math.max(0, g - hazeVeil);
      b = Math.max(0, b - hazeVeil);

      // Boost local color saturation
      const newLuma = 0.299 * r + 0.587 * g + 0.114 * b;
      const satBoost = 1 + factor * 0.4;
      r = Math.min(255, Math.max(0, newLuma + (r - newLuma) * satBoost));
      g = Math.min(255, Math.max(0, newLuma + (g - newLuma) * satBoost));
      b = Math.min(255, Math.max(0, newLuma + (b - newLuma) * satBoost));
    } else {
      // Negative dehaze: adds soft atmospheric mist/haze
      const mist = -factor * 40;
      r = Math.min(255, r + mist * (1 - r / 300));
      g = Math.min(255, g + mist * (1 - g / 300));
      b = Math.min(255, b + mist * 1.1 * (1 - b / 300));
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

/**
 * Comprehensive Lightroom-grade tonal, color, white balance, B&W, and optical adjustments
 */
function applyColorAdjustments(
  imageData: ImageData,
  adjustments: ProcessingSettings['adjustments']
): void {
  const {
    exposure = 0,
    brightness = 0,
    contrast = 0,
    highlights = 0,
    shadows = 0,
    whites = 0,
    blacks = 0,
    temperature = 0,
    tint = 0,
    vibrance = 0,
    saturation = 0,
    colorBalanceRed = 0,
    colorBalanceGreen = 0,
    colorBalanceBlue = 0,
    blackAndWhite = false,
    bwRedFilter = 0,
    bwGreenFilter = 0,
    bwBlueFilter = 0,
    bwTone = 'none',
    clarity = 0,
    vignette = 0,
    grain = 0,
  } = adjustments;

  const isAllDefault =
    exposure === 0 &&
    brightness === 0 &&
    contrast === 0 &&
    highlights === 0 &&
    shadows === 0 &&
    whites === 0 &&
    blacks === 0 &&
    temperature === 0 &&
    tint === 0 &&
    vibrance === 0 &&
    saturation === 0 &&
    colorBalanceRed === 0 &&
    colorBalanceGreen === 0 &&
    colorBalanceBlue === 0 &&
    !blackAndWhite &&
    clarity === 0 &&
    vignette === 0 &&
    grain === 0;

  if (isAllDefault) {
    return;
  }

  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  // Pre-calculate invariant scalars
  const expMult = Math.pow(2, exposure / 45);
  const cClamped = Math.min(95, Math.max(-95, contrast));
  const cFactor = (259 * (cClamped + 255)) / (255 * (259 - cClamped));
  const bOffset = (brightness / 100) * 128;

  // Color temperature & tint
  const tempR = (temperature / 100) * 35;
  const tempB = -(temperature / 100) * 35;
  const tintR = (tint / 100) * 18;
  const tintG = -(tint / 100) * 30;
  const tintB = (tint / 100) * 18;

  // RGB color balance
  const cbR = (colorBalanceRed / 100) * 45;
  const cbG = (colorBalanceGreen / 100) * 45;
  const cbB = (colorBalanceBlue / 100) * 45;

  // Vignette pre-calc
  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.hypot(cx, cy) || 1;
  const hasVignette = vignette !== 0;

  // Grain pre-calc
  const hasGrain = grain > 0;
  const grainAmount = (grain / 100) * 55;

  // B&W filter weights
  const bwR = 0.299 * (1 + (bwRedFilter / 100) * 1.5);
  const bwG = 0.587 * (1 + (bwGreenFilter / 100) * 1.5);
  const bwB = 0.114 * (1 + (bwBlueFilter / 100) * 1.5);
  const bwSum = bwR + bwG + bwB || 1;

  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    const dy = y - cy;

    for (let x = 0; x < w; x++) {
      const idx = (rowOffset + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      // 1. Exposure
      if (exposure !== 0) {
        r *= expMult;
        g *= expMult;
        b *= expMult;
      }

      // 2. Brightness
      if (brightness !== 0) {
        r += bOffset;
        g += bOffset;
        b += bOffset;
      }

      // 3. Contrast
      if (contrast !== 0) {
        r = cFactor * (r - 128) + 128;
        g = cFactor * (g - 128) + 128;
        b = cFactor * (b - 128) + 128;
      }

      // Compute luminance for zonal tone adjustments
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      // 4. Highlights (affects luma > 90)
      if (highlights !== 0 && luma > 90) {
        const hWeight = (luma - 90) / 165;
        const hDelta = (highlights / 100) * 75 * hWeight;
        r += hDelta;
        g += hDelta;
        b += hDelta;
      }

      // 5. Shadows (affects luma < 170)
      if (shadows !== 0 && luma < 170) {
        const sWeight = (170 - luma) / 170;
        const sDelta = (shadows / 100) * 75 * sWeight;
        r += sDelta;
        g += sDelta;
        b += sDelta;
      }

      // 6. Whites (top dynamic range roll-off, luma > 180)
      if (whites !== 0 && luma > 180) {
        const wWeight = (luma - 180) / 75;
        const wDelta = (whites / 100) * 60 * wWeight * wWeight;
        r += wDelta;
        g += wDelta;
        b += wDelta;
      }

      // 7. Blacks (deep shadow clip point, luma < 80)
      if (blacks !== 0 && luma < 80) {
        const blkWeight = (80 - luma) / 80;
        const blkDelta = (blacks / 100) * 60 * blkWeight * blkWeight;
        r += blkDelta;
        g += blkDelta;
        b += blkDelta;
      }

      // 8. White Balance (Temperature & Tint)
      if (temperature !== 0) {
        r += tempR;
        b += tempB;
      }
      if (tint !== 0) {
        r += tintR;
        g += tintG;
        b += tintB;
      }

      // 9. Color Balance (RGB Channels)
      if (colorBalanceRed !== 0) r += cbR;
      if (colorBalanceGreen !== 0) g += cbG;
      if (colorBalanceBlue !== 0) b += cbB;

      // 10. Vibrance & Saturation
      if (vibrance !== 0 || saturation !== 0) {
        const curLuma = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const satRatio = maxC > 0 ? (maxC - minC) / maxC : 0;
        // Vibrance boosts muted colors more while protecting saturated colors
        const vibFactor = 1 + (vibrance / 100) * (1 - satRatio) * 1.6;
        const satFactor = 1 + saturation / 70;
        const totalSat = Math.max(0, vibFactor * satFactor);

        r = curLuma + (r - curLuma) * totalSat;
        g = curLuma + (g - curLuma) * totalSat;
        b = curLuma + (b - curLuma) * totalSat;
      }

      // 11. Clarity (local midtone contrast)
      if (clarity !== 0) {
        const curLuma = 0.299 * r + 0.587 * g + 0.114 * b;
        const midDist = 1 - Math.abs(curLuma - 128) / 128;
        if (midDist > 0) {
          const delta = (curLuma - 128) * (clarity / 100) * midDist * 0.45;
          r += delta;
          g += delta;
          b += delta;
        }
      }

      // 12. Black & White Mode and Toning
      if (blackAndWhite) {
        let gray = (r * bwR + g * bwG + b * bwB) / bwSum;
        gray = Math.min(255, Math.max(0, gray));

        if (bwTone === 'none') {
          r = gray;
          g = gray;
          b = gray;
        } else if (bwTone === 'sepia') {
          r = gray * 1.15 + 12;
          g = gray * 0.98 + 4;
          b = gray * 0.78 - 6;
        } else if (bwTone === 'cyanotype') {
          r = gray * 0.70 - 4;
          g = gray * 0.92 + 2;
          b = gray * 1.28 + 18;
        } else if (bwTone === 'platinum') {
          r = gray * 1.03 + 2;
          g = gray * 1.01 + 1;
          b = gray * 0.97;
        } else if (bwTone === 'cool') {
          r = gray * 0.92 - 2;
          g = gray * 0.97;
          b = gray * 1.12 + 10;
        } else if (bwTone === 'warm') {
          r = gray * 1.09 + 8;
          g = gray * 1.03 + 3;
          b = gray * 0.92 - 2;
        }
      }

      // 13. Vignette
      if (hasVignette) {
        const dx = x - cx;
        const dist = Math.hypot(dx, dy) / maxDist;
        if (dist > 0.3) {
          const vNorm = (dist - 0.3) / 0.7;
          const vCurve = Math.pow(vNorm, 1.8);
          if (vignette < 0) {
            const dark = Math.max(0, 1 + (vignette / 100) * vCurve * 0.92);
            r *= dark;
            g *= dark;
            b *= dark;
          } else {
            const light = (vignette / 100) * vCurve * 150;
            r += light;
            g += light;
            b += light;
          }
        }
      }

      // 14. Film Grain (authentic luminance-weighted analog grain)
      if (hasGrain) {
        const n = ((x * 12.9898 + y * 78.233 + (r + g) * 0.05) * 43758.5453) % 1;
        const noise = (n - 0.5) * 2;
        const postLuma = 0.299 * r + 0.587 * g + 0.114 * b;
        const grainWeight = 1 - Math.pow(Math.abs(postLuma - 128) / 128, 1.4);
        const grainDelta = noise * grainAmount * Math.max(0.25, grainWeight);
        r += grainDelta;
        g += grainDelta;
        b += grainDelta;
      }

      data[idx] = Math.min(255, Math.max(0, Math.round(r)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      data[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
    }
  }
}

/**
 * Main Processing Engine:
 * Takes source image/canvas, scales according to target dimensions and algorithm,
 * enhances quality, and formats to chosen export format (PNG, JPEG, WebP).
 */
export async function processImage(
  sourceImage: HTMLImageElement,
  settings: ProcessingSettings
): Promise<ProcessedResult> {
  const startTime = performance.now();
  const targetW = Math.max(1, Math.round(settings.targetWidth));
  const targetH = Math.max(1, Math.round(settings.targetHeight));
  const srcW = sourceImage.naturalWidth || sourceImage.width;
  const srcH = sourceImage.naturalHeight || sourceImage.height;

  let scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = targetW;
  scaledCanvas.height = targetH;
  const scaledCtx = scaledCanvas.getContext('2d')!;

  const isDownscale = targetW < srcW && targetH < srcH;
  const isUpscale = targetW > srcW || targetH > srcH;

  // 1. Resampling according to chosen algorithm
  if (settings.algorithm === 'pixelated') {
    // Nearest neighbor / crisp pixels
    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(sourceImage, 0, 0, srcW, srcH, 0, 0, targetW, targetH);
  } else if (settings.algorithm === 'lanczos3' && targetW * targetH <= 4096 * 4096) {
    // High-performance Lanczos3
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = srcW;
    tempCanvas.height = srcH;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(sourceImage, 0, 0);

    const imgData = resampleLanczos3(tempCtx, srcW, srcH, targetW, targetH);
    scaledCtx.putImageData(imgData, 0, 0);
  } else if (settings.algorithm === 'bicubic' && targetW * targetH <= 2500 * 2500) {
    // High-precision Bicubic
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = srcW;
    tempCanvas.height = srcH;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(sourceImage, 0, 0);

    const imgData = resampleBicubic(tempCtx, srcW, srcH, targetW, targetH);
    scaledCtx.putImageData(imgData, 0, 0);
  } else if (isDownscale && (srcW / targetW >= 2 || srcH / targetH >= 2)) {
    // Multi-step high-quality downsampling for dramatic reductions
    const stepped = multiStepDownscale(sourceImage, targetW, targetH);
    scaledCtx.drawImage(stepped, 0, 0);
  } else {
    // Browser High-Quality bicubic
    scaledCtx.imageSmoothingEnabled = true;
    scaledCtx.imageSmoothingQuality = 'high';
    scaledCtx.drawImage(sourceImage, 0, 0, srcW, srcH, 0, 0, targetW, targetH);
  }

  // 2. Extract ImageData for quality enhancements (Sharpening, Denoise, Color)
  const finalImageData = scaledCtx.getImageData(0, 0, targetW, targetH);

  // Auto-sharpen slight upscales if user enabled sharpness, or apply custom sharpness
  if (settings.adjustments.denoise > 0) {
    applyDenoise(finalImageData, settings.adjustments.denoise);
  }

  // Dehaze
  if (settings.adjustments.dehaze && settings.adjustments.dehaze !== 0) {
    applyDehaze(finalImageData, settings.adjustments.dehaze);
  }

  // Texture (micro-detail)
  if (settings.adjustments.texture && settings.adjustments.texture !== 0) {
    applyTexture(finalImageData, settings.adjustments.texture);
  }

  // Automatic baseline sharpening when upscaling significantly to restore micro-edge clarity
  let effectiveSharpness = settings.adjustments.sharpness;
  if (isUpscale && effectiveSharpness === 0) {
    // subtle default 12% enhancement for crispness on upscale
    effectiveSharpness = Math.min(25, Math.round((Math.max(targetW / srcW, targetH / srcH) - 1) * 15));
  }

  if (effectiveSharpness > 0) {
    applyUnsharpMask(finalImageData, effectiveSharpness);
  }

  // Comprehensive Color, Tone, White Balance, B&W, and Optical adjustments
  applyColorAdjustments(finalImageData, settings.adjustments);

  // Put enhanced pixel data back
  scaledCtx.putImageData(finalImageData, 0, 0);

  // 3. Handle background color or gradient fill for transparent areas
  let exportCanvas = scaledCanvas;
  const shouldApplyBackground =
    settings.format === 'image/jpeg' || Boolean(settings.fillTransparency);

  if (shouldApplyBackground) {
    const hasAlpha = checkImageHasAlpha(scaledCanvas);
    if (hasAlpha) {
      exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetW;
      exportCanvas.height = targetH;
      const expCtx = exportCanvas.getContext('2d')!;

      if (
        settings.backgroundType === 'gradient' &&
        settings.backgroundGradient &&
        settings.backgroundGradient.stops.length >= 2
      ) {
        expCtx.fillStyle = createCanvasGradient(
          expCtx,
          settings.backgroundGradient,
          targetW,
          targetH
        );
      } else {
        expCtx.fillStyle = settings.backgroundColor || '#ffffff';
      }

      expCtx.fillRect(0, 0, targetW, targetH);
      expCtx.drawImage(scaledCanvas, 0, 0);
    }
  }

  // 4. Export to Blob and DataURL
  const hasQualitySlider =
    settings.format === 'image/jpeg' ||
    settings.format === 'image/webp' ||
    settings.format === 'image/avif';
  const quality = hasQualitySlider
    ? Math.min(1.0, Math.max(0.01, settings.quality))
    : undefined;

  let blob: Blob;

  if (settings.format === 'image/bmp') {
    const ctx = exportCanvas.getContext('2d')!;
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    blob = encodeBmp(imgData);
  } else if (settings.format === 'image/tiff') {
    const ctx = exportCanvas.getContext('2d')!;
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    blob = encodeTiff(imgData);
  } else if (settings.format === 'image/x-icon') {
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      exportCanvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas PNG export failed for ICO'))),
        'image/png'
      );
    });
    blob = await encodeIco(pngBlob, targetW, targetH);
  } else if (settings.format === 'image/avif') {
    blob = await new Promise<Blob>((resolve) => {
      exportCanvas.toBlob(
        (b) => {
          if (b && b.size > 0 && b.type === 'image/avif') {
            resolve(b);
          } else {
            // Fallback to high-quality WebP if browser canvas doesn't encode AVIF directly
            exportCanvas.toBlob(
              (fallbackBlob) => {
                resolve(fallbackBlob || new Blob([], { type: 'image/avif' }));
              },
              'image/webp',
              quality
            );
          }
        },
        'image/avif',
        quality
      );
    });
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      exportCanvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas export failed'));
        },
        settings.format,
        quality
      );
    });
  }

  const dataUrl = URL.createObjectURL(blob);
  const endTime = performance.now();

  return {
    blob,
    dataUrl,
    width: targetW,
    height: targetH,
    sizeBytes: blob.size,
    format: settings.format,
    processingTimeMs: Math.round(endTime - startTime),
  };
}

/**
 * Formats byte size into human readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Calculates aspect ratio representation (e.g. 16:9, 4:3, 1:1)
 */
export function getAspectRatioLabel(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  const rw = Math.round(width / divisor);
  const rh = Math.round(height / divisor);
  if (rw <= 20 && rh <= 20) {
    return `${rw}:${rh}`;
  }
  return (width / height).toFixed(2) + ':1';
}
