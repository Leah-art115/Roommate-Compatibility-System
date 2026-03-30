import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'USER';
  organizationId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000';

  login(email: string, password: string): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
      })
    );
  }

  register(token: string, password: string): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/register`, { token, password }).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
      })
    );
  }

  validateInviteToken(token: string): Observable<{ email: string; organizationId: string }> {
    return this.http.get<{ email: string; organizationId: string }>(
      `${this.apiUrl}/auth/validate-invite?token=${token}`
    );
  }

  getProfile(): Observable<{ id: string; name: string; email: string; role: string; organizationId: string }> {
    return this.http.get<{ id: string; name: string; email: string; role: string; organizationId: string }>(`${this.apiUrl}/auth/profile`);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

getUser(): JwtPayload | null {
  const token = this.getToken();
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

changePassword(currentPassword: string, newPassword: string) {
  return this.http.post(`${this.apiUrl}/auth/change-password`, {
    currentPassword,
    newPassword,
  });
}

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  redirectAfterLogin(): void {
    const user = this.getUser();
    if (!user) return;
    if (user.role === 'ORG_ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.role === 'SUPER_ADMIN') {
      this.router.navigate(['/super-admin/dashboard']);
    } else {
      this.router.navigate(['/student/dashboard']);
    }
  }
}