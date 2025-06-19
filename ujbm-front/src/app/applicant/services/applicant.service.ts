import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, finalize, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ApiPaths } from '@shared/utils/api-paths';                              
import type {ApplicantTableInfoResponse, AwarenessMethodResponse, HighSchoolTypeResponse, Page, ApplicantResumeResponse, ApplicantScoreResponse, ScoreRequest, StudentConversionResponse, ApplicantFilterRequest, ApplicantPage } from '../interfaces/applicant.interfaces';
import { EnrollmentModeResponse, EnumOptionResponse } from '../interfaces/enrollment-mode.interface';
import { DocumentTypeResponse,ReniecResponse, SunatResponse } from '../interfaces/document-type.interface';
import { UbigeoResponse } from '../interfaces/ubigeo.interface';
import { DisabilityType, GenderResponse } from '@shared/interfaces/person.interfaces';
import { ProgramResponse  } from '@shared/interfaces/program.interfaces';
import { ExamAccessResponse, ExamSubmissionRequest, ExamSubmissionResponse, InterviewScoreRequest, PendingInterviewApplicantResponse } from '../interfaces/exam.interfaces';
import { ApplicantScorePublicResponse, ExamByExcelRequest, ExamCreateRequest, ExamCreateResponse, ExamDeleteResponse, ExamDetailResponse, ExamListResponse, ExamStatus, ExamUpdateRequest, ExamUpdateResponse } from '../interfaces/admission&interview.interfaces';
import { PeriodOption } from 'src/app/enrollment/interfaces/course-section.interface';
@Injectable({
  providedIn: 'root'
})
export class ApplicantService {
  private http = inject(HttpClient);
  private get token(): string {
      return localStorage.getItem('access_token') || '';
    }
  private getAuthHeaders(): { [header: string]: string } {
    return {
      'Authorization': `Bearer ${this.token}`
    };
  }
  constructor() {}
  private submissionInProgress = false;
  //-----------------------------------------------------
  // PROGRAMAS Y DATOS BÁSICOS
  //-----------------------------------------------------

  getPrograms(): Observable<ProgramResponse[]> {
    return this.http.get<ProgramResponse[]>(
      ApiPaths.getFullUrl(`${ApiPaths.PROGRAM_PUBLIC}`)
    );
  }

  getEnrollmentModes(): Observable<EnumOptionResponse[]> {
  return this.http.get<EnumOptionResponse[]>(
    ApiPaths.getFullUrl(`${ApiPaths.ENUMS_PUBLIC}/enrollment-mode`) 
  );
}

