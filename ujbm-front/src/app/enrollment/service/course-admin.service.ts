import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPaths } from 'src/app/shared/utils/api-paths';
import { CourseFilterRequest, CoursePage, CourseRequest, CourseResponse } from '../interfaces/course-admin.interface';

@Injectable({ providedIn: 'root' })
export class CourseAdminService {
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

  filterCourses(filterRequest: CourseFilterRequest): Observable<CoursePage> {
    return this.http.post<CoursePage>(
      `${ApiPaths.getFullUrl(ApiPaths.COURSE_ADMIN)}/table-filter`,
      filterRequest,
      { headers: this.getAuthHeaders() }
    );
  }

  createCourse(request: CourseRequest): Observable<CourseResponse> {
    return this.http.post<CourseResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.COURSE_ADMIN)}`, 
      request,
      { headers: this.getAuthHeaders() }
    );
  }
   getCourseById(id: number): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.COURSE_ADMIN)}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateCourse(id: number, request: CourseRequest): Observable<CourseResponse> {
    return this.http.put<CourseResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.COURSE_ADMIN)}/${id}`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(
      `${ApiPaths.getFullUrl(ApiPaths.COURSE_ADMIN)}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
