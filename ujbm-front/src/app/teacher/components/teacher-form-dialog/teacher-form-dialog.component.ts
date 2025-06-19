import { Component, OnInit, OnChanges, SimpleChanges, inject, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { signal } from '@angular/core';

import { TeacherService } from '../../services/teacher-service';
import { ApplicantService } from '../../../applicant/services/applicant.service';
import { DocumentSearchService } from '@shared/services/document-search.service'; 
import { 
  TeacherCreateRequest, 
  TeacherTableInfoResponse,
  TeacherResponse 
} from '../../interfaces/teacher.interfaces';
import { CustomValidators } from '@shared/validators/custom-validators';
import { TextareaModule } from 'primeng/textarea';
import { Observable } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-teacher-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    CheckboxModule,
    RadioButtonModule,
    DialogModule,
    ToastModule,
    ProgressSpinner
  ],
  providers: [MessageService],
  templateUrl: './teacher-form-dialog.component.html',
  styleUrl: './teacher-form-dialog.component.scss'
})
export class TeacherFormDialogComponent implements OnInit, OnChanges, OnDestroy { 
  @Input() visible = false;
  @Input() teacherToEdit: TeacherTableInfoResponse | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private teacherService = inject(TeacherService);
  private applicantService = inject(ApplicantService);
  private documentSearchService = inject(DocumentSearchService); 
  private messageService = inject(MessageService);
 
  teacherForm!: FormGroup;
  saving = false;
  loading = false;
  searchingDocument = false; 
  showUbigeoError = false;
  
  private dataLoaded = false;
  

  departments = signal<any[]>([]);
  provinces = signal<any[]>([]);
  districts = signal<any[]>([]);
  

  documentTypes = signal<any[]>([]);
  genders = signal<any[]>([]);
  disabilityTypes = signal<any[]>([]);

  get isEditMode(): boolean {
    return !!this.teacherToEdit;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Editar Docente' : 'Crear Nuevo Docente';
  }

  get saveButtonLabel(): string {
    return this.isEditMode ? 'Actualizar' : 'Crear';
  }

  ngOnInit() {
    this.initForm();
    this.loadCatalogData();
    this.setupDisabilityControls();
    this.setupDocumentSearch(); 
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (this.teacherToEdit) {
        if (!this.dataLoaded || changes['teacherToEdit']) {
          this.loadTeacherData();
        }
      } else {
        this.resetForm();
        this.dataLoaded = false;
      }
    }

