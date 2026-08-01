import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'Organizers' | 'Coaches' | 'Players' | 'Admins';

export interface UserSession {
  email: string;
  role: UserRole;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<UserSession | null>(this.getStoredUser());
  public currentUser$ = this.userSubject.asObservable();

  constructor() {}

  private getStoredUser(): UserSession | null {
    const raw = localStorage.getItem('cancha_user_session');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public get currentUser(): UserSession | null {
    return this.userSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  public get token(): string | null {
    return this.userSubject.value?.token || null;
  }

  public login(email: string, role: UserRole): UserSession {
    const mockToken = `mock-jwt-token-${Date.now()}-${btoa(email)}`;
    return this.loginWithToken(email, role, mockToken);
  }

  public loginWithToken(email: string, role: UserRole, token: string): UserSession {
    const session: UserSession = {
      email,
      role,
      token,
    };
    localStorage.setItem('cancha_user_session', JSON.stringify(session));
    this.userSubject.next(session);
    return session;
  }


  public logout(): void {
    localStorage.removeItem('cancha_user_session');
    this.userSubject.next(null);
  }

  public hasRole(role: UserRole): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return user.role === role || user.role === 'Admins';
  }

  public getAuthHeaders(): { [header: string]: string } {
    const token = this.token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }
}
