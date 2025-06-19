import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ApplicantService } from 'src/app/applicant/services/applicant.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentSearchService {
  private applicantService = inject(ApplicantService);

  private documentNumberSubscription?: Subscription;
  private guardianDocumentNumberSubscription?: Subscription;
  private _disabled = false;

  setupDocumentSearch(form: FormGroup, nameField: string = 'name', lastnameField: string = 'lastname'): void {
    if (this.documentNumberSubscription) {
      this.documentNumberSubscription.unsubscribe();
      this.documentNumberSubscription = undefined;
    }

    form.get('documentType')?.valueChanges.subscribe(type => {
      const documentNumberControl = form.get('documentNumber');
      const nameControl = form.get(nameField);
      const lastnameControl = form.get(lastnameField);

      if (this.documentNumberSubscription) {
        this.documentNumberSubscription.unsubscribe();
        this.documentNumberSubscription = undefined;
      }

      if (!this._disabled && type !== '01' && type !== '06') {
        if (nameControl?.dirty && lastnameControl?.dirty) {
          const patchData: any = {};
          patchData[nameField] = '';
          patchData[lastnameField] = '';
          form.patchValue(patchData);
        }
      }

      if (type === '01') {
        this.documentNumberSubscription = documentNumberControl?.valueChanges.pipe(
          debounceTime(500),
          distinctUntilChanged(),
          filter(value => value?.length === 8),
          filter(() => !this._disabled)
        ).subscribe(dni => {
          this.searchReniecData(form, dni, nameField, lastnameField);
        });
      } else if (type === '06') {
        this.documentNumberSubscription = documentNumberControl?.valueChanges.pipe(
          debounceTime(500),
          distinctUntilChanged(),
          filter(value => value?.length === 11),
          filter(() => !this._disabled)
        ).subscribe(ruc => {
          this.searchSunatData(form, ruc, nameField, lastnameField);
        });
      }
    });
  }

  setupGuardianDocumentSearch(form: FormGroup): void {
    if (this._disabled) return;
    if (this.guardianDocumentNumberSubscription) {
      this.guardianDocumentNumberSubscription.unsubscribe();
      this.guardianDocumentNumberSubscription = undefined;
    }

    form.get('guardianDocumentType')?.valueChanges.subscribe(type => {
      const documentNumberControl = form.get('guardianDocumentNumber');
      const nameControl = form.get('guardianName');
      const lastnameControl = form.get('guardianLastname');

      if (this.guardianDocumentNumberSubscription) {
        this.guardianDocumentNumberSubscription.unsubscribe();
        this.guardianDocumentNumberSubscription = undefined;
      }

      if (type !== '01' && type !== '06') {
        if (nameControl?.dirty && lastnameControl?.dirty) {
          form.patchValue({
            'guardianName': '',
            'guardianLastname': ''
          });
        }
      }

      if (type === '01') {
        this.guardianDocumentNumberSubscription = documentNumberControl?.valueChanges.pipe(
          debounceTime(500),
          distinctUntilChanged(),
          filter(value => value?.length === 8)
        ).subscribe(dni => {
          this.searchReniecData(form, dni, 'guardianName', 'guardianLastname');
        });
      } else if (type === '06') {
        this.guardianDocumentNumberSubscription = documentNumberControl?.valueChanges.pipe(
          debounceTime(500),
          distinctUntilChanged(),
          filter(value => value?.length === 11)
        ).subscribe(ruc => {
          this.searchSunatData(form, ruc, 'guardianName', 'guardianLastname');
        });
      }
    });
  }

  private searchReniecData(form: FormGroup, dni: string, nameField: string, lastnameField: string): void {
    if (this._disabled) return;
    this.applicantService.getReniecData(dni).subscribe({
      next: (data) => {
        const patchData: any = {};
        patchData[nameField] = data.nombres;
        patchData[lastnameField] = `${data.apellidoPaterno} ${data.apellidoMaterno}`;
        form.patchValue(patchData);
        form.get(nameField)?.markAsDirty();
        form.get(lastnameField)?.markAsDirty();
      },
      error: (error) => {
        const patchData: any = {};
        patchData[nameField] = '';
        patchData[lastnameField] = '';
        form.patchValue(patchData);
        console.error('Error buscando RENIEC data:', error);
      }
    });
  }

  private searchSunatData(form: FormGroup, ruc: string, nameField: string, lastnameField: string): void {
    this.applicantService.getSunatData(ruc).subscribe({
      next: (data) => {
        const patchData: any = {};
        patchData[nameField] = data.name;
        patchData[lastnameField] = data.lastname;
        form.patchValue(patchData);
        form.get(nameField)?.markAsDirty();
        form.get(lastnameField)?.markAsDirty();
      },
      error: (error) => {
        const patchData: any = {};
        patchData[nameField] = '';
        patchData[lastnameField] = '';
        form.patchValue(patchData);
        console.error('Error fetching SUNAT data:', error);
      }
    });
  }

  temporarilyDisable() {
  this._disabled = true;
  }
  reactivate() {
    this._disabled = false;
  }
}