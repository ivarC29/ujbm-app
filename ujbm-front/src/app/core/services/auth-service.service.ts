import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { jwtDecode } from 'jwt-decode';
import { environment } from '@environments/environment';
import { ApiPaths } from '@shared/utils/api-paths';
import {StudentService} from '../../student/services/student.service';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload {
  sub: string;
  roles: string[];
  exp: number;
  iat: number;
}

interface LogoutRequest {
  token: string;
  refreshToken: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private studentService: StudentService = inject(StudentService);

  private http : HttpClient = inject(HttpClient);

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(ApiPaths.getFullUrl(`${ApiPaths.AUTH}/login`), credentials)
      .pipe(
        tap(response => {
          this.storeTokens(response.accessToken, response.refreshToken);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): Observable<any> {
  //quitar cursos del localStorage
  this.studentService.clearEnrollmentData();

  const accessToken = this.getAccessToken();
  const refreshToken = this.getRefreshToken();
  
  const logoutRequest: LogoutRequest = {
    token: accessToken || '',
    refreshToken: refreshToken
  };
  
  const logoutCall = accessToken 
    ? this.http.post<void>(ApiPaths.getFullUrl(`${ApiPaths.AUTH}/logout`), logoutRequest).pipe(
        catchError(error => {
          console.error('Error durante logout en servidor:', error);
          return of(null);
        })
      )
    : of(null);
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isAuthenticatedSubject.next(false);
    return logoutCall;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  refreshAccessToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(ApiPaths.getFullUrl(`${ApiPaths.AUTH}/refresh`), { refreshToken })
      .pipe(
        tap(response => {
          this.storeTokens(response.accessToken, response.refreshToken);
        })
      );
  }

  getDecodedToken(): TokenPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }

  getUserRoles(): string[] {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.roles || [];
  }

  getUsername(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.sub || null;
  }

  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

 changePassword(data: { 
  currentPassword: string; 
  newPassword: string; 
  confirmPassword: string 
}): Observable<void> {
  return this.http.post<void>(ApiPaths.getFullUrl(`${ApiPaths.AUTH}/change-password`), data, {
     headers: this.getAccessToken() ? { Authorization: `Bearer ${this.getAccessToken()}` } : {}
  });
}

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private hasValidToken(): boolean {
    return !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) return true;

    // Convertir exp (en segundos) a milisegundos y comparar con la fecha actual
    const expirationDate = new Date(decodedToken.exp * 1000);
    return expirationDate < new Date();
  }
}
