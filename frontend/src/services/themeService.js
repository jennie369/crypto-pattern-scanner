/**
 * Theme Service
 * Manages dark/light theme and color customization
 */

class ThemeService {
  constructor() {
    this.storageKey = 'gem-theme';
    this.theme = this.loadTheme();
    this.applyTheme(this.theme);
  }

  /**
   * Load theme from localStorage
   */
  loadTheme() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved || 'dark'; // Default: dark
    } catch {
      return 'dark';
    }
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.theme;
  }

  /**
   * Toggle between dark and light
   */
  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.theme);
    this.saveTheme();
    return this.theme;
  }

  /**
   * Set specific theme
   */
  setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    this.theme = theme;
    this.applyTheme(theme);
    this.saveTheme();
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'light') {
      // Light theme colors
      root.style.setProperty('--bg-primary', '#f5f7fa');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--bg-tertiary', '#e8ecf2');
      root.style.setProperty('--text-primary', '#1a1a2e');
      root.style.setProperty('--text-secondary', '#4a5568');
      root.style.setProperty('--text-muted', '#718096');
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.7)');
      root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)');
    } else {
      // Dark theme colors (default)
      root.style.setProperty('--bg-primary', '#0a0e27');
      root.style.setProperty('--bg-secondary', '#1a1a2e');
      root.style.setProperty('--bg-tertiary', '#16213e');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--text-muted', 'rgba(255, 255, 255, 0.6)');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.12)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.4)');
      root.style.setProperty('--glass-bg', 'rgba(30, 42, 94, 0.5)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.15)');
    }

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', theme);
  }

  /**
   * Save theme to localStorage
   */
  saveTheme() {
    try {
      localStorage.setItem(this.storageKey, this.theme);
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }
  }
}

// Export singleton instance
export const themeService = new ThemeService();
