import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ApplicantService } from 'src/app/applicant/services/applicant.service';
import { ApplicantScoreResponse, ScoreRequest } from 'src/app/applicant/interfaces/applicant.interfaces';

@Component({
  selector: 'app-score-details-dialog',
  standalone: true,
  imports: [CommonModule, 
    ReactiveFormsModule, 
    ToastModule, 
    ButtonModule, 
    TableModule, 
    InputTextModule, 
    InputNumberModule,
    ChipModule,
    ProgressSpinnerModule],
  template: `<p-toast></p-toast>

<div class="flex flex-col p-4 w-full">
  <div class="flex justify-end mb-4">
    <button 
      pButton 
      icon="pi pi-times" 
      class="p-button-rounded p-button-text" 
      (click)="dialogRef.close()"
    ></button>
  </div>
  
  <!-- Pantalla de carga -->
  @if (loading) {
    <div class="flex justify-center items-center my-8">
      <p-progressSpinner></p-progressSpinner>
    </div>
  } @else if (!scoreDetails) {
    <div class="flex flex-col items-center my-6">
      <i class="pi pi-exclamation-circle text-5xl text-yellow-500 mb-3"></i>
      <h3 class="text-xl font-medium">No hay datos disponibles</h3>
      <p class="text-gray-500 mt-2">Este postulante aún no tiene notas registradas.</p>
      <!-- Botón para registrar nueva nota -->
      <button 
        pButton 
        label="Registrar nota" 
        icon="pi pi-plus" 
        class="p-button-primary mt-4" 
        (click)="createNewScore()"
      ></button>
    </div>
  } @else {
    <!-- Información del postulante -->
    <div class="mb-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2 sm:col-span-1">
          <div class="mb-2">
            <span class="text-sm text-gray-500">Nombre completo:</span>
            <h3 class="font-medium text-lg">{{ scoreDetails.fullName }}</h3>
          </div>
          @if (!isNewScore && scoreDetails.code) {
          <div class="mb-2">
            <span class="text-sm text-gray-500">Código:</span>
            <p>{{ scoreDetails.code }}</p>
          </div>
        }
        </div>
        <div class="col-span-2 sm:col-span-1">
          <div class="mb-2">
            <span class="text-sm text-gray-500">Programa:</span>
            <p>{{ scoreDetails.programName }}</p>
          </div>
          @if (!isNewScore && scoreDetails.academicPeriodName) {
          <div class="mb-2">
            <span class="text-sm text-gray-500">Período académico:</span>
            <p>{{ scoreDetails.academicPeriodName }}</p>
          </div>
        }
        </div>
      </div>
    </div>

    <!-- Formulario para ver/editar notas -->
    <form [formGroup]="scoreForm" class="mb-4">
      <div class="mb-6">
        <div class="flex items-center mb-2">
          <span class="text-sm text-gray-500 mr-2">Puntaje total:</span>
          @if (editMode) {
            <p-inputNumber 
              formControlName="totalScore"
              [min]="0" 
              [max]="100" 
              [showButtons]="true"
              [style]="{'width': 'auto'}"
            ></p-inputNumber>
          } @else {
            <div class="flex items-center">
              <span [class]="'inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium ' + 
                (scoreDetails.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
                {{ scoreDetails.totalScore }}
              </span>
              <span class="ml-2 text-sm" [class]="scoreDetails.isApproved ? 'text-green-600' : 'text-red-600'">
                {{ scoreDetails.isApproved ? 'APROBADO' : 'DESAPROBADO' }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Respuestas -->
      <div>
  <h4 class="text-md font-medium mb-3">Respuestas:</h4>
  @if (!editMode) {
      <!-- Modo visualización mejorado -->
      <div class="answers-wrapper">
        @for (group of getAnswerGroups(scoreDetails!.answers); track $index) {
          <div class="answer-section">
            <div class="answer-index">{{ $index * 25 + 1 }}-{{ $index * 25 + group.length }}</div>
            <div class="answer-items">
              @for (answer of group; track $index) {
                <div [class]="getLetterStyle(answer)">
                  {{ answer }}
                </div>
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <!-- Modo edición mejorado -->
      <div class="answers-wrapper">
        @for (group of getAnswerGroups(answersArray.controls); track $index) {
          <div class="answer-section">
            <div class="answer-index">{{ $index * 25 + 1 }}-{{ $index * 25 + group.length }}</div>
            <div class="answer-items">
              @for (control of group; track $index) {
                <input 
                  pInputText 
                  [formControl]="$any(control)" 
                  class="answer-input"
                  maxlength="1"
                  (keyup)="moveToNextInput($event)"
                >
              }
            </div>
          </div>
        }
      </div>
    }
  </div>
    </form>

    <!-- Botones de acción -->
    <div class="flex justify-end gap-2 mt-6">
      @if (editMode) {
        <button 
          pButton
          label="Cancelar" 
          icon="pi pi-times" 
          class="p-button-outlined"
          (click)="cancel()"
        ></button>
        <button 
          pButton 
          label="Guardar cambios" 
          icon="pi pi-check" 
          class="p-button-success" 
          (click)="updateScore()"
          [disabled]="saving || scoreForm.invalid"
          [loading]="saving"
        ></button>
      } @else {
        <button 
          pButton 
          label="Cerrar" 
          icon="pi pi-times" 
          class="p-button-outlined"
          (click)="cancel()"
        ></button>
        <button 
          pButton 
          label="Editar" 
          icon="pi pi-pencil" 
          class="p-button-primary"
          (click)="toggleEditMode()"
        ></button>
      }
    </div>
  }
</div>`,
  styles: [`
  :host {
    display: block;
    width: 100%;
  }
  
  :host ::ng-deep {
    .p-dialog-maximized {
      .p-dialog-content {
        height: calc(100vh - 140px);
        overflow: auto;
      }
    }
    
    .p-inputnumber-button-up,
    .p-inputnumber-button-down {
      padding: 0.375rem;
    }
  }

  .answers-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    margin-bottom: 1.5rem;
  }
  
  .answer-section {
    display: flex;
    align-items: flex-start;
    width: 100%;
  }
  
  .answer-index {
    flex: 0 0 48px;
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    padding-top: 0.5rem;
  }
  
  .answer-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    flex: 1;
  }
  
  .answer-items > div,
  .answer-input {
    width: 2rem !important;
    height: 2rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 0.85rem !important;
    font-weight: bold !important;
  }
  
  .answer-input {
    padding: 0 !important;
    text-align: center !important;
    text-transform: uppercase !important;
  }
`],
  providers: [MessageService],
})
export class ScoreDetailsDialogComponent implements OnInit {
private dialogConfig = inject(DynamicDialogConfig);
  public dialogRef = inject(DynamicDialogRef);
  private messageService = inject(MessageService);
  private applicantService = inject(ApplicantService);
  private fb = inject(FormBuilder);

