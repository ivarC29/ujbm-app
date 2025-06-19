import { provideAppInitializer, inject } from '@angular/core';
import { AuthService } from '../services/auth-service.service';
import { RefreshTokenServiceService } from '../services/refresh-token-service.service';

// Función que verifica el token cuando se inicia la aplicación
export function initializeAuth(authService: AuthService, tokenRefreshService: RefreshTokenServiceService) {
  return () => {
    const token = authService.getAccessToken();

    if (token && !authService.isTokenExpired()) {
      tokenRefreshService.startRefreshTokenTimer();
      return Promise.resolve();
    } else if (token && authService.isTokenExpired()) {
      return new Promise<void>((resolve) => {
        authService.refreshAccessToken().subscribe({
          next: () => {
            tokenRefreshService.startRefreshTokenTimer();
            resolve();
          },
          error: () => {
            authService.logout();
            resolve();
          }
        });
      });
    }

    return Promise.resolve();
  };
}

// Nuevo provider recomendado para Angular 17+ (18/19)
export const AuthInitializerProvider = provideAppInitializer(
  () => initializeAuth(inject(AuthService), inject(RefreshTokenServiceService))()
);
