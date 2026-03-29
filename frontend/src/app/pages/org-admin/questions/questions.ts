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

  showModal = signal(false);
  modalLoading = signal(false);

  setType(type: string) {
  this.form.type = type as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE';
}

  form = {
    text: '',
    type: 'SINGLE_CHOICE' as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE',
    options: ['', ''],
    order: 0,
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

  openModal() {
    this.form = { text: '', type: 'SINGLE_CHOICE', options: ['', ''], order: this.questions().length + 1 };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
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

  addQuestion() {
    if (!this.form.text) {
      this.notificationService.show('Please enter a question', 'warning');
      return;
    }

    if (this.form.type !== 'SCALE' && this.form.options.some(o => !o.trim())) {
      this.notificationService.show('Please fill in all options', 'warning');
      return;
    }

    const payload = {
      text: this.form.text,
      type: this.form.type,
      options: this.form.type === 'SCALE' ? [] : this.form.options.filter(o => o.trim()),
      order: this.form.order,
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

  deleteQuestion(id: string) {
    this.deleting.set(id);
    this.orgAdminService.deleteQuestion(id).subscribe({
      next: () => {
        this.notificationService.show('Question deleted', 'success');
        this.deleting.set(null);
        this.loadQuestions();
      },
      error: () => {
        this.notificationService.show('Failed to delete question', 'error');
        this.deleting.set(null);
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
