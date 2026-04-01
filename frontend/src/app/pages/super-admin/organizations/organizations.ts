import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminService } from '../../../shared/services/super-admin.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organizations.html',
})
export class OrganizationsComponent implements OnInit {
  private superAdminService = inject(SuperAdminService);
  private notificationService = inject(NotificationService);

  organizations = signal<any[]>([]);
  loading = signal(true);
  deleting = signal<string | null>(null);

  showModal = signal(false);
  modalLoading = signal(false);
  form = { name: '', type: '' };

  orgTypes = [
    { key: 'SCHOOL', label: 'School', icon: 'fa-school' },
    { key: 'HOSTEL', label: 'Hostel', icon: 'fa-building' },
    { key: 'CAMP', label: 'Camp', icon: 'fa-campground' },
  ];

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.loading.set(true);
    this.superAdminService.getOrganizations().subscribe({
      next: (data) => {
        this.organizations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load organizations', 'error');
        this.loading.set(false);
      },
    });
  }

  openModal() {
    this.form = { name: '', type: '' };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  setType(type: string) {
    this.form.type = type;
  }

  createOrganization() {
    if (!this.form.name || !this.form.type) {
      this.notificationService.show('Please fill in all fields', 'warning');
      return;
    }

    this.modalLoading.set(true);
    this.superAdminService.createOrganization(this.form).subscribe({
      next: () => {
        this.notificationService.show('Organization created successfully', 'success');
        this.closeModal();
        this.loadOrganizations();
        this.modalLoading.set(false);
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to create organization', 'error');
        this.modalLoading.set(false);
      },
    });
  }

  deleteOrganization(id: string) {
    this.deleting.set(id);
    this.superAdminService.deleteOrganization(id).subscribe({
      next: () => {
        this.notificationService.show('Organization deleted', 'success');
        this.deleting.set(null);
        this.loadOrganizations();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to delete organization', 'error');
        this.deleting.set(null);
      },
    });
  }

  typeLabel(type: string): string {
    return this.orgTypes.find(t => t.key === type)?.label || type;
  }

  typeIcon(type: string): string {
    return this.orgTypes.find(t => t.key === type)?.icon || 'fa-building';
  }

  typeColor(type: string): string {
    if (type === 'SCHOOL') return '#eff6ff';
    if (type === 'HOSTEL') return '#f0fdf4';
    return '#fef9c3';
  }

  typeTextColor(type: string): string {
    if (type === 'SCHOOL') return '#1d4ed8';
    if (type === 'HOSTEL') return '#16a34a';
    return '#ca8a04';
  }
}