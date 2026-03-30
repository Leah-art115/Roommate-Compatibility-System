import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { NotificationService } from '../../shared/components/notification/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  profile = signal<any>(null);
  loading = signal(true);
  changingPassword = signal(false);

  showPasswordForm = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load profile', 'error');
        this.loading.set(false);
      },
    });
  }

  togglePasswordForm() {
    this.showPasswordForm.set(!this.showPasswordForm());
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }

  changePassword() {
    if (!this.passwordForm.currentPassword) {
      this.notificationService.show('Please enter your current password', 'warning');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.notificationService.show('New password must be at least 8 characters', 'warning');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.notificationService.show('Passwords do not match', 'error');
      return;
    }

    this.changingPassword.set(true);
    this.authService.changePassword(
      this.passwordForm.currentPassword,
      this.passwordForm.newPassword,
    ).subscribe({
      next: () => {
        this.notificationService.show('Password changed successfully', 'success');
        this.changingPassword.set(false);
        this.showPasswordForm.set(false);
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to change password', 'error');
        this.changingPassword.set(false);
      },
    });
  }

  genderIcon(gender: string): string {
    return gender === 'female' ? 'fa-venus' : 'fa-mars';
  }

  genderColor(gender: string): string {
    return gender === 'female' ? 'var(--color-female-primary)' : 'var(--color-male-primary)';
  }

  genderAccent(gender: string): string {
    return gender === 'female' ? 'var(--color-female-accent)' : 'var(--color-male-accent)';
  }

  bookingStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      NOT_STARTED: 'Not Started',
      QUIZ_DONE: 'Quiz Completed',
      ALLOCATED: 'Room Allocated',
    };
    return labels[status] || status;
  }

  bookingStatusColor(status: string): string {
    if (status === 'ALLOCATED') return 'bg-green-100 text-green-700';
    if (status === 'QUIZ_DONE') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  }

  orgTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      SCHOOL: 'School',
      HOSTEL: 'Hostel',
      CAMP: 'Camp',
    };
    return labels[type] || type;
  }
}