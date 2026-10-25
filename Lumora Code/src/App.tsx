import React, { useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import {
  UploadedImage,
  ProcessingSettings,
  ProcessedResult,
  OutputFormat,
  ImagePreset,
  PresetCategory,
  DEFAULT_ADJUSTMENTS,
} from './types';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ImagePreviewComparison } from './components/ImagePreviewComparison';
import { ControlsPanel } from './components/ControlsPanel';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PresetsModal } from './components/PresetsModal';
import { SavePresetModal } from './components/SavePresetModal';
import { createSampleImage } from './utils/sampleImages';
import { processImage, checkImageHasAlpha } from './utils/imageProcessing';
import {
  getSavedPresets,
  persistPresets,
  createPresetFromSettings,
  applyPresetToSettings,
} from './utils/presetsStorage';
import { DEFAULT_GRADIENT } from './utils/gradientUtils';
import {
  getDefaultOutputFormat,
  setDefaultOutputFormat,
  getFormatExtension,
  SUPPORTED_FORMATS,
} from './utils/formatEncoders';
import { AppTheme, getSavedTheme, applyTheme } from './utils/theme';
import { Check, Star } from 'lucide-react';

export default function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Presets & Favorites State
  const [presets, setPresets] = useState<ImagePreset[]>(() => getSavedPresets());
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<ImagePreset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Theme State (Persisted in localStorage)
  const [theme, setTheme] = useState<AppTheme>(() => getSavedTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, []);

  // Default Output Format State (Persisted in localStorage)
  const [defaultFormat, setDefaultFormatState] = useState<OutputFormat>(() =>
    getDefaultOutputFormat()
  );

  const handleSetDefaultFormat = useCallback((newDefault: OutputFormat) => {
    setDefaultOutputFormat(newDefault);
    setDefaultFormatState(newDefault);
    const desc = SUPPORTED_FORMATS.find((f) => f.id === newDefault);
    setToastMessage(`Saved ${desc?.label || newDefault} as default output format`);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Settings
  const [settings, setSettings] = useState<ProcessingSettings>(() => ({
    scaleMode: 'factor',
    scaleFactor: 1.0,
    targetWidth: 800,
    targetHeight: 600,
    maintainAspectRatio: true,
    aspectRatio: 800 / 600,
    algorithm: 'lanczos3',
    format: getDefaultOutputFormat(),
    quality: 0.85,
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    backgroundGradient: DEFAULT_GRADIENT,
    fillTransparency: false,
    adjustments: { ...DEFAULT_ADJUSTMENTS },
  }));

  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Active image element cache
  const activeImageElementRef = useRef<HTMLImageElement | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Get currently selected image
  const selectedImage = images.find((img) => img.id === selectedImageId) || images[0] || null;

  // Load a file into UploadedImage structure
  const loadFile = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = previewUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });

    // Check transparency
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    let hasAlpha = false;
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      hasAlpha = checkImageHasAlpha(canvas);
    }

    const uploaded: UploadedImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      name: file.name,
      previewUrl,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      sizeBytes: file.size,
      type: file.type,
      hasAlpha,
    };

    return { uploaded, imgElement: img };
  }, []);

  // Handle new files added
  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      try {
        const newUploadedList: UploadedImage[] = [];
        let firstElement: HTMLImageElement | null = null;
        let firstUploaded: UploadedImage | null = null;

        for (const f of files) {
          const { uploaded, imgElement } = await loadFile(f);
          newUploadedList.push(uploaded);
          if (!firstElement) {
            firstElement = imgElement;
            firstUploaded = uploaded;
          }
        }

        setImages((prev) => [...prev, ...newUploadedList]);

        if (firstUploaded && (!selectedImageId || images.length === 0)) {
          setSelectedImageId(firstUploaded.id);
          activeImageElementRef.current = firstElement;

          // Set initial target dimensions and saved default format
          setSettings((prev) => ({
            ...prev,
            targetWidth: firstUploaded!.width,
            targetHeight: firstUploaded!.height,
            aspectRatio: firstUploaded!.width / firstUploaded!.height,
            scaleFactor: 1.0,
            format: defaultFormat,
          }));
        }
      } catch (err) {
        console.error('Error loading files:', err);
      }
    },
    [defaultFormat, images.length, loadFile, selectedImageId]
  );

  // Load sample image
  const handleLoadSample = useCallback(
    async (type: 'photo' | 'graphic' | 'pixel') => {
      const sampleFile = await createSampleImage(type);
      await handleFilesAdded([sampleFile]);
    },
    [handleFilesAdded]
  );

  // Switch active image
  const handleSelectImage = useCallback(
    (id: string) => {
      const found = images.find((i) => i.id === id);
      if (found) {
        setSelectedImageId(id);
        const img = new Image();
        img.src = found.previewUrl;
        img.onload = () => {
          activeImageElementRef.current = img;
          setSettings((prev) => {
            const newW = Math.round(found.width * prev.scaleFactor);
            const newH = prev.maintainAspectRatio
              ? Math.round(newW / (found.width / found.height))
              : Math.round(found.height * prev.scaleFactor);
            return {
              ...prev,
              targetWidth: newW,
              targetHeight: newH,
              aspectRatio: found.width / found.height,
            };
          });
        };
      }
    },
    [images]
  );

  // Remove image
  const handleRemoveImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const filtered = prev.filter((img) => img.id !== id);
        if (selectedImageId === id) {
          const next = filtered[0];
          setSelectedImageId(next ? next.id : null);
          if (next) {
            const img = new Image();
            img.src = next.previewUrl;
            img.onload = () => {
              activeImageElementRef.current = img;
            };
          } else {
            activeImageElementRef.current = null;
            setProcessedResult(null);
          }
        }
        return filtered;
      });
    },
    [selectedImageId]
  );

  // Reset workspace
  const handleReset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    if (processedResult?.dataUrl) {
      URL.revokeObjectURL(processedResult.dataUrl);
    }
    setImages([]);
    setSelectedImageId(null);
    activeImageElementRef.current = null;
    setProcessedResult(null);
  }, [images, processedResult]);

  // Update Settings
  const handleUpdateSettings = useCallback((newPartial: Partial<ProcessingSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newPartial,
    }));
  }, []);

  // Presets: Apply a preset
  const handleApplyPreset = useCallback(
    (preset: ImagePreset) => {
      const origW = selectedImage?.width || 800;
      const origH = selectedImage?.height || 600;
      const newSettings = applyPresetToSettings(preset, origW, origH);
      setSettings(newSettings);
      setActivePresetId(preset.id);
      setToastMessage(`Applied preset: ${preset.name}`);
    },
    [selectedImage]
  );

  // Presets: Toggle favorite
  const handleToggleFavoritePreset = useCallback((id: string) => {
    setPresets((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      );
      persistPresets(updated);
      return updated;
    });
  }, []);

  // Presets: Open modal to save or edit
  const handleOpenSavePresetModal = useCallback((presetToEditParam?: ImagePreset) => {
    setPresetToEdit(presetToEditParam || null);
    setIsSavePresetModalOpen(true);
  }, []);

  // Presets: Save (create or update)
  const handleSavePreset = useCallback(
    (
      name: string,
      category: PresetCategory,
      isFavorite: boolean,
      description?: string,
      overwriteId?: string
    ) => {
      if (overwriteId) {
        setPresets((prev) => {
          const updated = prev.map((p) => {
            if (p.id === overwriteId) {
              return {
                ...p,
                name,
                category,
                isFavorite,
                description,
                updatedAt: Date.now(),
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
            return p;
          });
          persistPresets(updated);
          return updated;
        });
        setActivePresetId(overwriteId);
        setToastMessage(`Updated preset: ${name}`);
      } else {
        const newPreset = createPresetFromSettings(
          name,
          category,
          settings,
          isFavorite,
          description
        );
        setPresets((prev) => {
          const updated = [newPreset, ...prev];
          persistPresets(updated);
          return updated;
        });
        setActivePresetId(newPreset.id);
        setToastMessage(`Saved new preset: ${name}`);
      }
    },
    [settings]
  );

  // Presets: Delete
  const handleDeletePreset = useCallback(
    (id: string) => {
      setPresets((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        persistPresets(updated);
        return updated;
      });
      if (activePresetId === id) {
        setActivePresetId(null);
      }
      setToastMessage('Preset deleted');
    },
    [activePresetId]
  );

  // Presets: Overwrite with current workspace settings
  const handleOverwritePreset = useCallback(
    (preset: ImagePreset) => {
      setPresets((prev) => {
        const updated = prev.map((p) => {
          if (p.id === preset.id) {
            return {
              ...p,
              updatedAt: Date.now(),
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
          return p;
        });
        persistPresets(updated);
        return updated;
      });
      setActivePresetId(preset.id);
      setToastMessage(`Updated "${preset.name}" with current settings`);
    },
    [settings]
  );

  // Presets: Import from JSON
  const handleImportPresets = useCallback((imported: ImagePreset[]) => {
    setPresets((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const filteredNew = imported.filter((p) => !existingIds.has(p.id));
      const merged = [...filteredNew, ...prev];
      persistPresets(merged);
      return merged;
    });
    setToastMessage(`Imported ${imported.length} presets successfully`);
  }, []);

  // Presets: Reset to defaults
  const handleResetDefaultPresets = useCallback(() => {
    localStorage.removeItem('image_scaler_custom_presets_v1');
    const defaults = getSavedPresets();
    setPresets(defaults);
    setActivePresetId(null);
    setToastMessage('Reset to default preset library');
  }, []);

  // Toast Auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = window.setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => window.clearTimeout(timer);
    }
  }, [toastMessage]);

  // Run processing whenever selected image or settings change (debounced)
  useEffect(() => {
    if (!selectedImage) {
      setProcessedResult(null);
      return;
    }

    if (!activeImageElementRef.current) {
      const img = new Image();
      img.src = selectedImage.previewUrl;
      img.onload = () => {
        activeImageElementRef.current = img;
        triggerProcessing();
      };
      return;
    }

    triggerProcessing();

    function triggerProcessing() {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }

      setIsProcessing(true);

      debounceTimerRef.current = window.setTimeout(async () => {
        if (!activeImageElementRef.current) return;
        try {
          const result = await processImage(activeImageElementRef.current, settings);
          setProcessedResult((prev) => {
            if (prev?.dataUrl) {
              URL.revokeObjectURL(prev.dataUrl);
            }
            return result;
          });
        } catch (err) {
          console.error('Processing error:', err);
        } finally {
          setIsProcessing(false);
        }
      }, 100);
    }

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [selectedImage, settings]);

  // Global paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        handleFilesAdded(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFilesAdded]);

  // Download Single Processed File
  const handleDownload = useCallback(() => {
    if (!processedResult || !selectedImage) return;

    const baseName = selectedImage.name.replace(/\.[^/.]+$/, '');
    const ext = getFormatExtension(processedResult.format);
    const fileName = `${baseName}_scaled_${processedResult.width}x${processedResult.height}.${ext}`;

    const link = document.createElement('a');
    link.href = processedResult.dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedResult, selectedImage]);

  // Copy Processed Image to Clipboard as PNG
  const handleCopyToClipboard = useCallback(async (): Promise<boolean> => {
    if (!activeImageElementRef.current) return false;
    try {
      // Create PNG blob
      const pngSettings: ProcessingSettings = {
        ...settings,
        format: 'image/png',
      };
      const result = await processImage(activeImageElementRef.current, pngSettings);
      const clipboardItem = new ClipboardItem({
        'image/png': result.blob,
      });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
      return false;
    }
  }, [settings]);

  // Batch Export All Images as ZIP
  const handleDownloadBatchZip = useCallback(async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const zip = new JSZip();

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const img = new Image();
        img.src = item.previewUrl;
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });

        // Compute scaled dimensions for this item using current scaleFactor
        const itemW = Math.round(item.width * settings.scaleFactor);
        const itemH = settings.maintainAspectRatio
          ? Math.round(itemW / (item.width / item.height))
          : Math.round(item.height * settings.scaleFactor);

        const itemSettings: ProcessingSettings = {
          ...settings,
          targetWidth: itemW,
          targetHeight: itemH,
        };

        const result = await processImage(img, itemSettings);
        const baseName = item.name.replace(/\.[^/.]+$/, '');
        const ext = getFormatExtension(result.format);
        const fileName = `${baseName}_scaled_${result.width}x${result.height}.${ext}`;

        zip.file(fileName, result.blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `processed_images_batch_${images.length}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error('Batch export failed:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [images, settings]);

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-200 dark:selection:bg-amber-900/60 transition-colors">
      {/* Top Header */}
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasImage={images.length > 0}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        favoritesCount={presets.filter((p) => p.isFavorite).length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Upload Zone & Thumbnail strip */}
        <UploadZone
          images={images}
          selectedImageId={selectedImageId}
          onSelectImage={handleSelectImage}
          onRemoveImage={handleRemoveImage}
          onFilesAdded={handleFilesAdded}
          onLoadSample={handleLoadSample}
        />

        {/* If an image is selected, show the split preview & control panel */}
        {selectedImage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 cols: Interactive Preview & Split Slider */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <ImagePreviewComparison
                originalImage={selectedImage}
                processedResult={processedResult}
                isProcessing={isProcessing}
              />
            </div>

            {/* Right 5 cols: Controls Panel */}
            <div className="lg:col-span-5">
              <ControlsPanel
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                originalImage={selectedImage}
                processedResult={processedResult}
                isProcessing={isProcessing}
                onDownload={handleDownload}
                onCopyToClipboard={handleCopyToClipboard}
                allImagesCount={images.length}
                onDownloadBatchZip={handleDownloadBatchZip}
                defaultFormat={defaultFormat}
                onSetDefaultFormat={handleSetDefaultFormat}
                // Presets & Favorites
                presets={presets}
                activePresetId={activePresetId}
                onApplyPreset={handleApplyPreset}
                onToggleFavoritePreset={handleToggleFavoritePreset}
                onOpenSavePresetModal={handleOpenSavePresetModal}
                onDeletePreset={handleDeletePreset}
                onOverwritePresetWithCurrent={handleOverwritePreset}
                onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Shortcuts & Help Modal */}
      <ShortcutsModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Presets Management Hub Modal */}
      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        presets={presets}
        activePresetId={activePresetId}
        onApplyPreset={(preset) => {
          handleApplyPreset(preset);
          setIsPresetsModalOpen(false);
        }}
        onToggleFavorite={handleToggleFavoritePreset}
        onOpenSaveModal={handleOpenSavePresetModal}
        onDeletePreset={handleDeletePreset}
        onOverwritePreset={handleOverwritePreset}
        onImportPresets={handleImportPresets}
        onResetDefaults={handleResetDefaultPresets}
      />

      {/* Save / Edit Preset Modal */}
      <SavePresetModal
        isOpen={isSavePresetModalOpen}
        onClose={() => {
          setIsSavePresetModalOpen(false);
          setPresetToEdit(null);
        }}
        onSave={handleSavePreset}
        currentSettings={settings}
        presetToEdit={presetToEdit}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white shadow-xl border border-stone-800 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
