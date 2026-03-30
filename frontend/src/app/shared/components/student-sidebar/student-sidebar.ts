import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-sidebar.html',
})
export class StudentSidebarComponent {
  @Input() collapsed = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.getUser();

  navItems = [
  { label: 'Dashboard', icon: 'fa-gauge', route: '/student/dashboard' },
  { label: 'My Quiz', icon: 'fa-clipboard-question', route: '/student/quiz' },
  { label: 'Browse Rooms', icon: 'fa-door-open', route: '/student/rooms' },
  { label: 'My Room', icon: 'fa-house', route: '/student/my-room' },
  { label: 'Complaints', icon: 'fa-triangle-exclamation', route: '/student/complaints' },
  { label: 'Profile', icon: 'fa-user', route: '/student/profile' },
];

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout() {
    this.authService.logout();
  }
}