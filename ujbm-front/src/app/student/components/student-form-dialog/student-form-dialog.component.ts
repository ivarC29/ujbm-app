import { Component, EventEmitter, Input, Output, SimpleChanges, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { StudentService } from '../../services/student.service';
import { StudentRequest, StudentResponse } from '../../interfaces/student.interfaces';
import { ProgramResponse } from '@shared/interfaces/program.interfaces';
import { ApplicantService } from 'src/app/applicant/services/applicant.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TextInputComponent } from '@shared/components/text-input/text-input.component';
import { DateInputComponent } from '@shared/components/date-input/date-input.component';
import { SelectInputComponent } from '@shared/components/select-input/select-input-component';
import { RadioGroupComponent as AppSharedRadioGroupComponent } from '@shared/components/radio-button/radio-button.component'; // Alias para evitar conflicto
import { UbigeoResponse } from 'src/app/applicant/interfaces/ubigeo.interface';
import { Subscription } from 'rxjs';
import { DocumentSearchService } from '@shared/services/document-search.service'; 
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { EnumOptionResponse } from 'src/app/applicant/interfaces/enrollment-mode.interface';
import { GenderResponse } from '@shared/interfaces/person.interfaces';


@Component({
  selector: 'app-student-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ToastModule,
    TextareaModule,
    ProgressSpinnerModule,
    MessageModule,
    TextInputComponent,
    DateInputComponent,
    SelectInputComponent,
    AppSharedRadioGroupComponent
  ],
  providers: [MessageService],
  templateUrl: './student-form-dialog.component.html',
  styleUrls: ['./student-form-dialog.component.scss']
})
export class StudentFormDialogComponent implements OnInit, OnDestroy {
  @Input() studentToEdit: any = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() studentCreated = new EventEmitter<void>();
  @Output() studentUpdated = new EventEmitter<void>();

  studentForm!: FormGroup;
  saving = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  private applicantService = inject(ApplicantService);
  private documentSearchService = inject(DocumentSearchService); 
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private messageService = inject(MessageService);

  // Signals para selects
  programs = toSignal(this.applicantService.getPrograms(), { initialValue: [] });
  
  documentTypes = toSignal(
    this.applicantService.getDocumentTypes().pipe(
      map(data => Array.isArray(data) ? data.filter(type => type.code !== '00') : [])
    ), { initialValue: [] }
  );

  genders = toSignal(
    this.applicantService.getGenders().pipe(
      map(genders => genders.map(g => ({ code: g.code, label: g.label }))) 
    ), { initialValue: [] }
  );
  
  enrollmentModes = toSignal(
    this.applicantService.getEnrollmentModes().pipe(
      map(modes => Array.isArray(modes) ? modes.filter(mode => mode.code !== '00') : [])
    ), { initialValue: [] }
  );
  
  disabilityTypes = toSignal(this.applicantService.getDisabilityTypes(), { initialValue: [] });

  departments = toSignal(this.applicantService.getDepartments(), { initialValue: [] });
  provinces = signal<UbigeoResponse[]>([]);
  districts = signal<UbigeoResponse[]>([]);

  cycleOptions = [
  { value: 1, label: 'Ciclo I' },
  { value: 2, label: 'Ciclo II' },
  { value: 3, label: 'Ciclo III' },
  { value: 4, label: 'Ciclo IV' },
  { value: 5, label: 'Ciclo V' },
  { value: 6, label: 'Ciclo VI' },
  { value: 7, label: 'Ciclo VII' },
  { value: 8, label: 'Ciclo VIII' },
  { value: 9, label: 'Ciclo IX' },
  { value: 10, label: 'Ciclo X' }
];


  // Subscripciones para limpiar
  private departmentSubscription?: Subscription;
  private provinceSubscription?: Subscription;
 


  constructor() {
    this.studentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCatalogData();
    this.setupFormListeners();
    this.documentSearchService.setupDocumentSearch(this.studentForm); 
    this.documentSearchService.setupGuardianDocumentSearch(this.studentForm); 
  }

  ngOnDestroy(): void {
    this.departmentSubscription?.unsubscribe();
    this.provinceSubscription?.unsubscribe();
  }

