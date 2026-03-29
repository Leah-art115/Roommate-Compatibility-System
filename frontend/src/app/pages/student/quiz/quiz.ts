import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../../../shared/services/student.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-student-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  currentIndex = signal(0);

  // answers map: questionId -> string (single/scale) or string[] (multiple)
  answers = signal<Record<string, string | string[]>>({});

  ngOnInit() {
    // Check if already answered
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
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load questions', 'error');
        this.loading.set(false);
      },
    });
  }

  get currentQuestion(): any {
    return this.questions()[this.currentIndex()];
  }

  get progress(): number {
    return Math.round(((this.currentIndex() + 1) / this.questions().length) * 100);
  }

  get isFirst(): boolean {
    return this.currentIndex() === 0;
  }

  get isLast(): boolean {
    return this.currentIndex() === this.questions().length - 1;
  }

  get currentAnswer(): string | string[] | undefined {
    return this.answers()[this.currentQuestion?.id];
  }

  get canProceed(): boolean {
    const a = this.currentAnswer;
    if (!a) return false;
    if (Array.isArray(a)) return a.length > 0;
    return a.toString().trim() !== '';
  }

  // Single choice
  selectSingle(option: string) {
    const q = this.currentQuestion;
    this.answers.update(a => ({ ...a, [q.id]: option }));
  }

  // Multiple choice
  toggleMultiple(option: string) {
    const q = this.currentQuestion;
    const current = (this.answers()[q.id] as string[]) ?? [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    this.answers.update(a => ({ ...a, [q.id]: updated }));
  }

  isSelected(option: string): boolean {
    const a = this.currentAnswer;
    if (Array.isArray(a)) return a.includes(option);
    return a === option;
  }

  // Scale
  selectScale(value: number) {
    const q = this.currentQuestion;
    this.answers.update(a => ({ ...a, [q.id]: value.toString() }));
  }

  get scaleValue(): number {
    const a = this.currentAnswer;
    return a ? parseInt(a as string, 10) : 0;
  }

  scaleLabels: Record<number, string> = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree',
  };

  next() {
    if (!this.isLast) {
      this.currentIndex.update(i => i + 1);
    }
  }

  back() {
    if (!this.isFirst) {
      this.currentIndex.update(i => i - 1);
    }
  }

  get allAnswered(): boolean {
    return this.questions().every(q => {
      const a = this.answers()[q.id];
      if (!a) return false;
      if (Array.isArray(a)) return a.length > 0;
      return a.toString().trim() !== '';
    });
  }

  submit() {
    if (!this.allAnswered) {
      this.notificationService.show('Please answer all questions before submitting', 'warning');
      return;
    }

    this.submitting.set(true);

    const payload: { questionId: string; answer: string }[] = [];

    for (const [questionId, answer] of Object.entries(this.answers())) {
      if (Array.isArray(answer)) {
        // Multiple choice — join as comma-separated
        payload.push({ questionId, answer: answer.join(',') });
      } else {
        payload.push({ questionId, answer: answer as string });
      }
    }

    this.studentService.submitAnswers(payload).subscribe({
      next: () => {
        this.notificationService.show('Quiz submitted! You can now browse rooms.', 'success');
        this.router.navigate(['/student/rooms']);
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to submit quiz', 'error');
        this.submitting.set(false);
      },
    });
  }
}
