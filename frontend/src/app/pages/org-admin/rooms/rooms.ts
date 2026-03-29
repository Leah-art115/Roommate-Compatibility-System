import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrgAdminService } from '../../../shared/services/org-admin.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.html',
})
export class RoomsComponent implements OnInit {
  private orgAdminService = inject(OrgAdminService);
  private notificationService = inject(NotificationService);

  rooms = signal<any[]>([]);
  loading = signal(true);
  deleting = signal<string | null>(null);

  filter = signal<'ALL' | 'FULL' | 'AVAILABLE' | 'EMPTY' | 'FEMALE' | 'MALE'>('ALL');

setFilter(f: 'ALL' | 'FULL' | 'AVAILABLE' | 'EMPTY' | 'FEMALE' | 'MALE') {
  this.filter.set(f);
}

  filters: { key: 'ALL' | 'FULL' | 'AVAILABLE' | 'EMPTY' | 'FEMALE' | 'MALE'; label: string }[] = [
  { key: 'ALL', label: 'All Rooms' },
  { key: 'AVAILABLE', label: 'Available' },
  { key: 'FULL', label: 'Full' },
  { key: 'EMPTY', label: 'Empty' },
  { key: 'FEMALE', label: 'Female Block' },
  { key: 'MALE', label: 'Male Block' },
];

  showModal = signal(false);
  modalLoading = signal(false);
  form = { roomNumber: '', block: '', capacity: 4, gender: '' };

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.loading.set(true);
    this.orgAdminService.getRooms().subscribe({
      next: (data) => {
        this.rooms.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load rooms', 'error');
        this.loading.set(false);
      },
    });
  }

  get filteredRooms() {
  const f = this.filter();
  if (f === 'FULL') return this.rooms().filter(r => r.isFull);
  if (f === 'AVAILABLE') return this.rooms().filter(r => !r.isFull && r.occupants > 0);
  if (f === 'EMPTY') return this.rooms().filter(r => r.occupants === 0);
  if (f === 'FEMALE') return this.rooms().filter(r => r.gender === 'female');
  if (f === 'MALE') return this.rooms().filter(r => r.gender === 'male');
  return this.rooms();
}

  get femaleRooms() {
    return this.filteredRooms.filter(r => r.gender === 'female');
  }

  get maleRooms() {
    return this.filteredRooms.filter(r => r.gender === 'male');
  }

  get showFemaleSection(): boolean {
    return this.filter() !== 'MALE';
  }

  get showMaleSection(): boolean {
    return this.filter() !== 'FEMALE';
  }

  openModal() {
    this.form = { roomNumber: '', block: '', capacity: 4, gender: '' };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  addRoom() {
    if (!this.form.roomNumber || !this.form.gender) {
      this.notificationService.show('Please fill in room number and gender', 'warning');
      return;
    }

    this.modalLoading.set(true);
    this.orgAdminService.createRoom(this.form).subscribe({
      next: () => {
        this.notificationService.show('Room created successfully', 'success');
        this.closeModal();
        this.loadRooms();
        this.modalLoading.set(false);
      },
      error: (err) => {
        this.modalLoading.set(false);
        const message = err?.error?.message || 'Failed to create room';
        this.notificationService.show(message, 'error');
      },
    });
  }

  deleteRoom(id: string) {
    this.deleting.set(id);
    this.orgAdminService.deleteRoom(id).subscribe({
      next: () => {
        this.notificationService.show('Room deleted', 'success');
        this.deleting.set(null);
        this.loadRooms();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to delete room', 'error');
        this.deleting.set(null);
      },
    });
  }

  occupancyPercent(room: any): number {
    return Math.round((room.occupants / room.capacity) * 100);
  }

  occupancyColor(room: any): string {
    const pct = this.occupancyPercent(room);
    if (pct === 100) return 'var(--color-error)';
    if (pct >= 50) return 'var(--color-warning)';
    return 'var(--color-success)';
  }

  genderColor(gender: string): string {
    return gender === 'female' ? 'var(--color-female-primary)' : 'var(--color-male-primary)';
  }

  genderAccent(gender: string): string {
    return gender === 'female' ? 'var(--color-female-accent)' : 'var(--color-male-accent)';
  }
}