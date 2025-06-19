import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { PageTitleComponent } from '@shared/components/page-title/page-title.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ExamListResponse, ExamDetailResponse } from '../../interfaces/admission&interview.interfaces';
import { ApplicantService } from '../../services/applicant.service';
import { ApplicantExamManagementComponent } from "../../components/applicant-exam-management/applicant-exam-management.component";
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Paginator } from 'primeng/paginator';

@Component({
  selector: 'app-applicant-exam-management-page',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    ToastModule,
    PageTitleComponent,
    ApplicantExamManagementComponent,
    DialogModule,
    ConfirmDialogModule,
    Paginator
],
  providers: [MessageService, ConfirmationService], 
  templateUrl: './applicant-exam-management-page.component.html',
  styleUrl: './applicant-exam-management-page.component.scss'
})
export default class ApplicantExamManagementPageComponent implements OnInit {
  exams = signal<any[]>([]);
  loading = signal(false);
  showCreateExam = signal(false);
  useExcelMode = signal(false)

  // Variables para modales
  viewExamModalVisible = false;
  editExamModalVisible = false;
  selectedExamId: number | null = null;
  selectedExamData: ExamDetailResponse | null = null;

  // Paginación
  rows = 10;
  first = 0;
  totalRecords = 0;

  
  allExams: ExamListResponse[] = [];

  constructor(
    private applicantService: ApplicantService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService 
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }


  loadExams(): void {
    this.loading.set(true);
    
    this.applicantService.getExamsByType('ADMISSION').subscribe({
      next: (response) => {
        this.allExams = response; 
        this.totalRecords = this.allExams.length;
        this.paginate();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los exámenes'
        });
        this.loading.set(false);
      }
    });
  }

  
  paginate(page: number = 0): void {
    const startIndex = page * this.rows;
    const endIndex = startIndex + this.rows;
    this.exams.set(this.allExams.slice(startIndex, endIndex));
  }

  onPageChange(event: any): void {
    this.rows = event.rows; 
    this.first = event.first;
    this.paginate(Math.floor(this.first / this.rows));
  }

  onCreateExam(): void {
    this.showCreateExam.set(true);
  }
  onCreateExamExcel(): void {
    this.useExcelMode.set(true); 
    this.showCreateExam.set(true);
  }

  onBackToList(): void {
    this.showCreateExam.set(false);
    this.useExcelMode.set(false);
    this.loadExams();
  }

  onSwitchToManual(): void {
    this.useExcelMode.set(false); 
    
  }

  isUpcoming(dateTime: string): boolean {
    return new Date(dateTime) > new Date();
  }

  isFinished(dateTime: string): boolean {
    return new Date(dateTime) < new Date();
  }

  
  getExamStatus(exam: ExamListResponse): { label: string; class: string } {
    switch (exam.status) {
      case 'DRAFT':
        return {
          label: 'Borrador',
          class: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800'
        };
      case 'PUBLISHED':
        if (exam.scheduledDate) {
          const scheduledDate = new Date(exam.scheduledDate.split('/').reverse().join('-'));
          const now = new Date();
          
          if (scheduledDate > now) {
            return { 
              label: 'Programado', 
              class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800' 
            };
          } else {
            return {
              label: 'Listo para activar',
              class: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
            };
          }
        }
        return {
          label: 'Publicado',
          class: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
        };
      case 'ACTIVE':
        return {
          label: 'Activo',
          class: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'
        };
      case 'CLOSED':
        return {
          label: 'Finalizado',
          class: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'
        };
      case 'FINISHED':
      case 'CANCELLED':
        return { 
          label: 'Finalizado', 
          class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800' 
        };
      default:
        return {
          label: exam.status,
          class: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800'
        };
    }
  }

  
  formatDateTime(dateString: string): string {
    if (!dateString) return 'No programado';
   
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const formattedDate = new Date(`${year}-${month}-${day} ${timePart}`);
    return formattedDate.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  }

  
  onViewExam(examId: number): void {
    this.selectedExamId = examId;
    this.loading.set(true);
    
    this.applicantService.getExamById(examId).subscribe({
      next: (examData) => {
        this.selectedExamData = examData;
        this.viewExamModalVisible = true;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading exam details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los detalles del examen'
        });
        this.loading.set(false);
      }
    });
  }

  // Método para editar examen
  onEditExam(examId: number): void {
    this.selectedExamId = examId;
    this.editExamModalVisible = true;
  }

  // Método para cerrar modal de vista
  onCloseViewModal(): void {
    this.viewExamModalVisible = false;
    this.selectedExamData = null;
    this.selectedExamId = null;
  }

  // Método para cerrar modal de edición
  onCloseEditModal(): void {
    this.editExamModalVisible = false;
    this.selectedExamId = null;
  }

  // Método cuando se actualiza el examen
  onExamUpdated(): void {
    this.onCloseEditModal();
    this.loadExams();
  }

  onDeleteExam(examId: number, examName: string): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el examen "${examName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
      accept: () => {
        this.applicantService.deleteExam(examId).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Examen eliminado',
              detail: response.message
            });
            this.loadExams();
          },
          error: (error) => {
            console.error('Error deleting exam:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el examen'
            });
          }
        });
      },
      reject: () => {
       
      }
    });
  }

  onPublishExam(examId: number, examName: string): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea publicar el examen "${examName}"?`,
      header: 'Confirmar Publicación',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Sí, publicar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
      accept: () => {
        this.loading.set(true);
        this.applicantService.publishExam(examId).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: ' Examen publicado',
              detail: 'El examen ha sido publicado exitosamente',
              life: 3000
            });
            this.loadExams(); 
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error publishing exam:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo publicar el examen',
              life: 3000
            });
            this.loading.set(false);
          }
        });
      }
    });
  }

  onActivateExam(examId: number, examName: string): void {
  this.confirmationService.confirm({
    message: `¿Está seguro de que desea activar el examen "${examName}"? Los estudiantes podrán comenzar a tomarlo.`,
    header: 'Confirmar Activación',
    icon: 'pi pi-play',
    acceptLabel: 'Sí, activar',
    rejectLabel: 'Cancelar',
    acceptButtonStyleClass: 'p-button-warning',
    rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
    accept: () => {
      this.loading.set(true);
      this.applicantService.activateExam(examId).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Examen activado',
            detail: 'El examen ha sido activado exitosamente',
            life: 3000
          });
          this.loadExams(); 
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error activating exam:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo activar el examen',
            life: 3000
          });
          this.loading.set(false);
        }
      });
    }
  });
}

onCloseExam(examId: number, examName: string): void {
  this.confirmationService.confirm({
    message: `¿Está seguro de que desea cerrar el examen "${examName}"? Esta acción no se puede deshacer.`,
    header: 'Confirmar Cierre',
    icon: 'pi pi-stop',
    acceptLabel: 'Sí, cerrar',
    rejectLabel: 'Cancelar',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
    accept: () => {
      this.loading.set(true);
      this.applicantService.closeExam(examId).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Examen cerrado',
            detail: 'El examen ha sido cerrado exitosamente',
            life: 3000
          });
          this.loadExams(); 
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error closing exam:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cerrar el examen',
            life: 3000
          });
          this.loading.set(false);
        }
      });
    }
  });
}

  formatBackendDateTime(dateString: string): string {
    if (!dateString) return 'No programado';
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
