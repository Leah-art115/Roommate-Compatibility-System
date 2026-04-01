import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-super-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './super-admin-sidebar.html',
})
export class SuperAdminSidebarComponent {
  @Input() collapsed = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.getUser();

  navItems = [
    { label: 'Dashboard', icon: 'fa-gauge', route: '/super-admin/dashboard' },
    { label: 'Organizations', icon: 'fa-building', route: '/super-admin/organizations' },
    { label: 'Org Admins', icon: 'fa-user-tie', route: '/super-admin/org-admins' },
    { label: 'Profile', icon: 'fa-user', route: '/super-admin/profile' },
  ];

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
  }
}
