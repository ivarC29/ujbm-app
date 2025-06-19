import { Component, signal } from '@angular/core';
import { BaseTableComponent } from '@shared/utils/base-table.component';
import { EnrollmentAdminResponse, EnrollmentDetailsResponse, EnrollmentFilterRequest, EnrollmentPage, ProgramSelectResponse } from '../../interfaces/student-enrollment.interfaces';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StudentService } from '../../services/student.service';
import { DatePickerModule } from 'primeng/datepicker';
import { EnumOptionResponse } from 'src/app/applicant/interfaces/enrollment-mode.interface';


@Component({
  selector: 'app-student-enrollment-admin',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TagModule ,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    PaginatorModule,
    ToolbarModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    SkeletonModule,
    SelectModule,
    DatePickerModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './student-enrollment-admin.component.html',
  styleUrl: './student-enrollment-admin.component.scss'
})
export class StudentEnrollmentAdminComponent extends BaseTableComponent<EnrollmentAdminResponse & {name: string}, EnrollmentFilterRequest> {
// Signals para datos dinámicos
  programs = signal<ProgramSelectResponse[]>([]);
  enrollmentStatuses = signal<EnumOptionResponse[]>([]);
  enrollmentDetailStatuses = signal<EnumOptionResponse[]>([]);
  
  // Estado del detalle
  detailsDialogVisible = false;
  selectedEnrollmentId?: number;
  selectedEnrollmentDetails?: EnrollmentDetailsResponse;
  loadingDetails = false;
  
  private globalSearchTerm = "";
  
  statusOptions = [
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Confirmada', value: 'CONFIRMED' },
    { label: 'Rechazada', value: 'CANCELLED' },
    { label: 'En Proceso', value: 'DRAFT' }
  ];


  loadingConfirm = signal<number | null>(null); 
  loadingReject = signal<number | null>(null);  
  loadingView = signal<number | null>(null);    

