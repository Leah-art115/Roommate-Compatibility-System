import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StudentService } from '../../../shared/services/student.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-student-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quiz.html',
})
export class StudentQuizComponent implements OnInit {
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  questions = signal<any[]>([]);
  loading = signal(true);
  submitting = signal(false);
  alreadySubmitted = signal(false);
  warningAcknowledged = signal(false);

  currentIndex = signal(0);
  answers = signal<Record<string, string | string[]>>({});
  weights = signal<Record<string, number>>({});

  weightOptions = [
    { value: 1, label: 'Not important', icon: 'fa-circle-minus' },
    { value: 2, label: 'Somewhat important', icon: 'fa-circle-half-stroke' },
    { value: 3, label: 'Important', icon: 'fa-circle-dot' },
    { value: 4, label: 'Very important', icon: 'fa-circle' },
  ];

  scaleValues = [1, 2, 3, 4, 5];

  // computed so Angular tracks signal dependencies properly
  currentQuestion = computed(() => this.questions()[this.currentIndex()]);

  canProceed = computed(() => {
    const q = this.currentQuestion();
    if (!q) return false;
    const a = this.answers()[q.id];
    if (!a) return false;
    if (Array.isArray(a)) return a.length > 0;
    return a.toString().trim() !== '';
  });

  isLast = computed(() => this.currentIndex() === this.questions().length - 1);
  isFirst = computed(() => this.currentIndex() === 0);

  progress = computed(() => {
    const qs = this.questions();
    if (qs.length === 0) return 0;
    const answered = qs.filter(q => {
      const a = this.answers()[q.id];
      if (!a) return false;
      if (Array.isArray(a)) return a.length > 0;
      return a.toString().trim() !== '';
    }).length;
    return Math.round((answered / qs.length) * 100);
  });

  allAnswered = computed(() =>
    this.questions().every(q => {
      const a = this.answers()[q.id];
      if (!a) return false;
      if (Array.isArray(a)) return a.length > 0;
      return a.toString().trim() !== '';
    })
  );

  scaleValue = computed(() => {
    const q = this.currentQuestion();
    if (!q) return 0;
    const a = this.answers()[q.id];
    return a ? parseInt(a as string, 10) : 0;
  });

  scaleLabels = computed(() => {
    const q = this.currentQuestion();
    if (!q || q.type !== 'SCALE') return {} as Record<number, string>;
    const min = q.scaleMin || 'Strongly Disagree';
    const max = q.scaleMax || 'Strongly Agree';
    return { 1: min, 2: '', 3: 'Neutral', 4: '', 5: max } as Record<number, string>;
  });

  ngOnInit() {
    this.studentService.getMyAnswers().subscribe({
      next: (existing) => {
        if (existing.length > 0) {
          this.alreadySubmitted.set(true);
          this.loading.set(false);
          return;
        }
        this.loadQuestions();
      },
      error: () => this.loadQuestions(),
    });
  }

  loadQuestions() {
    this.studentService.getQuestions().subscribe({
      next: (data) => {
        this.questions.set(data);
        const defaultWeights: Record<string, number> = {};
        data.forEach((q: any) => defaultWeights[q.id] = 2);
        this.weights.set(defaultWeights);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load questions', 'error');
        this.loading.set(false);
      },
    });
  }

  acknowledgeWarning() {
    this.warningAcknowledged.set(true);
  }

  isSelected(option: string): boolean {
    const q = this.currentQuestion();
    if (!q) return false;
    const a = this.answers()[q.id];
    if (Array.isArray(a)) return a.includes(option);
    return a === option;
  }

  selectSingle(option: string) {
    const q = this.currentQuestion();
    this.answers.set({ ...this.answers(), [q.id]: option });
  }

  toggleMultiple(option: string) {
    const q = this.currentQuestion();
    const current = (this.answers()[q.id] as string[]) ?? [];
    const updated = current.includes(option)
      ? current.filter((o: string) => o !== option)
      : [...current, option];
    this.answers.set({ ...this.answers(), [q.id]: updated });
  }

  selectScale(value: number) {
    const q = this.currentQuestion();
    this.answers.set({ ...this.answers(), [q.id]: value.toString() });
  }

  setWeight(questionId: string, weight: number) {
    this.weights.set({ ...this.weights(), [questionId]: weight });
  }

  getWeight(questionId: string): number {
    return this.weights()[questionId] ?? 2;
  }

  next() { if (!this.isLast()) this.currentIndex.update(i => i + 1); }
  back() { if (!this.isFirst()) this.currentIndex.update(i => i - 1); }

  submit() {
    if (!this.allAnswered()) {
      this.notificationService.show('Please answer all questions before submitting', 'warning');
      return;
    }

    this.submitting.set(true);

    const payload: { questionId: string; answer: string }[] = [];
    for (const [questionId, answer] of Object.entries(this.answers())) {
      if (Array.isArray(answer)) {
        payload.push({ questionId, answer: answer.join(',') });
      } else {
        payload.push({ questionId, answer: answer as string });
      }
    }

    const weightPayload = Object.entries(this.weights()).map(([questionId, weight]) => ({
      questionId,
      weight,
    }));

    this.studentService.submitAnswers(payload, weightPayload).subscribe({
      next: () => {
        this.notificationService.show('Quiz submitted! You can now browse rooms.', 'success');
        this.router.navigate(['/student/rooms']);
      },
      error: (err: any) => {
        this.notificationService.show(err?.error?.message || 'Failed to submit quiz', 'error');
        this.submitting.set(false);
      },
    });
  }
}
