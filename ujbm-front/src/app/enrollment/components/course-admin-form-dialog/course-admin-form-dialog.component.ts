import { Component, EventEmitter, Input, Output, signal, SimpleChange, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { CourseAdminService } from '../../service/course-admin.service';
import { CourseRequest, CourseResponse } from '../../interfaces/course-admin.interface';
import { ProgramResponse } from '@shared/interfaces/program.interfaces';
import { ApplicantService } from 'src/app/applicant/services/applicant.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-course-admin-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    MessageModule,
    ProgressSpinnerModule,
    SelectModule,
    ToastModule 
  ],
  providers: [MessageService],
  templateUrl: './course-admin-form-dialog.component.html',
  styleUrls: ['./course-admin-form-dialog.component.scss']
})
export class CourseAdminFormDialogComponent {
  @Input() courseToEdit: CourseResponse | null = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() courseCreated = new EventEmitter<void>();
  @Output() courseUpdated = new EventEmitter<void>();


  courseForm: FormGroup;
  saving = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  programs = signal<ProgramResponse[]>([]);
  loadingPrograms = signal<boolean>(false);

  private dataLoaded = false;

  get isEditMode(): boolean {
    return !!this.courseToEdit;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Editar Curso' : 'Crear Nuevo Curso';
  }

  get saveButtonLabel(): string {
    return this.isEditMode ? 'Actualizar' : 'Crear';
  }

  constructor(
    private fb: FormBuilder,
    private courseService: CourseAdminService,
    private applicantService: ApplicantService,
    private messageService: MessageService
  ) {
    this.courseForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadPrograms();
  }

  ngOnChanges(changes: SimpleChanges): void {
   if (changes['visible'] && this.visible) {
      if (this.courseToEdit) {
        // solo cargar si no se han cargado los datos o si cambió el curso
        if (!this.dataLoaded || changes['courseToEdit']) {
          this.loadCourseData();
        }
      } else {
        //para crear nuevo curso
        this.resetForm();
        this.dataLoaded = false;
      }
    }

    // si cambió courseToEdit y el dialog está visible
    if (changes['courseToEdit'] && this.visible && this.courseToEdit) {
      this.loadCourseData();
    }
  }
  

  private createForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      credits: [null, [Validators.required, Validators.min(1), Validators.max(6)]],
      cycle: [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      programId: [null, [Validators.required]]
    });
  }

 private loadPrograms(): void {
    this.loadingPrograms.set(true);
    this.applicantService.getPrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);
        this.loadingPrograms.set(false);
      },
      error: (error) => {
        console.error('Error cargando programas:', error);
        this.loadingPrograms.set(false);
      }
    });
  }

  private loadCourseData(): void {
   if (this.courseToEdit) {
      this.loading.set(true);
      this.courseService.getCourseById(this.courseToEdit.id).subscribe({
        next: (course) => {
          this.courseForm.patchValue({
            code: course.code,
            name: course.name,
            credits: course.credits,
            cycle: course.cycle,
            programId: course.programId
          });
          this.loading.set(false);
          this.dataLoaded = true; 
        },
        error: (error) => {
          console.error('Error cargando curso:', error);
          this.errorMessage.set('Error al cargar los datos del curso');
          this.loading.set(false);
          this.dataLoaded = false;
        }
      });
    }
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.errorMessage.set('');
  }

  onSave(): void {
    if (this.courseForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const courseRequest: CourseRequest = this.courseForm.value;

     const operation = this.isEditMode 
      ? this.courseService.updateCourse(this.courseToEdit!.id, courseRequest)
      : this.courseService.createCourse(courseRequest);

    operation.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Curso Actualizado' : 'Curso Creado',
          detail: this.isEditMode 
            ? `El curso "${response.name}" ha sido actualizado exitosamente`
            : `El curso "${response.name}" ha sido creado exitosamente`,
          life: 5000
        });
        
        if (this.isEditMode) {
          this.courseUpdated.emit();
        } else {
          this.courseCreated.emit();
        }
        this.dataLoaded = false;
        this.onHide();
        this.saving.set(false);
      },
      error: (error) => {
  console.error('Error saving course:', error);

  // Obtener mensaje del backend
  const backendMsg = error.error?.message || error.message || '';
  let summary = 'Error';
  let detail = backendMsg || `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el curso. Inténtalo de nuevo.`;

  // Manejo específico para código duplicado
  if (backendMsg.includes('Ya existe un curso con el código')) {
    summary = 'Código duplicado';
    detail = backendMsg;
  }

  this.messageService.add({
    severity: 'error',
    summary,
    detail,
    life: 6000
  });

  this.errorMessage.set(detail);
  this.saving.set(false);
}
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.courseForm.controls).forEach(key => {
      const control = this.courseForm.get(key);
      control?.markAsTouched();
    });
  }

 private resetForm(): void {
    this.courseForm.reset();
    this.courseForm.patchValue({
      code: '',
      name: '',
      credits: null,
      cycle: null,
      programId: null
    });
    this.errorMessage.set('');
    this.courseForm.markAsUntouched();
    this.courseForm.markAsPristine();
    this.dataLoaded = false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} debe ser mayor a ${field.errors['min'].min - 1}`;
      if (field.errors['max']) return `${this.getFieldLabel(fieldName)} no puede ser mayor a ${field.errors['max'].max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      code: 'Código',
      name: 'Nombre',
      credits: 'Créditos',
      cycle: 'Ciclo',
      programId: 'Programa'
    };
    return labels[fieldName] || fieldName;
  }

  creditOptions = [
    { label: '1 Crédito', value: 1 },
    { label: '2 Créditos', value: 2 },
    { label: '3 Créditos', value: 3 },
    { label: '4 Créditos', value: 4 },
    { label: '5 Créditos', value: 5 },
    { label: '6 Créditos', value: 6 }
  ];

  cycleOptions = [
    { label: 'Ciclo I', value: 1, description: 'Primer Ciclo' },
    { label: 'Ciclo II', value: 2, description: 'Segundo Ciclo' },
    { label: 'Ciclo III', value: 3, description: 'Tercer Ciclo' },
    { label: 'Ciclo IV', value: 4, description: 'Cuarto Ciclo' },
    { label: 'Ciclo V', value: 5, description: 'Quinto Ciclo' },
    { label: 'Ciclo VI', value: 6, description: 'Sexto Ciclo' },
    { label: 'Ciclo VII', value: 7, description: 'Séptimo Ciclo' },
    { label: 'Ciclo VIII', value: 8, description: 'Octavo Ciclo' },
    { label: 'Ciclo IX', value: 9, description: 'Noveno Ciclo' },
    { label: 'Ciclo X', value: 10, description: 'Décimo Ciclo' }
  ];
}