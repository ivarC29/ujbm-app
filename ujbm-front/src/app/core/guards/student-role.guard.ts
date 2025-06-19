import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';

export const studentGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  if (authService.hasRole('ROLE_STUDENT')) {
    return true;
  }

  // Si no tiene el rol de estudiante, redirigir a la página de acceso denegado
  router.navigate(['/forbidden']);
  return false;
};