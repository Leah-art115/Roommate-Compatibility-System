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

  // ── Student ──
  {
    path: 'student',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/student/dashboard/student-dashboard').then((m) => m.StudentDashboardComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/student/dashboard/student-overview').then((m) => m.StudentOverviewComponent),
      },
      {
        path: 'quiz',
        loadComponent: () =>
          import('./pages/student/quiz/quiz').then((m) => m.StudentQuizComponent),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./pages/student/rooms/student-rooms').then((m) => m.StudentRoomsComponent),
      },
      {
        path: 'my-room',
        loadComponent: () =>
          import('./pages/student/my-room/my-room').then((m) => m.StudentMyRoomComponent),
      },
      {
        path: 'complaints',
        loadComponent: () =>
          import('./pages/student/complaints/student-complaints').then((m) => m.StudentComplaintsComponent),
      },
    ],
  },

  // ── Org Admin ──
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
