import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  title = 'frontend';

  private authService = inject(AuthService);

  ngOnInit() {
    // Re-apply theme on every page load/refresh so it persists
    this.authService.applyTheme();
  }
}