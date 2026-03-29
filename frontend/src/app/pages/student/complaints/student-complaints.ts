import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../shared/services/student.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

const CATEGORIES = [
  { key: 'ROOMMATE_BEHAVIOR', label: 'Roommate Behavior', icon: 'fa-user-slash' },
  { key: 'ROOM_CONDITION', label: 'Room Condition', icon: 'fa-house-crack' },
  { key: 'NOISE', label: 'Noise', icon: 'fa-volume-high' },
  { key: 'OTHER', label: 'Other', icon: 'fa-circle-exclamation' },
];

@Component({
  selector: 'app-student-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-complaints.html',   // Make sure this file exists as complaints.html
})
export class StudentComplaintsComponent implements OnInit {
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);

  complaints = signal<any[]>([]);
  loading = signal(true);
  submitting = signal(false);
  showForm = signal(false);

  categories = CATEGORIES;
  form = { category: '', description: '' };

  ngOnInit() {
    this.loadComplaints();
  }

  loadComplaints() {
    this.loading.set(true);
    this.studentService.getMyComplaints().subscribe({
      next: (data) => {
        this.complaints.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openForm() {
    this.form = { category: '', description: '' };
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  submit() {
    if (!this.form.category) {
      this.notificationService.show('Please select a category', 'warning');
      return;
    }
    if (this.form.description.trim().length < 10) {
      this.notificationService.show('Please provide at least 10 characters in your description', 'warning');
      return;
    }

    this.submitting.set(true);
    this.studentService.submitComplaint({
      category: this.form.category,
      description: this.form.description.trim(),
    }).subscribe({
      next: () => {
        this.notificationService.show('Complaint submitted successfully', 'success');
        this.closeForm();
        this.loadComplaints();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to submit complaint', 'error');
        this.submitting.set(false);
      },
    });
  }

  categoryLabel(key: string): string {
    return CATEGORIES.find(c => c.key === key)?.label ?? key;
  }

  categoryIcon(key: string): string {
    return CATEGORIES.find(c => c.key === key)?.icon ?? 'fa-circle-exclamation';
  }
}
