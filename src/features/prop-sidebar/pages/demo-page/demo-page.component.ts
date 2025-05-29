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
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarPanelComponent } from '../../components/sidebar-panel/sidebar-panel.component';
import { PropSidebarService } from '../../services/prop-sidebar.service';
import { SidebarPanelConfig } from '../../types/prop-sidebar.types';
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
import { oneDark } from '@codemirror/theme-one-dark'; // Dark theme
import { basicSetup } from 'codemirror'; // Changed from @codemirror/basic-setup to codemirror

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarPanelComponent, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="flex h-full">
      <!-- Main Content -->
      <section
        class="flex-1 flex flex-col gap-6 bg-zinc-50 p-6 h-full max-h-[calc(100vh-40px)] overflow-hidden"
      >
        <div class="flex flex-col">
          <h1 class="text-xl font-semibold text-gray-800">
            Редактор панели свойств
          </h1>
          <p class="text-gray-600 pt-2">
            Состав панели генерируется динамически из JSON конфигурации. Ниже вы
            можете редактировать JSON и применять изменения.
          </p>
        </div>

        <div
          #codemirrorHost
          class="w-full h-full border border-gray-300 rounded-md overflow-hidden"
        ></div>

        <div class="justify-end flex gap-4">
          <button
            (click)="loadExampleIntoTextareaAndApply()"
            class="rounded w-fit px-4 py-2 font-medium text-zinc-800 border border-zinc-300 hover:cursor-pointer"
          >
            Сбросить конфигурацию
          </button>
          <button
            (click)="applyJsonFromTextarea()"
            class="rounded w-fit bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-600 hover:cursor-pointer"
          >
            Применить конфигурацию
          </button>
        </div>
      </section>

      <!-- Sidebar -->
      <div *ngIf="config" class="border-l border-gray-200">
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
        border-left-color: white !important;
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
        border-left: 2px solid #6366f1; /* indigo-500 */
      }

      /* Custom style for the left resize handle when hovered */
      .resize-handle-left:hover > .mwl-resizable-handle-left {
        background-color: rgba(
          99,
          102,
          241,
          0.5
        ); /* semi-transparent indigo-500 */
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
      }

      .resize-handle {
        position: absolute;
        left: -5px;
        top: 0;
        width: 10px;
        height: 100%;
        cursor: col-resize;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .resize-handle-visual {
        width: 2px;
        height: 50px;
        background-color: #e0e7ff; /* indigo-100 - всегда немного видна */
        border-radius: 2px;
        transition: background-color 0.2s ease-in-out, height 0.2s ease-in-out;
      }

      /* При наведении на саму ручку */
      .resize-handle:hover .resize-handle-visual {
        background-color: #a5b4fc; /* indigo-300 */
        height: 70px; /* Немного увеличим высоту для лучшей обратной связи */
      }

      /* Во время активного изменения размера */
      app-sidebar-panel.is-resizing-cdk .resize-handle-visual {
        background-color: #6366f1; /* indigo-500 */
        height: 80px; /* Еще немного увеличим */
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

  constructor(private propSidebarService: PropSidebarService) {}

  ngOnInit(): void {
    this.propSidebarService.config$.subscribe(
      (config: SidebarPanelConfig | null) => {
        this.config = config;
        if (this.config) {
          const serviceConfigJson = JSON.stringify(this.config, null, 2);
          if (this.jsonEditText !== serviceConfigJson) {
            this.jsonEditText = serviceConfigJson;
            this.updateCodeMirrorContent(this.jsonEditText);
          }
        } else {
          this.jsonEditText = '';
          this.updateCodeMirrorContent('');
        }
      }
    );

    const savedJsonString = localStorage.getItem(this.localStorageKey);
    if (savedJsonString) {
      this.jsonEditText = savedJsonString;
      // Content will be set in ngAfterViewInit or via subscription updateCodeMirrorContent
      this.applyJsonFromTextarea(false);
    } else {
      this.loadExampleIntoTextareaAndApply();
    }

    const savedWidth = localStorage.getItem(this.sidebarWidthKey);
    if (savedWidth) {
      this.sidebarWidth = parseInt(savedWidth, 10);
    }
  }

  ngAfterViewInit(): void {
    this.initCodeMirror(this.jsonEditText);
  }

  ngOnDestroy(): void {
    this.cmView?.destroy();
  }

  private initCodeMirror(initialContent: string): void {
    if (this.codemirrorHost && !this.cmView) {
      const state = EditorState.create({
        doc: initialContent,
        extensions: [
          basicSetup, // Includes line numbers, history, folding, etc.
          keymap.of([
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...completionKeymap,
            ...lintKeymap,
            ...closeBracketsKeymap,
            indentWithTab,
          ]),
          json(),
          oneDark, // Apply the oneDark theme
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          highlightSelectionMatches(),
          placeholder('Вставьте JSON конфигурацию сюда...'),
          EditorView.lineWrapping, // Enable line wrapping
          EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
              this.jsonEditText = update.state.doc.toString();
              // Optionally, add debounce here if needed before updating service/localStorage
            }
          }),
        ],
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
    try {
      const data = await import('../../data/example-panel.json');
      this.jsonEditText = JSON.stringify(data.default, null, 2);
      this.updateCodeMirrorContent(this.jsonEditText); // Update CodeMirror
      this.applyJsonFromTextarea();
    } catch (err: any) {
      console.error('Ошибка загрузки примера конфигурации:', err);
      const errorJson = JSON.stringify(
        {
          error: 'Не удалось загрузить пример конфигурации',
          details: err.message,
        },
        null,
        2
      );
      this.jsonEditText = errorJson;
      this.updateCodeMirrorContent(this.jsonEditText); // Update CodeMirror with error
      this.applyJsonFromTextarea(false); // Apply to service, but don't save error to localStorage by default
    }
  }

  applyJsonFromTextarea(saveToLocalStorage: boolean = true): void {
    try {
      const parsedConfig = JSON.parse(this.jsonEditText) as SidebarPanelConfig;
      this.propSidebarService.loadFromJson(parsedConfig);
      // The subscription to config$ will call updateCodeMirrorContent if canonical form differs

      if (this.config) {
        const canonicalJsonString = JSON.stringify(this.config, null, 2);
        // Ensure CodeMirror also has the canonical version if service modified it
        if (this.jsonEditText !== canonicalJsonString) {
          this.jsonEditText = canonicalJsonString;
          this.updateCodeMirrorContent(this.jsonEditText);
        }

        if (saveToLocalStorage) {
          localStorage.setItem(this.localStorageKey, this.jsonEditText);
          console.log(
            'Конфигурация успешно применена и сохранена в localStorage.'
          );
        } else {
          console.log('Конфигурация успешно применена.');
        }
      } else {
        console.warn('Конфигурация привела к null значению this.config');
        if (saveToLocalStorage) {
          localStorage.removeItem(this.localStorageKey);
        }
        // If config becomes null, jsonEditText and CodeMirror content are cleared by the subscription
      }
    } catch (error: any) {
      console.error('Ошибка парсинга JSON из редактора:', error);
      alert(
        'Ошибка в JSON конфигурации: ' +
          error.message +
          '. Проверьте консоль для деталей.'
      );
      // Do not clear CodeMirror content on error, let user fix it.
    }
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
    this.propSidebarService.reset(); // Triggers subscription, clearing jsonEditText and CM content
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.sidebarWidthKey); // Удаляем сохраненную ширину
    this.sidebarWidth = 384; // Сбрасываем ширину к дефолтной
    console.log(
      'Панель закрыта, конфигурация сброшена и удалена из localStorage.'
    );
  }
}
