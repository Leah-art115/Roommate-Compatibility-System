import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminService } from '../../../shared/services/super-admin.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-org-admins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './org-admins.html',
})
export class OrgAdminsComponent implements OnInit {
  private superAdminService = inject(SuperAdminService);
  private notificationService = inject(NotificationService);

  admins = signal<any[]>([]);
  organizations = signal<any[]>([]);
  loading = signal(true);
  deleting = signal<string | null>(null);

  showModal = signal(false);
  modalLoading = signal(false);
  showPassword = signal(false);

  form = {
    name: '',
    email: '',
    organizationId: '',
    temporaryPassword: '',
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.superAdminService.getOrgAdmins().subscribe({
      next: (data) => {
        this.admins.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Failed to load admins', 'error');
        this.loading.set(false);
      },
    });

    this.superAdminService.getOrganizations().subscribe({
      next: (data) => this.organizations.set(data),
      error: () => {},
    });
  }

  openModal() {
    this.form = { name: '', email: '', organizationId: '', temporaryPassword: '' };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  createAdmin() {
    if (!this.form.name || !this.form.email || !this.form.organizationId || !this.form.temporaryPassword) {
      this.notificationService.show('Please fill in all fields', 'warning');
      return;
    }

    this.modalLoading.set(true);
    this.superAdminService.createOrgAdmin(this.form).subscribe({
      next: () => {
        this.notificationService.show('Org admin created successfully', 'success');
        this.closeModal();
        this.loadData();
        this.modalLoading.set(false);
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to create admin', 'error');
        this.modalLoading.set(false);
      },
    });
  }

  deleteAdmin(id: string) {
    this.deleting.set(id);
    this.superAdminService.deleteOrgAdmin(id).subscribe({
      next: () => {
        this.notificationService.show('Admin deleted', 'success');
        this.deleting.set(null);
        this.loadData();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to delete admin', 'error');
        this.deleting.set(null);
      },
    });
  }

  orgName(orgId: string): string {
    return this.organizations().find(o => o.id === orgId)?.name || 'Unknown';
  }
}