import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';


import { BaseTableComponent } from '@shared/utils/base-table.component';
import { 
  ApplicantTableInfoResponse, 
  ApplicantFilterRequest,
  Page,
  StudentConversionResponse
} from '../../interfaces/applicant.interfaces';

import { ApplicantService } from '../../services/applicant.service';
import { FileUploadDialogComponent } from '../../../shared/components/file-upload-dialog/file-upload-dialog.component';
import { DocumentViewerComponent } from '@shared/components/document-viewer/document-viewer.component';
import { HttpEventType } from '@angular/common/http';
import { ScoreDetailsDialogComponent } from '@shared/components/score-details-dialog/score-details-dialog.component';
import { EnrollmentMode, EnumOptionResponse } from '../../interfaces/enrollment-mode.interface';

import { Payment1ActionDialogComponent } from '@shared/components/payment1-action-dialog/payment1-action-dialog.component';

@Component({
  selector: 'applicants-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    MultiSelectModule,
    SelectModule,
    TagModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    DropdownModule,
    PaginatorModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    SkeletonModule,
    TooltipModule,
    ConfirmDialogModule,
    FileUploadDialogComponent,
    SelectModule
],
  providers: [
    DialogService,
    DynamicDialogRef,
    MessageService,
    ConfirmationService,
    ApplicantService
  ],
  templateUrl: './applicants-table.component.html',
  styleUrl: './applicants-table.component.scss'
})
export class ApplicantsTableComponent extends BaseTableComponent<ApplicantTableInfoResponse, ApplicantFilterRequest> implements OnInit {
  
  private dialogService = inject(DialogService);
  private dialogRef: DynamicDialogRef = inject(DynamicDialogRef);

  programs = signal<any[]>([]);
  enrollmentModes = signal<EnumOptionResponse[]>([]);
  statusList = signal<any[]>([])
  

  convertingStudents = new Set<number>();
  showScoresDialog = false;
  uploadingScores = false;
  dateFilterValue: Date | null = null;
  today: Date = new Date();

  // Mapeo de campos para sorting
  private readonly sortFieldMapping: { [key: string]: string } = {
  'fullName': 'person.name',
  'enrollmentMode': 'enrollmentMode', //no me anda funcionando
  'programName': 'program.name',
  'registryDate': 'registryDate',
  'statusName': 'statusCode'
};

