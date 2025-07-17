// src/app/shared/navbar/navbar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive, NavigationEnd } from '@angular/router'; // Adicionado NavigationEnd
import { AuthService } from '../../core/auth.service';
import { Subject, takeUntil, filter } from 'rxjs'; // Adicionado 'filter'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isOnProtectedArea: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('NavbarComponent: Construtor iniciado.');
  }

  ngOnInit(): void {
    console.log('NavbarComponent: ngOnInit iniciado. Assinando isLoggedIn$ e Router events.');

    // Assina o status de login
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isLoggedIn = status;
        console.log('NavbarComponent (AuthService): isLoggedIn$ atualizado para:', this.isLoggedIn);
        // Garante que a visibilidade seja atualizada após qualquer mudança de login
        this.updateNavbarVisibility();
      });

    // Assina eventos do Router para saber a rota atual
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd), // Filtra apenas eventos de NavigationEnd
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        console.log('NavbarComponent (Router): NavigationEnd detectado. URL após redirecionamentos:', event.urlAfterRedirects);
        this.updateNavbarVisibility(event.urlAfterRedirects); // Atualiza com a nova URL
      });

    // Chama a atualização inicial com a URL atual e estado de login
    this.isLoggedIn = this.authService.isLoggedIn(); // Pega o estado inicial de login
    console.log('NavbarComponent (AuthService): Estado inicial de isLoggedIn (direto do service):', this.isLoggedIn);
    this.updateNavbarVisibility(this.router.url); // Chama para definir o estado inicial da navbar
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateNavbarVisibility(currentUrl: string = this.router.url): void {
    // Adicionado log para a URL que está sendo processada
    console.log('NavbarComponent (updateNavbarVisibility): Processando URL:', currentUrl);

    // Define se a rota atual está em uma área protegida
    this.isOnProtectedArea = currentUrl.startsWith('/area-do-paciente') ||
                             currentUrl.startsWith('/marcacao') ||
                             currentUrl.startsWith('/historico');

    console.log('NavbarComponent (updateNavbarVisibility): isBrowser =', this.authService['isBrowser'], 'isLoggedIn =', this.isLoggedIn, 'URL =', currentUrl, 'isOnProtectedArea =', this.isOnProtectedArea);
    console.log('NavbarComponent: Navbar deve estar no estado:',
      !this.isLoggedIn ? 'NÃO LOGADO' : (this.isOnProtectedArea ? 'LOGADO E PROTEGIDO' : 'LOGADO E PÚBLICO')
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}