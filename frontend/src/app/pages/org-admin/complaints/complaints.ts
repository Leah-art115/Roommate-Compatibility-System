import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgAdminService } from '../../../shared/services/org-admin.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complaints.html',
})
export class ComplaintsComponent implements OnInit {
  private orgAdminService = inject(OrgAdminService);
  private notificationService = inject(NotificationService);

  complaints = signal<any[]>([]);
  loading = signal(true);
  resolving = signal<string | null>(null);

  filter = signal<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  filters: { key: 'ALL' | 'OPEN' | 'RESOLVED'; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'OPEN', label: 'Open' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  ngOnInit() {
    this.loadComplaints();
  }

  loadComplaints() {
    this.loading.set(true);
    this.orgAdminService.getComplaints().subscribe({
      next: (data) => {
        this.complaints.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load complaints', 'error');
        this.loading.set(false);
      },
    });
  }

  get filteredComplaints() {
    const f = this.filter();
    if (f === 'OPEN') return this.complaints().filter(c => c.status === 'OPEN');
    if (f === 'RESOLVED') return this.complaints().filter(c => c.status === 'RESOLVED');
    return this.complaints();
  }

  setFilter(f: 'ALL' | 'OPEN' | 'RESOLVED') {
    this.filter.set(f);
  }

  resolve(id: string) {
    this.resolving.set(id);
    this.orgAdminService.resolveComplaint(id).subscribe({
      next: () => {
        this.notificationService.show('Complaint marked as resolved', 'success');
        this.resolving.set(null);
        this.loadComplaints();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to resolve complaint', 'error');
        this.resolving.set(null);
      },
    });
  }

  categoryLabel(category: string): string {
    const labels: Record<string, string> = {
      ROOMMATE_BEHAVIOR: 'Roommate Behavior',
      ROOM_CONDITION: 'Room Condition',
      NOISE: 'Noise',
      OTHER: 'Other',
    };
    return labels[category] || category;
  }

  categoryIcon(category: string): string {
    const icons: Record<string, string> = {
      ROOMMATE_BEHAVIOR: 'fa-user-slash',
      ROOM_CONDITION: 'fa-house-crack',
      NOISE: 'fa-volume-high',
      OTHER: 'fa-circle-exclamation',
    };
    return icons[category] || 'fa-circle-exclamation';
  }

  categoryColor(category: string): string {
    const colors: Record<string, string> = {
      ROOMMATE_BEHAVIOR: 'bg-purple-100 text-purple-700',
      ROOM_CONDITION: 'bg-orange-100 text-orange-700',
      NOISE: 'bg-yellow-100 text-yellow-700',
      OTHER: 'bg-gray-100 text-gray-600',
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  }

  genderColor(gender: string): string {
    return gender === 'female' ? 'var(--color-female-primary)' : 'var(--color-male-primary)';
  }

  timeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}