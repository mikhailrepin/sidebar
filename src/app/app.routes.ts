import { Routes } from '@angular/router';
import { DemoPageComponent } from '../features/pages/demo-page/demo-page.component';

export const routes: Routes = [
  { path: '', component: DemoPageComponent },
  { path: '**', redirectTo: '' },
];
