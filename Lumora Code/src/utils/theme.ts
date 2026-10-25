export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'image_scaler_theme';

/**
 * Retrieves the saved theme from localStorage, defaulting to 'light'
 */
export function getSavedTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (err) {
    console.warn('Unable to read theme from localStorage:', err);
  }
  return 'light';
}

/**
 * Applies the theme to document.documentElement and saves it to localStorage
 */
export function applyTheme(theme: AppTheme): void {
  try {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.warn('Unable to persist theme to localStorage:', err);
  }
}