  constructor(
    messageService: MessageService,
    confirmationService: ConfirmationService,
    private applicantService: ApplicantService
  ) {
    super(messageService, confirmationService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadDropdownData();
    this.loadEnrollmentModes();
  }

  
  getInitialFilter(): ApplicantFilterRequest {
  return {
    fullName: null,
    code: null,
    documentNumber: null,
    programId: null,
    statusCode: null,
    enrollmentModeCode: null,
    registryDate: null,
    enrolled: null,
    available: null,
    
    page: 0,
    size: 10,
    sortBy: 'id',
    sortDirection: 'ASC'
  };
}

  loadItems(): void {
  if (this.isProcessingAction) return;

  this.isProcessingAction = true;
  this.loading.set(true);
  
  const filterRequest: ApplicantFilterRequest = {
    page: this.currentFilter.page || 0,
    size: this.rows,
    sortBy: this.currentFilter.sortBy || 'code',
    sortDirection: this.currentFilter.sortDirection || 'ASC',
    
    fullName: this.currentFilter.fullName || null,
    code: this.currentFilter.code || null,
    documentNumber: this.currentFilter.documentNumber || null,
    programId: this.currentFilter.programId || null,
    statusCode: this.currentFilter.statusCode || null,
    enrollmentModeCode: this.currentFilter.enrollmentModeCode || null,
    registryDate: this.currentFilter.registryDate || null,
    enrolled: this.currentFilter.enrolled || null,
    available: this.currentFilter.available || null
  };


  this.applicantService.filterApplicants(filterRequest).subscribe({
    next: (response: Page<ApplicantTableInfoResponse>) => {
      
      this.items.set(response.content);
      this.totalRecords = response.page.totalElements;
      this.loading.set(false);
      this.isProcessingAction = false;
    },
    error: (error) => {
      this.showErrorMessage(
        'Error', 
        `No se pudieron cargar los postulantes. ${error.error?.message || error.message || ''}`
      );
      this.loading.set(false);
      this.isProcessingAction = false;
    }
  });
}
  deleteItem(applicant: ApplicantTableInfoResponse): void {
    console.warn('no hay delete en postulantes');
  }

  getItemDisplayName(applicant: ApplicantTableInfoResponse): string {
    return applicant.fullName;
  }

  override onSort(event: any): void {
    if (this.isProcessingAction) return;

    const frontendField = event.field;
    const backendField = this.sortFieldMapping[frontendField] || frontendField;
    const newSortDirection = event.order === 1 ? 'ASC' : 'DESC';

    if (this.currentFilter.sortBy !== backendField || this.currentFilter.sortDirection !== newSortDirection) {
      this.currentFilter.sortBy = backendField;
      this.currentFilter.sortDirection = newSortDirection;
      this.resetPagination();
      this.loadItems();
    }
  }

  onEnrollmentModeFilterChange(event: any): void {
  const modeCode = event.value;
  this.onColumnFilter('enrollmentModeCode', modeCode || null);
}


  // Métodos de filtrado específicos
  protected override applyColumnFilter(field: string, value: any): void {
  const filterValue = value?.trim ? value.trim() : value;

  switch (field) {
    case 'fullName':
    case 'code':
    case 'documentNumber':
    case 'enrollmentModeCode': 
      if (filterValue && filterValue !== '') {
        this.currentFilter[field] = filterValue; 
      } else {
        this.currentFilter[field] = null; 
      }
      this.resetPagination(); 
      this.loadItems();
      break;
    case 'programId':
    case 'statusCode':
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        this.currentFilter[field] = filterValue;
      } else {
        this.currentFilter[field] = null;
      }
      this.resetPagination();
      this.loadItems();
      break;
    case 'registryDate':
      if (filterValue) {
        this.currentFilter[field] = filterValue;
      } else {
        this.currentFilter[field] = null;
      }
      this.resetPagination();
      this.loadItems();
      break;
    default:
      super.applyColumnFilter(field, value);
      return;
  }
}

//métodos de filtros específicos
protected override applyGlobalFilter(searchValue: string): void {
  this.currentFilter.fullName = searchValue || null;
}


protected override clearGlobalFilter(): void {
  this.currentFilter.fullName = null;
}

onProgramFilterChange(event: any): void {
  const selectedProgramIds = event.value;
  
  if (!selectedProgramIds || selectedProgramIds.length === 0) {
    this.onColumnFilter('programId', null);
    return;
  }

  const programId = Array.isArray(selectedProgramIds) ? selectedProgramIds[0] : selectedProgramIds;
  this.onColumnFilter('programId', programId);
}
onStatusFilterChange(event: any): void {
  const statusCode = event.value;
  this.onColumnFilter('statusCode', statusCode || null);
}

clearDateFilter(): void {
  this.dateFilterValue = null;
  this.onColumnFilter('registryDate','');
}
  onDateSelect(date: Date): void {
    if (!date) {
      this.onColumnFilter('registryDate', null);
      return;
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    this.onColumnFilter('registryDate', formattedDate);
  }

capitalizeFirstLetter(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

private loadDropdownData(): void {  
  // Cargar programas
  this.applicantService.getPrograms().subscribe({
    next: (programs) => {
      this.programs.set(programs);
    },
    error: (error) => {
      this.setDefaultPrograms();
    }
  });


  this.setDefaultStatuses();
}

private loadEnrollmentModes(): void {
  
  this.applicantService.getEnrollmentModes().subscribe({
    next: (data: any) => {
      const modes = Array.isArray(data) ? data : (data.content || data.data || []);
      
      const processedModes = modes
        .filter((mode: any) => mode.code !== '00')
        .map((mode: any) => ({
          code: mode.code,
          name: this.capitalizeFirstLetter(mode.label), 
          label: mode.label, 
          description: mode.description
        }));
      
      this.enrollmentModes.set(processedModes);
    },
    error: (error) => {
      console.error('Error cargando modos de inscripción:', error);
      this.setDefaultEnrollmentModes();
    }
  });
}

private setDefaultEnrollmentModes(): void {
  // datos por defecto
  this.enrollmentModes.set([
    { 
      code: '01', 
      name: 'Ewddwdw',
      label: 'examen ordinario',
      description: 'Examen de admisión.'
    },
    { 
      code: '02', 
      name: 'Evaluación Preferente',
      label: 'evaluación preferente',
      description: 'Dirigido para jóvenes que están cursando el 5to. Año de Educación Secundaria.'
    },
    { 
      code: '03', 
      name: 'Exonerados',
      label: 'exonerados',
      description: 'Alumnos con bachiller, deportistas, fuerzas armadas, etc.'
    },
    { 
      code: '04', 
      name: 'Traslado',
      label: 'traslado',
      description: 'Alumnos provenientes de otras universidades.'
    }
  ]);
}



  private setDefaultPrograms(): void {
    this.programs.set([
      {id: 3, name: 'Periodismo'},
      {id: 6, name: 'Ingeniería Informática - Sistemas de Información'}
    ]);
  }

  private setDefaultStatuses(): void {
    this.statusList.set([
      { value: '01', label: 'Pendiente' },
      { value: '02', label: 'Aprobado' },
      { value: '03', label: 'Rechazado' },
      { value: '04', label: 'En revisión' }
    ]);
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'Aprobado': return 'success';
      case 'Rechazado': return 'danger';
      case 'Pendiente': return 'warn';
      case 'En revisión': return 'info';
      default: return 'info';
    }
  }

  getStatusLabel(statusName: string): string {
    return statusName || 'Desconocido';
  }

  // Métodos de funcionalidad 
  openDocumentModal(applicant: ApplicantTableInfoResponse, documentType: string): void {
    if (this.isTransferRejected(applicant)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Acción bloqueada',
      detail: 'Los sílabos de este postulante de traslado han sido rechazados. Todas las acciones están bloqueadas.'
    });
    return;
  }

