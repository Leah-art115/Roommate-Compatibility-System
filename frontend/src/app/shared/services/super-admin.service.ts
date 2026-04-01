import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000';

  getStats() {
    return this.http.get<any>(`${this.api}/super-admin/stats`);
  }

  // Organizations
  getOrganizations() {
    return this.http.get<any[]>(`${this.api}/super-admin/organizations`);
  }

  getOrganization(id: string) {
    return this.http.get<any>(`${this.api}/super-admin/organizations/${id}`);
  }

  createOrganization(data: { name: string; type: string }) {
    return this.http.post(`${this.api}/super-admin/organizations`, data);
  }

  deleteOrganization(id: string) {
    return this.http.delete(`${this.api}/super-admin/organizations/${id}`);
  }

  // Org Admins
  getOrgAdmins() {
    return this.http.get<any[]>(`${this.api}/super-admin/org-admins`);
  }

  createOrgAdmin(data: {
    name: string;
    email: string;
    organizationId: string;
    temporaryPassword: string;
  }) {
    return this.http.post(`${this.api}/super-admin/org-admins`, data);
  }

  deleteOrgAdmin(id: string) {
    return this.http.delete(`${this.api}/super-admin/org-admins/${id}`);
  }
}
