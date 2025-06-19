import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import{ ApiPaths } from '@shared/utils/api-paths';  
import { Observable } from 'rxjs';
import { EnumOptionResponse } from 'src/app/applicant/interfaces/enrollment-mode.interface';

@Injectable({
    providedIn: 'root'
})
export class EnumService {
    
  constructor(private http: HttpClient) {}

  private get token(): string {
    return localStorage.getItem('access_token') || '';
  }

  private getAuthHeaders(): { [header: string]: string } {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  getEnrollmentStatus(): Observable<EnumOptionResponse[]> {
    return this.http.get<EnumOptionResponse[]>(
      `${ApiPaths.getFullUrl(ApiPaths.ENUM_ENROLLLMENT_STATUS_PUBLIC)}`);
  }

    getEnrollmentDetailStatus(): Observable<EnumOptionResponse[]> {
        return this.http.get<EnumOptionResponse[]>(
        `${ApiPaths.getFullUrl(ApiPaths.ENUM_ENROLLMENT_DETAIL_STATUS_PUBLIC)}`);
    }

    getValueTypes(): Observable<EnumOptionResponse[]> {
        return this.http.get<EnumOptionResponse[]>(
        `${ApiPaths.getFullUrl(ApiPaths.ENUM_VALUE_TYPE_PUBLIC)}`);
    }



    
}