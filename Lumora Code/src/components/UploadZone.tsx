import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, X, Plus, Clipboard } from 'lucide-react';
import { UploadedImage } from '../types';
import { formatBytes } from '../utils/imageProcessing';

interface UploadZoneProps {
  images: UploadedImage[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onFilesAdded: (files: File[]) => void;
  onLoadSample: (type: 'photo' | 'graphic' | 'pixel') => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  images,
  selectedImageId,
  onSelectImage,
  onRemoveImage,
  onFilesAdded,
  onLoadSample,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files) as File[];
      const validFiles = fileList.filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files) as File[];
      const validFiles = fileList.filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
      e.target.value = '';
    }
  };

  const handlePasteClick = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], `pasted-image-${Date.now()}.${type.split('/')[1] || 'png'}`, {
              type,
            });
            onFilesAdded([file]);
            return;
          }
        }
      }
    } catch {
      // Fallback message
      alert('To paste an image, press Ctrl+V or Cmd+V anywhere on the page.');
    }
  };

  // If no images uploaded yet, show full drag & drop hero area
  if (images.length === 0) {
    return (
      <div
        id="empty-upload-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer bg-white dark:bg-stone-900 ${
          isDragOver
            ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-850 ring-4 ring-stone-100 dark:ring-stone-800 scale-[0.99]'
            : 'border-stone-300 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 hover:bg-stone-50/50 dark:hover:bg-stone-850/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,image/tiff,image/x-icon"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center mb-4 text-stone-700 dark:text-stone-300 shadow-xs">
            <UploadCloud className="w-8 h-8 text-stone-600 dark:text-stone-300" />
          </div>

          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Drop your image here, or browse
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            Supports PNG, JPEG, WebP, AVIF, TIFF, BMP, ICO, GIF, and SVG. Processed 100% locally in your browser.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6" onClick={(e) => e.stopPropagation()}>
            <button
              id="upload-browse-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white dark:text-stone-900 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              Choose File
            </button>

            <button
              id="upload-paste-button"
              type="button"
              onClick={handlePasteClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
              title="Paste image from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Paste (Ctrl+V)
            </button>
          </div>

          {/* Quick test sample buttons */}
          <div className="pt-6 border-t border-stone-200/80 dark:border-stone-800 w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500 mb-3 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Or try with ready-to-test sample images:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                id="empty-sample-photo"
                type="button"
                onClick={() => onLoadSample('photo')}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
              >
                🌅 Sunset Landscape (Photo)
              </button>
              <button
                id="empty-sample-graphic"
                type="button"
                onClick={() => onLoadSample('graphic')}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
              >
                ⚡ Vector Badge (Alpha Graphic)
              </button>
              <button
                id="empty-sample-pixel"
                type="button"
                onClick={() => onLoadSample('pixel')}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
              >
                👾 Pixel Sprite (64×64)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If images exist, show a top thumbnail gallery bar with add button
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 shadow-xs mb-4 transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,image/tiff,image/x-icon"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {images.map((img) => {
          const isSelected = img.id === selectedImageId;
          return (
            <div
              key={img.id}
              onClick={() => onSelectImage(img.id)}
              className={`group relative flex-shrink-0 flex items-center gap-2 p-1.5 rounded-lg cursor-pointer border transition-all ${
                isSelected
                  ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300'
              }`}
            >
              <img
                src={img.previewUrl}
                alt={img.name}
                className="w-10 h-10 object-cover rounded-md bg-stone-200 dark:bg-stone-700 flex-shrink-0"
              />
              <div className="pr-5 max-w-[140px] truncate text-left">
                <p className="text-xs font-medium truncate">{img.name}</p>
                <p className={`text-[10px] ${isSelected ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                  {img.width}×{img.height} • {formatBytes(img.sizeBytes)}
                </p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(img.id);
                }}
                className={`absolute top-1 right-1 p-0.5 rounded-full transition-colors ${
                  isSelected
                    ? 'text-stone-400 dark:text-stone-500 hover:text-white dark:hover:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* Add more files button */}
        <button
          id="gallery-add-button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors h-13 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-stone-500 dark:text-stone-400" />
          <span className="whitespace-nowrap">Add more</span>
        </button>
      </div>
    </div>
  );
};
