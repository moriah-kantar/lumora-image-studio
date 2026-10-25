import React from 'react';
import { RotateCcw } from 'lucide-react';

interface AdjustmentSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  displayPlusSign?: boolean;
  hint?: string;
  gradientTrack?: string;
  onChange: (value: number) => void;
  onReset?: () => void;
}

export const AdjustmentSlider: React.FC<AdjustmentSliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  defaultValue = 0,
  unit = '',
  displayPlusSign = true,
  hint,
  gradientTrack,
  onChange,
  onReset,
}) => {
  const isChanged = value !== defaultValue;

  const formatValue = (val: number) => {
    if (val > 0 && displayPlusSign) return `+${val}${unit}`;
    return `${val}${unit}`;
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange(defaultValue);
    }
  };

  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5 cursor-pointer select-none"
        >
          <span>{label}</span>
          {hint && (
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">
              ({hint})
            </span>
          )}
        </label>

        <div className="flex items-center gap-1.5">
          <span
            onDoubleClick={handleReset}
            title="Double click to reset to default"
            className={`font-mono text-[11px] px-1.5 py-0.5 rounded transition-colors select-none cursor-pointer ${
              isChanged
                ? 'font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/40'
                : 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
            }`}
          >
            {formatValue(value)}
          </span>

          {isChanged && (
            <button
              type="button"
              id={`${id}-reset-btn`}
              onClick={handleReset}
              title={`Reset ${label} to ${formatValue(defaultValue)}`}
              className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex items-center">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-stone-200 dark:bg-stone-750 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          style={gradientTrack ? { background: gradientTrack } : undefined}
        />
      </div>
    </div>
  );
};
