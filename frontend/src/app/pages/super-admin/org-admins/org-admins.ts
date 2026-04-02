import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  admins = signal<any[]>([]);
  organizations = signal<any[]>([]);
  loading = signal(true);
  deleting = signal<string | null>(null);

  // Add admin modal
  showModal = signal(false);
  modalLoading = signal(false);
  showPassword = signal(false);

  form = {
    name: '',
    email: '',
    organizationId: '',
    temporaryPassword: '',
  };

  // Delete confirmation modal
  showDeleteModal = signal(false);
  adminToDelete = signal<{ id: string; name: string; orgName: string } | null>(null);

  ngOnInit() {
    this.loadData();
    // If arriving from the organizations page shortcut, auto-open modal with org pre-selected
    this.route.queryParams.subscribe(params => {
      if (params['orgId']) {
        // Wait for organizations to load first
        const check = setInterval(() => {
          if (this.organizations().length > 0) {
            clearInterval(check);
            this.openModal(params['orgId']);
          }
        }, 100);
      }
    });
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

  openModal(preselectedOrgId?: string) {
    this.form = {
      name: '',
      email: '',
      organizationId: preselectedOrgId ?? '',
      temporaryPassword: '',
    };
    this.showPassword.set(false);
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
        this.notificationService.show('Org admin created and welcome email sent', 'success');
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

  // Delete confirmation
  confirmDelete(id: string, name: string, orgName: string) {
    this.adminToDelete.set({ id, name, orgName });
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.adminToDelete.set(null);
    this.showDeleteModal.set(false);
  }

  deleteAdmin() {
    const target = this.adminToDelete();
    if (!target) return;

    this.deleting.set(target.id);
    this.showDeleteModal.set(false);

    this.superAdminService.deleteOrgAdmin(target.id).subscribe({
      next: () => {
        this.notificationService.show('Admin deleted', 'success');
        this.deleting.set(null);
        this.adminToDelete.set(null);
        this.loadData();
      },
      error: (err) => {
        this.notificationService.show(err?.error?.message || 'Failed to delete admin', 'error');
        this.deleting.set(null);
        this.adminToDelete.set(null);
      },
    });
  }

  orgName(orgId: string): string {
    return this.organizations().find(o => o.id === orgId)?.name || 'Unknown';
  }
}