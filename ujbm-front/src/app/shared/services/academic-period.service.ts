import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPaths } from '../utils/api-paths';

export interface AcademicPeriodSelectResponse {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AcademicPeriodService {
  private http = inject(HttpClient);
  private get token(): string {
    return localStorage.getItem('access_token') || '';
  }
  private getAuthHeaders(): { [header: string]: string } {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }
  getAcademicPeriods(): Observable<AcademicPeriodSelectResponse[]> {
    return this.http.get<AcademicPeriodSelectResponse[]>(
      ApiPaths.getFullUrl(`${ApiPaths.ACADEMIC_PERIOD_ADMIN}/select`),
      { headers: this.getAuthHeaders() }
    );
  }
}
