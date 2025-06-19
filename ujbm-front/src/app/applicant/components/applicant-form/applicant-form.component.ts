import { Component, Input, OnInit, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApplicantService } from '../../services/applicant.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { TextInputComponent } from '@shared/components/text-input/text-input.component';
import { DateInputComponent } from '@shared/components/date-input/date-input.component';
import { SelectInputComponent } from '@shared/components/select-input/select-input-component';
import { of } from 'rxjs';
import { FileUploadGroupComponent } from '@shared/components/file-upload-group/file-upload-group.component';
import { UbigeoResponse } from '../../interfaces/ubigeo.interface';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RadioGroupComponent } from "../../../shared/components/radio-button/radio-button.component";
import { DocumentSearchService } from '@shared/services/document-search.service';


@Component({
  selector: 'app-applicant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextInputComponent, DateInputComponent, SelectInputComponent, FileUploadGroupComponent, RadioButtonModule, RadioGroupComponent],
  templateUrl: './applicant-form.component.html',
  styleUrls: ['./applicant-form.component.scss'],
})
export class ApplicantFormComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() selectedMode!: string;

  private applicantService = inject(ApplicantService);
  @Input() showGuardianForm = false; 
   private documentSearchService = inject(DocumentSearchService);

  programs = toSignal(
    this.applicantService.getPrograms().pipe(
      map(programs => programs.map(program => ({
        code: program.id.toString(), // Convertir id a string para el control del formulario
        label: program.name
      })))
    ),
    { initialValue: [] }
  );
  documentTypes = toSignal(
    this.applicantService.getDocumentTypes().pipe(
      map(data => {
        return (Array.isArray(data) ? data : []).map(type => ({
          ...type,
        }));
      })
    ),
    { initialValue: [] }
  );


  relationshipTypes = toSignal(
    of([
      { code: '01', label: 'Padre' },
      { code: '02', label: 'Madre' },
      { code: '03', label: 'Apoderado' }
    ]),
    { initialValue: [] }
  );
  referralSources = toSignal(
    this.applicantService.getAwarenessMethods().pipe(
      map(methods => methods.map(method => ({
        code: method.code,
        label: method.label
      })))
    ),
    { initialValue: [] }
  );
  sexOptions = toSignal(
    this.applicantService.getGenders().pipe(
      map(genders=> genders.map(gend => ({
        code: gend.code,
        label: gend.label 
      })))
    ),
    { initialValue: [] }
  );

  disabilityTypes = toSignal(
    this.applicantService.getDisabilityTypes(),
    { initialValue: [] }
  );


  departments = toSignal(
      this.applicantService.getDepartments().pipe(
        map(departments => departments.map(dept => ({
          code: dept.code,
          name: dept.name
        })))
      ),
      { initialValue: [] }
  );
  schoolTypes = toSignal(
    this.applicantService.getHighSchoolTypes().pipe(
      map(types => types.map(type => ({
        code: type.code,
        label: type.label
      })))
    ),
    { initialValue: [] }
  );
  
    // signal para ubigeo del applicant
    private provinces = signal<UbigeoResponse[]>([]);
    private districts = signal<UbigeoResponse[]>([]);
  
      // Signals para ubigeo de la escuela
    private schoolProvinces = signal<UbigeoResponse[]>([]);
    private schoolDistricts = signal<UbigeoResponse[]>([]);
  
    // provinces and districts
    getProvinces(departmentCode: string) {
      if (!departmentCode) return [];
      return this.provinces();
    }
  
    getDistricts(provinceCode: string) {
      if (!provinceCode) return [];
      return this.districts();
    }

    getSchoolProvinces(departmentCode: string) {
      if (!departmentCode) return [];
      return this.schoolProvinces();
    }
    
    getSchoolDistricts(provinceCode: string) {
      if (!provinceCode) return [];
      return this.schoolDistricts();
    }
  ngOnInit() {
    // Suscribirse a cambios en la fecha de nacimiento
    this.form.get('birthdate')?.valueChanges.subscribe(date => {
      if (date) {
        this.checkAge(date);
      }
    });
     // cambio de departamento y llenar provincias
     this.form.get('department')?.valueChanges.subscribe(departmentCode => {
      if (departmentCode) {
        this.applicantService.getProvinces(departmentCode).subscribe(provinces => {
          this.provinces.set(provinces);
        });
        
        this.districts.set([]);
        this.form.get('district')?.setValue('');
      }
    });
    // cambio de provincia y llenar distritos
    this.form.get('province')?.valueChanges.subscribe(provinceCode => {
      if (provinceCode) {
        const departmentCode = this.form.get('department')?.value;
        this.applicantService.getDistricts(departmentCode, provinceCode).subscribe(districts => {
          this.districts.set(districts);
        });
      }
    });
    // para escuela de procedencia
    this.form.get('schoolDepartment')?.valueChanges.subscribe(code => {
      if (code) {
        this.applicantService.getProvinces(code).subscribe(provinces => {
          this.schoolProvinces.set(provinces);
        });
        
        this.schoolDistricts.set([]);
        this.form.get('schoolDistrict')?.setValue('');
        
        const provinceControl = this.form.get('schoolProvince');
        provinceControl?.enable();
        provinceControl?.setValue('');
        this.form.get('schoolDistrict')?.disable();
      }
    });

    this.form.get('schoolProvince')?.valueChanges.subscribe(code => {
      if (code) {
        const departmentCode = this.form.get('schoolDepartment')?.value;
        this.applicantService.getDistricts(departmentCode, code).subscribe(districts => {
          this.schoolDistricts.set(districts);
        });
        
        const districtControl = this.form.get('schoolDistrict');
        districtControl?.enable();
        districtControl?.setValue('');
      }
    });
    this.documentSearchService.setupDocumentSearch(this.form);
    // locacion de la escuela
    this.form.get('schoolDepartment')?.valueChanges.subscribe(code => {
      if (code) {
        const provinceControl = this.form.get('schoolProvince');
        provinceControl?.enable();
        provinceControl?.setValue('');
        this.form.get('schoolDistrict')?.disable();
        this.form.get('schoolDistrict')?.setValue('');
      }
    });

    this.form.get('schoolProvince')?.valueChanges.subscribe(code => {
      if (code) {
        const districtControl = this.form.get('schoolDistrict');
        districtControl?.enable();
        districtControl?.setValue('');
      }
    });
  
  }

  private checkAge(date: string | Date) {
    if (!date) return;
    
    let birthDate = typeof date === 'string' 
      ? new Date(date.split('/').reverse().join('-'))
      : date;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    if (today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Emitir evento al padre si es menor de edad
    if (age < 18) {
      this.form.get('birthdate')?.setErrors(null);
    }
  }

  
}
