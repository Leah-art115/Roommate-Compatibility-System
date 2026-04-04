import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000';

  getQuestions() {
    return this.http.get<any[]>(`${this.api}/questions/my`);
  }

  submitAnswers(
    answers: { questionId: string; answer: string }[],
    weights: { questionId: string; weight: number }[],
  ) {
    return this.http.post(`${this.api}/questions/submit`, { answers, weights });
  }

  getMyAnswers() {
    return this.http.get<any[]>(`${this.api}/questions/my-answers`);
  }

  getAvailableRooms() {
    return this.http.get<any[]>(`${this.api}/rooms/available`);
  }

  bookRoom(roomId: string) {
    return this.http.post(`${this.api}/rooms/book/${roomId}`, {});
  }

  getMyRoom() {
    return this.http.get<any>(`${this.api}/rooms/my/room`);
  }

  requestSwitch(reason: string) {
    return this.http.post(`${this.api}/rooms/switch-request`, { reason });
  }

  getMySwitchRequests() {
    return this.http.get<any[]>(`${this.api}/rooms/my/switch-requests`);
  }

  submitComplaint(data: { category: string; description: string }) {
    return this.http.post(`${this.api}/complaints`, data);
  }

  getMyComplaints() {
    return this.http.get<any[]>(`${this.api}/complaints/my`);
  }
}
