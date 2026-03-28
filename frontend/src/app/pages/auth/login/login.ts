import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  showPassword = false;

  onSubmit() {
    if (!this.email || !this.password) {
      this.notificationService.show('Please fill in all fields', 'warning');
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.notificationService.show('Login successful!', 'success');
        setTimeout(() => {
          this.authService.redirectAfterLogin();
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        const message = err?.error?.message || 'Login failed. Please try again.';
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
}