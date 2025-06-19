import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BaseTableComponent } from '@shared/utils/base-table.component';
import { StudentService } from '../../services/student.service';
import { StudentTableInfoResponse, StudentFilterRequest } from '../../interfaces/student.interfaces';
import { ProgramResponse } from '@shared/interfaces/program.interfaces';
import { ApplicantService } from 'src/app/applicant/services/applicant.service';
import { StudentFormDialogComponent } from '../student-form-dialog/student-form-dialog.component';
import { EnrollmentModeResponse } from 'src/app/applicant/interfaces/enrollment-mode.interface';

@Component({
  selector: 'app-student-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    TooltipModule,
    SelectModule,
    InputTextModule,
    SkeletonModule,
    ConfirmDialogModule,
    ToastModule,
    StudentFormDialogComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.scss']
})
export class StudentTableComponent extends BaseTableComponent<StudentTableInfoResponse, StudentFilterRequest> implements OnInit {
  programs = signal<ProgramResponse[]>([]);
  loadingPrograms = signal<boolean>(false);
  enrollmentModes = signal<EnrollmentModeResponse[]>([]);
  loadingEnrollmentModes = signal<boolean>(false);

  formDialogVisible = false;
  studentToEdit: StudentTableInfoResponse | null = null;
  constructor(
    messageService: MessageService,
    confirmationService: ConfirmationService,
    private studentService: StudentService,
    private applicantService: ApplicantService
  ) {
    super(messageService, confirmationService);
  }

  // mapeo de campos frontend a backend similar a teacher y applicant
  private readonly sortFieldMapping: { [key: string]: string } = {
    'fullName': 'person.name',
    'code': 'code',
    'email': 'person.email',
    'enrollmentModeCode': 'person.enrollmentMode',
    'programName': 'program.name'
  };

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadPrograms();
    this.loadEnrollmentModes();
  }

  getInitialFilter(): StudentFilterRequest {
    return {
      page: 0,
      size: 10,
      sortBy: 'person.name',
      sortDirection: 'ASC',
    };
  }

  loadItems(): void {
    if (this.isProcessingAction) return;
    this.isProcessingAction = true;
    this.loading.set(true);
    this.currentFilter.size = this.rows;

    this.studentService.filterStudents(this.currentFilter).subscribe({
      next: (response) => {
        this.items.set(response.content);
        this.totalRecords = response.page.totalElements;
        this.loading.set(false);
        this.isProcessingAction = false;
      },
      error: (error) => {
        this.showErrorMessage('Error cargando estudiantes', error.error?.message || error.message || 'Error');
        this.loading.set(false);
        this.isProcessingAction = false;
      }
    });
  }

  deleteItem(student: StudentTableInfoResponse): void {
    this.studentService.deleteStudent(student.id).subscribe({
      next: () => {
        this.showSuccessMessage('Estudiante eliminado', `El estudiante "${student.fullName}" ha sido eliminado exitosamente`);
        this.loadItems();
      },
      error: (error) => {
        this.showErrorMessage('Error al eliminar', error.error?.message || 'Error al eliminar el estudiante');
      }
    });
  }

  getItemDisplayName(student: StudentTableInfoResponse): string {
    return student.fullName;
  }

  // Filtros
  private loadPrograms(): void {
    this.loadingPrograms.set(true);
    this.applicantService.getPrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);
        this.loadingPrograms.set(false);
      },
      error: () => {
        this.loadingPrograms.set(false);
      }
    });
  }
  private loadEnrollmentModes(): void {
  this.loadingEnrollmentModes.set(true);
  this.applicantService.getEnrollmentModes().subscribe({
    next: (modes) => {
      this.enrollmentModes.set(
        modes.filter(mode => mode.code !== '00')
      );
      this.loadingEnrollmentModes.set(false);
    },
    error: () => {
      this.loadingEnrollmentModes.set(false);
    },
  });
}

  onProgramFilterChange(event: any): void {
  const programId = event.value ? event.value.toString() : null;
    this.onColumnFilter('programId', programId);
  }

  onCreateStudent(): void {
    this.studentToEdit = null;
    this.formDialogVisible = true;
  }

  onEditStudent(student: StudentTableInfoResponse): void {
    this.studentToEdit = student;
    this.formDialogVisible = true;
  }

  onDeleteStudent(student: StudentTableInfoResponse): void {
    this.onDeleteWithConfirmation(student);
  }

  onStudentCreated(): void {
    this.formDialogVisible = false;
    this.studentToEdit = null;
    this.loadItems();
  }

  onStudentUpdated(): void {
    this.formDialogVisible = false;
    this.studentToEdit = null;
    this.loadItems();
  }

  onDialogClose(): void {
    this.formDialogVisible = false;
  }
  getProgramName(programId: number): string {
    const program = this.programs().find(p => p.id === programId);
    return program ? program.name : `Programa ${programId}`;
  }

  // onSort para mapear campos frontend a backend
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

  // Filtros personalizados
  protected override applyColumnFilter(field: string, value: any): void {
    const filterValue = value?.trim ? value.trim() : value;
    switch (field) {
      case 'code':
      case 'fullName':
      case 'email':
        if (filterValue && filterValue !== '') {
          (this.currentFilter as StudentFilterRequest)[field] = filterValue;
        } else {
          delete (this.currentFilter as StudentFilterRequest)[field];
        }
        break;
      case 'enrollmentModeCode':
      case 'programId':
        if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
          (this.currentFilter as StudentFilterRequest)[field] = filterValue;
        } else {
          delete (this.currentFilter as StudentFilterRequest)[field];
        }
        break;
      default:
        super.applyColumnFilter(field, value);
        return;    }
  }

  protected override applyGlobalFilter(searchValue: string): void {
    this.currentFilter.fullName = searchValue;
  }

  protected override clearGlobalFilter(): void {
    delete this.currentFilter.fullName;
  }

  get students() {
    return this.items;
  }
}
