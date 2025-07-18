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
  email = '';
  password = '';
  errorMessage: string | null = null;
  authRequired = false; 

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['authRequired']) {
        this.authRequired = true;
        this.errorMessage = 'É necessário fazer login para acessar essa área.';
      } else {
        this.authRequired = false;
      }
    });
  }

  login(): void {
    this.errorMessage = null;
    this.authRequired = false;

    this.authService.login(this.email, this.password).subscribe(
      (loggedIn: boolean) => {
        if (loggedIn) {
          console.log('Login bem-sucedido!');
          this.router.navigate(['/area-do-paciente']);
        } else {
          console.log('Login falhou!');
          this.errorMessage = 'Email ou senha inválidos.';
        }
      },
      (error) => {
        console.error('Erro na subscrição do login:', error);
        this.errorMessage = 'Ocorreu um erro inesperado ao tentar fazer login. Tente novamente.';
      }
    );
  }
}