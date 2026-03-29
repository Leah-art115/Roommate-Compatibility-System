import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrgAdminService } from '../../../shared/services/org-admin.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.html',
})
export class OverviewComponent implements OnInit {
  private orgAdminService = inject(OrgAdminService);

  students = signal<any[]>([]);
  rooms = signal<any[]>([]);
  questions = signal<any[]>([]);
  switchRequests = signal<any[]>([]);
  complaints = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.orgAdminService.getStudents().subscribe({
      next: (data) => this.students.set(data),
    });

    this.orgAdminService.getRooms().subscribe({
      next: (data) => this.rooms.set(data),
    });

    this.orgAdminService.getQuestions().subscribe({
      next: (data) => this.questions.set(data),
    });

    this.orgAdminService.getSwitchRequests().subscribe({
      next: (data) => this.switchRequests.set(data),
    });

    this.orgAdminService.getComplaints().subscribe({
      next: (data) => {
        this.complaints.set(data);
        this.loading.set(false);
      },
    });
  }

  get totalStudents() { return this.students().length; }
  get allocatedStudents() { return this.students().filter(s => s.status === 'ACCEPTED').length; }
  get totalRooms() { return this.rooms().length; }
  get fullRooms() { return this.rooms().filter(r => r.isFull).length; }
  get availableRooms() { return this.rooms().filter(r => !r.isFull).length; }
  get pendingSwitchRequests() { return this.switchRequests().filter(r => r.status === 'PENDING').length; }
  get openComplaints() { return this.complaints().filter(c => c.status === 'OPEN').length; }
}