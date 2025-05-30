import {
  Injectable,
  Renderer2,
  RendererFactory2,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'system' | 'light' | 'dark' | 'midnight' | 'dark-gold';

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private renderer: Renderer2;
  // currentThemeSubject stores the *actually applied* theme
  private currentThemeSubject = new BehaviorSubject<Theme>('light'); // Initial placeholder, set in _initializeTheme
  public currentTheme$ = this.currentThemeSubject.asObservable();

  themes: { name: Theme; displayText: string; icon: string }[] = [
    { name: 'system', displayText: 'Системная', icon: 'theme-system' },
    { name: 'light', displayText: 'Светлая', icon: 'theme-light' },
    { name: 'dark', displayText: 'Тёмная', icon: 'theme-dark' },
    { name: 'midnight', displayText: 'Полночь', icon: 'theme-dark' },
    {
      name: 'dark-gold',
      displayText: 'Тёмное золото',
      icon: 'theme-dark',
    },
  ];

  private mediaQueryList: MediaQueryList | undefined;
  private systemThemeChangeHandler = (event: MediaQueryListEvent) => {
    this.handleSystemThemeChange(event);
  };

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this._initializeTheme();

    if (
      isPlatformBrowser(this.platformId) &&
      typeof window.matchMedia === 'function'
    ) {
      this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryList.addEventListener(
        'change',
        this.systemThemeChangeHandler
      );
    }
  }

  ngOnDestroy(): void {
    if (this.mediaQueryList && isPlatformBrowser(this.platformId)) {
      this.mediaQueryList.removeEventListener(
        'change',
        this.systemThemeChangeHandler
      );
    }
  }

  private _initializeTheme(): void {
    const userPreference = this.getUserPreferenceFromStorage();
    let themeToApply: Theme;

    if (userPreference === 'system') {
      if (
        isPlatformBrowser(this.platformId) &&
        typeof window.matchMedia === 'function'
      ) {
        themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        themeToApply = 'light'; // Fallback for SSR or if matchMedia not available
      }
    } else {
      themeToApply = userPreference;
    }

    // Ensure any pre-existing data-theme (e.g., from SSR or static HTML) is cleared before setting the new one.
    const existingThemeOnDoc =
      document.documentElement.getAttribute('data-theme');
    if (existingThemeOnDoc) {
      this.renderer.removeAttribute(document.documentElement, 'data-theme');
    }

    this.renderer.setAttribute(
      document.documentElement,
      'data-theme',
      themeToApply
    );
    this.currentThemeSubject.next(themeToApply);
    console.log(
      'ThemeService initialized. User preference:',
      userPreference,
      'Applied theme:',
      themeToApply
    );
  }

  private getUserPreferenceFromStorage(): Theme {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light'; // Default to 'light'
    }
    return 'light'; // Fallback
  }

  setTheme(userSelectedTheme: Theme, saveToLocalStorage: boolean = true): void {
    if (saveToLocalStorage && typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', userSelectedTheme);
    }

    let themeToActuallyApply: Theme;
    if (userSelectedTheme === 'system') {
      if (
        isPlatformBrowser(this.platformId) &&
        typeof window.matchMedia === 'function'
      ) {
        themeToActuallyApply = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';
      } else {
        themeToActuallyApply = 'light'; // Fallback
      }
    } else {
      themeToActuallyApply = userSelectedTheme;
    }

    const previouslyAppliedTheme = this.currentThemeSubject.value;

    if (previouslyAppliedTheme !== themeToActuallyApply) {
      if (previouslyAppliedTheme) {
        // Remove the old theme attribute if it was set by this service or matches the subject
        this.renderer.removeAttribute(document.documentElement, 'data-theme');
      }
      this.renderer.setAttribute(
        document.documentElement,
        'data-theme',
        themeToActuallyApply
      );
      this.currentThemeSubject.next(themeToActuallyApply);
    } else {
      // If the theme to apply is the same as the current one, ensure DOM matches the state.
      // This handles cases where DOM might have been manipulated externally or during initialization.
      const currentDOMTheme =
        document.documentElement.getAttribute('data-theme');
      if (currentDOMTheme !== themeToActuallyApply) {
        if (currentDOMTheme) {
          this.renderer.removeAttribute(document.documentElement, 'data-theme');
        }
        this.renderer.setAttribute(
          document.documentElement,
          'data-theme',
          themeToActuallyApply
        );
      }
    }
    console.log(
      'User selected:',
      userSelectedTheme,
      'Theme applied:',
      themeToActuallyApply
    );
  }

  private handleSystemThemeChange(event: MediaQueryListEvent): void {
    const storedPreference = this.getUserPreferenceFromStorage();
    if (storedPreference === 'system') {
      console.log(
        'System theme changed via media query, re-applying. New system isDark:',
        event.matches
      );
      // Calling setTheme with 'system' will make it re-evaluate and apply 'light' or 'dark'
      // Pass 'false' for saveToLocalStorage to not overwrite 'system' preference in localStorage.
      this.setTheme('system', false);
    }
  }

  // Returns the *currently applied* theme
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  // Returns the user's *stored preference* (e.g., 'system', 'light')
  public getInitialUserPreference(): Theme {
    return this.getUserPreferenceFromStorage();
  }

  getAvailableThemes(): { name: Theme; displayText: string; icon: string }[] {
    return this.themes;
  }
}