  applicantId: number = 0;
  scoreDetails: ApplicantScoreResponse | null = null;
  loading = true;
  saving = false;
  editMode = false;
  isNewScore = false;
  
  scoreForm = this.fb.group({
    totalScore: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    answers: this.fb.array([])
  });

  get answersArray(): FormArray {
    return this.scoreForm.get('answers') as FormArray;
  }

  ngOnInit(): void {
    this.applicantId = this.dialogConfig.data?.applicantId;
    
    if (!this.applicantId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener el ID del postulante'
      });
      this.loading = false;
      return;
    }
    
    this.loadScoreDetails();
  }

  loadScoreDetails(): void {
    this.loading = true;
    
    this.applicantService.getApplicantScoreDetails(this.applicantId).subscribe({
      next: (response) => {
        this.scoreDetails = response;
        this.initForm(response);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles de notas:', error);
        
        if (error.status === 404) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No hay datos',
            detail: 'Este postulante aún no tiene calificaciones registradas'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los detalles de las notas'
          });
        }
        
        this.loading = false;
      }
    });
  }

  initForm(data: ApplicantScoreResponse): void {
    this.scoreForm.patchValue({
      totalScore: data.totalScore
    });
    
    while (this.answersArray.length > 0) {
      this.answersArray.removeAt(0);
    }
    
    // Siempre crear exactamente 100 controles
  for (let i = 0; i < 100; i++) {
    // Usar el valor de la respuesta si existe, o string vacío si no
    const answer = data.answers && i < data.answers.length ? data.answers[i] : '';
    this.answersArray.push(this.fb.control(answer));
  }
}

  createNewScore(): void {
  //un scoreDetails básico con la información del estudiante
  this.scoreDetails = {
    fullName: this.dialogConfig.data?.applicantInfo?.fullName || '',
    programName: this.dialogConfig.data?.applicantInfo?.programName || '',
    totalScore: 0,
    isApproved: false,
    answers: []
  };
  
  this.isNewScore = true;
  this.initEmptyForm();
  this.toggleEditMode();
  
  this.messageService.add({
    severity: 'info',
    summary: 'Registro de notas',
    detail: 'Ingrese las notas para este postulante'
  });
}
initEmptyForm(): void {
    this.scoreForm.patchValue({
      totalScore: 0
    });
    
    // Limpiar respuestas existentes
    while (this.answersArray.length > 0) {
      this.answersArray.removeAt(0);
    }
    
    // Crear 100 campos vacíos para las respuestas
    for (let i = 0; i < 100; i++) {
      this.answersArray.push(this.fb.control(''));
    }
  }
  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  getLetterStyle(letter: string): string {
    const baseStyle = 'inline-flex items-center justify-center rounded-full w-8 h-8 text-sm font-bold';
    
    switch (letter) {
      case 'A': return baseStyle + ' bg-blue-100 text-blue-800';
      case 'B': return baseStyle + ' bg-green-100 text-green-800';
      case 'C': return baseStyle + ' bg-purple-100 text-purple-800';
      case 'D': return baseStyle + ' bg-yellow-100 text-yellow-800';
      case 'E': return baseStyle + ' bg-red-100 text-red-800';
      default: return baseStyle + ' bg-gray-100 text-gray-800';
    }
  }
  getAnswerGroups(answers: string[] | AbstractControl[]): any[][] {
  const groups: any[][] = [];
  const groupSize = 25;
  
  if (!answers || answers.length === 0) return groups;
  
  // Dividir las respuestas en grupos de 25
  for (let i = 0; i < answers.length; i += groupSize) {
    const group = answers.slice(i, i + groupSize);
    groups.push(group);
  }
  
  return groups;
}

  updateScore(): void {
    if (this.scoreForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'Por favor revise los valores ingresados'
      });
      return;
    }

    if (this.saving) return; 
    
    this.saving = true;
    
    const scoreRequest: ScoreRequest = {
      totalScore: this.scoreForm.value.totalScore!,
      answers: this.answersArray.controls.map(control => control.value)
    };
    
    this.applicantService.updateApplicantScore(this.applicantId, scoreRequest).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Puntaje actualizado correctamente'
        });
        
        setTimeout(() => {
          this.saving = false;
          this.editMode = false;
          this.dialogRef.close('updated');
        }, 1500);
      },
      error: (error) => {
        console.error('Error al actualizar puntaje:', error);
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo actualizar el puntaje. Por favor intente nuevamente.'
        });
        
        this.saving = false;
      }
    });
  }

  cancel(): void {
    if (this.editMode) {
      this.editMode = false;
      if (this.scoreDetails) {
        this.initForm(this.scoreDetails);
      }
    } else {
      this.dialogRef.close();
    }
  }
  moveToNextInput(event: KeyboardEvent): void {
  if (event.key.match(/^[a-zA-Z]$/)) {
    const target = event.target as HTMLInputElement;
    const inputs = Array.from(document.querySelectorAll('.answer-input')) as HTMLInputElement[];
    const currentIndex = inputs.indexOf(target);
    
    if (currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    }
  }
}
}

