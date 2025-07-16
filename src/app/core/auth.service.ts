import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importe HttpClient
import { Observable, of } from 'rxjs'; // Importe Observable e of
import { tap, catchError, map } from 'rxjs/operators'; // Importe operadores
import { Router } from '@angular/router'; // Importe Router

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
  private loggedIn = false; 
  private currentUser: User | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      this.loggedIn = true;
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map(users => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          this.loggedIn = true;
          this.currentUser = user;
          localStorage.setItem('currentUser', JSON.stringify(user));
          return true;
        } else {
          this.loggedIn = false;
          this.currentUser = null;
          return false;
        }
      }),
      catchError(error => {
        console.error('Erro ao tentar login:', error);
        return of(false); 
      })
    );
  }

  logout(): void {
    this.loggedIn = false;
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}