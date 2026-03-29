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

  // ── Add Room Modal ──
  showModal = signal(false);
  modalLoading = signal(false);
  // floor: 0 = Ground Floor, 1–10 = upper floors
  form = { roomNumber: '', floor: 0, gender: '', block: 'A' };

  // ── Delete Confirmation Modal ──
  showDeleteModal = signal(false);
  roomToDelete = signal<{ id: string; roomNumber: string } | null>(null);

  // ── Block Management Modal ──
  showBlockModal = signal(false);
  newBlockName = '';
  blocks = signal<string[]>(['A']);

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

  get multipleBlocks(): boolean {
    return this.blocks().length > 1;
  }

  // ── Floors: 0 = Ground, 1–10 = upper floors ──
  // Ground floor rooms: G001–G010 (floor digit = 0, 3-digit room number padded to 3)
  // Upper floor rooms:  G101–G110, G201–G210 ... G1001–G1010
  // Pattern: prefix + floorStr + roomPadded(2 digits)
  // Ground: G + "0" + "01"–"10" → G001–G010 (total 4 chars)
  // Floor1: G + "1" + "01"–"10" → G101–G110 (total 4 chars)
  // Floor10: G + "10" + "01"–"10" → G1001–G1010 (total 5 chars)

  get availableFloors(): { value: number; label: string }[] {
    const floors = [{ value: 0, label: 'Ground Floor' }];
    for (let i = 1; i <= 10; i++) {
      floors.push({ value: i, label: `Floor ${i}` });
    }
    return floors;
  }

  floorLabel(floor: number): string {
    return floor === 0 ? 'Ground Floor' : `Floor ${floor}`;
  }

  suggestNextRoomNumber(gender: string, floor: number): string {
    if (gender === '' || floor === null || floor === undefined) return '';

    const prefix = gender === 'female' ? 'G' : 'B';
    const floorStr = floor.toString(); // "0", "1", ... "10"

    // Room number format: prefix + floorStr + 2-digit room index
    // e.g. G001, G101, G1001
    const existingOnFloor = this.rooms()
      .filter(r => {
        const rn: string = r.roomNumber || '';
        // Must start with prefix+floorStr and the remainder must be exactly 2 chars
        return rn.startsWith(prefix + floorStr) &&
               rn.length === prefix.length + floorStr.length + 2;
      })
      .map(r => {
        const rn: string = r.roomNumber;
        const roomPart = rn.slice(prefix.length + floorStr.length);
        return parseInt(roomPart, 10);
      })
      .filter(n => !isNaN(n));

    const nextRoom = existingOnFloor.length > 0 ? Math.max(...existingOnFloor) + 1 : 1;

    if (nextRoom > 10) return ''; // floor is full

    const roomPadded = nextRoom.toString().padStart(2, '0');
    return `${prefix}${floorStr}${roomPadded}`;
  }

  onGenderOrFloorChange() {
    this.form.roomNumber = this.suggestNextRoomNumber(this.form.gender, this.form.floor);
  }

  get floorFull(): boolean {
    return this.form.gender !== '' && this.suggestNextRoomNumber(this.form.gender, this.form.floor) === '';
  }

  roomDescription(roomNumber: string, gender: string, floor: number): string {
    if (!roomNumber) return '';
    const prefix = gender === 'female' ? 'G' : 'B';
    const floorStr = floor.toString();
    const roomPart = roomNumber.slice(prefix.length + floorStr.length);
    const genderLabel = gender === 'female' ? 'Girls' : 'Boys';
    const floorLbl = this.floorLabel(floor);
    return `${genderLabel}, ${floorLbl}, Room ${roomPart}`;
  }

  // ── Add Room Modal ──
  openModal() {
    this.form = { roomNumber: '', floor: 0, gender: '', block: 'A' };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  addRoom() {
    if (!this.form.roomNumber || !this.form.gender) {
      this.notificationService.show('Please select gender and floor', 'warning');
      return;
    }
    if (this.floorFull) {
      this.notificationService.show('This floor is full — all 10 rooms are taken', 'warning');
      return;
    }

    this.modalLoading.set(true);
    const payload = {
      roomNumber: this.form.roomNumber,
      block: this.form.block || 'A',
      capacity: 4,
      gender: this.form.gender,
    };

    this.orgAdminService.createRoom(payload).subscribe({
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

  // ── Delete Confirmation ──
  confirmDelete(id: string, roomNumber: string) {
    this.roomToDelete.set({ id, roomNumber });
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.roomToDelete.set(null);
    this.showDeleteModal.set(false);
  }

  deleteRoom() {
    const target = this.roomToDelete();
    if (!target) return;

    this.deleting.set(target.id);
    this.showDeleteModal.set(false);

    this.orgAdminService.deleteRoom(target.id).subscribe({
      next: () => {
        this.notificationService.show('Room deleted', 'success');
        this.deleting.set(null);
        this.roomToDelete.set(null);
        this.loadRooms();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to delete room', 'error');
        this.deleting.set(null);
        this.roomToDelete.set(null);
      },
    });
  }

  // ── Block Management ──
  openBlockModal() {
    this.newBlockName = '';
    this.showBlockModal.set(true);
  }

  closeBlockModal() {
    this.showBlockModal.set(false);
  }

  addBlock() {
    const name = this.newBlockName.trim().toUpperCase();
    if (!name) {
      this.notificationService.show('Please enter a block name', 'warning');
      return;
    }
    if (this.blocks().includes(name)) {
      this.notificationService.show('Block already exists', 'warning');
      return;
    }
    this.blocks.update(b => [...b, name]);
    this.notificationService.show(`Block ${name} added`, 'success');
    this.closeBlockModal();
  }

  // ── Helpers ──
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