import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class RefreshTokenServiceService {
  private refreshTokenTimeout: any;

  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  // Establecer un temporizador para refrescar el token
  public startRefreshTokenTimer() {
    // Decodificar el token para obtener su fecha de expiración
    const decodedToken = this.authService.getDecodedToken();

    if (!decodedToken) {
      return;
    }

    // Establece la fecha de expiración
    const expires = new Date(decodedToken.exp * 1000);

    // Establece el tiempo para refrescar el token (60 segundos antes de que expire)
    const timeout = expires.getTime() - Date.now() - (60 * 1000);

    // Si el token está a punto de expirar o ya está expirado, refrescarlo inmediatamente
    if (timeout <= 0) {
      this.refreshToken();
      return;
    }

    // Establecer temporizador para refrescar el token
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken();
    }, timeout);
  }

  // Detener el temporizador de refresco de token
  public stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  // Refrescar el token
  private refreshToken() {
    this.authService.refreshAccessToken().subscribe({
      next: () => this.startRefreshTokenTimer(),
      error: () => {
        // En caso de error al refrescar el token, cerrar la sesión
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
