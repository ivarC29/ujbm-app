import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiPaths } from '@shared/utils/api-paths';
import { 
  CourseSectionTableInfoResponse,
  CourseSectionFilterRequest,
  CourseSectionPage,
  CourseSectionRequest,
  CourseSectionResponse,
  CourseSectionBatchUploadResponse,
  CourseOption,
  TeacherOption,
  PeriodOption,
  CourseSelectResponse,
  TeacherAutocompleteResponse,
  AcademicPeriodSelectResponse
} from '../interfaces/course-section.interface';

@Injectable({ providedIn: 'root' })
export class CourseSectionService {
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

  filterCourseSections(filterRequest: CourseSectionFilterRequest): Observable<CourseSectionPage> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.COURSE_SECTION_ADMIN)}/table-filter`;
    

    return this.http.post<CourseSectionPage>(
      url,
      filterRequest,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // ✅ Crear sección
  createCourseSection(request: CourseSectionRequest): Observable<CourseSectionResponse> {
    const url = ApiPaths.getFullUrl(ApiPaths.COURSE_SECTION_ADMIN);
    
    return this.http.post<CourseSectionResponse>(
      url,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // ✅ Obtener por ID
  getCourseSectionById(id: number): Observable<CourseSectionResponse> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.COURSE_SECTION_ADMIN)}/${id}`;
    
    return this.http.get<CourseSectionResponse>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // ✅ Actualizar sección
  updateCourseSection(id: number, request: CourseSectionRequest): Observable<CourseSectionResponse> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.COURSE_SECTION_ADMIN)}/${id}`;
    
    return this.http.put<CourseSectionResponse>(
      url,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // ✅ Eliminar sección
  deleteCourseSection(id: number): Observable<void> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.COURSE_SECTION_ADMIN)}/${id}`;
    
    return this.http.delete<void>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // ✅ Carga masiva
  batchUpload(file: File): Observable<CourseSectionBatchUploadResponse> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.COURSE_SECTION_ADMIN)}/batch-upload`;
    
    const formData = new FormData();
    formData.append('file', file);

    const headers = {
      'Authorization': `Bearer ${this.token}`
      // No agregar Content-Type para FormData
    };

    return this.http.post<CourseSectionBatchUploadResponse>(
      url,
      formData,
      { headers }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // ✅ Métodos auxiliares para dropdowns
  getCourses(): Observable<CourseOption[]> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.COURSE_ADMIN)}/select`;
    
    return this.http.get<CourseOption[]>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getCoursesForSelect(): Observable<CourseSelectResponse[]> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.COURSE_ADMIN)}/select`;
    
    return this.http.get<CourseSelectResponse[]>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getCoursesForSelectByProgramAndCycle(programId: number, cycle: number): Observable<CourseSelectResponse[]> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.COURSE_ADMIN)}/select/by-program-and-cycle`;
    
    const params = new HttpParams()
      .set('programId', programId.toString())
      .set('cycle', cycle.toString());
    
    return this.http.get<CourseSelectResponse[]>(
      url,
      { 
        headers: this.getAuthHeaders(),
        params: params
      }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getTeachers(): Observable<TeacherOption[]> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.TEACHER_ADMIN)}/select`;
    
    return this.http.get<TeacherOption[]>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getTeachersAutocomplete(query: string): Observable<TeacherAutocompleteResponse[]> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.TEACHER_ADMIN)}/autocomplete`;
    
    const params = new HttpParams().set('query', query);
    
    return this.http.get<TeacherAutocompleteResponse[]>(
      url,
      { 
        headers: this.getAuthHeaders(),
        params: params
      }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getPeriods(): Observable<PeriodOption[]> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.ACADEMIC_PERIOD_ADMIN)}/active`;
    
    return this.http.get<PeriodOption[]>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

   getPeriodsForSelect(): Observable<AcademicPeriodSelectResponse[]> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.ACADEMIC_PERIOD_ADMIN)}/select`;
    
    return this.http.get<AcademicPeriodSelectResponse[]>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  getDayAbbreviation(day: string): string {
    const dayNames: Record<string, string> = {
      'MONDAY': 'Lun',
      'TUESDAY': 'Mar',
      'WEDNESDAY': 'Mié',
      'THURSDAY': 'Jue',
      'FRIDAY': 'Vie',
      'SATURDAY': 'Sáb',
      'SUNDAY': 'Dom'
    };
    return dayNames[day] || day;
  }

  getDayName(day: string): string {
    const dayNames: Record<string, string> = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return dayNames[day] || day;
  }
}