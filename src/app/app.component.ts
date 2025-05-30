import {
  Component,
  OnInit,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
  HostListener,
  OnDestroy,
} from '@angular/core';
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
        <div #themeDropdownContainer class="relative h-full flex items-center">
          <button
            #themeButton
            (click)="toggleThemeDropdown()"
            class="focus:outline-none flex items-center justify-center px-5 h-full hover:bg-primary-shaded-200 hover:cursor-pointer"
            [ngClass]="{
              'bg-primary-shaded-200 text-primary-default': isThemeDropdownOpen
            }"
          >
            <app-icon [name]="selectedThemeIcon" />
          </button>
          <div
            #themeMenu
            *ngIf="isThemeDropdownOpen"
            class="theme-dropdown-menu"
          >
            <a
              *ngFor="let theme of availableThemes"
              (click)="selectTheme(theme.name)"
              class="theme-dropdown-item"
              [class.item-active]="theme.name === userSelectedThemePreference"
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
      @apply absolute top-[calc(100%+4px)] right-1 shadow-elevation-shadow w-48 bg-elevation-level-1 rounded-md shadow-xl flex flex-col gap-2 p-2 z-50 border border-elevation-border;
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
export class AppComponent implements OnInit, OnDestroy {
  title = 'FormGen 1.1';
  isThemeDropdownOpen = false;
  availableThemes: { name: Theme; displayText: string; icon: string }[] = [];

  // Tracks the theme the user explicitly selected from the dropdown (e.g., 'system', 'light')
  userSelectedThemePreference: Theme = 'light';
  // Tracks the icon to display on the button, based on userSelectedThemePreference or the actual theme if 'system' is chosen
  selectedThemeIcon: string = '';

  @ViewChild('themeButton') themeButton!: ElementRef;
  @ViewChild('themeMenu') themeMenu!: ElementRef;
  @ViewChild('themeDropdownContainer') themeDropdownContainer!: ElementRef;

  constructor(
    private themeService: ThemeService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.availableThemes = this.themeService.getAvailableThemes();
    this.userSelectedThemePreference =
      this.themeService.getInitialUserPreference();
    this.updateButtonIcon(this.userSelectedThemePreference);

    this.themeService.currentTheme$.subscribe((actuallyAppliedTheme) => {
      console.log(
        'AppComponent: Applied theme changed to:',
        actuallyAppliedTheme
      );
      // selectedThemeIcon is now driven by userSelectedThemePreference directly via updateButtonIcon,
      // so no need to call updateButtonIcon here again based on actuallyAppliedTheme for 'system' preference.
    });
  }

  ngOnDestroy(): void {
    // No explicit unsubscription needed for document click listener if managed by HostListener
    // and component destruction, or if we add/remove it manually.
    // For HostListener, Angular handles cleanup.
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isThemeDropdownOpen) {
      // Check if the click was outside the dropdown container
      const clickedInsideContainer =
        this.themeDropdownContainer.nativeElement.contains(
          event.target as Node
        );
      if (!clickedInsideContainer) {
        this.isThemeDropdownOpen = false;
        console.log('Clicked outside, closing dropdown.');
      }
    }
  }

  private updateButtonIcon(themePreference: Theme): void {
    const themeDetails = this.availableThemes.find(
      (t) => t.name === themePreference
    );

    if (themeDetails) {
      this.selectedThemeIcon = themeDetails.icon;
    } else {
      // Fallback, though themePreference should always be a valid theme name
      this.selectedThemeIcon = 'theme-system'; // Default to system icon or handle error
      console.warn(
        `Theme details not found for preference: ${themePreference}, defaulting icon.`
      );
    }
    console.log(
      'AppComponent: Button icon updated to:',
      this.selectedThemeIcon,
      'based on preference:',
      themePreference
    );
  }

  toggleThemeDropdown(): void {
    this.isThemeDropdownOpen = !this.isThemeDropdownOpen;
    console.log('Toggled dropdown, open state:', this.isThemeDropdownOpen);
  }

  selectTheme(themeName: Theme): void {
    this.userSelectedThemePreference = themeName;
    this.themeService.setTheme(themeName);
    this.updateButtonIcon(themeName);
    this.isThemeDropdownOpen = false;
  }
}
