import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <main class="flex flex-col h-screen">
      <header
        class="bg-zinc-50 h-10 flex items-center px-3 border-b border-zinc-200"
      >
        <h1 class="text-zinc-900 text-lg font-semibold">{{ title }}</h1>
      </header>
      <div class="flex-1 overflow-hidden">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
  styles: `
  `,
})
export class AppComponent {
  title = 'App';
}
