import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrgAdminService } from '../../../shared/services/org-admin.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
})
export class StudentsComponent implements OnInit {
  private orgAdminService = inject(OrgAdminService);
  private notificationService = inject(NotificationService);

  students = signal<any[]>([]);
  loading = signal(true);
  sending = signal<string | null>(null);
  sendingAll = signal(false);
  deleting = signal<string | null>(null);

  filters: { key: 'ALL' | 'ACCEPTED' | 'PENDING' | 'ALLOCATED' | 'FEMALE' | 'MALE'; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'ACCEPTED', label: 'Registered' },
    { key: 'ALLOCATED', label: 'Has Room' },
    { key: 'FEMALE', label: 'Girls' },
    { key: 'MALE', label: 'Boys' },
  ];

  filter = signal<'ALL' | 'ACCEPTED' | 'PENDING' | 'ALLOCATED' | 'FEMALE' | 'MALE'>('ALL');

  // Add Student Modal
  showModal = signal(false);
  modalLoading = signal(false);
  form = { name: '', email: '', gender: '' };

  // Delete Confirmation Modal
  showDeleteModal = signal(false);
  studentToDelete = signal<{ id: string; name: string } | null>(null);

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading.set(true);
    this.orgAdminService.getStudents().subscribe({
      next: (data) => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load students', 'error');
        this.loading.set(false);
      },
    });
  }

  get filteredStudents() {
    const f = this.filter();
    if (f === 'ACCEPTED') return this.students().filter(s => s.status === 'ACCEPTED');
    if (f === 'PENDING') return this.students().filter(s => s.status === 'PENDING');
    if (f === 'ALLOCATED') return this.students().filter(s => s.hasRoom === true);
    if (f === 'FEMALE') return this.students().filter(s => s.gender === 'female');
    if (f === 'MALE') return this.students().filter(s => s.gender === 'male');
    return this.students();
  }

  setFilter(f: 'ALL' | 'ACCEPTED' | 'PENDING' | 'ALLOCATED' | 'FEMALE' | 'MALE') {
    this.filter.set(f);
  }

  // Add Student Modal
  openModal() {
    this.form = { name: '', email: '', gender: '' };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  addStudent() {
    if (!this.form.name || !this.form.email || !this.form.gender) {
      this.notificationService.show('Please fill in all fields', 'warning');
      return;
    }

    this.modalLoading.set(true);
    this.orgAdminService.addStudent(this.form).subscribe({
      next: () => {
        this.notificationService.show('Student added successfully', 'success');
        this.closeModal();
        this.loadStudents();
        this.modalLoading.set(false);
      },
      error: (err) => {
        this.modalLoading.set(false);
        const message = err?.error?.message || 'Failed to add student';
        this.notificationService.show(message, 'error');
      },
    });
  }

  // Delete Confirmation
  confirmDelete(id: string, name: string) {
    this.studentToDelete.set({ id, name });
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.studentToDelete.set(null);
    this.showDeleteModal.set(false);
  }

  deleteStudent() {
    const target = this.studentToDelete();
    if (!target) return;

    this.deleting.set(target.id);
    this.showDeleteModal.set(false);

    this.orgAdminService.deleteStudent(target.id).subscribe({
      next: () => {
        this.notificationService.show('Student removed', 'success');
        this.deleting.set(null);
        this.studentToDelete.set(null);
        this.loadStudents();
      },
      error: () => {
        this.notificationService.show('Failed to remove student', 'error');
        this.deleting.set(null);
        this.studentToDelete.set(null);
      },
    });
  }

  sendInvite(id: string) {
    this.sending.set(id);
    this.orgAdminService.sendInviteToOne(id).subscribe({
      next: () => {
        this.notificationService.show('Invite sent successfully', 'success');
        this.sending.set(null);
        this.loadStudents();
      },
      error: () => {
        this.notificationService.show('Failed to send invite', 'error');
        this.sending.set(null);
      },
    });
  }

  sendAllInvites() {
    this.sendingAll.set(true);
    this.orgAdminService.sendInvitesToAll().subscribe({
      next: (res: any) => {
        this.notificationService.show(res.message || 'Invites sent!', 'success');
        this.sendingAll.set(false);
        this.loadStudents();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to send invites', 'error');
        this.sendingAll.set(false);
      },
    });
  }

  genderIcon(gender: string) {
    return gender === 'female' ? 'fa-venus' : 'fa-mars';
  }

  genderColor(gender: string) {
    return gender === 'female' ? 'var(--color-female-primary)' : 'var(--color-male-primary)';
  }
}