  let fileId: number | null = null;

  switch (documentType) {
    case 'dni':
      fileId = applicant.dniFileId;
      break;
    case 'certificate':
      fileId = applicant.studyCertificateFileId;
      break;
    case 'photo':
      fileId = applicant.photoFileId;
      break;
    case 'PAYMENT1': 
      fileId = applicant.paymentReceiptFile1Id;
      break;
    case 'PAYMENT2':
      fileId = applicant.paymentReceiptFile2Id;
      break;
    case 'syllabus':
      break;
  }

  if (documentType === 'PAYMENT1' && !fileId && applicant.hasPaidAdmissionFee) {
    this.dialogRef = this.dialogService.open(DocumentViewerComponent, {
      header: `Pago de Admisión Exonerado - ${applicant.fullName}`,
      width: '50%',
      contentStyle: { 'max-height': '90vh', overflow: 'auto' },
      closable: true,
      data: { 
        fileData: null,
        applicantId: applicant.id, 
        documentType: 'PAYMENT1',
        isValidated: true,
        enrollmentModeCode: applicant.enrollmentModeCode,
        isExonerated: true
      },
    });

    this.dialogRef.onClose.subscribe(() => {
      this.loadItems(); 
    });
    return;
  }

  if (!fileId && documentType !== 'syllabus') {
    this.messageService.add({
      severity: 'warn',
      summary: 'Sin documento',
      detail: `No se encontró un ${this.getDocumentTypeName(documentType)} para este aplicante`
    });
    return;
  }

  if (!fileId && documentType !== 'syllabus') {
    this.messageService.add({
      severity: 'warn',
      summary: 'Sin documento',
      detail: `No se encontró un ${this.getDocumentTypeName(documentType)} para este aplicante`
    });
    return;
  }