  private setupFormListeners(): void {
    this.departmentSubscription = this.studentForm.get('department')?.valueChanges.subscribe(departmentCode => {
      const provinceControl = this.studentForm.get('province');
      const districtControl = this.studentForm.get('district');

      this.provinces.set([]);
      this.districts.set([]);
      provinceControl?.setValue('');
      districtControl?.setValue('');

      if (departmentCode) {
        this.applicantService.getProvinces(departmentCode).subscribe(provinces => {
          this.provinces.set(provinces);
          provinceControl?.enable(); 
        });
        districtControl?.disable(); 
      } else {
        provinceControl?.disable(); 
        districtControl?.disable(); 
      }
    });

    this.provinceSubscription = this.studentForm.get('province')?.valueChanges.subscribe(provinceCode => {
      const districtControl = this.studentForm.get('district');
      this.districts.set([]);
      districtControl?.setValue('');

      if (provinceCode) {
        const departmentCode = this.studentForm.get('department')?.value;
        if (departmentCode) {
          this.applicantService.getDistricts(departmentCode, provinceCode).subscribe(districts => {
            this.districts.set(districts);
            districtControl?.enable(); 
          });
        } else {
          districtControl?.disable(); 
        }
      } else {
        districtControl?.disable(); 
      }
    });

    // inicializar el estado de los campos de ubigeo al cargar el formulario
    // Esto es importante si el formulario se abre para edición y ya hay valores.
    const initialDepartment = this.studentForm.get('department')?.value;
    const initialProvince = this.studentForm.get('province')?.value;

    if (!initialDepartment) {
      this.studentForm.get('province')?.disable();
      this.studentForm.get('district')?.disable();
    } else {
      this.studentForm.get('province')?.enable();
      if (!initialProvince) {
        this.studentForm.get('district')?.disable();
      } else {
        this.studentForm.get('district')?.enable();
      }
    }
  }


