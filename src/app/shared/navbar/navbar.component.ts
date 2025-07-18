import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive, NavigationEnd } from '@angular/router'; 
import { AuthService } from '../../core/auth.service';
import { Subject, takeUntil, filter } from 'rxjs'; 

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
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isLoggedIn = status;
        this.updateNavbarVisibility();
      });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd), 
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateNavbarVisibility(event.urlAfterRedirects); 
      });

    this.isLoggedIn = this.authService.isLoggedIn(); 
    this.updateNavbarVisibility(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateNavbarVisibility(currentUrl: string = this.router.url): void {
    this.isOnProtectedArea = currentUrl.startsWith('/area-do-paciente') ||
                             currentUrl.startsWith('/marcacao') ||
                             currentUrl.startsWith('/historico');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}