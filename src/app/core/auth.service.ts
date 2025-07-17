// src/app/core/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedInSubject.asObservable();    

  private currentUser: User | null = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        this.loggedInSubject.next(true); 
      }
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map(users => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          this.currentUser = user;
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this.loggedInSubject.next(true); 
          return true;
        } else {
          this.currentUser = null;
          if (this.isBrowser) {
            localStorage.removeItem('currentUser');
          }
          this.loggedInSubject.next(false); 
          return false;
        }
      }),
      catchError(error => {
        console.error('Erro ao tentar login:', error);
        this.loggedInSubject.next(false); 
        return of(false);
      })
    );
  }

  logout(): void {
    this.currentUser = null;
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.loggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (this.isBrowser) {
      return !!localStorage.getItem('currentUser');
    }
    return this.loggedInSubject.value;
  }

  getCurrentUser(): User | null {
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return this.currentUser;
  }
}