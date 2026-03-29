import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OrgAdminService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000';

  // Students
  getStudents() {
    return this.http.get<any[]>(`${this.api}/org-admin/students`);
  }

  addStudent(data: { name: string; email: string; gender: string }) {
    return this.http.post(`${this.api}/org-admin/students`, data);
  }

  deleteStudent(id: string) {
    return this.http.delete(`${this.api}/org-admin/students/${id}`);
  }

  sendInviteToOne(id: string) {
    return this.http.post(`${this.api}/org-admin/invites/send/${id}`, {});
  }

  sendInvitesToAll() {
    return this.http.post(`${this.api}/org-admin/invites/send-all`, {});
  }

  // Rooms
  getRooms() {
    return this.http.get<any[]>(`${this.api}/rooms/admin`);
  }

  createRoom(data: { roomNumber: string; block?: string; capacity?: number; gender?: string }) {
    return this.http.post(`${this.api}/rooms`, data);
  }

  createRoomsBulk(rooms: any[]) {
    return this.http.post(`${this.api}/rooms/bulk`, { rooms });
  }

  deleteRoom(id: string) {
    return this.http.delete(`${this.api}/rooms/${id}`);
  }

  // Questions
  getQuestions() {
    return this.http.get<any[]>(`${this.api}/questions/admin`);
  }

  createQuestion(data: { text: string; type: string; options: string[]; order?: number }) {
    return this.http.post(`${this.api}/questions`, data);
  }

  deleteQuestion(id: string) {
    return this.http.delete(`${this.api}/questions/${id}`);
  }

  // Switch Requests
  getSwitchRequests() {
    return this.http.get<any[]>(`${this.api}/rooms/switch-requests`);
  }

  approveSwitchRequest(id: string) {
    return this.http.put(`${this.api}/rooms/switch-requests/${id}/approve`, {});
  }

  rejectSwitchRequest(id: string, rejectionReason: string) {
    return this.http.put(`${this.api}/rooms/switch-requests/${id}/reject`, { rejectionReason });
  }

  // Complaints
  getComplaints() {
    return this.http.get<any[]>(`${this.api}/complaints/admin`);
  }

  resolveComplaint(id: string) {
    return this.http.put(`${this.api}/complaints/${id}/resolve`, {});
  }
}