  if (documentType === 'syllabus') {
    // Para sílabos, abrimos un modal específico sin mostrar archivo
    this.dialogRef = this.dialogService.open(DocumentViewerComponent, {
      header: `Sílabos del postulante: ${applicant.fullName}`,
      width: 'auto',
      contentStyle: { 'max-height': '90vh', overflow: 'auto' },
      closable: true,
      data: { 
        applicantId: applicant.id,
        documentType: 'syllabus',
        enrollmentModeCode: applicant.enrollmentModeCode,
        showSyllabusDownload: true
      },
    });

    this.dialogRef.onClose.subscribe(() => {
      this.loadItems(); 
    });
    return;
  }

  this.loading.set(true);


  if (fileId !== null) {
    this.applicantService.createSecureObjectUrl(fileId).subscribe({
      next: (fileData) => {
        const isValidated = this.getDocumentValidationStatus(applicant, documentType);
        const isExonerated = documentType === 'PAYMENT1' && applicant.hasPaidAdmissionFee && !applicant.paymentReceiptFile1Id;

        this.dialogRef = this.dialogService.open(DocumentViewerComponent, {
          header: `Documento: ${this.getDocumentTypeName(documentType)} - ${fileData.fileName}`,
          width: '70%',
          contentStyle: { 'max-height': '90vh', overflow: 'auto' },
          closable: true,
          data: { 
            fileData: fileData,
            applicantId: applicant.id, 
            documentType,
            isValidated,
            enrollmentModeCode: applicant.enrollmentModeCode
          },
        });

        this.dialogRef.onClose.subscribe(() => {
          this.loadItems(); 
        });
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading document:', error);
        this.messageService.add({
          severity: 'error', 
          summary: 'Error', 
          detail: 'No se pudo cargar el documento'
        });
        this.loading.set(false);
      },
    });
  }

}

canManagePayment1(applicant: ApplicantTableInfoResponse): boolean {
  return applicant.dniValidated && applicant.certificateValidated && applicant.photoValidated;
}

getPayment1Tooltip(applicant: ApplicantTableInfoResponse): string {
  if (!this.canManagePayment1(applicant)) {
    return 'Debe validar DNI, certificado y foto primero';
  }
  return applicant.hasPaidAdmissionFee ? 'Pago exonerado' : 'Exonerar o generar cobro';
}
getDocumentTypeName(type: string): string {
  switch (type) {
    case 'dni': return 'DNI';
    case 'certificate': return 'Certificado de Estudios';
    case 'photo': return 'Fotografía';
    case 'PAYMENT1': return 'Comprobante de Pago (Examen)';  
    case 'PAYMENT2': return 'Comprobante de Cuota 1'; 
    case 'syllabus': return 'Sílabos';
    default: return type;
  }
}

getDocumentValidationStatus(applicant: ApplicantTableInfoResponse, documentType: string): boolean {
  switch (documentType) {
    case 'dni': return !!applicant.dniValidated;
    case 'certificate': return !!applicant.certificateValidated;
    case 'photo': return !!applicant.photoValidated;
    case 'PAYMENT1': return applicant.hasPaidAdmissionFee === true; 
    case 'PAYMENT2': return applicant.enrolled === true; 
    default: return false;
  }
}

//Para mejorar flujo a base de habilitar y deshabilitar botones
  /**
 * Verifica si un postulante de traslado tiene estado rechazado
 */
isTransferRejected(applicant: ApplicantTableInfoResponse): boolean {
  return applicant.enrollmentModeCode === '04' && applicant.statusName === 'Rechazado';
}

/**
 * Verifica si se puede mostrar/editar la nota del postulante
 * Solo se permite si hay un pago detectado
 */
canShowScore(applicant: ApplicantTableInfoResponse): boolean {
  // Si es traslado rechazado, no se puede ver la nota
  if (this.isTransferRejected(applicant)) {
    return false;
  }
  
  // Para otros casos, solo se permite si hay pago de examen
  return applicant.hasPaidAdmissionFee === true;
}

