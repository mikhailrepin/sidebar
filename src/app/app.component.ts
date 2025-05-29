import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService, Theme } from './services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  template: `
    <main class="flex flex-col h-screen gap-1">
      <header
        class="bg-elevation-level-3 h-14 flex items-center justify-between px-3 border-b border-elevation-border"
      >
        <h1 class="text-text-default text-2xl font-semibold">
          🎛️ _{{ title }}
        </h1>
        <div class="relative">
          <button
            (click)="toggleThemeDropdown()"
            class="px-2 flex items-center mt-1 py-1 rounded-md border border-elevation-border text-text-default hover:bg-elevation-level-2 focus:outline-none"
          >
            {{ currentThemeDisplayName }}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 inline-block ml-1 transition-transform duration-200"
              [ngClass]="{ 'rotate-180': isThemeDropdownOpen }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <div
            *ngIf="isThemeDropdownOpen"
            class="absolute right-0 mt-1 shadow-elevation-shadow w-48 bg-elevation-level-1 rounded-md shadow-lg p-1 z-50 border border-elevation-border"
          >
            <a
              *ngFor="let theme of availableThemes"
              (click)="selectTheme(theme.name)"
              class="block px-4 py-2 text-sm text-text-default hover:bg-secondary-default cursor-pointer"
              [class.bg-primary-shaded-100.text-primary-default]="
                theme.name === currentTheme
              "
            >
              {{ theme.displayText }}
            </a>
          </div>
        </div>
      </header>
      <div class="flex-1 overflow-hidden">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
  styles: `
  `,
})
export class AppComponent implements OnInit {
  title = 'FormGen 1.0';
  isThemeDropdownOpen = false;
  availableThemes: { name: Theme; displayText: string }[] = [];
  currentTheme: Theme = 'light';
  currentThemeDisplayName: string = 'Светлая';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.availableThemes = this.themeService.getAvailableThemes();
    this.themeService.currentTheme$.subscribe((theme) => {
      this.currentTheme = theme;
      this.currentThemeDisplayName =
        this.availableThemes.find((t) => t.name === theme)?.displayText ||
        theme;
    });
  }

  toggleThemeDropdown(): void {
    this.isThemeDropdownOpen = !this.isThemeDropdownOpen;
  }

  selectTheme(themeName: Theme): void {
    this.themeService.setTheme(themeName);
    this.isThemeDropdownOpen = false;
  }
}
