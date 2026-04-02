import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-sidebar.html',
})
export class StudentSidebarComponent implements OnInit {

  @Input() collapsed = false;
  private authService = inject(AuthService);
  private studentService = inject(StudentService);
  private router = inject(Router);

  user = this.authService.getUser();
  quizDone = signal(false);

  allNavItems = [
    { label: 'Dashboard', icon: 'fa-gauge', route: '/student/dashboard', alwaysShow: true },
    { label: 'My Quiz', icon: 'fa-clipboard-question', route: '/student/quiz', alwaysShow: false },
    { label: 'Browse Rooms', icon: 'fa-door-open', route: '/student/rooms', alwaysShow: true },
    { label: 'My Room', icon: 'fa-house', route: '/student/my-room', alwaysShow: true },
    { label: 'Complaints', icon: 'fa-triangle-exclamation', route: '/student/complaints', alwaysShow: true },
    { label: 'Profile', icon: 'fa-user', route: '/student/profile', alwaysShow: true },
  ];

  ngOnInit() {
    // Check if quiz has already been submitted
    this.studentService.getMyAnswers().subscribe({
      next: (answers) => {
        this.quizDone.set(answers.length > 0);
      },
      error: () => {
        this.quizDone.set(false);
      },
    });
  }

  get navItems() {
    return this.allNavItems.filter(item => {
      if (item.alwaysShow) return true;
      // Only show quiz if not done yet
      if (item.route === '/student/quiz') return !this.quizDone();
      return true;
    });
  }

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