/**
 * Obtiene el tooltip apropiado para el botón de nota
 */
getScoreTooltip(applicant: ApplicantTableInfoResponse): string {
  if (this.isTransferRejected(applicant)) {
    return 'Sílabos rechazados - Acción bloqueada';
  }
  
  if (!applicant.hasPaidAdmissionFee) {
    return 'Debe tener un pago de examen confirmado para ver/editar la nota';
  }
  
  return 'Click para ver detalles de la nota';
}

/**
 * Obtiene el tooltip apropiado para botones de documentos
 */
getDocumentTooltip(applicant: ApplicantTableInfoResponse, documentType: string): string {
  if (this.isTransferRejected(applicant)) {
    return 'Sílabos rechazados - Acción bloqueada';
  }
  
  switch (documentType) {
    case 'dni':
      return 'Ver documento de identidad';
    case 'certificate':
      return 'Ver certificado de estudios';
    case 'photo':
      return 'Ver fotografía';
    case 'PAYMENT1':
      if (!applicant.paymentReceiptFile1Id) {
        return 'Sin comprobante de pago de examen';
      }
      return 'Ver comprobante de pago de examen';
    case 'PAYMENT2':
      if (!applicant.paymentReceiptFile2Id) {
        return 'Sin comprobante de primera cuota';
      }
      return 'Ver comprobante de primera cuota';
    case 'syllabus':
      return 'Ver sílabos';
    default:
      return 'Ver documento';
  }
}

/**
 * Obtiene el tooltip apropiado para el botón de conversión a estudiante
 */
getConversionTooltip(applicant: ApplicantTableInfoResponse): string {
  if (this.isTransferRejected(applicant)) {
    return 'Sílabos rechazados - No se puede convertir a estudiante';
  }
  
  return 'Convertir a estudiante';
}


  showUploadScoresDialog(): void {
    this.showScoresDialog = true;
  }

  handleFileSelected(file: File): void {
  }



  handleDialogCancel(): void {
    this.showScoresDialog = false;
  }

  showScoreDetails(applicant: ApplicantTableInfoResponse): void {
    // verificar si se puede mostrar la nota
  if (!this.canShowScore(applicant)) {
    if (this.isTransferRejected(applicant)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción bloqueada',
        detail: 'Los sílabos de este postulante de traslado han sido rechazados. No se pueden ver las notas.'
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Pago requerido',
        detail: 'Debe validar el pago de examen antes de poder ver o editar las notas del postulante.'
      });
    }
    return;
  }

  this.dialogRef = this.dialogService.open(ScoreDetailsDialogComponent, {
    header: 'Detalles de puntaje',
    width: 'auto',
    maximizable: false,
    contentStyle: { 'max-height': '90vh', overflow: 'auto' },
    baseZIndex: 10000,
    data: {
      applicantId: applicant.id,
      applicantInfo: {
        fullName: applicant.fullName,
        programName: applicant.programName,
        documentNumber: applicant.documentNumber,
        scoreId: applicant.scoreId,
        totalScore: applicant.totalScore || 0
      }
    }
  });

  this.dialogRef.onClose.subscribe(result => {
    if (result === 'updated') {
      this.loadItems(); 
    }
  });
}


