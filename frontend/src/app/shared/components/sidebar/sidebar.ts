import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  @Input() collapsed = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.getUser();

  navItems = [
  { label: 'Dashboard', icon: 'fa-gauge', route: '/admin/dashboard' },
  { label: 'Students', icon: 'fa-users', route: '/admin/students' },
  { label: 'Rooms', icon: 'fa-door-open', route: '/admin/rooms' },
  { label: 'Questions', icon: 'fa-clipboard-question', route: '/admin/questions' },
  { label: 'Switch Requests', icon: 'fa-arrows-rotate', route: '/admin/switch-requests' },
  { label: 'Complaints', icon: 'fa-triangle-exclamation', route: '/admin/complaints' },
  { label: 'Profile', icon: 'fa-user', route: '/admin/profile' },
];

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout() {
    this.authService.logout();
  }
}
