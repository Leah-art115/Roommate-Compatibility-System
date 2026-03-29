import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrgAdminService } from '../../../shared/services/org-admin.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-switch-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './switch-requests.html',
})
export class SwitchRequestsComponent implements OnInit {
  private orgAdminService = inject(OrgAdminService);
  private notificationService = inject(NotificationService);

  requests = signal<any[]>([]);
  loading = signal(true);
  processing = signal<string | null>(null);

  filter = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  filters: { key: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  // Reject modal
  showRejectModal = signal(false);
  selectedRequestId = signal<string | null>(null);
  rejectionReason = '';

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading.set(true);
    this.orgAdminService.getSwitchRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load switch requests', 'error');
        this.loading.set(false);
      },
    });
  }

  get filteredRequests() {
    const f = this.filter();
    if (f === 'ALL') return this.requests();
    return this.requests().filter(r => r.status === f);
  }

  setFilter(f: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') {
    this.filter.set(f);
  }

  approve(id: string) {
    this.processing.set(id);
    this.orgAdminService.approveSwitchRequest(id).subscribe({
      next: () => {
        this.notificationService.show('Switch request approved', 'success');
        this.processing.set(null);
        this.loadRequests();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to approve', 'error');
        this.processing.set(null);
      },
    });
  }

  openRejectModal(id: string) {
    this.selectedRequestId.set(id);
    this.rejectionReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
    this.selectedRequestId.set(null);
  }

  confirmReject() {
    if (!this.rejectionReason.trim()) {
      this.notificationService.show('Please provide a rejection reason', 'warning');
      return;
    }

    const id = this.selectedRequestId();
    if (!id) return;

    this.processing.set(id);
    this.orgAdminService.rejectSwitchRequest(id, this.rejectionReason).subscribe({
      next: () => {
        this.notificationService.show('Switch request rejected', 'success');
        this.processing.set(null);
        this.closeRejectModal();
        this.loadRequests();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to reject', 'error');
        this.processing.set(null);
      },
    });
  }

  genderColor(gender: string): string {
    return gender === 'female' ? 'var(--color-female-primary)' : 'var(--color-male-primary)';
  }

  statusColor(status: string): string {
    if (status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-600';
    return 'bg-yellow-100 text-yellow-700';
  }

  statusIcon(status: string): string {
    if (status === 'APPROVED') return 'fa-circle-check';
    if (status === 'REJECTED') return 'fa-circle-xmark';
    return 'fa-clock';
  }
}