handleUploadScores(file: File): void {
  this.uploadingScores = true;
  
  const validExtensions = ['.txt', '.csv'];
  const fileName = file.name.toLowerCase();
  const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!isValidExtension) {
    this.uploadingScores = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Formato inválido',
      detail: 'El archivo debe tener formato TXT o CSV'
    });
    return;
  }
  
  this.applicantService.uploadScores(file).subscribe({
    next: (event) => {
      if (event.type === HttpEventType.Response) {
        this.uploadingScores = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Notas subidas',
          detail: 'El archivo de notas ha sido procesado correctamente'
        });
        this.showScoresDialog = false;
        this.loadItems(); 
      }
    },
    error: (error) => {
      this.uploadingScores = false;
      this.showScoresDialog = false; 
      
      let errorMessage = 'Error desconocido al procesar el archivo de notas';
      let errorSummary = 'Error en el archivo';
      
      const backendMsg = error?.error?.message || 
                        error?.message || 
                        error?.error?.detail || 
                        error?.error?.Detail || 
                        error?.statusText || 
                        '';
      
      if (backendMsg) {
        const lowerMsg = backendMsg.toLowerCase();
        
        if (lowerMsg.includes('arrayindexoutofboundsexception') || 
            lowerMsg.includes('index') && lowerMsg.includes('out of bounds')) {
          errorSummary = 'Formato de archivo incorrecto';
          errorMessage = 'El formato del archivo no es correcto. Verifique que:\n' +
                        '• Cada línea tenga el formato: CÓDIGO,NOTA\n' +
                        '• Use comas (,) como separador\n' +
                        '• Las notas sean números válidos\n' +
                        '• No haya líneas vacías o incompletas';
        }
        else if (lowerMsg.includes('notfoundexception') || 
                 lowerMsg.includes('postulante no encontrado') ||
                 lowerMsg.includes('no encontrado con el código')) {
          errorSummary = 'Códigos no encontrados';
          const codigoMatch = backendMsg.match(/código:\s*(\w+)/i);
          const codigo = codigoMatch ? codigoMatch[1] : 'desconocido';
          errorMessage = `Uno o más códigos de postulantes no existen en el sistema.\n` +
                        `Código problemático: ${codigo}\n\n` +
                        'Verifique que:\n' +
                        '• Los códigos en el archivo correspondan a postulantes registrados\n' +
                        '• No haya errores de escritura en los códigos\n' +
                        '• Los códigos estén en el formato correcto';
        }
        else if (lowerMsg.includes('numberformatexception') || 
                 lowerMsg.includes('for input string')) {
          errorSummary = 'Formato de nota inválido';
          errorMessage = 'Una o más notas tienen formato inválido.\n\n' +
                        'Verifique que:\n' +
                        '• Las notas sean números (ejemplo: 15.5)\n' +
                        '• Use punto (.) como separador decimal\n' +
                        '• No haya espacios extra o caracteres especiales\n' +
                        '• Las notas estén en el rango válido (0-20)';
        }
        else if (lowerMsg.includes('access denied') || 
                 lowerMsg.includes('forbidden') ||
                 lowerMsg.includes('unauthorized')) {
          errorSummary = 'Sin permisos';
          errorMessage = 'No tiene permisos para subir notas. Contacte al administrador.';
        }
        else if (lowerMsg.includes('file too large') || 
                 lowerMsg.includes('size limit')) {
          errorSummary = 'Archivo muy grande';
          errorMessage = 'El archivo es demasiado grande. Intente con un archivo más pequeño.';
        }
        else if (lowerMsg.includes('empty') || 
                 lowerMsg.includes('no data')) {
          errorSummary = 'Archivo vacío';
          errorMessage = 'El archivo está vacío o no contiene datos válidos.';
        }
        else if (lowerMsg.includes('connection') || 
                 lowerMsg.includes('timeout') ||
                 lowerMsg.includes('network')) {
          errorSummary = 'Error de conexión';
          errorMessage = 'Error de conexión. Verifique su conexión a internet e intente nuevamente.';
        }
        // Si no coincide con ningún patrón, usar el mensaje original
        else if (backendMsg.length > 0) {
          errorMessage = backendMsg;
        }
      }
      
      this.messageService.add({
        severity: 'error',
        summary: errorSummary,
        detail: errorMessage,
        life: 8000 // Más tiempo para leer el mensaje
      });
    }
  });
}

convertToStudent(applicant: ApplicantTableInfoResponse): void {
  // Limpiar cualquier toast previo
  this.messageService.clear('confirm-conversion');
  
  // Toast personalizado de confirmación
  this.messageService.add({
    key: 'confirm-conversion',
    severity: 'info',
    summary: 'Confirmar conversión a estudiante',
    detail: `¿Desea convertir a ${applicant.fullName} en estudiante?`,
    sticky: true,
    data: applicant 
  });
}

