import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentService } from '../../../shared/services/student.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-student-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-rooms.html',   // Must match the actual filename
})
export class StudentRoomsComponent implements OnInit {
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  rooms = signal<any[]>([]);
  loading = signal(true);
  booking = signal<string | null>(null);
  expandedRoom = signal<string | null>(null);
  expandedRoomate = signal<string | null>(null);
  showConfirm = signal<string | null>(null);

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.loading.set(true);
    this.studentService.getAvailableRooms().subscribe({
      next: (data) => {
        const sorted = [...data].sort((a, b) => {
          if (a.isEmpty && !b.isEmpty) return 1;
          if (!a.isEmpty && b.isEmpty) return -1;
          return (b.overallCompatibility ?? 0) - (a.overallCompatibility ?? 0);
        });
        this.rooms.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to load rooms';
        this.notificationService.show(msg, 'error');
        this.loading.set(false);
      },
    });
  }

  toggleRoom(id: string) {
    this.expandedRoom.set(this.expandedRoom() === id ? null : id);
    this.expandedRoomate.set(null);
  }

  toggleRoommate(id: string) {
    this.expandedRoomate.set(this.expandedRoomate() === id ? null : id);
  }

  confirmBook(roomId: string) {
    this.showConfirm.set(roomId);
  }

  cancelBook() {
    this.showConfirm.set(null);
  }

  bookRoom() {
    const roomId = this.showConfirm();
    if (!roomId) return;

    this.booking.set(roomId);
    this.showConfirm.set(null);

    this.studentService.bookRoom(roomId).subscribe({
      next: () => {
        this.notificationService.show('Room booked successfully!', 'success');
        this.router.navigate(['/student/my-room']);
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to book room', 'error');
        this.booking.set(null);
      },
    });
  }

  compatibilityColor(score: number | null): string {
    if (score === null) return 'var(--color-text-secondary)';
    if (score >= 75) return 'var(--color-success)';
    if (score >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  }

  compatibilityBg(score: number | null): string {
    if (score === null) return 'var(--color-border)';
    if (score >= 75) return '#dcfce7';
    if (score >= 50) return '#fef9c3';
    return '#fee2e2';
  }
}