  getDocumentTypes(): Observable<DocumentTypeResponse> {
    return this.http.get<DocumentTypeResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.ENUMS_PUBLIC}/document-id-type`)
    );
  }

  getGenders(): Observable<GenderResponse[]> {
    return this.http.get<GenderResponse[]>(
      ApiPaths.getFullUrl(`${ApiPaths.ENUMS_PUBLIC}/gender`)
    );
  }

  getDisabilityTypes(): Observable<DisabilityType[]> {
    return this.http.get<DisabilityType[]>(
      ApiPaths.getFullUrl(`${ApiPaths.ENUMS_PUBLIC}/disability-type`)
    );
  }

  getHighSchoolTypes(): Observable<HighSchoolTypeResponse> {
    return this.http.get<HighSchoolTypeResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.ENUMS_PUBLIC}/high-school-type`)
    );
  }

  getAwarenessMethods(): Observable<AwarenessMethodResponse> {
    return this.http.get<AwarenessMethodResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.ENUMS_PUBLIC}/awareness-method`)
    );
  }

  getApplicantStatuses(): Observable<any[]> {
    return this.http.get<any[]>(
      ApiPaths.getFullUrl(`${ApiPaths.ENUMS_PUBLIC}/applicant-status`)
    );
  }

  getPeriods(): Observable<PeriodOption[]> {
      const url = `${ApiPaths.getFullUrl(ApiPaths.ACADEMIC_PERIOD_ADMIN)}/select`;
      
      return this.http.get<PeriodOption[]>(
        url,
        { headers: this.getAuthHeaders() }
      ).pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
    }

  //-----------------------------------------------------
  // DATOS DE APLICANTES
  //-----------------------------------------------------

 getAvailableApplicants(
    page: number = 0, 
    size: number = 8, 
    sortedBy: string = 'id', 
    sortDirection: string = 'ASC'
  ): Observable<Page<ApplicantTableInfoResponse>> {
    const params = {
      page: page.toString(),
      elements: size.toString(),
      sortedBy: sortedBy,
      sortDirection: sortDirection
    };
  return this.http.get<Page<ApplicantTableInfoResponse>>(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/available`),
    { params: params,
      headers: this.getAuthHeaders() }  
  );
}

  getApplicantResumeByDni(dni: string, paymentType: string): Observable<ApplicantResumeResponse> {
  const params = new HttpParams().set('paymentType', paymentType);
  return this.http.get<ApplicantResumeResponse>(
    `${ApiPaths.getFullUrl(ApiPaths.APPLICANT_PUBLIC)}/${dni}/resume`,
    { params }
  );
}


  getApplicantScoreDetails(applicantId: number): Observable<ApplicantScoreResponse> {
  return this.http.get<ApplicantScoreResponse>(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/${applicantId}/score-details`),
    { headers: this.getAuthHeaders() }
  );
}


  //-----------------------------------------------------
  // SERVICIOS DE INTEGRACIÓN GUBERNAMENTAL
  //-----------------------------------------------------

  getReniecData(dni: string): Observable<ReniecResponse> {
    return this.http.get<ReniecResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.GOVERNMENT_PUBLIC}/reniec/${dni}`)
    );
  }

  getSunatData(ruc: string): Observable<SunatResponse> {
    return this.http.get<SunatResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.GOVERNMENT_PUBLIC}/sunat/form/${ruc}`)
    );
  }

  //-----------------------------------------------------
  // SERVICIOS DE UBIGEO
  //-----------------------------------------------------

  getDepartments(): Observable<UbigeoResponse[]> {
    return this.http.get<UbigeoResponse[]>(
      ApiPaths.getFullUrl(`${ApiPaths.UBIGEO_PUBLIC}/departments`)
    );
  }

  getProvinces(departmentCode: string): Observable<UbigeoResponse[]> {
    return this.http.get<UbigeoResponse[]>(
      ApiPaths.getFullUrl(`${ApiPaths.UBIGEO_PUBLIC}/provinces`), {
        params: { departmentCode }
      }
    );
  }

  getDistricts(departmentCode: string, provinceCode: string): Observable<UbigeoResponse[]> {
    return this.http.get<UbigeoResponse[]>(
      ApiPaths.getFullUrl(`${ApiPaths.UBIGEO_PUBLIC}/districts`), {
        params: { departmentCode, provinceCode }
      }
    );
  }

  //-----------------------------------------------------
  // SERVICIOS DE ARCHIVOS
  //-----------------------------------------------------

  downloadFile(fileId: number): Observable<any> {
    return this.http.get<any>(
      ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/files/${fileId}`), {
        headers: this.getAuthHeaders()
      }
    );
  }

  // URL segura para la vista
  createSecureObjectUrl(fileId: number): Observable<any> {
    return this.downloadFile(fileId).pipe(
      map(response => {
        if (response && response.data && response.fileType) {
          // blob del contenido base64
          const byteCharacters = atob(response.data);
          const byteNumbers = new Array(byteCharacters.length);
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: response.fileType });
          
          // url y devolver objeto con metadatos
          return {
            url: URL.createObjectURL(blob),
            fileName: response.fileName,
            fileType: response.fileType,
            isPdf: response.fileType.includes('pdf')
          };
        } 
        else if (response instanceof Blob) {
          return {
            url: URL.createObjectURL(response),
            fileType: response.type,
            fileName: 'documento.pdf',
            isPdf: response.type.includes('pdf')
          };
        }
        else {
          console.error('Formato de respuesta inesperado:', response);
          throw new Error('Formato de respuesta inesperado');
        }
      })
    );
  }

  //-----------------------------------------------------
  // SERVICIOS DE VALIDACIÓN
  //-----------------------------------------------------

  validateDocument(applicantId: number, documentType: string): Observable<void> {
  return this.http.post<void>(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/${applicantId}/validate-document`),
    null,
    {
      params: { documentType },
      headers: this.getAuthHeaders()
    }
  ).pipe(
    catchError(error => {
     let errorMessage = '';
      
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Error desconocido al validar el documento';
      }
      
      if (errorMessage.includes('Debe validar primero DNI')) {
        return throwError(() => new Error('Debe validar primero el DNI, certificado y foto del postulante.'));
      }
      
      if (errorMessage.includes('no tiene un puntaje registrado')) {
        return throwError(() => new Error('El postulante no tiene notas registradas. Suba las notas primero.'));
      }
      
      if (errorMessage.includes('puntaje no es suficiente')) {
        return throwError(() => new Error('El puntaje del postulante no es suficiente para validar el pago.'));
      }
      
      if (errorMessage.includes('No se ha subido una boleta de pago')) {
        return throwError(() => new Error('No se ha subido un comprobante de pago para este postulante.'));
      }
            return throwError(() => new Error(errorMessage));
    })
  );
}
rejectDocument(applicantId: number, documentType: string): Observable<void> {
  return this.http.post<void>(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/${applicantId}/reject-document`),
    null,
    {
      params: { documentType },
      headers: this.getAuthHeaders()
    }
  );
}
downloadSyllabus(applicantId: number): Observable<Blob> {
  return this.http.get(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/${applicantId}/download-syllabus`),
    {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }
  );
}

rejectSyllabus(applicantId: number): Observable<void> {
  return this.http.post<void>(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/${applicantId}/reject-syllabus`),
    null,
    {
      headers: this.getAuthHeaders()
    }
  );
}

  validatePayment(dni: string): Observable<void> {
    return this.http.post<void>(
      ApiPaths.getFullUrl(`${ApiPaths.API_BASE}/applicant/${dni}/validate-payment`),
      null,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  convertApplicantToStudent(applicantId: number): Observable<StudentConversionResponse> {
  return this.http.post<StudentConversionResponse>(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/enroll/${applicantId}`),
    null,
    {
      headers: this.getAuthHeaders()
    }
  ).pipe(
    catchError(error => {
      return throwError(() => error);
    })
  );
}

  //-----------------------------------------------------
  // SERVICIOS DE REGISTRO Y ACTUALIZACIÓN
  //-----------------------------------------------------

  // Actualizar puntaje
  updateApplicantScore(applicantId: number, scoreData: ScoreRequest): Observable<any> {
    return this.http.patch(
      ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/${applicantId}/update-score`),
      scoreData,
      { headers: this.getAuthHeaders(),
     responseType: 'text'
    }
  ).pipe(
    map(response => {
      return { success: true };
    }),
    catchError(error => {
      if (error.status >= 200 && error.status < 300) {
        return of({ success: true });
      }
      
      console.error('Error en actualización de puntaje:', error);
      return throwError(() => error);
    })
  );
}
  saveApplicant(applicantData: any): Observable<any> {
    if (this.submissionInProgress) {
    return throwError(() => new Error('Ya hay una solicitud en progreso'));
    }
    this.submissionInProgress = true;

    const filePromises: Promise<any>[] = [];

    // Convertir archivos a base64
    if (applicantData.dniFile) {
      filePromises.push(this.fileToBase64(applicantData.dniFile));
    }
    
    if (applicantData.certificateFile || applicantData.studyCertificateFile) {
      filePromises.push(this.fileToBase64(
        applicantData.certificateFile || applicantData.studyCertificateFile, 
        'certificate'
      ));
    }
    
    if (applicantData.photoFile) {
      filePromises.push(this.fileToBase64(applicantData.photoFile, 'photo'));
    }
    
    const syllabusFiles: Promise<any>[] = [];
    if (applicantData.syllabusFile && (applicantData.enrollmentMode === '04' || applicantData.selectedMode === '04')) {
      if (Array.isArray(applicantData.syllabusFile)) {
        for (const file of applicantData.syllabusFile) {
          syllabusFiles.push(this.fileToBase64(file, 'syllabus'));
        }
      } else {
        syllabusFiles.push(this.fileToBase64(applicantData.syllabusFile, 'syllabus'));
      }
    }

    return from(Promise.all([...filePromises, ...syllabusFiles])).pipe(
      map(fileResults => {
        const graduationYear = parseInt(applicantData.school.graduationYear);
        
        if (!applicantData.program) {
          throw new Error('El programa es requerido para registrar un postulante');
        }

        // formatear fecha de nacimiento
        let birthdate = applicantData.birthdate;
        if (typeof birthdate === 'string' && birthdate.includes('/')) {
          const [day, month, year] = birthdate.split('/');
          birthdate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        const getLocalDate = () => {
          const today = new Date();
          const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Lima'
          });
          return formatter.format(today);
        };

        return {
          registryDate: getLocalDate(),
          status: applicantData.status || '01',
          awarenessMethod: applicantData.awarenessMethod || applicantData.referralSource,
          programId: Number(applicantData.program), 
          person: {
            name: applicantData.name,
            lastname: applicantData.lastname,
            documentIdType: applicantData.documentType,
            documentNumber: applicantData.documentNumber,
            email: applicantData.email,
            phoneNumber: applicantData.phoneNumber,
            address: applicantData.location?.address || '',
            birthdate: birthdate,
            type: '01',
            enrollmentMode: applicantData.enrollmentMode, 
            gender: applicantData.sex,
            ubigeo: {
              departmentCode: applicantData.location.department,
              provinceCode: applicantData.location.province,
              districtCode: applicantData.location.district
            },
            guardianName: applicantData.guardian?.name || null,
            guardianLastname: applicantData.guardian?.lastname || null,
            guardianPhoneNumber: applicantData.guardian?.phoneNumber || null,
            guardianEmail: applicantData.guardian?.email || null,
            hasDisability: applicantData.hasDisability === true,
            disabilityType: applicantData.disabilityType,
            disabilityDescription: (applicantData.hasDisability === true && applicantData.disabilityType === '12')
              ? applicantData.otherDisabilityDescription
              : null,
            available: true
          },
          highSchoolInfo: {
            type: applicantData.school.type,
            name: applicantData.school.name,
            graduationYear: isNaN(graduationYear) ? new Date().getFullYear() : graduationYear,
            ubigeo: {
              departmentCode: applicantData.school.location.department,
              provinceCode: applicantData.school.location.province,
              districtCode: applicantData.school.location.district
            }
          },
          
          dniFile: this.convertToFileRequest(fileResults.find(f => f.type === 'dni')),
          studyCertificateFile: this.convertToFileRequest(fileResults.find(f => f.type === 'certificate')),
          photoFile: this.convertToFileRequest(fileResults.find(f => f.type === 'photo')),
          syllabusFiles: fileResults
            .filter(f => f.type === 'syllabus')
            .map(f => this.convertToFileRequest(f))
        };
      }),
      switchMap(requestBody => {
        return this.http.post<any>(
          ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_PUBLIC}`), 
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }),
      finalize(() => {
      this.submissionInProgress = false;
    })
    );
  }

  //-----------------------------------------------------
  // SERVICIOS DE SUBIDA DE ARCHIVOS
  //-----------------------------------------------------

  uploadPaymentReceipt(dni: string, file: File, paymentType: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('paymentType', paymentType);

  return this.http.post(
    `${ApiPaths.getFullUrl(ApiPaths.APPLICANT_PUBLIC)}/${dni}/upload-payment`,
    formData,
    {
      reportProgress: true,
      observe: 'events',
      responseType: 'text' as 'json',
    }
  );
}

  uploadScores(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<any>(
      ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/upload-scores`),
      formData,
      {
        headers: this.getAuthHeaders(),
        reportProgress: true,
        observe: 'events',
        responseType: 'text' as 'json'
      }
    ).pipe(
      catchError(error => {
        console.error('Error al subir archivo de notas:', error);
        return throwError(() => error);
      })
    );
  }

  //-----------------------------------------------------
  // MÉTODOS AUXILIARES PARA MANEJO DE ARCHIVOS
  //-----------------------------------------------------

  // Convertir de fileToBase64 a ApplicantFileRequest
  private convertToFileRequest(fileData: any): any {
    if (!fileData) return null;
    
    return {
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      data: fileData.data 
    };
  }

  // Convertir un archivo a base64
  private fileToBase64(file: File, type = 'dni'): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.substring(base64String.indexOf(',') + 1);
        
        const fileType = file.type || this.detectMimeType(file.name) || this.getDefaultFileType(type);
        
        resolve({
          type: type,
          fileName: file.name || this.getDefaultFileName(type),
          fileType: fileType,
          data: base64Data
        });
      };
      
      reader.onerror = error => reject(error);
    });
  }

  // Obtener nombres de archivo por defecto
  private getDefaultFileName(type: string): string {
    switch (type) {
      case 'dni': return 'documento_identidad.pdf';
      case 'certificate': return 'certificado_estudios.pdf';
      case 'photo': return 'foto_carnet.jpg';
      case 'syllabus': return 'silabo.pdf';
      case 'payment': return 'comprobante_pago.pdf';
      default: return 'archivo.pdf';
    }
  }

  // Obtener tipos MIME por defecto
  private getDefaultFileType(type: string): string {
    switch (type) {
      case 'dni': return 'application/pdf';
      case 'certificate': return 'application/pdf';
      case 'photo': return 'image/jpeg';
      case 'syllabus': return 'application/pdf';
      case 'payment': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  }

  // Detectar tipo MIME por extensión
  private detectMimeType(fileName: string): string | null {
    if (!fileName) return null;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return null;
    
    const mimeTypes: {[key: string]: string} = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'zip': 'application/zip'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  //-----------------------------------------------------
  // FILTRADO Y ELIMINACIÓN DE APLICANTES
  //-----------------------------------------------------

  filterApplicants(filterRequest: ApplicantFilterRequest): Observable<Page<ApplicantTableInfoResponse>> {
  const url = ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/table-filter`);
  
  return this.http.post<Page<ApplicantTableInfoResponse>>(url, filterRequest, { 
    headers: this.getAuthHeaders() 
  }).pipe(
    map(response => {
      const mappedContent = response.content.map(applicant => ({
        ...applicant,
        name: applicant.fullName 
      }));
      
      return {
        ...response,
        content: mappedContent
      };
    }),
    catchError(error => {
      return throwError(() => error);
    })
  );
}

  deleteApplicant(applicantId: number): Observable<void> {
    return this.http.delete<void>(
      ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/${applicantId}`),
      { headers: this.getAuthHeaders() }
    );
  }

  //EXAM METHODS
  validateExamAccess(dni: string): Observable<ExamAccessResponse> {
  return this.http.get<ExamAccessResponse>(ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_PUBLIC}/${dni}/validate-exam-access`));
  }
  submitExam(dni: string, request: ExamSubmissionRequest): Observable<ExamSubmissionResponse> {
    return this.http.post<ExamSubmissionResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_PUBLIC}/${dni}/submit-exam`), 
      request
    );
  }

  getPendingJournalismInterviews(): Observable<PendingInterviewApplicantResponse[]> {
  return this.http.get<PendingInterviewApplicantResponse[]>(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_PUBLIC}/pending-interviews/journalism`)
  );
}

// Registrar nota de entrevista
setInterviewScore(dni: string, request: InterviewScoreRequest): Observable<ApplicantScoreResponse> {
  return this.http.post<ApplicantScoreResponse>(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_PUBLIC}/${dni}/interview-score`),
    request
  );
}
  exonerateAdmissionPayment(applicantId: number): Observable<void> {
    return this.http.post<void>(
      ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/${applicantId}/exonerate-payment`),
      null,
      { headers: this.getAuthHeaders() }
    );
  }

  generateCollection(applicantId: number): Observable<void> {
    return this.http.post<void>(
      ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_ADMIN}/${applicantId}/generate-collection`),
      null,
      { headers: this.getAuthHeaders() }
    );
  }

   createExam(request: ExamCreateRequest): Observable<ExamCreateResponse> {
    return this.http.post<ExamCreateResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.EXAM_ADMIN}`),
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  createExamByExcel(request: ExamByExcelRequest): Observable<ExamCreateResponse> {
    return this.http.post<ExamCreateResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.EXAM_ADMIN}/excel`),
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  getExamsByType(examType?: string): Observable<ExamListResponse[]> {
    let httpParams = new HttpParams();
    if (examType) {
      httpParams = httpParams.set('examType', examType);
    }
    
    return this.http.get<ExamListResponse[]>(
      ApiPaths.getFullUrl(`${ApiPaths.EXAM_ADMIN}/type`),
      { 
        params: httpParams,
        headers: this.getAuthHeaders() 
      }
    );
  }

  getExamById(examId: number): Observable<ExamDetailResponse> {
  return this.http.get<ExamDetailResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.EXAM_ADMIN}/${examId}`),
      { headers: this.getAuthHeaders() }
  );
  }

  updateExam(examId: number, request: ExamUpdateRequest): Observable<ExamUpdateResponse> {
    return this.http.put<ExamUpdateResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.EXAM_ADMIN}/${examId}`),
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  publishExam(examId: number): Observable<ExamUpdateResponse> {
  const request: ExamUpdateRequest = {
    status: ExamStatus.PUBLISHED,
    name: undefined,
    description: undefined,
    programId: undefined,
    courseSectionId: undefined,
    academicPeriodId: undefined,
    maxScore: undefined,
    durationMinutes: undefined,
    passingScore: undefined,
    attemptsAllowed: undefined,
    shuffleQuestions: undefined,
    schedule: undefined,
    examFile: undefined,
    questions: undefined
  };

  return this.http.put<ExamUpdateResponse>(
    ApiPaths.getFullUrl(`${ApiPaths.EXAM_ADMIN}/${examId}`),
    request,
    { headers: this.getAuthHeaders() }
  );
}
  activateExam(examId: number): Observable<ExamUpdateResponse> {
  const request: ExamUpdateRequest = {
    status: ExamStatus.ACTIVE,
    name: undefined,
    description: undefined,
    programId: undefined,
    courseSectionId: undefined,
    academicPeriodId: undefined,
    maxScore: undefined,
    durationMinutes: undefined,
    passingScore: undefined,
    attemptsAllowed: undefined,
    shuffleQuestions: undefined,
    schedule: undefined,
    examFile: undefined,
    questions: undefined
  };

  return this.http.put<ExamUpdateResponse>(
    ApiPaths.getFullUrl(`${ApiPaths.EXAM_ADMIN}/${examId}`),
    request,
    { headers: this.getAuthHeaders() }
  );
}

