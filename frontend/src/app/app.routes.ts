import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'student/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/student/dashboard/dashboard').then((m) => m.StudentDashboardComponent),
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/org-admin/dashboard/dashboard').then((m) => m.OrgAdminDashboardComponent),
  },
  { path: '**', redirectTo: 'login' },
];