  constructor(
    messageService: MessageService,
    confirmationService: ConfirmationService,
    private enrollmentService: StudentService
  ) {
    super(messageService, confirmationService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadPrograms();
  }

  getInitialFilter(): EnrollmentFilterRequest {
    return {
      page: 0,
      size: 10,
      sortBy: 'enrollmentDate',
      sortDirection: 'DESC',
      status: 'PENDING' 
    };
  }

  loadItems(): void {
    if (this.isProcessingAction) return;

    this.isProcessingAction = true;
    this.loading.set(true);
    
   
    const filterRequest: EnrollmentFilterRequest = {
      ...this.currentFilter
    };
    
     

    this.enrollmentService.filterEnrollments(filterRequest).subscribe({
      next: (response: EnrollmentPage) => {
        const mappedContent = response.content.map(enrollment => ({
          ...enrollment,
          name: enrollment.studentName 
        }));

        this.items.set(mappedContent);
        this.totalRecords = response.page.totalElements;
        this.loading.set(false);
        this.isProcessingAction = false;
      },
      error: (error) => {
        this.showErrorMessage(
          'Error', 
          `No se pudieron cargar las matrículas. ${error.error?.message || error.message || ''}`
        );
        this.loading.set(false);
        this.isProcessingAction = false;
      }
    });
  }

  deleteItem(item: EnrollmentAdminResponse): void {
    // No se implementa
  }

  getItemDisplayName(item: EnrollmentAdminResponse): string {
    return `Matrícula de ${item.studentName} (${item.studentCode})`;
  }

  private loadPrograms(): void {
    this.enrollmentService.getPrograms().subscribe({
      next: (programs) => this.programs.set(programs),
      error: (error) => console.error('Error loading programs:', error)
    });
  }

  // Método personalizado para búsqueda global
  override onGlobalSearch(value: string): void {
  
  this.globalSearchTerm = value?.trim() || '';
  this.resetPagination();
  
  if (this.globalSearchTerm) {
    this.currentFilter.studentName = this.globalSearchTerm;
  } else {
    delete this.currentFilter.studentName;
  }
  
  this.loadItems();
}


  onProgramFilterChange(event: any): void {
    const programId = event.value;
    this.onColumnFilter('programId', programId);
  }

  onStatusFilterChange(event: any): void {
    const status = event.value;
    this.onColumnFilter('status', status);
  }

  onDateFilterChange(event: any): void {
    const date = event;
    this.onColumnFilter('enrollmentDate', date);
  }

  protected override applyColumnFilter(field: string, value: any): void {
    if (field === 'enrollmentDate' && value) {
      this.currentFilter.enrollmentDate = value;
    } else {
  
      super.applyColumnFilter(field, value);
    }
  }

  confirmEnrollment(id: number): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea confirmar esta matrícula?',
      header: 'Confirmar Matrícula',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.loadingConfirm.set(id);
        
        this.enrollmentService.confirmEnrollment(id).subscribe({
          next: (response) => {
            this.showSuccessMessage('Éxito', 'Matrícula confirmada correctamente');
            this.loadItems(); 
            
            if (this.selectedEnrollmentDetails?.id === id) {
              this.selectedEnrollmentDetails = response;
            }
            
            this.loadingConfirm.set(null);
          },
          error: (error) => {
            this.showErrorMessage(
              'Error', 
              `No se pudo confirmar la matrícula. ${error.error?.message || error.message || ''}`
            );
            this.loadingConfirm.set(null);
          }
        });
      }
    });
  }

  rejectEnrollment(id: number): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea rechazar esta matrícula? Esta acción no se puede deshacer.',
      header: 'Rechazar Matrícula',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Rechazar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.loadingReject.set(id);
        
        this.enrollmentService.rejectEnrollment(id).subscribe({
          next: (response) => {
            this.showSuccessMessage('Éxito', 'Matrícula rechazada correctamente');
            this.loadItems(); 
            
            if (this.selectedEnrollmentDetails?.id === id) {
              this.selectedEnrollmentDetails = response;
            }
            
            this.loadingReject.set(null);
          },
          error: (error) => {
            this.showErrorMessage(
              'Error', 
              `No se pudo rechazar la matrícula. ${error.error?.message || error.message || ''}`
            );
            this.loadingReject.set(null);
          }
        });
      }
    });
  }

  viewEnrollmentDetails(enrollment: any): void {
    this.loadingView.set(enrollment.id);
    this.selectedEnrollmentId = enrollment.id;
    this.loadingDetails = true;
    this.detailsDialogVisible = true;

    this.enrollmentService.getEnrollmentDetails(enrollment.id).subscribe({
      next: (response) => {
        this.selectedEnrollmentDetails = response;
        this.loadingDetails = false;
        this.loadingView.set(null);
      },
      error: (error) => {
        this.showErrorMessage(
          'Error', 
          `No se pudieron cargar los detalles. ${error.error?.message || error.message || ''}`
        );
        this.loadingDetails = false;
        this.loadingView.set(null);
        this.detailsDialogVisible = false;
      }
    });
  }

  isActionDisabled(enrollmentId: number, action: 'view' | 'confirm' | 'reject'): boolean {
    switch (action) {
      case 'view':
        return this.loadingView() === enrollmentId || this.isProcessingAction;
      case 'confirm':
        return this.loadingConfirm() === enrollmentId || this.loadingReject() === enrollmentId || this.isProcessingAction;
      case 'reject':
        return this.loadingReject() === enrollmentId || this.loadingConfirm() === enrollmentId || this.isProcessingAction;
      default:
        return false;
    }
  }

  getButtonIcon(enrollmentId: number, action: 'view' | 'confirm' | 'reject'): string {
    switch (action) {
      case 'view':
        return this.loadingView() === enrollmentId ? 'pi pi-spin pi-spinner' : 'pi pi-eye';
      case 'confirm':
        return this.loadingConfirm() === enrollmentId ? 'pi pi-spin pi-spinner' : 'pi pi-check';
      case 'reject':
        return this.loadingReject() === enrollmentId ? 'pi pi-spin pi-spinner' : 'pi pi-times';
      default:
        return '';
    }
  }

  

  private processEnrollmentConfirmation(id: number): void {
    this.enrollmentService.confirmEnrollment(id).subscribe({
      next: (response) => {
        this.showSuccessMessage('Matrícula Confirmada', 'La matrícula ha sido confirmada exitosamente');
        
        if (this.detailsDialogVisible && this.selectedEnrollmentId === id) {
          this.selectedEnrollmentDetails = response;
        }
        this.loadItems();
      },
      error: (error) => {
        this.showErrorMessage(
          'Error al Confirmar Matrícula', 
          error.error?.message || 'Ha ocurrido un error al confirmar la matrícula'
        );
      }
    });
  }

  private processEnrollmentRejection(id: number): void {
    this.enrollmentService.rejectEnrollment(id).subscribe({
      next: (response) => {
        this.showSuccessMessage('Matrícula Rechazada', 'La matrícula ha sido rechazada exitosamente');    
        if (this.detailsDialogVisible && this.selectedEnrollmentId === id) {
          this.selectedEnrollmentDetails = response;
        }

        this.loadItems();
      },
      error: (error) => {
        this.showErrorMessage(
          'Error al Rechazar Matrícula', 
          error.error?.message || 'Ha ocurrido un error al rechazar la matrícula'
        );
      }
    });
  }



  getDateFilterValue(): Date | null {
  if (this.currentFilter.enrollmentDate) {
    if (typeof this.currentFilter.enrollmentDate === 'string') {
      return new Date(this.currentFilter.enrollmentDate + 'T00:00:00');
    } else if (this.currentFilter.enrollmentDate instanceof Date) {
      return this.currentFilter.enrollmentDate;
    }
  }
  return null;
}

  formatDate(date: string): string {
    return this.enrollmentService.formatDate(date);
  }
  
  getStatusClass(status: string): string {
    return this.enrollmentService.getStatusClass(status);
  }
  
  getStatusLabel(status: string): string {
    return this.enrollmentService.getStatusLabel(status);
  }

  getDetailStatusLabel(status: string): string {
  switch(status) {
    case 'REGISTERED': return 'Registrado';
    case 'NOT_REGISTERED': return 'No Registrado';
    case 'CANCELLED': return 'Cancelado';
    default: return status;
  }
}

getDetailStatusClass(status: string): string {
  switch(status) {
    case 'REGISTERED': 
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'NOT_REGISTERED': 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    case 'CANCELLED': 
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
}
  
  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedEnrollmentId = undefined;
    this.selectedEnrollmentDetails = undefined;
  }

  override clear(table: any): void {
  
  this.globalSearchTerm = '';
  
  setTimeout(() => {
    const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }, 0);
  
  // Resetear filtros a valores iniciales
  this.currentFilter = this.getInitialFilter();
  this.resetPagination();
  
  // Recargar datos
  this.loadItems();
  
  if (table) {
    table.clear();
  }
}
}