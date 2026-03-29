import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../shared/services/student.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-student-my-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-room.html',
})
export class StudentMyRoomComponent implements OnInit {
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);

  loading = signal(true);
  myRoom = signal<any>(null);
  switchRequests = signal<any[]>([]);
  expandedRoommate = signal<string | null>(null);

  // Switch request form
  showSwitchModal = signal(false);
  switchReason = '';
  submittingSwitch = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.studentService.getMyRoom().subscribe({
      next: (data) => {
        this.myRoom.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });

    this.studentService.getMySwitchRequests().subscribe({
      next: (data) => this.switchRequests.set(data),
      error: () => {},
    });
  }

  toggleRoommate(id: string) {
    this.expandedRoommate.set(this.expandedRoommate() === id ? null : id);
  }

  get pendingSwitchRequest(): any {
    return this.switchRequests().find(r => r.status === 'PENDING');
  }

  get switchesUsed(): number {
    return this.switchRequests().filter(r => r.status === 'APPROVED').length;
  }

  get canRequestSwitch(): boolean {
    return !this.pendingSwitchRequest && this.switchesUsed < 2;
  }

  openSwitchModal() {
    this.switchReason = '';
    this.showSwitchModal.set(true);
  }

  closeSwitchModal() {
    this.showSwitchModal.set(false);
  }

  submitSwitchRequest() {
    if (!this.switchReason.trim()) {
      this.notificationService.show('Please provide a reason for the switch', 'warning');
      return;
    }

    this.submittingSwitch.set(true);
    this.studentService.requestSwitch(this.switchReason.trim()).subscribe({
      next: () => {
        this.notificationService.show('Switch request submitted successfully', 'success');
        this.closeSwitchModal();
        this.submittingSwitch.set(false);
        this.loadData();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to submit request', 'error');
        this.submittingSwitch.set(false);
      },
    });
  }

  compatibilityColor(score: number): string {
    if (score >= 75) return 'var(--color-success)';
    if (score >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  }

  compatibilityBg(score: number): string {
    if (score >= 75) return '#dcfce7';
    if (score >= 50) return '#fef9c3';
    return '#fee2e2';
  }

  switchStatusColor(status: string): string {
    if (status === 'APPROVED') return 'text-green-700 bg-green-100';
    if (status === 'REJECTED') return 'text-red-700 bg-red-100';
    return 'text-yellow-700 bg-yellow-100';
  }

  switchStatusIcon(status: string): string {
    if (status === 'APPROVED') return 'fa-circle-check';
    if (status === 'REJECTED') return 'fa-circle-xmark';
    return 'fa-clock';
  }
}