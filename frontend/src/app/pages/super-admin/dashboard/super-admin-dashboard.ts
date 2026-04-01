import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SuperAdminSidebarComponent } from '../../../shared/components/super-admin-sidebar/super-admin-sidebar';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SuperAdminSidebarComponent],
  templateUrl: './super-admin-dashboard.html',
})
export class SuperAdminDashboardComponent {
  collapsed = signal(false);

  toggleSidebar() {
    this.collapsed.set(!this.collapsed());
  }
}
