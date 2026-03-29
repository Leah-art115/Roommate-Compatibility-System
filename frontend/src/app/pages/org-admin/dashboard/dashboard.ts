import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-org-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.html',
})
export class OrgAdminDashboardComponent {
  collapsed = signal(false);

  toggleSidebar() {
    this.collapsed.set(!this.collapsed());
  }
}
