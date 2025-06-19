import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPaths } from 'src/app/shared/utils/api-paths';
import { ChartDataDTO, DashboardFilterRequest } from '../interfaces/applicant-dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private get token(): string {
    return localStorage.getItem('access_token') || '';
  }
  private getAuthHeaders(): { [header: string]: string } {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  getApplicantChartData(filter: DashboardFilterRequest): Observable<ChartDataDTO[]> {
    return this.http.post<ChartDataDTO[]>(
      ApiPaths.getFullUrl(`${ApiPaths.DASHBOARD_ADMIN}/chart-data-applicant`),
      filter,
      { headers: this.getAuthHeaders() }
    );
  }
}
