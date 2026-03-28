import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    const id = this.counter++;
    this.notifications.update((n) => [...n, { id, message, type }]);

    setTimeout(() => {
      this.dismiss(id);
    }, 3500);
  }

  dismiss(id: number) {
    this.notifications.update((n) => n.filter((notif) => notif.id !== id));
  }
}