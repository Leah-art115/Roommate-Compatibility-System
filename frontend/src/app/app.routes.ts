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
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/org-admin/dashboard/dashboard').then((m) => m.OrgAdminDashboardComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/org-admin/dashboard/overview').then((m) => m.OverviewComponent),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/org-admin/students/students').then((m) => m.StudentsComponent),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./pages/org-admin/rooms/rooms').then((m) => m.RoomsComponent),
      },
      {
        path: 'questions',
        loadComponent: () =>
          import('./pages/org-admin/questions/questions').then((m) => m.QuestionsComponent),
      },
      {
        path: 'switch-requests',
        loadComponent: () =>
          import('./pages/org-admin/switch-requests/switch-requests').then((m) => m.SwitchRequestsComponent),
      },
      {
        path: 'complaints',
        loadComponent: () =>
          import('./pages/org-admin/complaints/complaints').then((m) => m.ComplaintsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];