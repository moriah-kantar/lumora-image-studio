import { DimensionPreset } from '../types';

export const DIMENSION_PRESETS: DimensionPreset[] = [
  // Display
  { id: '4k', name: '4K Ultra HD', category: 'Display', width: 3840, height: 2160 },
  { id: '1080p', name: 'Full HD 1080p', category: 'Display', width: 1920, height: 1080 },
  { id: '720p', name: 'HD 720p', category: 'Display', width: 1280, height: 720 },

  // Social
  { id: 'ig-square', name: 'Instagram Square (1:1)', category: 'Social', width: 1080, height: 1080 },
  { id: 'ig-portrait', name: 'Instagram Portrait (4:5)', category: 'Social', width: 1080, height: 1350 },
  { id: 'ig-story', name: 'Instagram Story (9:16)', category: 'Social', width: 1080, height: 1920 },
  { id: 'yt-thumb', name: 'YouTube Thumbnail', category: 'Social', width: 1280, height: 720 },
  { id: 'x-post', name: 'X / Twitter Post', category: 'Social', width: 1200, height: 675 },
  { id: 'og-image', name: 'Open Graph Banner', category: 'Social', width: 1200, height: 630 },

  // Web
  { id: 'web-hero', name: 'Web Hero Header', category: 'Web', width: 1600, height: 900 },
  { id: 'web-card', name: 'Blog Card Image', category: 'Web', width: 800, height: 600 },
  { id: 'web-thumb', name: 'Web Thumbnail', category: 'Web', width: 400, height: 300 },

  // Icon
  { id: 'avatar', name: 'Avatar Profile', category: 'Icon', width: 512, height: 512 },
  { id: 'icon-large', name: 'App Icon Large', category: 'Icon', width: 512, height: 512 },
  { id: 'favicon', name: 'Favicon High-Res', category: 'Icon', width: 64, height: 64 },
];
