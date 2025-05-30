import {
  Injectable,
  PLATFORM_ID,
  inject,
  makeStateKey,
  TransferState,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, map } from 'rxjs';

const SPRITE_PATH = './sprites.svg'; // Путь к вашему спрайту в папке public. Убедитесь, что он доступен по этому пути.
const SPRITE_LOADED_KEY = makeStateKey<boolean>('spriteLoaded');

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private transferState = inject(TransferState);

  private spriteLoaded$: Observable<boolean> | null = null;
  private readonly spriteContainerId = 'global-svg-sprite-container';

  constructor() {
    // Для Server-Side Rendering (SSR) и Client-Side Hydration,
    // проверяем, был ли спрайт уже загружен на сервере.
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(SPRITE_LOADED_KEY)
    ) {
      const alreadyLoaded = this.transferState.get(SPRITE_LOADED_KEY, false);
      if (alreadyLoaded) {
        this.spriteLoaded$ = of(true);
        // Удаляем ключ из transferState, так как он больше не нужен на клиенте
        this.transferState.remove(SPRITE_LOADED_KEY);
      }
    }
  }

  ensureSpriteLoaded(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      // Логика для сервера (SSR)
      if (!this.spriteLoaded$) {
        // На сервере мы не вставляем спрайт в DOM напрямую, а только "загружаем" его
        // и передаем состояние клиенту через TransferState.
        this.spriteLoaded$ = this.http
          .get(SPRITE_PATH, { responseType: 'text' })
          .pipe(
            tap(() => {
              // Устанавливаем ключ, чтобы клиент знал, что спрайт "загружен"
              this.transferState.set(SPRITE_LOADED_KEY, true);
            }),
            mapToTrue(),
            catchError((error) => {
              // В случае ошибки на сервере, мы не прерываем работу,
              // клиент попытается загрузить спрайт самостоятельно.
              console.error('Failed to preload SVG sprite on server:', error);
              return of(false);
            }),
            shareReplay(1)
          );
      }
      return this.spriteLoaded$ ?? of(false);
    }

    // Логика для браузера
    if (!this.spriteLoaded$) {
      if (
        document.getElementById(this.spriteContainerId)?.querySelector('svg')
      ) {
        this.spriteLoaded$ = of(true);
      } else {
        this.spriteLoaded$ = this.http
          .get(SPRITE_PATH, { responseType: 'text' })
          .pipe(
            tap((spriteContent) => {
              let spriteContainer = document.getElementById(
                this.spriteContainerId
              );
              if (!spriteContainer) {
                spriteContainer = document.createElement('div');
                spriteContainer.id = this.spriteContainerId;
                spriteContainer.style.display = 'none';
                document.body.appendChild(spriteContainer);
              }
              spriteContainer.innerHTML = spriteContent;
            }),
            mapToTrue(),
            catchError((error) => {
              console.error('Failed to load SVG sprite on client:', error);
              return of(false);
            }),
            shareReplay(1)
          );
      }
    }
    return this.spriteLoaded$ ?? of(false);
  }
}

// Вспомогательный оператор RxJS
function mapToTrue<T>() {
  return (source: Observable<T>): Observable<boolean> =>
    source.pipe(map(() => true));
}

// Необходимо добавить HttpClientModule в imports вашего основного модуля или standalone компонента/маршрута
// Пример для AppModule:
// import { HttpClientModule } from '@angular/common/http';
// @NgModule({
//   imports: [
//     BrowserModule,
//     HttpClientModule, // <--- Добавьте это
//     // ...другие модули
//   ],
//   // ...
// })
// export class AppModule { }

// Если вы используете standalone компоненты и bootstrapApplication:
// bootstrapApplication(AppComponent, {
//   providers: [
//     importProvidersFrom(HttpClientModule), // <--- Добавьте это
//   ]
// });
