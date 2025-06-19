import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  if (authService.hasRole('ROLE_ADMIN')) {
    return true;
  }

  // Si no tiene el rol de administrador, redirigir a la página de acceso denegado
  // y pasar la URL de retorno como parámetro de consulta
  router.navigate(['/forbidden']);
  return false;
};
