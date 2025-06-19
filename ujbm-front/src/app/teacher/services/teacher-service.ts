import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiPaths } from '@shared/utils/api-paths';
import { Page } from 'src/app/applicant/interfaces/applicant.interfaces';
import { TeacherTableInfoResponse, TeacherCreateRequest, TeacherFilterRequest, TeacherPage, TeacherCreateResponse, TeacherAutocompleteResponse, TeacherResponse, TeacherCourseSectionResponse } from '../interfaces/teacher.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private http = inject(HttpClient);
  
  private get token(): string {
    return localStorage.getItem('access_token') || '';
  }
  
  private getAuthHeaders(): { [header: string]: string } {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  filterTeachers(filterRequest: TeacherFilterRequest): Observable<TeacherPage> {
    return this.http.post<TeacherPage>(
      `${ApiPaths.getFullUrl(ApiPaths.TEACHER_ADMIN)}/table-filter`,
      filterRequest,
      { headers: this.getAuthHeaders() }
    );
  }

  createTeacher(teacherData: TeacherCreateRequest): Observable<TeacherCreateResponse> {
    return this.http.post<TeacherCreateResponse>(
      ApiPaths.getFullUrl(ApiPaths.TEACHER_ADMIN),
      teacherData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error creating teacher:', error);
        let errorMessage = 'Error al crear el docente';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  getTeacherById(id: number): Observable<TeacherResponse> {
    return this.http.get<TeacherResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.TEACHER_ADMIN)}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateTeacher(id: number, teacherData: TeacherCreateRequest): Observable<TeacherResponse> {
    return this.http.put<TeacherResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.TEACHER_ADMIN)}/${id}`,
      teacherData,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(
      `${ApiPaths.getFullUrl(ApiPaths.TEACHER_ADMIN)}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  autocompleteTeachers(query: string): Observable<TeacherAutocompleteResponse[]> {
    return this.http.get<TeacherAutocompleteResponse[]>(
      `${ApiPaths.getFullUrl(ApiPaths.TEACHER_ADMIN)}/autocomplete`,
      { 
        headers: this.getAuthHeaders(),
        params: { query }
      }
    );
  }

   getMyCourses(): Observable<TeacherCourseSectionResponse[]> {
    return this.http.get<TeacherCourseSectionResponse[]>(
      ApiPaths.getFullUrl(`${ApiPaths.COURSE_SECTION_TEACHER}/my-courses`),
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getTeachersTable(page: number, size: number, sortField: string, sortOrder: string): Observable<TeacherPage> {
    const filterRequest: TeacherFilterRequest = {
      page,
      size,
      sortBy: sortField,
      sortDirection: sortOrder as 'ASC' | 'DESC'
    };
    return this.filterTeachers(filterRequest);
  }
}