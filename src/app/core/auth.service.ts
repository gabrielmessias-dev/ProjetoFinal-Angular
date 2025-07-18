// src/app/core/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Auth, UserCredential, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

interface AppUser {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedInSubject.asObservable();

  private currentUser: AppUser | null = null;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private auth: Auth 
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        this.currentUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email || ''
        };
        this.loggedInSubject.next(true);
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
      } else {
        this.currentUser = null;
        this.loggedInSubject.next(false);
        if (this.isBrowser) {
          localStorage.removeItem('currentUser');
        }
      }
    });

    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser && !this.loggedInSubject.value) {
        try {
          const parsedUser = JSON.parse(storedUser);
          this.currentUser = { ...parsedUser, id: String(parsedUser.id) };
          this.loggedInSubject.next(true);
        } catch (e) {
          console.error('AuthService: Erro ao parsear usuário do localStorage.', e);
          localStorage.removeItem('currentUser');
          this.loggedInSubject.next(false);
        }
      } else if (!storedUser && this.loggedInSubject.value) {
        this.loggedInSubject.next(false);
      }
    } else {
      this.loggedInSubject.next(false);
    }
  }

  login(email: string, password: string): Observable<boolean> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential: UserCredential) => {
        const firebaseUser = userCredential.user;
        this.currentUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email || ''
        };
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        this.loggedInSubject.next(true);
        return true;
      }),
      catchError(error => {
        console.error('AuthService: Erro no login Firebase:', error.code, error.message);
        this.currentUser = null;
        if (this.isBrowser) {
          localStorage.removeItem('currentUser');
        }
        this.loggedInSubject.next(false);
        return of(false);
      })
    );
  }

  logout(): void {;
    from(signOut(this.auth)).pipe(
      catchError(error => {
        console.error('AuthService: Erro no logout Firebase:', error);
        return of(null);
      })
    ).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  getCurrentUser(): AppUser | null {
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return this.currentUser;
  }
}