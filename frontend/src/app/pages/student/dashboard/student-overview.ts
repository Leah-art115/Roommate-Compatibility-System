import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { StudentService } from '../../../shared/services/student.service';

@Component({
  selector: 'app-student-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-overview.html',
})
export class StudentOverviewComponent implements OnInit {
  private authService = inject(AuthService);
  private studentService = inject(StudentService);
  private router = inject(Router);

  user = this.authService.getUser();
  profile = signal<any>(null);
  loading = signal(true);
  myRoom = signal<any>(null);
  myComplaints = signal<any[]>([]);
  mySwitchRequests = signal<any[]>([]);

  bookingStatus = signal<'NOT_STARTED' | 'QUIZ_DONE' | 'ALLOCATED'>('NOT_STARTED');

  steps = [
    { key: 'quiz', label: 'Complete Compatibility Quiz', icon: 'fa-clipboard-question', route: '/student/quiz' },
    { key: 'room', label: 'Browse & Book a Room', icon: 'fa-door-open', route: '/student/rooms' },
    { key: 'done', label: 'All Set!', icon: 'fa-circle-check', route: null },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.authService.getProfile().subscribe({
      next: (profile) => this.profile.set(profile),
      error: () => {},
    });

    this.studentService.getMyRoom().subscribe({
      next: (data) => {
        this.myRoom.set(data);
        this.bookingStatus.set('ALLOCATED');
        this.loading.set(false);
      },
      error: () => {
        this.studentService.getMyAnswers().subscribe({
          next: (answers) => {
            this.bookingStatus.set(answers.length > 0 ? 'QUIZ_DONE' : 'NOT_STARTED');
            this.loading.set(false);
          },
          error: () => {
            this.bookingStatus.set('NOT_STARTED');
            this.loading.set(false);
          },
        });
      },
    });

    this.studentService.getMyComplaints().subscribe({
      next: (data) => this.myComplaints.set(data),
      error: () => {},
    });

    this.studentService.getMySwitchRequests().subscribe({
      next: (data) => this.mySwitchRequests.set(data),
      error: () => {},
    });
  }

  get currentStepIndex(): number {
    if (this.bookingStatus() === 'NOT_STARTED') return 0;
    if (this.bookingStatus() === 'QUIZ_DONE') return 1;
    return 2;
  }

  get pendingSwitchRequest(): any {
    return this.mySwitchRequests().find(r => r.status === 'PENDING');
  }

  get openComplaints(): number {
    return this.myComplaints().filter(c => c.status === 'OPEN').length;
  }

  get userName(): string {
    return this.profile()?.name || 'User';
  }

  navigate(route: string | null) {
    if (route) this.router.navigate([route]);
  }
}
