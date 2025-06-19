import { Injectable } from '@angular/core';
import { MenuItem } from '../interfaces/menu-item.interface';
import { SystemParameter, SystemParameterDto } from '../interfaces/system-parameter.interface';
import { ScheduleConfig } from '../interfaces/schedule-config.interface';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/auth-service.service';
import { ApiPaths } from '@shared/utils/api-paths';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private menuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Parámetros del sistema',
      description: 'Configurar parámetros del sistema',
      icon: 'pi pi-cog',
      route: '/settings/system-parameters',
      enabled: true
    },
    {
      id: '2',
      title: 'Configurar Horarios',
      description: 'Configurar horarios disponibles',
      icon: 'pi pi-calendar',
      route: '/settings/schedule-configuration',
      enabled: false
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMenuItems(): Observable<MenuItem[]> {
    return new Observable(observer => {
      observer.next(this.menuItems);
      observer.complete();
    });
  }

  private get token(): string {
      return this.authService.getAccessToken() || '';
    }
  private getHeaders(): { [header: string]: string } {
    return {
      'Authorization': `Bearer ${this.token}`
    };  }

  getSystemParameters(): Observable<SystemParameter[]> {
    return this.http.get<SystemParameter[]>(
      ApiPaths.getFullUrl(ApiPaths.PARAMETER_ADMIN),
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error al obtener los parámetros del sistema:', error);
        return of([]);
      })
    );
  }

  getParameterByKey(key: string): Observable<SystemParameter | null> {
    return this.getSystemParameters().pipe(
      map((parameters: SystemParameter[]) => 
        parameters.find(param => param.key === key) || null
      )
    );
  }

  createParameter(param: SystemParameterDto): Observable<SystemParameter> {
    return this.http.post<SystemParameter>(
      ApiPaths.getFullUrl(ApiPaths.PARAMETER_ADMIN),
      param,
      { headers: this.getHeaders() }
    );
  }


  updateParameter(param: SystemParameterDto): Observable<SystemParameter> {
    return this.http.put<SystemParameter>(
      ApiPaths.getFullUrl(ApiPaths.PARAMETER_ADMIN),
      param,
      { headers: this.getHeaders() }
    );
  }

  deleteParameter(key: string): Observable<void> {
    return this.http.delete<void>(
      ApiPaths.getFullUrl(`${ApiPaths.PARAMETER_ADMIN}/${key}`),
      { headers: this.getHeaders() }
    );
  }

  
  setParameterEditable(key: string, editable: boolean): Observable<SystemParameter> {
    return this.http.put<SystemParameter>(
      ApiPaths.getFullUrl(`${ApiPaths.PARAMETER_ADMIN}/${key}/editable`),
      null,
      { 
        headers: this.getHeaders(),
        params: { editable: editable.toString() }
      }
    );
  }

 
  private formatKeyToLabel(key: string): string {
    return key
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
