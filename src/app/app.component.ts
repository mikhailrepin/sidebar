import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService, Theme } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../features/ui/atoms/icon/icon.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, IconComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <main class="flex flex-col h-screen gap-1">
      <header
        class="bg-elevation-level-3 h-14 flex items-center justify-between border-b border-elevation-border"
      >
        <h1 class="text-text-default text-2xl font-semibold px-4">
          🎛️ _{{ title }}
        </h1>
        <div class="relative h-full flex items-center">
          <button
            (click)="toggleThemeDropdown()"
            class="focus:outline-none flex items-center justify-center px-5 h-full hover:bg-primary-shaded-200 hover:cursor-pointer"
            [ngClass]="{
              'bg-primary-shaded-200 text-primary-default': isThemeDropdownOpen
            }"
          >
            <app-icon [name]="currentThemeIcon" />
            <!-- {{ currentThemeDisplayName }} -->
          </button>
          <div *ngIf="isThemeDropdownOpen" class="theme-dropdown-menu">
            <a
              *ngFor="let theme of availableThemes"
              (click)="selectTheme(theme.name)"
              class="theme-dropdown-item"
              [class.item-active]="theme.name === currentTheme"
            >
              <app-icon [name]="theme.icon" />
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
    @import '../styles.css';
    .theme-dropdown-menu {
      @apply absolute top-[calc(100%+4px)] right-1 shadow-elevation-shadow w-48 bg-elevation-level-1 rounded-md shadow-lg flex flex-col gap-2 p-2 z-50 border border-elevation-border;
    }
    .theme-dropdown-item {
      @apply flex items-center gap-2 px-2 h-8 rounded-sm text-sm;
      &:hover {
        @apply bg-secondary-dark cursor-pointer;
      }
    }
    .item-active {
      @apply bg-primary-shaded-200 text-primary-default;
    }
  `,
})
export class AppComponent implements OnInit {
  title = 'FormGen 1.1';
  isThemeDropdownOpen = false;
  availableThemes: { name: Theme; displayText: string; icon: string }[] = [];
  currentTheme: Theme = 'light';
  currentThemeDisplayName: string = 'Светлая';
  currentThemeIcon: string = '';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.availableThemes = this.themeService.getAvailableThemes();
    this.themeService.currentTheme$.subscribe((theme) => {
      this.currentTheme = theme;
      const themeDetails = this.availableThemes.find((t) => t.name === theme);
      this.currentThemeDisplayName = themeDetails?.displayText || theme;
      this.currentThemeIcon = themeDetails?.icon || '';
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
