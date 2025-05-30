import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'midnight' | 'dark-gold';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private currentThemeSubject = new BehaviorSubject<Theme>(
    this.getInitialTheme()
  );
  currentTheme$ = this.currentThemeSubject.asObservable();

  themes: { name: Theme; displayText: string; icon: string }[] = [
    { name: 'light', displayText: 'Светлая', icon: 'theme-light' },
    { name: 'dark', displayText: 'Тёмная', icon: 'theme-dark' },
    { name: 'midnight', displayText: 'Полночь', icon: 'theme-dark' },
    {
      name: 'dark-gold',
      displayText: 'Тёмное золото',
      icon: 'theme-dark',
    },
  ];

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadTheme();
  }

  private getInitialTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
  }

  private loadTheme(): void {
    const theme = this.getInitialTheme();
    this.setTheme(theme, false); // Не сохраняем повторно при инициализации
  }

  setTheme(theme: Theme, saveToLocalStorage: boolean = true): void {
    const oldTheme = this.currentThemeSubject.value;
    if (oldTheme) {
      this.renderer.removeClass(document.documentElement, 'theme-' + oldTheme);
      this.renderer.removeAttribute(document.documentElement, 'data-theme');
    }

    this.renderer.setAttribute(document.documentElement, 'data-theme', theme);
    // Если вы используете CSS переменные, которые НЕ через data-theme, а через классы, то:
    // this.renderer.addClass(document.documentElement, 'theme-' + theme);

    if (saveToLocalStorage && typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    this.currentThemeSubject.next(theme);
    console.log('Тема изменена на: ' + theme);
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  getAvailableThemes(): { name: Theme; displayText: string; icon: string }[] {
    return this.themes;
  }
}
