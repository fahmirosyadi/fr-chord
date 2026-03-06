import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private STORAGE_KEY = 'app-theme';
  currentTheme: typeof this.THEMES[number] = 'rose';
  public THEMES = [
    'blue',
    'rose',
    'green',
    'cyan',
    'black'
  ] as const;

  // Default themes
  // private themes = {
  //   'dark-rose': {
  //     '--primary-color': '#f43f5e',
  //     '--on-primary-color': '#ffffff',
  //     '--accent-color': '#ec4899',
  //     '--on-accent-color': '#ffffff',
  //     '--background-color': '#121212',
  //     '--surface-color': '#1e1e1e',
  //     '--on-surface-color': '#ffffff',
  //   },
  //   'dark-blue': {
  //     '--primary-color': '#3b82f6',
  //     '--on-primary-color': '#ffffff',
  //     '--accent-color': '#2563eb',
  //     '--on-accent-color': '#ffffff',
  //     '--background-color': '#121212',
  //     '--surface-color': '#1e1e1e',
  //     '--on-surface-color': '#ffffff',
  //   }
  // };

  // Apply a theme by updating CSS variables
  setTheme(theme: typeof this.THEMES[number]) {

    const body = document.body;

    // remove all themes
    this.THEMES.forEach(t => body.classList.remove(`${t}-theme`));

    // apply selected
    body.classList.add(`${theme}-theme`);

    // save to localStorage
    localStorage.setItem(this.STORAGE_KEY, theme);

    this.currentTheme = theme;
  }

  loadTheme() {

    const savedTheme =
      (localStorage.getItem(this.STORAGE_KEY) as typeof this.THEMES[number]) || 'rose';

    this.setTheme(savedTheme);
  }

}