confirmConversion(applicant: ApplicantTableInfoResponse): void {
  if (this.convertingStudents.has(applicant.id)) {
    return; // Evitar doble conversión
  }

  this.convertingStudents.add(applicant.id);
  this.messageService.clear('confirm-conversion');

  this.applicantService.convertApplicantToStudent(applicant.id).subscribe({
    next: (response: StudentConversionResponse) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Conversión exitosa',
        detail: `${response.nombreCompleto} ha sido convertido a estudiante exitosamente.
                Código: ${response.codigo}
                Programa: ${response.programa}
                ${response.mensaje}`,
        life: 8000 
      });

      this.loadItems();
      this.convertingStudents.delete(applicant.id); // Remover aquí también
    },
    error: (error) => {
      let errorMessage = 'Error desconocido al convertir postulante a estudiante';
      
      // Intentar obtener el mensaje del backend de diferentes formas
      const backendMsg = error?.error?.message || 
                        error?.message || 
                        error?.error?.detail || 
                        error?.error?.Detail || 
                        error?.error?.defaultMessage || 
                        error?.statusText || 
                        '';
      if (backendMsg) {
        const lowerMsg = backendMsg.toLowerCase();

        if (lowerMsg.includes('no hay secciones disponibles') || lowerMsg.includes('secciones disponibles')) {
          errorMessage = 'No hay secciones disponibles para matricular al postulante. Por favor, verifique la disponibilidad de secciones en el programa seleccionado.';
        } else if (lowerMsg.includes('documentos') && lowerMsg.includes('validados')) {
          errorMessage = 'Debe validar todos los documentos del postulante (DNI, certificado y foto) antes de convertirlo a estudiante.';
        } else if (lowerMsg.includes('puntaje') && lowerMsg.includes('registrado')) {
          errorMessage = 'Debe registrar las notas del postulante antes de convertirlo a estudiante.';
        } else if (lowerMsg.includes('puntaje') && lowerMsg.includes('mínimo')) {
          errorMessage = 'El postulante no alcanzó el puntaje mínimo requerido para su modalidad de ingreso.';
        } else if (lowerMsg.includes('pago') && lowerMsg.includes('confirmado')) {
          errorMessage = 'Debe validar el pago de matrícula antes de convertir al postulante a estudiante.';
        } else if (lowerMsg.includes('ya es estudiante')) {
          errorMessage = 'Esta persona ya ha sido convertida a estudiante anteriormente.';
        } else {
          // Si no coincide con ningún patrón específico, usar el mensaje original
          errorMessage = backendMsg;
        }
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Error en la conversión',
        detail: errorMessage,
        life: 5000
      });

      // IMPORTANTE: Remover del set aquí también para evitar que se quede "cargando"
      this.convertingStudents.delete(applicant.id);
    },
    complete: () => {
      // Como medida de seguridad adicional
      this.convertingStudents.delete(applicant.id);
    }
  });
}

cancelConversion(): void {
  this.messageService.clear('confirm-conversion');
}
  openPayment1Modal(applicant: ApplicantTableInfoResponse): void {
    if (!applicant.dniValidated || !applicant.certificateValidated || !applicant.photoValidated) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Documentos pendientes',
      detail: 'Debe validar DNI, certificado de estudios y foto antes de gestionar el pago de admisión.'
    });
    return;
  }
    this.dialogRef = this.dialogService.open(Payment1ActionDialogComponent, {
      header: 'Gestionar Pago de Admisión',
      width: '400px',
      data: { applicantId: applicant.id, hasPaidAdmissionFee: applicant.hasPaidAdmissionFee },
      closable: true,
      baseZIndex: 10000
    });
    this.dialogRef.onClose.subscribe(result => {
      if (result === 'updated') {
        this.loadItems();
      }
    });
  }

  get applicants() {
    return this.items;
  }
}

