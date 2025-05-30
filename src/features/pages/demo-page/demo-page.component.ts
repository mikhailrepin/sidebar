import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarPanelComponent } from '../../prop-sidebar/components/sidebar-panel/sidebar-panel.component';
import { PropSidebarService } from '../../prop-sidebar/services/prop-sidebar.service';
import { SidebarPanelConfig } from '../../prop-sidebar/types/prop-sidebar.types';
import { ButtonComponent } from '../../ui/atoms/button/button.component';
// import * as Prism from 'prismjs'; // No longer needed
// import 'prismjs/components/prism-json'; // No longer needed

// CodeMirror imports
import { EditorState, Transaction } from '@codemirror/state';
import { EditorView, keymap, placeholder, ViewUpdate } from '@codemirror/view';
import {
  defaultKeymap,
  history,
  indentWithTab,
  historyKeymap,
} from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import { ThemeService, Theme } from '../../../app/services/theme.service';

// Minimal theme to ONLY override backgrounds after oneDark has been applied.
const overrideDarkBackgroundTheme = EditorView.theme(
  {
    '&': {
      // Root editor element .cm-editor
      backgroundColor: 'var(--color-elevation-level-1) !important',
    },
    '.cm-gutters': {
      // Gutter area
      backgroundColor: 'var(--color-elevation-level-1) !important',
      // oneDark's styles for gutter text color, border, etc., should persist
      // as this theme only overrides the background.
    },
  },
  { dark: true }
); // Mark as dark, as var(--color-elevation-level-0) is expected to be dark.

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, SidebarPanelComponent, FormsModule, ButtonComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="flex h-full gap-1">
      <!-- Main Content -->
      <section
        class="flex-1 flex flex-col gap-6 bg-elevation-level-3 border-t border-r border-elevation-border p-6 h-full max-h-[calc(100vh-40px)] overflow-hidden"
      >
        <div class="flex flex-col">
          <h1 class="text-xl font-semibold text-text-default">
            Редактор панели свойств
          </h1>
          <p class="text-text-shaded pt-2">
            Состав панели генерируется динамически из JSON конфигурации. Ниже вы
            можете редактировать JSON и применять изменения.
          </p>
        </div>

        <div
          #codemirrorHost
          class="w-full h-full border border-elevation-border rounded-md overflow-hidden"
        ></div>

        <div class="justify-end flex gap-4">
          <app-button
            variant="secondary"
            buttonStyle="outline"
            [disabled]="isResetDisabled"
            size="big"
            label="Сбросить конфигурацию"
            (click)="loadExampleIntoTextareaAndApply()"
          />
          <app-button
            variant="primary"
            buttonStyle="fill"
            [disabled]="isApplyDisabled"
            size="big"
            label="Применить конфигурацию"
            (click)="applyJsonFromTextarea()"
          />
        </div>
      </section>

      <!-- Sidebar -->
      <div
        *ngIf="config"
        class="border-l border-t border-elevation-border h-full"
      >
        <app-sidebar-panel
          [config]="config"
          [width]="sidebarWidth"
          (propertyChange)="onPropertyChange($event)"
          (widthChange)="onSidebarWidthChange($event)"
          (close)="closePanel()"
        ></app-sidebar-panel>
      </div>
    </div>
  `,
  styles: [
    `
      /* Ensure CodeMirror takes full height of its container */
      .cm-editor {
        height: 100%;
        font-size: 0.875rem; /* 14px */
      }
      .cm-scroller {
        overflow: auto;
      }
      /* Custom selection color for better visibility on dark theme if needed */
      .cm-editor .cm-selectionBackground,
      .cm-editor.cm-focused .cm-selectionBackground {
        background-color: #0052cc !important; /* A distinct blue */
      }
      .cm-editor .cm-cursor {
        border-left-color: var(
          --color-text-white
        ) !important; /* Ensure cursor is visible on dark theme */
      }
      .resize-handle-left {
        position: relative;
      }
      .resize-handle-left ::ng-deep .mwl-resizable-handle {
        position: absolute;
        width: 10px; /* Ширина области для захвата */
        height: 100%;
        left: -5px; /* Смещение для центрирования */
        top: 0;
        cursor: col-resize;
        z-index: 10; /* Чтобы было поверх других элементов */
      }
      .resize-handle-left.resize-active ::ng-deep .mwl-resizable-handle {
        /* Можно добавить стили для активного состояния, если нужно */
      }
      /* Подсветка границы при наведении */
      .resize-handle-left:hover ::ng-deep .mwl-resizable-handle {
        /* Simulate border color change by adding a pseudo-element or using box-shadow */
      }
      .resize-handle-left.resize-active {
        border-left: 2px solid var(--color-primary-default); /* indigo-500 */
      }

      /* Custom style for the left resize handle when hovered */
      .resize-handle-left:hover > .mwl-resizable-handle-left {
        background-color: oklch(
          from var(--color-primary-default) l c h / 0.5
        ); /* semi-transparent primary */
        transition: background-color 0.2s ease-in-out;
      }

      .resize-active {
        /* Add a visual cue during resize if desired, e.g., a more prominent border */
        /* For example, making the left border itself indigo during resize */
        /* This might require adjusting where the border is applied if using the handle */
      }

      /* Стили для ручки изменения размера и контейнера app-sidebar-panel */
      app-sidebar-panel {
        display: block;
        position: relative;
        height: 100%;
      }

      .resize-handle {
        position: absolute;
        left: -5px; /* Adjusted for 2px handle centered on border */
        top: 0;
        width: 10px; /* Interaction area */
        height: 100%;
        cursor: col-resize;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .resize-handle-visual {
        width: 0; /* Hidden by default */
        height: 100%;
        background-color: transparent; /* Hidden by default */
        transition: width 0.2s ease-in-out, background-color 0.2s ease-in-out;
      }

      /* При наведении на саму ручку */
      .resize-handle:hover .resize-handle-visual {
        width: 2px; /* Visible on hover */
        background-color: var(--color-primary-default); /* indigo-500 */
      }

      /* Во время активного изменения размера */
      app-sidebar-panel.is-resizing-cdk .resize-handle-visual {
        width: 2px;
        background-color: var(
          --color-primary-invert
        ); /* indigo-600 - slightly darker when resizing */
      }
    `,
  ],
})
export class DemoPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('codemirrorHost') codemirrorHost!: ElementRef<HTMLDivElement>;
  private cmView: EditorView | null = null;

  config: SidebarPanelConfig | null = null;
  jsonEditText: string = '';
  sidebarWidth: number = 384; // Default width (w-96)
  private readonly localStorageKey = 'sidebarConfigJson';
  private readonly sidebarWidthKey = 'sidebarWidth';

  // State for button disabling
  isResetDisabled: boolean = true;
  isApplyDisabled: boolean = true;
  private defaultConfigJson: string = '';

  constructor(
    private propSidebarService: PropSidebarService,
    private themeService: ThemeService // Inject ThemeService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const data = await import('../../prop-sidebar/data/example-panel.json');
      this.defaultConfigJson = JSON.stringify(data.default, null, 2);
    } catch (err) {
      console.error(
        'Не удалось загрузить конфигурацию по умолчанию для состояния кнопок:',
        err
      );
      this.defaultConfigJson = ''; // Убедимся, что значение определено
    }

    this.propSidebarService.config$.subscribe(
      (newServiceConfig: SidebarPanelConfig | null) => {
        this.config = newServiceConfig; // Сохраняем актуальную конфигурацию из сервиса
        let expectedEditorContent: string;

        if (this.config) {
          // Если в сервисе есть валидная конфигурация, она является ожидаемым содержимым редактора
          expectedEditorContent = JSON.stringify(this.config, null, 2);
        } else {
          // Если конфигурация в сервисе null (панель закрыта, конфиг сброшен),
          // редактор должен отображать конфигурацию по умолчанию.
          expectedEditorContent = this.defaultConfigJson; // <--- Ключевое изменение
        }

        // Обновляем текст в редакторе и сам редактор, только если он отличается от ожидаемого.
        if (this.jsonEditText !== expectedEditorContent) {
          this.jsonEditText = expectedEditorContent;
          this.updateCodeMirrorContent(this.jsonEditText);
        }

        // Состояние кнопок обновляем в любом случае, так как оно зависит и от редактора, и от сервиса.
        setTimeout(() => {
          this.updateButtonStates();
        });
      }
    );

    const savedJsonString = localStorage.getItem(this.localStorageKey);
    if (savedJsonString) {
      this.jsonEditText = savedJsonString; // Начальный текст для CodeMirror
      // applyJsonFromTextarea вызовет propSidebarService.loadFromJson(),
      // что вызовет подписку, которая обновит jsonEditText до канонической формы
      // и вызовет updateButtonStates().
      this.applyJsonFromTextarea(false);
    } else {
      // loadExampleIntoTextareaAndApply установит jsonEditText в defaultConfigJson,
      // затем вызовет applyJsonFromTextarea, который обновит состояние кнопок.
      await this.loadExampleIntoTextareaAndApply();
    }

    const savedWidth = localStorage.getItem(this.sidebarWidthKey);
    if (savedWidth) {
      this.sidebarWidth = parseInt(savedWidth, 10);
    }
  }

  ngAfterViewInit(): void {
    this.initCodeMirror(this.jsonEditText);
    // Первоначальное состояние кнопок после инициализации CodeMirror с начальным текстом
    setTimeout(() => this.updateButtonStates());

    // Subscribe to theme changes to re-initialize CodeMirror with the correct theme
    this.themeService.currentTheme$.subscribe((theme) => {
      if (this.cmView) {
        this.cmView.destroy();
        this.cmView = null;
      }
      this.initCodeMirror(this.jsonEditText);
    });
  }

  ngOnDestroy(): void {
    this.cmView?.destroy();
  }

  private initCodeMirror(initialContent: string): void {
    if (this.codemirrorHost && !this.cmView) {
      const currentAppTheme = this.themeService.getCurrentTheme();
      const editorExtensions: any[] = [
        // Ensure 'any[]' or proper Extension type
        basicSetup,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          ...lintKeymap,
          ...closeBracketsKeymap,
          indentWithTab,
        ]),
        json(),
        oneDark, // ALWAYS apply the full oneDark theme first.
        // This handles all default oneDark styling including syntax highlighting.
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightSelectionMatches(),
        placeholder('Вставьте JSON конфигурацию сюда...'),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            this.jsonEditText = update.state.doc.toString();
            setTimeout(() => this.updateButtonStates());
          }
        }),
      ];

      // If the application's current theme is NOT 'light',
      // add our minimal background override theme.
      // This will be applied AFTER oneDark, overriding only its background.
      if (currentAppTheme !== 'light') {
        editorExtensions.push(overrideDarkBackgroundTheme);
      }
      // No explicit syntaxHighlighting(oneDarkHighlightStyle) is needed here,
      // as the full `oneDark` extension already provides its syntax highlighting.

      const state = EditorState.create({
        doc: initialContent,
        extensions: editorExtensions,
      });

      this.cmView = new EditorView({
        state,
        parent: this.codemirrorHost.nativeElement,
      });
    }
  }

  private updateCodeMirrorContent(content: string): void {
    if (this.cmView && this.cmView.state.doc.toString() !== content) {
      this.cmView.dispatch({
        changes: { from: 0, to: this.cmView.state.doc.length, insert: content },
      });
    }
  }

  // onJsonEdit is no longer needed as CodeMirror handles its internal state and updates jsonEditText via listener
  // updateFormattedJsonForDisplay is no longer needed
  // escapeHtml is no longer needed
  // highlightCode is no longer needed

  async loadExampleIntoTextareaAndApply(): Promise<void> {
    // defaultConfigJson уже должен быть загружен в ngOnInit
    if (this.defaultConfigJson === '') {
      // Попытка загрузить снова, если в ngOnInit не удалось, или обработать ошибку
      try {
        const data = await import('../../prop-sidebar/data/example-panel.json');
        this.defaultConfigJson = JSON.stringify(data.default, null, 2);
      } catch (err: any) {
        console.error(
          'Ошибка загрузки примера конфигурации (запасной вариант):',
          err
        );
        this.jsonEditText = JSON.stringify(
          {
            error: 'Не удалось загрузить пример конфигурации',
            details: err.message,
          },
          null,
          2
        );
        this.updateCodeMirrorContent(this.jsonEditText);
        this.propSidebarService.loadFromJson(null as any); // Очищаем конфигурацию в сервисе
        // updateButtonStates будет вызван подпиской на сервис или явно
        this.updateButtonStates();
        return;
      }
    }

    this.jsonEditText = this.defaultConfigJson;
    this.updateCodeMirrorContent(this.jsonEditText);
    this.applyJsonFromTextarea(true); // Применить и сохранить в localStorage
  }

  applyJsonFromTextarea(saveToLocalStorage: boolean = true): void {
    let parsedConfigSuccessfully = false;
    try {
      const parsedConfig = JSON.parse(this.jsonEditText) as SidebarPanelConfig;
      this.propSidebarService.loadFromJson(parsedConfig);
      // Подписка на config$ вызовет:
      // 1. Обновление this.config
      // 2. Обновление this.jsonEditText до канонической формы (если отличается)
      // 3. Обновление CodeMirror (если jsonEditText изменился)
      // 4. Вызов this.updateButtonStates()
      parsedConfigSuccessfully = true; // Успешный парсинг и загрузка в сервис

      if (this.config) {
        // this.config уже обновлен подпиской
        // this.jsonEditText также мог быть обновлен до канонической формы подпиской
        if (saveToLocalStorage) {
          localStorage.setItem(this.localStorageKey, this.jsonEditText); // Используем текущий jsonEditText
          console.log(
            'Конфигурация успешно применена и сохранена в localStorage.'
          );
        } else {
          console.log('Конфигурация успешно применена.');
        }
      } else {
        // Конфигурация стала null после парсинга/загрузки (например, пустая JSON строка)
        // Это может произойти, если this.jsonEditText был, например, "null" или "{}" который сервис интерпретирует как отсутствие конфигурации.
        console.warn(
          'Применение конфигурации привело к null значению this.config в сервисе.'
        );
        if (saveToLocalStorage) {
          localStorage.setItem(this.localStorageKey, this.jsonEditText); // Сохраняем то, что привело к null
        }
        // Примечание: подписка уже очистила jsonEditText (если сервис вернул null -> пустую строку)
        // и вызвала updateButtonStates, если config стал null.
      }
    } catch (error: any) {
      console.error('Ошибка парсинга JSON из редактора:', error);
      alert(
        'Ошибка в JSON конфигурации: ' +
          error.message +
          '. Проверьте консоль для деталей.'
      );
      // При ошибке, пользователь должен исправить. "Применить" должна быть активна, если в редакторе есть текст.
      // Состояние "Сбросить" зависит от того, совпадает ли текущий текст с дефолтным.
      this.updateButtonStates(); // Явно обновляем кнопки после ошибки
    }
  }

  private updateButtonStates(): void {
    const defaultLoaded = this.defaultConfigJson !== '';
    let currentEditorJsonCanonical = '';

    try {
      // Приводим текущее содержимое редактора к канонической JSON строке
      // Это нужно, чтобы сравнение было нечувствительно к форматированию (пробелы, переносы строк)
      // и порядку свойств (если JSON.parse + JSON.stringify его нормализуют).
      const parsedEditorContent = JSON.parse(this.jsonEditText);
      currentEditorJsonCanonical = JSON.stringify(parsedEditorContent, null, 2);
    } catch (e) {
      // Если в редакторе невалидный JSON, то он точно не равен дефолтной или активной конфигурации.
      // Оставляем jsonEditText как есть для прямого сравнения, которое скорее всего вернет false.
      currentEditorJsonCanonical = this.jsonEditText;
    }

    // Кнопка "Сбросить" должна быть заблокирована, если канонический вид текущей конфигурации в редакторе
    // совпадает с конфигурацией по умолчанию.
    // defaultConfigJson уже создан с JSON.stringify(..., null, 2)
    this.isResetDisabled =
      defaultLoaded && currentEditorJsonCanonical === this.defaultConfigJson;

    // activeServiceConfigJson также создается с JSON.stringify(..., null, 2) из this.config
    const activeServiceConfigJson = this.config
      ? JSON.stringify(this.config, null, 2)
      : '';

    // Кнопка "Применить" должна быть заблокирована, если канонический вид текущей конфигурации в редакторе
    // совпадает с активной конфигурацией в сервисе.
    this.isApplyDisabled =
      currentEditorJsonCanonical === activeServiceConfigJson;
  }

  onPropertyChange(event: { id: string; value: any }): void {
    console.log('Свойство изменено из панели:', event);
    this.propSidebarService.updatePropertyValue(event.id, event.value);
    // The subscription to config$ will update jsonEditText and then call updateCodeMirrorContent.
  }

  onSidebarWidthChange(newWidth: number): void {
    this.sidebarWidth = newWidth;
    localStorage.setItem(this.sidebarWidthKey, newWidth.toString());
    console.log('Ширина панели изменена и сохранена:', newWidth);
  }

  closePanel(): void {
    this.propSidebarService.reset(); // Вызывает подписку: config=null, jsonEditText='', CM очищается, updateButtonStates() вызывается.
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.sidebarWidthKey); // Удаляем сохраненную ширину
    this.sidebarWidth = 384; // Сбрасываем ширину к дефолтной
    console.log(
      'Панель закрыта, конфигурация сброшена и удалена из localStorage.'
    );
  }
}
