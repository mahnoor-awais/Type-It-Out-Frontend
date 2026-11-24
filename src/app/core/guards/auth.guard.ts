import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAuthenticated = authService.isAuthenticated();

  if (route.data['guestOnly'] === true) {
    return isAuthenticated ? router.createUrlTree(['/']) : true;
  }

  return isAuthenticated ? true : router.createUrlTree(['/login']);
};
