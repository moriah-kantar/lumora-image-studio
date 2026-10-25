import { OutputFormat } from '../types';

export const DEFAULT_FORMAT_STORAGE_KEY = 'image_scaler_default_format';

export interface FormatDescriptor {
  id: OutputFormat;
  label: string;
  extension: string;
  category: 'Modern Web' | 'Standard' | 'Lossless & Icons';
  description: string;
  badge?: string;
  note?: string;
  supportsAlpha: boolean;
  hasQuality: boolean;
}

export const SUPPORTED_FORMATS: FormatDescriptor[] = [
  {
    id: 'image/webp',
    label: 'WebP',
    extension: 'webp',
    category: 'Modern Web',
    description: 'Modern web standard with superior compression, transparency, and adjustable quality.',
    badge: 'Popular',
    note: 'Web standard & alpha',
    supportsAlpha: true,
    hasQuality: true,
  },
  {
    id: 'image/jpeg',
    label: 'JPEG',
    extension: 'jpg',
    category: 'Standard',
    description: 'Universal compatibility across all devices and web platforms with adjustable compression.',
    note: 'Universal photo',
    supportsAlpha: false,
    hasQuality: true,
  },
  {
    id: 'image/png',
    label: 'PNG',
    extension: 'png',
    category: 'Standard',
    description: '100% Lossless raster graphics format preserving razor-sharp lines and full alpha channel.',
    note: 'Lossless + alpha',
    supportsAlpha: true,
    hasQuality: false,
  },
  {
    id: 'image/avif',
    label: 'AVIF',
    extension: 'avif',
    category: 'Modern Web',
    description: 'Next-generation AV1 image format offering smaller file sizes than WebP and JPEG at high quality.',
    badge: 'Next-Gen',
    note: 'Ultra compression',
    supportsAlpha: true,
    hasQuality: true,
  },
  {
    id: 'image/bmp',
    label: 'BMP',
    extension: 'bmp',
    category: 'Lossless & Icons',
    description: 'Standard uncompressed Windows bitmap with pristine raw pixel fidelity and zero artifacts.',
    note: 'Raw pixel bitmap',
    supportsAlpha: true,
    hasQuality: false,
  },
  {
    id: 'image/tiff',
    label: 'TIFF',
    extension: 'tiff',
    category: 'Lossless & Icons',
    description: 'High-end photographic, publishing, and archival format with uncompressed RGB/RGBA channels.',
    note: 'Print & archival',
    supportsAlpha: true,
    hasQuality: false,
  },
  {
    id: 'image/x-icon',
    label: 'ICO',
    extension: 'ico',
    category: 'Lossless & Icons',
    description: 'Universal icon format for website favicons and desktop app icons with 32-bit transparency.',
    badge: 'Favicon',
    note: 'Favicon / app icon',
    supportsAlpha: true,
    hasQuality: false,
  },
];

/**
 * Gets the user's saved default output format, defaulting to 'image/webp'
 */
export function getDefaultOutputFormat(): OutputFormat {
  try {
    const saved = localStorage.getItem(DEFAULT_FORMAT_STORAGE_KEY);
    if (saved && SUPPORTED_FORMATS.some((f) => f.id === saved)) {
      return saved as OutputFormat;
    }
  } catch (e) {
    console.warn('Unable to read default format from localStorage:', e);
  }
  return 'image/webp';
}

/**
 * Saves the user's preferred default output format to localStorage
 */
export function setDefaultOutputFormat(format: OutputFormat): void {
  try {
    localStorage.setItem(DEFAULT_FORMAT_STORAGE_KEY, format);
  } catch (e) {
    console.warn('Unable to save default format to localStorage:', e);
  }
}

/**
 * Returns the file extension (without dot) for a given output format
 */
export function getFormatExtension(format: OutputFormat): string {
  const found = SUPPORTED_FORMATS.find((f) => f.id === format);
  return found?.extension || 'png';
}

/**
 * Checks if browser canvas supports direct AVIF export
 */
export function isBrowserAvifExportSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').startsWith('data:image/avif');
  } catch {
    return false;
  }
}

/**
 * Pure client-side 32-bit BGRA Windows BMP encoder
 */
