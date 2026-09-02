import { Routes } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { Login } from './pages/login/login';
import { RobotsList } from './pages/robots-list/robots-list';
import { Shell } from './core/components/shell/shell';

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
    path: '',
    component: Shell,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((module) => module.Home),
        providers: [provideCharts(withDefaultRegisterables())]
      },
      {
        path: 'robots',
        component: RobotsList
      }
    ]
  }
];