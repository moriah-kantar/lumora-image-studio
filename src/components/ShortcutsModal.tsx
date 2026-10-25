import React from 'react';
import { X, Keyboard, Shield, Zap, Sparkles, Check } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Lumora Studio Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-stone-600 dark:text-stone-300 max-h-[80vh] overflow-y-auto">
          {/* Shortcuts list */}
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mb-2">
              <Keyboard className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              Keyboard & Mouse Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <span className="text-stone-700 dark:text-stone-300">Paste screenshot</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 font-mono text-[10px] text-stone-800 dark:text-stone-200">
                  Ctrl + V
                </kbd>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <span className="text-stone-700 dark:text-stone-300">Zoom Canvas</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 font-mono text-[10px] text-stone-800 dark:text-stone-200">
                  Scroll Wheel
                </kbd>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <span className="text-stone-700 dark:text-stone-300">Pan image</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 font-mono text-[10px] text-stone-800 dark:text-stone-200">
                  Drag with Zoom
                </kbd>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <span className="text-stone-700 dark:text-stone-300">Before/After</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 font-mono text-[10px] text-stone-800 dark:text-stone-200">
                  Drag Split Bar
                </kbd>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between col-span-2">
                <span className="text-stone-700 dark:text-stone-300">Favorites & Presets</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                  Star presets for 1-click apply in top bar
                </span>
              </div>
            </div>
          </div>

          {/* Upscale algorithms explained */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Resampling Filter Guide
            </h4>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Lanczos3:</strong> 3-lobed windowed sinc filter that delivers maximum sharpness and edge fidelity without blur. Best for photos and text.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Bicubic:</strong> Catmull-Rom cubic spline interpolation. Best for smooth photographic gradients and portraits.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Nearest Neighbor:</strong> Preserves crisp blocky pixel grid without blur. Essential for pixel art and retro gaming sprites.
                </span>
              </li>
            </ul>
          </div>

          {/* Privacy badge */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p className="text-[11px]">
                <strong>Client-Side & Confidential:</strong> All image scaling, resampling, enhancement, and compression operations run 100% locally in your browser's Canvas API. Your pictures are never uploaded to any remote server.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-stone-50 dark:bg-stone-950/70 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750 rounded-lg transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