    if (changes['teacherToEdit'] && this.visible && this.teacherToEdit) {
      this.loadTeacherData();
    }
  }

  ngOnDestroy(): void {
    //el documentSearchService ya lo hace
  }

  
  private setupDocumentSearch(): void {
    this.documentSearchService.setupDocumentSearch(this.teacherForm, 'name', 'lastname');
  }

  private loadTeacherData(): void {
    if (this.teacherToEdit && this.teacherToEdit.id) {
      this.loading = true;
      this.teacherService.getTeacherById(this.teacherToEdit.id).subscribe({
        next: (teacher: TeacherResponse) => {
          this.populateForm(teacher);
          this.loading = false;
          this.dataLoaded = true;
        },
        error: (error) => {
          console.error('Error cargando datos del docente:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los datos del docente'
          });
          this.loading = false;
          this.dataLoaded = false;
        }
      });
    }
  }

  private populateForm(teacher: TeacherResponse): void {
    if (teacher.person.ubigeo) {
      this.loadLocationForEdit(teacher.person.ubigeo);
    }

    let hireDate = null;
    if (teacher.hireDate) {
      try {
        const [day, month, year] = teacher.hireDate.split('/');
        hireDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } catch (error) {
        console.error('Error parsing hire date:', error);
      }
    }

    let birthdate = null;
    if (teacher.person.birthdate) {
      try {
        const [day, month, year] = teacher.person.birthdate.split('/');
        birthdate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } catch (error) {
        console.error('Error parsing birthdate:', error);
      }
    }

    if (this.documentSearchService.temporarilyDisable) {
    this.documentSearchService.temporarilyDisable();
  }

    this.teacherForm.patchValue({
      name: teacher.person.name,
      lastname: teacher.person.lastname,
      documentType: teacher.person.documentIdType,
      documentNumber: teacher.person.documentNumber,
      email: teacher.person.email,
      phoneNumber: teacher.person.phoneNumber,
      birthdate: birthdate,
      gender: teacher.person.gender,
      address: teacher.person.address,
      professionalTitle: teacher.professionalTitle,
      academicDegree: teacher.academicDegree,
      hireDate: hireDate,
      isFullTime: teacher.isFullTime,
      hasDisability: teacher.person.hasDisability ? 'true' : 'false',
      disabilityType: teacher.person.disabilityType,
      disabilityDescription: teacher.person.disabilityDescription
    });

    if (teacher.person.ubigeo) {
      setTimeout(() => {
        this.teacherForm.patchValue({
          department: teacher.person.ubigeo.departmentCode,
          province: teacher.person.ubigeo.provinceCode,
          district: teacher.person.ubigeo.districtCode
        });
      }, 500);
    }
    if (this.documentSearchService.reactivate) {
    setTimeout(() => {
      this.documentSearchService.reactivate();
    }, 500);
  }
  }

  private loadLocationForEdit(ubigeo: any): void {
    if (ubigeo.departmentCode) {
      this.applicantService.getProvinces(ubigeo.departmentCode).subscribe({
        next: (provinces) => {
          this.provinces.set(provinces.map(p => ({
            code: p.code,
            label: p.name
          })));
          this.teacherForm.get('province')?.enable();

          if (ubigeo.provinceCode) {
            this.applicantService.getDistricts(ubigeo.departmentCode, ubigeo.provinceCode).subscribe({
              next: (districts) => {
                this.districts.set(districts.map(d => ({
                  code: d.code,
                  label: d.name
                })));
                this.teacherForm.get('district')?.enable();
              }
            });
          }
        }
      });
    }
  }

  initForm() {
    this.teacherForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(100),
        CustomValidators.onlyLettersAndSpaces()
      ]],
      lastname: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(100),
        CustomValidators.onlyLettersAndSpaces()
      ]],
      documentType: ['01', Validators.required],
      documentNumber: ['', [
        Validators.required, 
        CustomValidators.documentNumber()
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        CustomValidators.validEmail()
      ]],
      phoneNumber: ['', [
        Validators.required,
        CustomValidators.phoneNumber()
      ]],
      birthdate: [null, Validators.required],
      gender: [null, Validators.required],
      
      department: [null, Validators.required],
      province: [{value: null, disabled: true}, Validators.required],
      district: [{value: null, disabled: true}, Validators.required],
      address: [''],
      
      professionalTitle: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      academicDegree: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      hireDate: [new Date()],
      isFullTime: [false],
      
      hasDisability: ['false'],
      disabilityType: [{value: null, disabled: true}],
      disabilityDescription: [{value: null, disabled: true}]
    });
  }

  private resetForm(): void {
    this.teacherForm.reset();
    this.teacherForm.patchValue({
      documentType: '01',
      hireDate: new Date(),
      isFullTime: false,
      hasDisability: 'false'
    });
    
    this.provinces.set([]);
    this.districts.set([]);
    this.teacherForm.get('province')?.disable();
    this.teacherForm.get('district')?.disable();
    
    this.showUbigeoError = false;
    this.teacherForm.markAsUntouched();
    this.teacherForm.markAsPristine();
    this.dataLoaded = false;
  }

  loadCatalogData() {
    this.applicantService.getDocumentTypes().subscribe({
      next: (response) => { 
        try {
          const types = Array.isArray(response) ? response : 
                       (response.data && Array.isArray(response.data)) ? response.data : [];
          
          this.documentTypes.set(types.map(t => ({
            code: t.code,
            label: t.label
          })));
          
          if (this.documentTypes().length === 0) {
            this.setDefaultDocumentTypes();
          }
        } catch (error) {
          console.error('Error procesando tipos de documentos', error);
          this.setDefaultDocumentTypes();
        }
      },
      error: (err) => {
        console.error('Error cargando tipos de documentos', err);
        this.setDefaultDocumentTypes();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los tipos de documento'
        });
      }
    });

    this.applicantService.getGenders().subscribe({
      next: (genders) => {
        this.genders.set(genders.map(g => ({
          code: g.code,
          label: g.label
        })));
      },
      error: () => this.setDefaultGenders()
    });

    this.applicantService.getDisabilityTypes().subscribe({
      next: (types) => {
        this.disabilityTypes.set(types.map(t => ({
          code: t.code,
          label: t.label
        })));
      },
      error: () => this.setDefaultDisabilityTypes()
    });

    this.loadDepartments();
  }

  setDefaultDocumentTypes() {
    this.documentTypes.set([
      { code: '01', label: 'DNI' },
      { code: '04', label: 'Carnet de Extranjería' },
      { code: '06', label: 'RUC' }, // ✅ RUC incluido
      { code: '07', label: 'Pasaporte' }
    ]);
  }

  setDefaultGenders() {
    this.genders.set([
      { code: '1', label: 'Masculino' },
      { code: '2', label: 'Femenino' },
      { code: '3', label: 'Otro' }
    ]);
  }

  setDefaultDisabilityTypes() {
    this.disabilityTypes.set([
      { code: '01', label: 'Física' },
      { code: '02', label: 'Sensorial' },
      { code: '03', label: 'Intelectual' },
      { code: '04', label: 'Mental' },
      { code: '05', label: 'Múltiple' },
      { code: '12', label: 'Otros' }
    ]);
  }

  loadDepartments() {
    this.applicantService.getDepartments().subscribe({
      next: (departments) => {
        this.departments.set(departments.map(d => ({
          code: d.code,
          label: d.name
        })));
      },
      error: (err) => {
        console.error('Error loading departments', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los departamentos'
        });
      }
    });
  }

  setupDisabilityControls() {
    this.teacherForm.get('hasDisability')?.valueChanges.subscribe(value => {
      const disabilityType = this.teacherForm.get('disabilityType');
      const disabilityDescription = this.teacherForm.get('disabilityDescription');
      
      if (value === 'true') {
        disabilityType?.enable();
        disabilityType?.setValidators([Validators.required]);
      } else {
        disabilityType?.disable();
        disabilityType?.clearValidators();
        disabilityType?.setValue(null);
        
        disabilityDescription?.disable();
        disabilityDescription?.clearValidators();
        disabilityDescription?.setValue(null);
      }
      
      disabilityType?.updateValueAndValidity();
      disabilityDescription?.updateValueAndValidity();
    });
  }

  onDepartmentChange(event: any) {
    const departmentCode = event.value;
    if (departmentCode) {
      this.teacherForm.get('province')?.enable();
      this.teacherForm.patchValue({
        province: null,
        district: null
      });
      
      this.applicantService.getProvinces(departmentCode).subscribe({
        next: (provinces) => {
          this.provinces.set(provinces.map(p => ({
            code: p.code,
            label: p.name
          })));
          this.districts.set([]);
        },
        error: (err) => {
          console.error('Error loading provinces', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las provincias'
          });
        }
      });
    } else {
      this.teacherForm.get('province')?.disable();
      this.teacherForm.get('district')?.disable();
      this.provinces.set([]);
      this.districts.set([]);
    }
  }

  onProvinceChange(event: any) {
    const provinceCode = event.value;
    const departmentCode = this.teacherForm.get('department')?.value;
    
    if (departmentCode && provinceCode) {
      this.teacherForm.get('district')?.enable();
      this.teacherForm.get('district')?.setValue(null);
      
      this.applicantService.getDistricts(departmentCode, provinceCode).subscribe({
        next: (districts) => {
          this.districts.set(districts.map(d => ({
            code: d.code,
            label: d.name
          })));
        },
        error: (err) => {
          console.error('Error loading districts', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los distritos'
          });
        }
      });
    } else {
      this.teacherForm.get('district')?.disable();
      this.districts.set([]);
    }
  }

  onDisabilityTypeChange(event: any) {
    const disabilityType = event.value;
    const disabilityDescription = this.teacherForm.get('disabilityDescription');
    
    if (disabilityType === '12') {
      disabilityDescription?.enable();
      disabilityDescription?.setValidators([Validators.required]);
    } else {
      disabilityDescription?.disable();
      disabilityDescription?.clearValidators();
      disabilityDescription?.setValue(null);
    }
    
    disabilityDescription?.updateValueAndValidity();
  }


  searchByDocumentManually() {
    const documentType = this.teacherForm.get('documentType')?.value;
    const documentNumber = this.teacherForm.get('documentNumber')?.value;
    
    if (!documentType || !documentNumber) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Seleccione el tipo de documento e ingrese el número'
      });
      return;
    }
    
    if (documentType === '01' && documentNumber.length === 8) {
      this.messageService.add({
        severity: 'info',
        summary: 'Búsqueda automática',
        detail: 'Los datos se buscarán automáticamente al ingresar 8 dígitos del DNI'
      });
    } else if (documentType === '06' && documentNumber.length === 11) {
      this.messageService.add({
        severity: 'info',
        summary: 'Búsqueda automática',
        detail: 'Los datos se buscarán automáticamente al ingresar 11 dígitos del RUC'
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Búsqueda soportada',
        detail: 'La búsqueda automática funciona con DNI (8 dígitos) y RUC (11 dígitos)'
      });
    }
  }

  isInvalid(field: string): boolean {
    const control = this.teacherForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.teacherForm.get(field);
    
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Campo requerido';
    if (control.errors['email']) return 'Correo electrónico inválido';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['pattern']) return 'Formato inválido';
    if (control.errors['invalidDocumentNumber']) return 'Número de documento inválido';
    if (control.errors['invalidEmail']) return 'Correo electrónico inválido';
    if (control.errors['invalidPhoneNumber']) return 'Número de teléfono inválido';
    if (control.errors['onlyLettersAndSpaces']) return 'Solo se permiten letras y espacios';
    
    return 'Campo inválido';
  }

  formatDateForBackend(date: Date | null): string {
    if (!date) return '';
    
    if (typeof date === 'string') return date;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  save() {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'Complete todos los campos requeridos correctamente'
      });
      return;
    }
    
    this.saving = true;
    this.showUbigeoError = false;
    const formValue = this.teacherForm.getRawValue();
    
    try {
      const teacherData: TeacherCreateRequest = {
        person: {
          name: formValue.name,
          lastname: formValue.lastname,
          documentIdType: formValue.documentType,
          documentNumber: formValue.documentNumber,
          email: formValue.email,
          phoneNumber: formValue.phoneNumber,
          address: formValue.address || '',
          birthdate: this.formatDateForBackend(formValue.birthdate),
          type: '03', 
          enrollmentMode: '00', 
          ubigeo: {
            departmentCode: formValue.department,  
            provinceCode: formValue.province,       
            districtCode: formValue.district       
          },
          guardianName: '',
          guardianLastname: '',
          guardianPhoneNumber: '',
          guardianEmail: '',
          hasDisability: formValue.hasDisability === 'true',
          disabilityType: formValue.hasDisability === 'true' ? formValue.disabilityType : undefined,
          disabilityDescription: formValue.hasDisability === 'true' && formValue.disabilityType === '12' 
            ? formValue.disabilityDescription 
            : undefined,
          gender: formValue.gender,
          available: true
        },
        professionalTitle: formValue.professionalTitle,
        academicDegree: formValue.academicDegree,
        hireDate: this.formatDateForBackend(formValue.hireDate),
        isFullTime: formValue.isFullTime || false
      };

      const operation = this.isEditMode 
        ? this.teacherService.updateTeacher(this.teacherToEdit!.id, teacherData)
        : this.teacherService.createTeacher(teacherData);

      (operation as Observable<TeacherResponse>).subscribe({
        next: (response) => {
          this.saving = false;
          this.messageService.add({
            severity: 'success',
            summary: this.isEditMode ? 'Docente Actualizado' : 'Docente Creado',
            detail: this.isEditMode 
              ? 'El docente ha sido actualizado exitosamente'
              : 'El docente ha sido creado exitosamente'
          });
          this.dataLoaded = false;
          this.onHide();
          this.saved.emit();
        },
        error: (error) => {
          let errorMessage = 'No se pudo registrar el docente.';

          // Obtener el mensaje del backend de manera segura
          const backendMsg = error?.error?.message ||
                            error?.message ||
                            error?.error?.Detail ||
                            error?.error?.defaultMessage || '';

          const lowerMsg = backendMsg.toLowerCase();

          // detectar errores por restricciones de clave única (más confiable)
          if (backendMsg.includes('uklg3krm9dihgjfnbi7wgw7eowq') ||
              backendMsg.includes('Ya existe la llave (document_number)')) {
            errorMessage = 'El número de documento ya está registrado. Por favor, use un número diferente.';
          }
          else if (backendMsg.includes('ukfwmwi44u55bo4rvwsv0cln012') ||
                  backendMsg.includes('Ya existe la llave (email)')) {
            errorMessage = 'El correo electrónico ya está registrado. Por favor, use un correo diferente.';
          }

          // validación de DNI inválido
          else if (
            lowerMsg.includes('invalid document number') ||
            (lowerMsg.includes('número de documento') && lowerMsg.includes('no es válido')) ||
            (lowerMsg.includes('dni') && lowerMsg.includes('inválido'))
          ) {
            errorMessage = 'El número de documento ingresado no es válido. Verifique que el DNI tenga 8 dígitos.';
          }

          // usar el mensaje del backend si no se detecta otro error específico
          else if (backendMsg) {
            errorMessage = backendMsg;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
          this.saving = false;
          
          if (error.message?.includes('Ubigeo') || 
              error.error?.message?.includes('Ubigeo') || 
              error.error?.message?.includes('departamento') ||
              error.error?.message?.includes('provincia') ||
              error.error?.message?.includes('distrito')) {
            this.showUbigeoError = true;
            this.messageService.add({
              severity: 'error',
              summary: 'Error de ubicación',
              detail: 'La ubicación seleccionada no es válida. Por favor, verifique departamento, provincia y distrito.'
            });
          }
        }
      });
      
    } catch (error) {
      console.error('Error preparing teacher data:', error);
      this.saving = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al preparar los datos del docente'
      });
    }
  }

  cancel() {
    this.saving = false; 
    this.showUbigeoError = false;
    this.visibleChange.emit(false);
  }

  onHide() {
    this.saving = false;
    this.showUbigeoError = false;
    this.visibleChange.emit(false);
  }
}