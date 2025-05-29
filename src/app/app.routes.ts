import { Routes } from '@angular/router';
import { DemoPageComponent } from '../features/prop-sidebar/pages/demo-page/demo-page.component';

export const routes: Routes = [
  { path: '', component: DemoPageComponent },
  { path: '**', redirectTo: '' },
];