closeExam(examId: number): Observable<ExamUpdateResponse> {
  const request: ExamUpdateRequest = {
    status: ExamStatus.CLOSED,
    name: undefined,
    description: undefined,
    programId: undefined,
    courseSectionId: undefined,
    academicPeriodId: undefined,
    maxScore: undefined,
    durationMinutes: undefined,
    passingScore: undefined,
    attemptsAllowed: undefined,
    shuffleQuestions: undefined,
    schedule: undefined,
    examFile: undefined,
    questions: undefined
  };

  return this.http.put<ExamUpdateResponse>(
    ApiPaths.getFullUrl(`${ApiPaths.EXAM_ADMIN}/${examId}`),
    request,
    { headers: this.getAuthHeaders() }
  );
}

  deleteExam(examId: number): Observable<ExamDeleteResponse> {
    return this.http.delete<ExamDeleteResponse>(
      ApiPaths.getFullUrl(`${ApiPaths.EXAM_ADMIN}/${examId}`),
      { headers: this.getAuthHeaders() }
    );
  }

  getApplicantScoreByDni(dni: string): Observable<ApplicantScorePublicResponse> {
  return this.http.get<ApplicantScorePublicResponse>(
    ApiPaths.getFullUrl(`${ApiPaths.APPLICANT_PUBLIC}/score/${dni}`)
  );
}

  
}