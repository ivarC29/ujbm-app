import {Component,inject,OnInit,signal,WritableSignal,} from '@angular/core';
import {FormBuilder,FormGroup,ReactiveFormsModule,Validators,ValidatorFn} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ApplicantService } from '../../services/applicant.service';
import { ApplicantFormComponent } from '../../components/applicant-form/applicant-form.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectButtonComponent } from '@shared/components/select-button/select-button.component';
import { ButtonModule } from 'primeng/button';
import { CustomValidators } from '@shared/validators/custom-validators';
import { EnrollmentMode } from '../../interfaces/enrollment-mode.interface';
import { SelectInputComponent } from '@shared/components/select-input/select-input-component';
import { TooltipHelpComponent } from '@shared/components/tooltip-help/tooltip-help.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PageTitleComponent } from "../../../shared/components/page-title/page-title.component";
import { DocumentSearchService } from '@shared/services/document-search.service';
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { AppConfigurator } from "../../../layout/component/app.configurator";

@Component({
  selector: 'app-applicant-registry',
  standalone: true,
  providers: [MessageService],
  imports: [CommonModule, ReactiveFormsModule, ApplicantFormComponent, SelectButtonComponent, SelectButtonModule, ButtonModule, SelectInputComponent, TooltipHelpComponent, ToastModule,  PageHeaderComponent, AppConfigurator],
  templateUrl: './applicant-registry.component.html',
  styleUrls: ['./applicant-registry.component.scss'],
})
export default class ApplicantRegistryComponent implements OnInit {
  showGuardianForm: boolean = false;
  private fb = inject(FormBuilder);
  private applicantService = inject(ApplicantService);
  private messageService = inject(MessageService);
  private documentSearchService = inject(DocumentSearchService);
  private submissionInProgress = false;
  saving: boolean = false;


  title = 'Registro de postulante';
  formGroup: FormGroup;
  //Modo de inscripción
  enrollmentModes = toSignal(
    this.applicantService.getEnrollmentModes().pipe(
      map((data: any) => {
        return (data || [])
        .filter((mode: EnrollmentMode) => mode.code !== '00')
        .map((mode: EnrollmentMode) => ({
          ...mode,
          label: this.capitalizeFirstLetter(mode.label),
        }));
      })
    ),
    { initialValue: [] }
  );

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  selectedMode: WritableSignal<string>;
  selectedDescription: WritableSignal<string> = signal('');