export function encodeBmp(imageData: ImageData): Blob {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // 32-bit BMP has 4 bytes per pixel, naturally 4-byte aligned
  const rowSize = width * 4;
  const pixelArraySize = rowSize * height;
  const fileHeaderSize = 14;
  const dibHeaderSize = 40;
  const totalFileSize = fileHeaderSize + dibHeaderSize + pixelArraySize;

  const buffer = new ArrayBuffer(totalFileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // 1. BMP File Header (14 bytes)
  bytes[0] = 0x42; // 'B'
  bytes[1] = 0x4d; // 'M'
  view.setUint32(2, totalFileSize, true);
  view.setUint16(6, 0, true); // reserved1
  view.setUint16(8, 0, true); // reserved2
  view.setUint32(10, fileHeaderSize + dibHeaderSize, true); // offset to pixel data = 54

  // 2. DIB Header (BITMAPINFOHEADER - 40 bytes)
  view.setUint32(14, dibHeaderSize, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive height = bottom-up
  view.setUint16(26, 1, true); // color planes
  view.setUint16(28, 32, true); // 32 bits per pixel (BGRA)
  view.setUint32(30, 0, true); // BI_RGB (uncompressed)
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true); // ~72 DPI horizontal (pixels/meter)
  view.setInt32(42, 2835, true); // ~72 DPI vertical (pixels/meter)
  view.setUint32(46, 0, true); // colors in palette
  view.setUint32(50, 0, true); // important colors

  // 3. Pixel data: bottom-up BGRA
  let destOffset = 54;
  for (let y = height - 1; y >= 0; y--) {
    const rowStart = y * width * 4;
    for (let x = 0; x < width; x++) {
      const srcOffset = rowStart + x * 4;
      bytes[destOffset] = data[srcOffset + 2]; // Blue
      bytes[destOffset + 1] = data[srcOffset + 1]; // Green
      bytes[destOffset + 2] = data[srcOffset]; // Red
      bytes[destOffset + 3] = data[srcOffset + 3]; // Alpha
      destOffset += 4;
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/**
 * Pure client-side baseline TIFF 6.0 uncompressed RGBA encoder
 */
export function encodeTiff(imageData: ImageData): Blob {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const pixelByteCount = width * height * 4;

  const headerSize = 8;
  const numTags = 10;
  const ifdSize = 2 + numTags * 12 + 4; // 2 count + 120 tags + 4 next IFD = 126
  const extraDataOffset = headerSize + ifdSize; // 134
  const bitsPerSampleLength = 8; // 4 * uint16 = 8 bytes
  const imageDataOffset = extraDataOffset + bitsPerSampleLength; // 142
  const totalFileSize = imageDataOffset + pixelByteCount;

  const buffer = new ArrayBuffer(totalFileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // 1. TIFF Header (8 bytes, Little-Endian 'II')
  bytes[0] = 0x49; // 'I'
  bytes[1] = 0x49; // 'I'
  view.setUint16(2, 42, true); // TIFF magic number 42
  view.setUint32(4, 8, true); // Offset to first IFD = 8

  // 2. IFD (Image File Directory)
  let ifdOffset = 8;
  view.setUint16(ifdOffset, numTags, true);
  ifdOffset += 2;

  const writeTag = (
    tag: number,
    type: number,
    count: number,
    valOrOffset: number
  ) => {
    view.setUint16(ifdOffset, tag, true);
    view.setUint16(ifdOffset + 2, type, true);
    view.setUint32(ifdOffset + 4, count, true);
    view.setUint32(ifdOffset + 8, valOrOffset, true);
    ifdOffset += 12;
  };

  // Types: 3 = SHORT (uint16), 4 = LONG (uint32)
  writeTag(256, 4, 1, width); // ImageWidth
  writeTag(257, 4, 1, height); // ImageLength
  writeTag(258, 3, 4, extraDataOffset); // BitsPerSample -> points to [8, 8, 8, 8]
  writeTag(259, 3, 1, 1); // Compression (1 = uncompressed)
  writeTag(262, 3, 1, 2); // PhotometricInterpretation (2 = RGB)
  writeTag(273, 4, 1, imageDataOffset); // StripOffsets -> image data start
  writeTag(277, 3, 1, 4); // SamplesPerPixel (RGBA = 4)
  writeTag(278, 4, 1, height); // RowsPerStrip
  writeTag(279, 4, 1, pixelByteCount); // StripByteCounts
  writeTag(338, 3, 1, 2); // ExtraSamples (2 = unassociated alpha)

  // Next IFD Offset (0 = none)
  view.setUint32(ifdOffset, 0, true);

  // 3. Extra Data: BitsPerSample [8, 8, 8, 8] (4 x uint16)
  view.setUint16(extraDataOffset, 8, true);
  view.setUint16(extraDataOffset + 2, 8, true);
  view.setUint16(extraDataOffset + 4, 8, true);
  view.setUint16(extraDataOffset + 6, 8, true);

  // 4. Raw RGBA Pixel Data
  bytes.set(data, imageDataOffset);

  return new Blob([buffer], { type: 'image/tiff' });
}

/**
 * Standard ICO encoder wrapping a PNG payload in an ICONDIR and ICONDIRENTRY container
 */
export async function encodeIco(
  pngBlob: Blob,
  width: number,
  height: number
): Promise<Blob> {
  const pngArrayBuffer = await pngBlob.arrayBuffer();
  const pngBytes = new Uint8Array(pngArrayBuffer);

  const headerSize = 6;
  const entrySize = 16;
  const totalHeaderSize = headerSize + entrySize; // 22 bytes

  const headerBuffer = new ArrayBuffer(totalHeaderSize);
  const view = new DataView(headerBuffer);

  // ICONDIR (6 bytes)
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Resource type: 1 = icon
  view.setUint16(4, 1, true); // Number of images = 1

  // ICONDIRENTRY (16 bytes)
  view.setUint8(6, width >= 256 ? 0 : width); // Width in pixels (0 means 256)
  view.setUint8(7, height >= 256 ? 0 : height); // Height in pixels (0 means 256)
  view.setUint8(8, 0); // Number of colors in palette (0 = >= 8bpp)
  view.setUint8(9, 0); // Reserved (must be 0)
  view.setUint16(10, 1, true); // Color planes (1)
  view.setUint16(12, 32, true); // Bits per pixel (32bpp)
  view.setUint32(14, pngBytes.length, true); // Image data size in bytes
  view.setUint32(18, totalHeaderSize, true); // Offset of image data = 22

  return new Blob([headerBuffer, pngBytes], { type: 'image/x-icon' });
}
