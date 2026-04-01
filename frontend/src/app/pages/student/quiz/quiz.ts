import { Component, inject, OnInit, signal } from '@angular/core';
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

  currentIndex = signal(0);

  answers = signal<Record<string, string | string[]>>({});

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
    if (this.questions().length === 0) return 0;
    const answered = this.questions().filter(q => {
      const a = this.answers()[q.id];
      if (!a) return false;
      if (Array.isArray(a)) return a.length > 0;
      return a.toString().trim() !== '';
    }).length;
    return Math.round((answered / this.questions().length) * 100);
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
    const currentQ = this.currentQuestion;
    if (!currentQ) return false;
    const a = this.answers()[currentQ.id];
    if (!a) return false;
    if (Array.isArray(a)) return a.length > 0;
    return a.toString().trim() !== '';
  }

  selectSingle(option: string) {
    const q = this.currentQuestion;
    const newAnswers = { ...this.answers(), [q.id]: option };
    this.answers.set(newAnswers);
  }

  toggleMultiple(option: string) {
    const q = this.currentQuestion;
    const current = (this.answers()[q.id] as string[]) ?? [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    const newAnswers = { ...this.answers(), [q.id]: updated };
    this.answers.set(newAnswers);
  }

  isSelected(option: string): boolean {
    const currentQ = this.currentQuestion;
    if (!currentQ) return false;
    const a = this.answers()[currentQ.id];
    if (Array.isArray(a)) return a.includes(option);
    return a === option;
  }

  selectScale(value: number) {
    const q = this.currentQuestion;
    const newAnswers = { ...this.answers(), [q.id]: value.toString() };
    this.answers.set(newAnswers);
  }

  get scaleValue(): number {
    const currentQ = this.currentQuestion;
    if (!currentQ) return 0;
    const a = this.answers()[currentQ.id];
    return a ? parseInt(a as string, 10) : 0;
  }

  get scaleLabels(): Record<number, string> {
    const q = this.currentQuestion;
    if (!q || q.type !== 'SCALE') return {};
    const min = q.scaleMin || 'Strongly Disagree';
    const max = q.scaleMax || 'Strongly Agree';
    return {
      1: min,
      2: '',
      3: 'Neutral',
      4: '',
      5: max,
    };
  }

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