  updateDescription(code: string) {
    const mode = this.enrollmentModes().find((m: EnrollmentMode) => m.code === code);
    this.selectedDescription.set(mode?.description || 'Examen de admisión');
  }
  constructor() {
    this.formGroup = this.fb.group({
      selectedMode: ['01', {  
        validators: [Validators.required],
        nonNullable: true,
      }],
      name: ['', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          CustomValidators.onlyLettersAndSpaces(),
        ],
        nonNullable: true,
      }],
      lastname: ['', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          CustomValidators.onlyLettersAndSpaces(),
        ],
        nonNullable: true,
      }],
      documentType: ['', {
        validators: [Validators.required],
        nonNullable: true,
      }],
      documentNumber: [
        '',
        {
          validators: [Validators.required, CustomValidators.documentNumber()],
          nonNullable: true,
        },
      ],
      email: [
        '',
        {
          validators: [
            Validators.required,
            Validators.email,
            CustomValidators.validEmail(),
          ],
          nonNullable: true,
        },
      ],
      phoneNumber: [
        '',
        {
          validators: [Validators.required, CustomValidators.phoneNumber()],
          nonNullable: true,
        },
      ],
      department: ['', Validators.required],
      province: [{ value: '', disabled: true }, Validators.required],
      district: [{ value: '', disabled: true }, Validators.required],  
      address: ['', {
        validators: [
          Validators.required,
          Validators.maxLength(200)
        ],
        nonNullable: true,
      }],
      birthdate: [
        null,
        {
          validators: [
            Validators.required,
            CustomValidators.dateFormat(),
            // CustomValidators.validAge(18),
          ],
        },
      ],
      status: ['01', { nonNullable: true }], //PENDING CODE 01
      program: [
        '',
        {
          validators: [Validators.required],
          nonNullable: true,
        },
      ],
      sex: ['', {
        validators: [Validators.required],
        nonNullable: true,
      }],
      hasDisability: ["false", Validators.required],
      disabilityType: [{ value: '', disabled: true }],
      otherDisabilityDescription: [{ value: '', disabled: true }],
      dniFile: [null, [
        Validators.required,
        CustomValidators.fileType(['pdf', 'jpg', 'jpeg', 'png']),
        CustomValidators.fileSize(5)
      ]],
      studyCertificateFile: [null, [
        Validators.required,
        CustomValidators.fileType(['pdf','jpg', 'jpeg', 'png']),
        CustomValidators.fileSize(5)
      ]],
      photoFile: [null, [
        Validators.required,
        CustomValidators.fileType(['pdf','jpg', 'jpeg', 'png']),
        CustomValidators.fileSize(2)
      ]],
      syllabusFile: [[], {
  validators: [
        CustomValidators.fileTypeForMultiple(['pdf', 'jpg', 'jpeg', 'png']),
        CustomValidators.fileSizeForMultiple(10)
      ]
    }],
      // campos del apoderado
      guardianName: [{ value: '', disabled: true }],
      guardianLastname: [{ value: '', disabled: true }],
      guardianDocumentType: [{ value: '', disabled: true }],
      guardianDocumentNumber: [{ value: '', disabled: true }],
      guardianPhone: [{ value: '', disabled: true }],
      guardianEmail: [{ value: '', disabled: true }],
      guardianRelationship: [{ value: '', disabled: true }],
      // campos de la escuela
      schoolType: ['', Validators.required],
      graduationYear: ['', [
        Validators.required,
        CustomValidators.graduationYearValidator()
      ]],
      schoolName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      schoolDepartment: ['', Validators.required],
      schoolProvince: [{ value: '', disabled: true }, Validators.required],
      schoolDistrict: [{ value: '', disabled: true }, Validators.required],
      referralSource: ['', Validators.required],
    });


      // Suscribirse a cambios en la fecha de nacimiento
      this.formGroup.get('birthdate')?.valueChanges.subscribe(date => {
        if (date) {
          this.checkAge(date);
        }
      });
      // Suscribirse a cambios del departamento
      this.formGroup.get('department')?.valueChanges.subscribe(code => {
        if (code) {
          this.updateProvinces(code);
        }
      });

      // Suscribirse a cambios de la provincia
      this.formGroup.get('province')?.valueChanges.subscribe(code => {
        if (code) {
          this.updateDistricts(code);
        }
      });

    this.setupDisabilityFieldListeners();
    this.selectedMode = signal(this.formGroup.get('selectedMode')?.value || '');
    this.updateDescription('01');

    
  }


  // metodo para obtener el valor del modo de inscripción seleccionado
  ngOnInit(): void {
    this.formGroup.get('selectedMode')?.valueChanges.subscribe((mode) => {
      this.selectedMode.set(mode);
      this.updateDescription(mode);

    // Syllabus validations
    const syllabusControl = this.formGroup.get('syllabusFile');
    if (syllabusControl) {
      if (mode === '04') {
        syllabusControl.setValidators([
          Validators.required,
          CustomValidators.fileTypeForMultiple(['pdf', 'jpg', 'jpeg', 'png']),
          CustomValidators.fileSizeForMultiple(10)
        ]);
      } else {
        syllabusControl.clearValidators();
      }
      syllabusControl.updateValueAndValidity();
    }
  });
}


  
  private checkAge(date: Date | string | null): void {
    if (!date) return;
  
    let birthDate = typeof date === 'string'
      ? this.parseDateString(date)
      : new Date(date);
  
    const age = this.calculateAge(birthDate);
    this.showGuardianForm = age < 18;
    if (this.showGuardianForm) {
      this.messageService.clear(); 
      this.messageService.add({
        severity: 'info',
        summary: 'Atención',
        detail: 'Por ser menor de edad, es necesario completar los datos del apoderado',
        life: 5000, 
        sticky: false, 
        closable: true 
      });
    }
    const guardianControls = [
      'guardianName',
      'guardianLastname',
      'guardianDocumentType',
      'guardianDocumentNumber',
      'guardianPhone',
      'guardianEmail',
      'guardianRelationship'
    ];
  
    guardianControls.forEach(control => {
      const formControl = this.formGroup.get(control);
      if (this.showGuardianForm) {
        formControl?.enable();
        formControl?.setValidators(this.getGuardianValidators(control));
        // búsqueda RENIEC/SUNAT para el guardián
        if (control === 'guardianDocumentType') {
          this.documentSearchService.setupGuardianDocumentSearch(this.formGroup);
        }
      } else {
        formControl?.disable();
        formControl?.clearValidators();
        formControl?.reset();
      }
      formControl?.updateValueAndValidity();
    });
  
  }

  private getGuardianValidators(control: string): ValidatorFn[] {
    switch (control) {
      case 'guardianName':
      case 'guardianLastname':
        return [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          CustomValidators.onlyLettersAndSpaces()
        ];
      case 'guardianDocumentType':
        return [Validators.required];
      case 'guardianDocumentNumber':
        return [
          Validators.required,
          CustomValidators.documentNumber()
        ];
      case 'guardianPhone':
        return [
          Validators.required,
          CustomValidators.phoneNumber()
        ];
      case 'guardianEmail':
        return [
          Validators.required,
          Validators.email,
          CustomValidators.validEmail()
        ];
      case 'guardianRelationship':
        return [Validators.required];
      default:
        return [];
    }
  }
  
  private parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  
 //activar y desactivar los campos de provincia y distrito
  updateProvinces(departmentCode: string): void {
    const provinceControl = this.formGroup.get('province');
    provinceControl?.enable();
    provinceControl?.setValue('');
    this.formGroup.get('district')?.disable();
    this.formGroup.get('district')?.setValue('');
  }
  
  updateDistricts(provinceCode: string): void {
    const districtControl = this.formGroup.get('district');
    districtControl?.enable();
    districtControl?.setValue('');
  }
  
  private setupDisabilityFieldListeners(): void {
    const disabilityTypeControl = this.formGroup.get('disabilityType');
    const otherDisabilityControl = this.formGroup.get('otherDisabilityDescription');
  
    this.formGroup.get('hasDisability')?.valueChanges.subscribe((value) => {
      if (value === 'true') {
        disabilityTypeControl?.enable();
        disabilityTypeControl?.setValidators([Validators.required]);
  
        disabilityTypeControl?.valueChanges.subscribe((type) => {
          if (type === '12') {
            otherDisabilityControl?.enable();
            otherDisabilityControl?.setValidators([
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(100),
            ]);
          } else {
            otherDisabilityControl?.disable();
            otherDisabilityControl?.clearValidators();
            otherDisabilityControl?.reset();
          }
          otherDisabilityControl?.updateValueAndValidity();
        });
      } else {
        disabilityTypeControl?.disable();
        disabilityTypeControl?.clearValidators();
        disabilityTypeControl?.reset();
  
        otherDisabilityControl?.disable();
        otherDisabilityControl?.clearValidators();
        otherDisabilityControl?.reset();
      }
  
      disabilityTypeControl?.updateValueAndValidity();
      otherDisabilityControl?.updateValueAndValidity();
    });
  }



  onSubmit() {
    if (this.formGroup.invalid || this.saving || this.submissionInProgress) {
    return;
   }
   this.saving = true;
   this.submissionInProgress = true;

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      if (this.showGuardianForm && this.hasInvalidGuardianFields()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Campos incompletos',
          detail: 'Debe completar todos los campos del apoderado'
        });
      }
    this.saving = false;
    this.submissionInProgress = false;
      return;
    }
  
    const formValue = this.formGroup.getRawValue();
    if (!formValue.hasDisability || formValue.hasDisability === 'false') {
      formValue.disabilityType = '11'; // codigo para "sin información"
    }
    const selectedMode = this.enrollmentModes().find(
      (mode: EnrollmentMode) => mode.code === formValue.selectedMode
    );
  
    if (!selectedMode) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error en el formulario',
        detail: 'Modo de inscripción no válido'
      });
      return;
    }
    // formatear la fecha de nacimiento
    let formattedBirthdate = formValue.birthdate;
    if (formValue.birthdate) {
      if (typeof formValue.birthdate === 'string' && formValue.birthdate.includes('/')) {
        const [day, month, year] = formValue.birthdate.split('/');
        formattedBirthdate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } 
      else if (formValue.birthdate instanceof Date) {
        formattedBirthdate = formValue.birthdate.toISOString().split('T')[0];
      }
      else if (typeof formValue.birthdate === 'string' && formValue.birthdate.includes('T')) {
        formattedBirthdate = formValue.birthdate.split('T')[0];
      }
    }
    
  
    const applicantData = {
      name: formValue.name,
      lastname: formValue.lastname,
      documentType: formValue.documentType,
      documentNumber: formValue.documentNumber,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      sex: formValue.sex,
      location: {
        department: formValue.department,           
        province: formValue.province,               
        district: formValue.district,               
        address: formValue.address
      },
      birthdate: formattedBirthdate,
      status: formValue.status || '01',
      awarenessMethod: formValue.referralSource,
      program: formValue.program,
      hasDisability: formValue.hasDisability === true || formValue.hasDisability === 'true', 
      disabilityType: (formValue.hasDisability === true || formValue.hasDisability === 'true')
  ? formValue.disabilityType
  : null,
      otherDisabilityDescription:
        (formValue.hasDisability === true || formValue.hasDisability === 'true') && formValue.disabilityType === '12'
          ? formValue.otherDisabilityDescription
          : null, 
      dniFile: formValue.dniFile,
      photoFile: formValue.photoFile,
      certificateFile: formValue.studyCertificateFile,
      syllabusFile: formValue.syllabusFile, 
      enrollmentMode: formValue.selectedMode, 
      guardian: this.showGuardianForm ? {
        name: formValue.guardianName,
        lastname: formValue.guardianLastname,
        documentType: formValue.guardianDocumentType,
        documentNumber: formValue.guardianDocumentNumber,
        phoneNumber: formValue.guardianPhone,
        email: formValue.guardianEmail,
        guardianRelationship: formValue.guardianRelationship,
      } : null,

      school: {
        type: formValue.schoolType,
        name: formValue.schoolName,
        graduationYear: formValue.graduationYear,
        location: {
          department: formValue.schoolDepartment,
          province: formValue.schoolProvince,
          district: formValue.schoolDistrict
        }
      },
      
    };
    this.applicantService.saveApplicant(applicantData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Registro exitoso',
          detail: 'Su postulación se ha registrado correctamente'
        });
        this.onClear();
          setTimeout(() => {
          window.location.href = 'https://bausate.edu.pe/';
        }, 3000);
      },
      error: (error) => {
        let errorMessage = 'No se pudo registrar el postulante';
       const backendMsg = error?.error?.message || error?.message || 
        error?.error?.Detail || error?.error?.defaultMessage || '';
      
      const lowerMsg = backendMsg.toLowerCase();
      
      // 1. DNI duplicado
      if (
        lowerMsg.includes('El DNI ya está registrado') 
      ) {
        errorMessage = 'Este documento de identidad ya está registrado en el sistema';
      }
      // 2. Email duplicado
      else if (
        lowerMsg.includes('email') && (lowerMsg.includes('duplicada') || lowerMsg.includes('duplicate')) ||
        lowerMsg.includes('correo') && lowerMsg.includes('registrado') ||
        lowerMsg.includes('ya existe la llave (email)')
      ) {
        errorMessage = 'El correo electrónico ya está registrado. Use un correo diferente';
      }
      // 3. DNI inválido
      else if (
        lowerMsg.includes('invalid document number') ||
        lowerMsg.includes('número de documento') && lowerMsg.includes('no es válido') ||
        lowerMsg.includes('dni') && lowerMsg.includes('inválido')
      ) {
        errorMessage = 'El número de documento ingresado no es válido. Verifique que el DNI tenga 8 dígitos';
      }
      // 4. Usar el mensaje del backend si existe
      else if (backendMsg) {
        errorMessage = backendMsg;
      }
        this.messageService.add({
          severity: 'error',
          summary: 'Error en el registro',
          detail: errorMessage
        });
        this.saving = false;
        this.submissionInProgress = false;
      }
    });
  }

  onClear() {
    this.formGroup.reset();
    this.formGroup.get('selectedMode')?.setValue('01');
    this.selectedMode.set('01');
    this.updateDescription('01');
    this.showGuardianForm = false;

    const disabledControls = [
      'province', 'district', 
      'schoolProvince', 'schoolDistrict'
    ];
    
    disabledControls.forEach(control => {
      const formControl = this.formGroup.get(control);
      if (formControl) {
        formControl.disable();
        formControl.setValue('');
      }
    });
  
    // restablecer hasDisability a falso
    this.formGroup.get('hasDisability')?.setValue('false');
    
    // Deshabilitar controles de discapacidad
    const disabilityControls = ['disabilityType', 'otherDisabilityDescription'];
    disabilityControls.forEach(control => {
      const formControl = this.formGroup.get(control);
      if (formControl) {
        formControl.disable();
        formControl.setValue('');
      }
    });
    
    // Deshabilitar controles del apoderado
    const guardianControls = [
      'guardianName', 'guardianLastname', 'guardianDocumentType',
      'guardianDocumentNumber', 'guardianPhone', 'guardianEmail',
      'guardianRelationship'
    ];
    guardianControls.forEach(control => {
      const formControl = this.formGroup.get(control);
      if (formControl) {
        formControl.disable();
        formControl.setValue('');
      }
    });
  }

  onCancel() {
    window.location.href = 'https://bausate.edu.pe/';
  }
  private hasInvalidGuardianFields(): boolean {
    if (!this.showGuardianForm) return false;
  
    const guardianControls = [
      'guardianName',
      'guardianLastname',
      'guardianDocumentType',
      'guardianDocumentNumber',
      'guardianPhone',
      'guardianEmail'
    ];
  
    return guardianControls.some(control => 
      this.formGroup.get(control)?.invalid
    );
  }
}
