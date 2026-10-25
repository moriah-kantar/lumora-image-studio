import React from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  RotateCcw,
  Bookmark,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import { AppTheme } from '../utils/theme';

interface HeaderProps {
  onLoadSample: (type: 'photo' | 'graphic' | 'pixel') => void;
  onReset: () => void;
  hasImage: boolean;
  onOpenHelp: () => void;
  onOpenPresets?: () => void;
  favoritesCount?: number;
  theme?: AppTheme;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onReset,
  hasImage,
  onOpenHelp,
  onOpenPresets,
  favoritesCount = 0,
  theme = 'light',
  onToggleTheme,
}) => {
  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center shadow-sm border border-transparent dark:border-stone-700">
            <ImageIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                Lumora
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden md:block">
              Image Scaler & Quality Studio • Scale dimensions, upscale quality, compress, and export
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Sample images trigger */}
          <div className="relative group">
            <button
              id="header-samples-button"
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-transparent dark:border-stone-700 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Try Sample</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg py-1 hidden group-hover:block hover:block z-40">
              <button
                type="button"
                id="sample-photo-btn"
                onClick={() => onLoadSample('photo')}
                className="w-full text-left px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between transition-colors"
              >
                <span>Sunset Landscape</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">Photo</span>
              </button>
              <button
                type="button"
                id="sample-graphic-btn"
                onClick={() => onLoadSample('graphic')}
                className="w-full text-left px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between transition-colors"
              >
                <span>Geometric Vector</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">Graphic</span>
              </button>
              <button
                type="button"
                id="sample-pixel-btn"
                onClick={() => onLoadSample('pixel')}
                className="w-full text-left px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between transition-colors"
              >
                <span>Pixel Character (64px)</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">Sprite</span>
              </button>
            </div>
          </div>

          {/* Presets & Favorites trigger */}
          {onOpenPresets && (
            <button
              id="header-presets-button"
              type="button"
              onClick={onOpenPresets}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-transparent dark:border-stone-700 rounded-lg transition-colors"
              title="Open Presets & Favorites Library"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Presets</span>
              {favoritesCount > 0 && (
                <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400/30 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Light / Dark Mode Toggle Button */}
          {onToggleTheme && (
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-transparent dark:border-stone-700 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          )}

          {hasImage && (
            <button
              id="header-reset-button"
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              title="Clear current image"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            id="header-help-button"
            type="button"
            onClick={onOpenHelp}
            className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            title="Shortcuts and Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
