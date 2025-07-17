// src/app/pages/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute ,Router } from '@angular/router'; 

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
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  loginError = false;
  authRequired = false;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private activatedRoute: ActivatedRoute        
  ) {}

  ngOnInit(): void { //L
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['authRequired']) {
        this.authRequired = true;
      } else {
        this.authRequired = false;
      }
    });
  }

  onLogin(): void {
    this.loginError = false; 
    this.authRequired = false;

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