  private loadCatalogData(): void {
    // Los signals ya cargan los datos. 
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.studentForm.reset(); 
      this.provinces.set([]); 
      this.districts.set([]); 

      this.studentForm.get('province')?.disable();
      this.studentForm.get('district')?.disable();

      if (this.studentToEdit) {
        this.loadStudentData();
      } else {
        
        this.studentForm.patchValue({
          type: '02', 
          hasGuardian: 'false',
          hasDisability: 'false',
          available: true
        });
        this.studentForm.get('province')?.disable();
        this.studentForm.get('district')?.disable();
      }
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      enrollmentDate: ['', Validators.required],
      programId: [null, Validators.required],
      cycle: [null, Validators.required],
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      documentType: ['', Validators.required],
      documentNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: [''],
      birthdate: ['', Validators.required],
      type: ['02'], 
      enrollmentMode: ['', Validators.required],
      gender: ['', Validators.required], 
      department: [''],
      province: [''],
      district: [''],
      hasGuardian: ['false'], 
      guardianName: [''],
      guardianLastname: [''],
      guardianDocumentType: [''],
      guardianDocumentNumber: [''],
      guardianPhoneNumber: [''],
      guardianEmail: [''],
      hasDisability: ['false'],
      disabilityType: [''],
      disabilityDescription: [''],
      available: [true]
    });
  }

  private loadStudentData(): void {
    if (this.studentToEdit && this.studentToEdit.id) {
      this.loading.set(true);
      this.studentService.getStudentById(this.studentToEdit.id).subscribe({
        next: (student: StudentResponse) => {
           // Convertir fechas a Date para el datepicker
        const enrollmentDate = student.enrollmentDate
          ? new Date(student.enrollmentDate + 'T00:00:00')
          : null;

        // Convertir birthdate - el backend puede enviar en DD/MM/YYYY o YYYY-MM-DD
        let birthdate = null;
        if (student.person.birthdate) {
          if (student.person.birthdate.includes('/')) {
            // Si viene en formato DD/MM/YYYY, convertir a Date
            const [day, month, year] = student.person.birthdate.split('/');
            birthdate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            // Si viene en formato ISO YYYY-MM-DD, convertir normalmente
            birthdate = new Date(student.person.birthdate + 'T00:00:00');
          }
        }

          this.studentForm.patchValue({
            enrollmentDate, 
            programId: student.programId,
            cycle: student.cycle,
            name: student.person.name,
            lastname: student.person.lastname,
            documentType: student.person.documentIdType,
            documentNumber: student.person.documentNumber,
            email: student.person.email,
            phoneNumber: student.person.phoneNumber,
            address: student.person.address,
            birthdate: birthdate, 
            type: student.person.type,
            enrollmentMode: student.person.enrollmentMode,
            gender: student.person.gender, 
            department: student.person.ubigeo?.departmentCode,
            province: student.person.ubigeo?.provinceCode,
            district: student.person.ubigeo?.districtCode,
            hasGuardian: student.person.guardianName ? 'true' : 'false',
            guardianName: student.person.guardianName,
            guardianLastname: student.person.guardianLastname,
            guardianPhoneNumber: student.person.guardianPhoneNumber,
            guardianEmail: student.person.guardianEmail,
            hasDisability: student.person.hasDisability ? 'true' : 'false',
            disabilityType: student.person.disabilityType,
            disabilityDescription: student.person.disabilityDescription,
            available: student.person.available
          });
          
          if (student.person.ubigeo?.departmentCode) {
            this.applicantService.getProvinces(student.person.ubigeo.departmentCode).subscribe(provinces => {
              this.provinces.set(provinces);
              
              this.studentForm.get('province')?.setValue(student.person.ubigeo?.provinceCode);
            });
          }
          if (student.person.ubigeo?.provinceCode && student.person.ubigeo?.departmentCode) {
            this.applicantService.getDistricts(student.person.ubigeo.departmentCode, student.person.ubigeo.provinceCode).subscribe(districts => {
              this.districts.set(districts);
              this.studentForm.get('district')?.setValue(student.person.ubigeo?.districtCode);
            });
          }
          this.loading.set(false);
        },
        error: (error) => {
          this.showError('Error al cargar datos del estudiante', error.error?.message || 'Error desconocido');
          this.loading.set(false);
        }
      });
    }
  }

  onHide(): void {
    // Limpiar toasts al cerrar el dialog
    this.messageService.clear();
    
    this.visibleChange.emit(false);
    this.errorMessage.set('');
    this.studentForm.reset();
    this.provinces.set([]);
    this.districts.set([]);
  }

  onSave(): void {
    if (this.studentForm.invalid) {
      this.markFormGroupTouched();
      this.showError('Formulario inválido', 'Por favor, complete todos los campos requeridos.');
      return;
    }
    this.saving.set(true);
    this.errorMessage.set('');

    const formValue = this.studentForm.value;

    let formattedEnrollmentDate = '';
    if (formValue.enrollmentDate) {
      const date = new Date(formValue.enrollmentDate);
      if (!isNaN(date.getTime())) {
        formattedEnrollmentDate = date.toISOString().split('T')[0]; // Formato ISO: YYYY-MM-DD
      } else {
        this.showError('Fecha de matrícula inválida', 'El formato de la fecha de matrícula no es correcto.');
        this.saving.set(false);
        return;
      }
    }

    let formattedBirthdate = '';
    if (formValue.birthdate) {
      const date = new Date(formValue.birthdate);
      if (!isNaN(date.getTime())) {
        // Formatear birthdate como YYYY-MM-DD para el backend (formato ISO)
        formattedBirthdate = date.toISOString().split('T')[0];
      } else {
        this.showError('Fecha de nacimiento inválida', 'El formato de la fecha de nacimiento no es correcto.');
        this.saving.set(false);
        return;
      }
    }
    
    const guardianData = formValue.hasGuardian === 'true' ? {
      guardianName: formValue.guardianName,
      guardianLastname: formValue.guardianLastname,
      guardianPhoneNumber: formValue.guardianPhoneNumber,
      guardianEmail: formValue.guardianEmail,
      guardianDocumentType: formValue.guardianDocumentType,
      guardianDocumentNumber: formValue.guardianDocumentNumber,
    } : {
      guardianName: null,
      guardianLastname: null,
      guardianPhoneNumber: null,
      guardianEmail: null,
      guardianDocumentType: null,
      guardianDocumentNumber: null,
    };

    const disabilityData = formValue.hasDisability === 'true' ? {
      hasDisability: true,
      disabilityType: formValue.disabilityType,
      disabilityDescription: formValue.disabilityDescription
    } : {
      hasDisability: false,
      disabilityType: null,
      disabilityDescription: null
    };

    const studentRequest: StudentRequest = {
      enrollmentDate: formattedEnrollmentDate,
      programId: formValue.programId,
      cycle: formValue.cycle,
      person: {
        name: formValue.name,
        lastname: formValue.lastname,
        documentIdType: formValue.documentType,
        documentNumber: formValue.documentNumber,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        address: formValue.address || '',
        birthdate: formattedBirthdate, 
        type: formValue.type || '02', 
        enrollmentMode: formValue.enrollmentMode,
        ubigeo: {
          departmentCode: formValue.department || null,
          provinceCode: formValue.province || null,
          districtCode: formValue.district || null
        },
        ...guardianData,
        ...disabilityData,
        gender: formValue.gender, 
        available: formValue.available !== false 
      }
    };

    const operation = this.studentToEdit
      ? this.studentService.updateStudent(this.studentToEdit.id, studentRequest)
      : this.studentService.createStudent(studentRequest);

   (operation as any).subscribe({
    next: (response: any) => {
      const successMessage = this.studentToEdit ? 'Estudiante actualizado' : 'Estudiante creado';
      const detailMessage = response?.message || (this.studentToEdit
        ? 'El estudiante ha sido actualizado exitosamente.'
        : 'El estudiante ha sido creado exitosamente.');
      this.showSuccess(successMessage, detailMessage);

      if (this.studentToEdit) {
        this.studentUpdated.emit();
      } else {
        this.studentCreated.emit();
      }

      
      this.onHide(); 
    },
    error: (error: any) => {
  let errorMessage = 'No se pudo registrar el postulante';

  // Obtener el mensaje del backend de manera segura
  const backendMsg = error?.error?.message || 
                     error?.message || 
                     error?.error?.Detail || 
                     error?.error?.defaultMessage || '';

  const lowerMsg = backendMsg.toLowerCase();

  // Detectar errores por restricciones de clave única (más confiable)
  if (backendMsg.includes('uklg3krm9dihgjfnbi7wgw7eowq') || 
      backendMsg.includes('Ya existe la llave (document_number)')) {
    errorMessage = 'El número de documento ya está registrado. Por favor, use un número diferente.';
  } 
  else if (backendMsg.includes('ukfwmwi44u55bo4rvwsv0cln012') || 
           backendMsg.includes('Ya existe la llave (email)')) {
    errorMessage = 'El correo electrónico ya está registrado. Por favor, use un correo diferente.';
  } 

  // Validación de DNI inválido
  else if (
    lowerMsg.includes('invalid document number') ||
    (lowerMsg.includes('número de documento') && lowerMsg.includes('no es válido')) ||
    (lowerMsg.includes('dni') && lowerMsg.includes('inválido'))
  ) {
    errorMessage = 'El número de documento ingresado no es válido. Verifique que el DNI tenga 8 dígitos.';
  } 

  // mensaje del backend si no se detecta otro error específico
  else if (backendMsg) {
    errorMessage = backendMsg;
  }

  // Mostrar el mensaje de error y detener el proceso de guardado
  this.showError('Error al guardar', errorMessage);
  this.saving.set(false);
},
complete: () => {
  this.saving.set(false);
}
    });
  }


  private markFormGroupTouched(): void {
    Object.values(this.studentForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.studentForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Ingrese un email válido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  private showSuccess(summary: string, detail: string): void {
    this.messageService.add({ severity: 'success', summary, detail, life: 4000 });
  }

  private showError(summary: string, detail: string): void {
    this.messageService.add({ severity: 'error', summary, detail, life: 5000 });
    this.errorMessage.set(detail);
  }
}
