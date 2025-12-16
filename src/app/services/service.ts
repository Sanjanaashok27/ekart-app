
import { Injectable, signal, computed } from '@angular/core';

export type Role = 'admin' | 'customer';
export interface User {
  username: string;
  password: string;  
  role: Role;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private USERS: User[] = [
    { username: 'admin',    password: 'admin123',    role: 'admin',    name: 'Admin User' },
    { username: 'customer', password: 'customer123', role: 'customer', name: 'Customer User' },
  ];

  private _currentUser = signal<User | null>(null);
  currentUser = computed(() => this._currentUser());

  constructor() {
    const saved = localStorage.getItem('ekart_user');
    if (saved) {
      try { this._currentUser.set(JSON.parse(saved)); } catch { localStorage.removeItem('ekart_user'); }
    }
  }

  login(username: string, password: string): User | null {
    const user = this.USERS.find(u => u.username === username && u.password === password) || null;
    if (user) {
      this._currentUser.set(user);
      localStorage.setItem('ekart_user', JSON.stringify(user));
    }
    return user;
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem('ekart_user');
  }

  isLoggedIn(): boolean {
    return !!this._currentUser();
  }

  isAdmin(): boolean {
    return this._currentUser()?.role === 'admin';
  }

  isCustomer(): boolean {
    return this._currentUser()?.role === 'customer';
  }
}
