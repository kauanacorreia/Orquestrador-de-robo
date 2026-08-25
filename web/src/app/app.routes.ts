import { Routes } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { Login } from './pages/login/login';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((module) => module.Home),
    providers: [provideCharts(withDefaultRegisterables())]
  }

];