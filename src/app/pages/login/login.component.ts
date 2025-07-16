// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router'; 

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../core/auth.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  loginError = false;

  constructor(
    private authService: AuthService, 
    private router: Router            
  ) {}

  onLogin(): void {
    this.loginError = false; 

    this.authService.login(this.username, this.password).subscribe(
      (loggedIn: boolean) => {
        if (loggedIn) {
          console.log('Login bem-sucedido!');
          
          this.router.navigate(['/area-do-paciente']);
        } else {
          console.log('Login falhou!');
          this.loginError = true; 
        }
      },
      (error) => {
        console.error('Erro na requisição de login:', error);
        this.loginError = true; 
      }
    );
  }
}