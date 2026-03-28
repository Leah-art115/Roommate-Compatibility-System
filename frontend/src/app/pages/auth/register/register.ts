import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  token = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  validating = true;
  tokenValid = false;
  showPassword = false;
  showConfirmPassword = false;

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.validating = false;
      this.notificationService.show('No invite token found. Please use your invite link.', 'error');
      return;
    }

    this.authService.validateInviteToken(this.token).subscribe({
      next: (res) => {
        this.email = res.email;
        this.tokenValid = true;
        this.validating = false;
      },
      error: (err) => {
        this.validating = false;
        this.tokenValid = false;
        const message = err?.error?.message || 'Invalid or expired invite link.';
        this.notificationService.show(message, 'error');
      },
    });
  }

  onSubmit() {
    if (!this.password || !this.confirmPassword) {
      this.notificationService.show('Please fill in all fields', 'warning');
      return;
    }

    if (this.password.length < 8) {
      this.notificationService.show('Password must be at least 8 characters', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.notificationService.show('Passwords do not match', 'error');
      return;
    }

    this.loading = true;

    this.authService.register(this.token, this.password).subscribe({
      next: () => {
        this.notificationService.show('Account created successfully!', 'success');
        setTimeout(() => {
          this.authService.redirectAfterLogin();
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        const message = err?.error?.message || 'Registration failed. Please try again.';
        this.notificationService.show(message, 'error');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}