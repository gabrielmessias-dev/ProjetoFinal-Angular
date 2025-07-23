// src/app/pages/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute ,Router } from '@angular/router';
import { RouterLink } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../core/auth.service';
import { PoliticaModalComponent } from '../../shared/politica-modal/politica-modal.component';

declare var bootstrap: any; // <<<< CONFIRME SE ESTA LINHA ESTÁ PRESENTE!

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    PoliticaModalComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage: string | null = null;
  authRequired = false;
  mostrarModal = false;

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
        this.errorMessage = null;
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

  abrirModal(): void {
    this.mostrarModal = true;
  }

  // <<<< NOVO MÉTODO PARA ABRIR O MODAL DE CADASTRO >>>>
  openRegistrationModal(): void {
    const modalElement = document.getElementById('registrationRequestModal'); // O ID do modal HTML
    if (modalElement) {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        // console.log('Modal de registro show() chamado.'); // Log para debug, pode remover
      } else {
        console.error('Objeto Bootstrap.Modal não disponível. O JS do Bootstrap pode não ter carregado ou o ID do modal está errado.');
      }
    } else {
      console.error('Elemento do modal (#registrationRequestModal) NÃO encontrado no DOM!');
    }
  }
}