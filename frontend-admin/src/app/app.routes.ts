import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./layout').then((m) => m.DefaultLayoutComponent),
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./views/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        data: {
          title: 'Dashboard'
        }
      },
      {
        path: 'tables',
        loadComponent: () => import('./views/tables/tables.component').then((m) => m.TablesComponent),
        data: {
          title: 'Tables'
        }
      },
      {
        path: 'typography',
        loadComponent: () => import('./views/typography/typography.component').then((m) => m.TypographyComponent),
        data: {
          title: 'Typography'
        }
      },
      {
        path: 'icons',
        loadComponent: () => import('./views/icons/icons.component').then((m) => m.IconsComponent),
        data: {
          title: 'Icons'
        }
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
