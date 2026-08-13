import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/pages/login/login.component').then((m) => m.LoginComponent),
    data: {
      title: 'Login'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/pages/register/register.component').then((m) => m.RegisterComponent),
    data: {
      title: 'Register'
    }
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./layout').then((m) => m.DefaultLayoutComponent),
    canActivate: [authGuard],
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
        path: 'users',
        loadComponent: () => import('./views/users/users.component').then((m) => m.UsersComponent),
        data: {
          title: 'Usuarios'
        }
      },
      {
        path: 'tenants',
        loadComponent: () => import('./views/tenants/tenants.component').then((m) => m.TenantsComponent),
        data: {
          title: 'Tenants'
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
