import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-service.service';


export const roleRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const userRoles = authService.getUserRoles();
  
  if (userRoles.includes('ROLE_ADMIN')) {
    router.navigate(['/admin-dashboard']);
  } else if (userRoles.includes('ROLE_STUDENT')) {
    router.navigate(['/enrollment']); // se cambiara
  } else if (userRoles.includes('ROLE_TEACHER')) {
    router.navigate(['/teacher/my-sections']); // probablemente se quede
  } else {
    router.navigate(['/unauthorized']);
  }
  
  return false; 
};