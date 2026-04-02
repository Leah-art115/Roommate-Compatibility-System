import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrgAdminService } from '../../../shared/services/org-admin.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questions.html',
})
export class QuestionsComponent implements OnInit {
  private orgAdminService = inject(OrgAdminService);
  private notificationService = inject(NotificationService);

  questions = signal<any[]>([]);
  loading = signal(true);
  deleting = signal<string | null>(null);

  // Add / Edit modal
  showModal = signal(false);
  modalLoading = signal(false);
  editingId = signal<string | null>(null);

  // Delete confirmation modal
  showDeleteModal = signal(false);
  questionToDelete = signal<{ id: string; text: string } | null>(null);

  form = {
    text: '',
    type: 'SINGLE_CHOICE' as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE',
    options: ['', ''],
    order: 0,
    scaleMin: '',
    scaleMax: '',
  };

  questionTypes = [
    { key: 'SINGLE_CHOICE', label: 'Single Choice', icon: 'fa-circle-dot' },
    { key: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: 'fa-square-check' },
    { key: 'SCALE', label: 'Scale', icon: 'fa-sliders' },
  ];

  ngOnInit() {
    this.loadQuestions();
  }

  loadQuestions() {
    this.loading.set(true);
    this.orgAdminService.getQuestions().subscribe({
      next: (data) => {
        this.questions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load questions', 'error');
        this.loading.set(false);
      },
    });
  }

  // ── Add / Edit Modal ──
  openModal() {
    this.editingId.set(null);
    this.form = {
      text: '',
      type: 'SINGLE_CHOICE',
      options: ['', ''],
      order: this.questions().length + 1,
      scaleMin: '',
      scaleMax: '',
    };
    this.showModal.set(true);
  }

  openEditModal(question: any) {
    this.editingId.set(question.id);
    this.form = {
      text: question.text,
      type: question.type,
      options: question.type !== 'SCALE' && question.options?.length
        ? [...question.options]
        : ['', ''],
      order: question.order ?? 0,
      scaleMin: question.scaleMin ?? '',
      scaleMax: question.scaleMax ?? '',
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  get isEditing(): boolean {
    return this.editingId() !== null;
  }

  setType(type: string) {
    this.form.type = type as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE';
  }

  addOption() {
    this.form.options.push('');
  }

  removeOption(index: number) {
    if (this.form.options.length > 2) {
      this.form.options.splice(index, 1);
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  private validateForm(): boolean {
    if (!this.form.text.trim()) {
      this.notificationService.show('Please enter a question', 'warning');
      return false;
    }
    if (this.form.type === 'SCALE') {
      if (!this.form.scaleMin.trim() || !this.form.scaleMax.trim()) {
        this.notificationService.show('Please enter labels for both ends of the scale', 'warning');
        return false;
      }
    } else {
      if (this.form.options.some(o => !o.trim())) {
        this.notificationService.show('Please fill in all options', 'warning');
        return false;
      }
    }
    return true;
  }

  addQuestion() {
    if (!this.validateForm()) return;

    const payload = {
      text: this.form.text,
      type: this.form.type,
      options: this.form.type === 'SCALE' ? [] : this.form.options.filter(o => o.trim()),
      order: this.form.order,
      scaleMin: this.form.type === 'SCALE' ? this.form.scaleMin : undefined,
      scaleMax: this.form.type === 'SCALE' ? this.form.scaleMax : undefined,
    };

    this.modalLoading.set(true);
    this.orgAdminService.createQuestion(payload).subscribe({
      next: () => {
        this.notificationService.show('Question added successfully', 'success');
        this.closeModal();
        this.loadQuestions();
        this.modalLoading.set(false);
      },
      error: (err) => {
        this.modalLoading.set(false);
        this.notificationService.show(err?.error?.message || 'Failed to add question', 'error');
      },
    });
  }

  saveEdit() {
    if (!this.validateForm()) return;

    const id = this.editingId();
    if (!id) return;

    const payload = {
      text: this.form.text,
      options: this.form.type === 'SCALE' ? [] : this.form.options.filter(o => o.trim()),
      order: this.form.order,
      scaleMin: this.form.type === 'SCALE' ? this.form.scaleMin : undefined,
      scaleMax: this.form.type === 'SCALE' ? this.form.scaleMax : undefined,
    };

    this.modalLoading.set(true);
    this.orgAdminService.updateQuestion(id, payload).subscribe({
      next: () => {
        this.notificationService.show('Question updated successfully', 'success');
        this.closeModal();
        this.loadQuestions();
        this.modalLoading.set(false);
      },
      error: (err) => {
        this.modalLoading.set(false);
        this.notificationService.show(err?.error?.message || 'Failed to update question', 'error');
      },
    });
  }

  // ── Delete Confirmation ──
  confirmDelete(id: string, text: string) {
    this.questionToDelete.set({ id, text });
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.questionToDelete.set(null);
    this.showDeleteModal.set(false);
  }

  deleteQuestion() {
    const target = this.questionToDelete();
    if (!target) return;

    this.deleting.set(target.id);
    this.showDeleteModal.set(false);

    this.orgAdminService.deleteQuestion(target.id).subscribe({
      next: () => {
        this.notificationService.show('Question deleted', 'success');
        this.deleting.set(null);
        this.questionToDelete.set(null);
        this.loadQuestions();
      },
      error: () => {
        this.notificationService.show('Failed to delete question', 'error');
        this.deleting.set(null);
        this.questionToDelete.set(null);
      },
    });
  }

  typeLabel(type: string) {
    return this.questionTypes.find(t => t.key === type)?.label || type;
  }

  typeIcon(type: string) {
    return this.questionTypes.find(t => t.key === type)?.icon || 'fa-question';
  }
}