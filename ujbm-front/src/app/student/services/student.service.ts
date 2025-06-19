import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPaths } from '@shared/utils/api-paths';
import {
  StudentTableInfoResponse,
  StudentFilterRequest,
  StudentCreateResponse,
  StudentRequest,
  StudentResponse,
  StudentPage
} from '../interfaces/student.interfaces';
import { EnrollmentStatusWithAvailableCourseSectionsResponse,EnrollmentResponse, EnrollmentRequest, EnrollmentFilterRequest, EnrollmentPage, EnrollmentDetailsResponse, ProgramSelectResponse } from '../interfaces/student-enrollment.interfaces';

@Injectable({ providedIn: 'root' })
export class StudentService {
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

  filterStudents(filterRequest: StudentFilterRequest): Observable<StudentPage> {
    return this.http.post<StudentPage>(
      `${ApiPaths.getFullUrl(ApiPaths.STUDENT_ADMIN)}/table-filter`,
      filterRequest,
      { headers: this.getAuthHeaders() }
    );
  }
   getAvailableCourseSections(): Observable<EnrollmentStatusWithAvailableCourseSectionsResponse> {
      const url = `${ApiPaths.getFullUrl(ApiPaths.ENROLLMENT_STUDENT)}/available-course-sections`;
      return this.http.get<EnrollmentStatusWithAvailableCourseSectionsResponse>(url, {
        headers: this.getAuthHeaders()
      });
    }

  createStudent(request: StudentRequest): Observable<StudentCreateResponse> {
    return this.http.post<StudentCreateResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.STUDENT_ADMIN)}`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  getStudentById(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.STUDENT_ADMIN)}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateStudent(id: number, request: StudentRequest): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.STUDENT_ADMIN)}/${id}`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(
      `${ApiPaths.getFullUrl(ApiPaths.STUDENT_ADMIN)}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  submitEnrollment(request: EnrollmentRequest): Observable<EnrollmentResponse> {
    const url = `${ApiPaths.getFullUrl(ApiPaths.ENROLLMENT_STUDENT)}/submit`;
    return this.http.post<EnrollmentResponse>(url, request, {
      headers: this.getAuthHeaders()
    });
  }

  /* Admin methods */
  filterEnrollments(filterRequest: EnrollmentFilterRequest): Observable<EnrollmentPage> {
    return this.http.post<EnrollmentPage>(
      `${ApiPaths.getFullUrl(ApiPaths.ENROLLMENT_ADMIN)}/table-filter`,
      filterRequest,
      { headers: this.getAuthHeaders() }
    );
  }
  
  getEnrollmentDetails(id: number): Observable<EnrollmentDetailsResponse> {
    return this.http.get<EnrollmentDetailsResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.ENROLLMENT_ADMIN)}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
  
  confirmEnrollment(id: number): Observable<EnrollmentDetailsResponse> {
    return this.http.put<EnrollmentDetailsResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.ENROLLMENT_ADMIN)}/${id}/confirm`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
  
  rejectEnrollment(id: number): Observable<EnrollmentDetailsResponse> {
    return this.http.put<EnrollmentDetailsResponse>(
      `${ApiPaths.getFullUrl(ApiPaths.ENROLLMENT_ADMIN)}/${id}/reject`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
  
  getPrograms(): Observable<ProgramSelectResponse[]> {
  return this.http.get<ProgramSelectResponse[]>(
    ApiPaths.getFullUrl(ApiPaths.PROGRAM_PUBLIC),
    { headers: this.getAuthHeaders() }
  );
}
  
  // --- MIS CURSOS: Obtener cursos matriculados con horarios ---
getEnrolledSectionsWithSchedules(): Observable<import('../interfaces/student.interfaces').EnrollmentDetailsWithScheduleResponse> {
  const url = `${ApiPaths.getFullUrl(ApiPaths.ENROLLMENT_STUDENT)}/enrolled-sections-with-schedules`;
  return this.http.get<import('../interfaces/student.interfaces').EnrollmentDetailsWithScheduleResponse>(url, {
    headers: this.getAuthHeaders()
  });
}

  // Utilidades para formateo
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'DRAFT': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }
  
  getStatusLabel(status: string): string {
    switch(status) {
      case 'DRAFT': return 'En Proceso';
      case 'PENDING': return 'Pendiente';
      case 'CONFIRMED': return 'Confirmada';
      case 'CANCELLED': return 'Rechazada';
      default: return status;
    }
  }






  clearEnrollmentData(): void {
    localStorage.removeItem('enrolledDetails');
  }


}
