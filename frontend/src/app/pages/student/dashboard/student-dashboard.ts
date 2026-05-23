import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentSidebarComponent } from '../../../shared/components/student-sidebar/student-sidebar';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StudentSidebarComponent],
  templateUrl: './student-dashboard.html',   // Must match the actual filename
})
export class StudentDashboardComponent {
  private authService = inject(AuthService);


  user = this.authService.getUser();

 sidebarOpen = signal(false);

toggleSidebar() {
  this.sidebarOpen.update(v => !v);
}

closeSidebar() {
  this.sidebarOpen.set(false);
}
}
