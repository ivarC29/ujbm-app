import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service.service';


export const authGuard: CanActivateFn = (route, state) => {

  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  if (authService.getAccessToken() && !authService.isTokenExpired()) {
    // Verificar roles requeridos si están definidos en la ruta
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));
      if (!hasRequiredRole) {
        router.navigate(['/forbidden']);
        return false;
      }
    }
    return true;
  }
  // Si no hay token o el token ha expirado, redirigir a la página de inicio de sesión
  // y pasar la URL de retorno como parámetro de consulta
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
