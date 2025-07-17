// src/app/core/login.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); 
  const router = inject(Router);           

  if (authService.isLoggedIn()) {
    return true;
 } else {
    router.navigate(['/login'], { queryParams: { authRequired: true } });
    return false;
  }
}