import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProgramResponse } from '@shared/interfaces/program.interfaces';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ExamByExcelRequest, ScheduleType } from 'src/app/applicant/interfaces/admission&interview.interfaces';
import { ApplicantService } from 'src/app/applicant/services/applicant.service';

@Component({
  selector: 'app-excel-exam-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    CheckboxModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="max-w-5xl mx-auto">
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <!-- Header -->
        <div class="border-b border-gray-200 dark:border-gray-700 p-6">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <i class="pi pi-file-excel text-green-600 mr-3 text-3xl"></i>
                Crear Examen desde Excel
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mt-1">
                Importe preguntas masivamente desde un archivo Excel
              </p>
            </div>
            <button
              pButton
              label="Crear Manual"
              icon="pi pi-pencil"
              class="p-button-outlined p-button-success"
              (click)="switchToManual.emit()"
          ></button>
          </div>
        </div>

        <div class="p-6">
          <!-- Instrucciones destacadas -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8">
            <h4 class="text-blue-800 dark:text-blue-200 font-bold text-lg mb-4 flex items-center">
              <i class="pi pi-info-circle mr-3 text-2xl"></i>
              Instrucciones para el archivo Excel
            </h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 class="font-semibold text-blue-700 dark:text-blue-300 mb-3">Estructura requerida:</h5>
                <ul class="text-blue-700 dark:text-blue-300 text-sm space-y-2">
                  <li class="flex items-center">
                    <i class="pi pi-check-circle mr-2 text-green-600"></i>
                    Pregunta, TipoPregunta, Puntos
                  </li>
                  <li class="flex items-center">
                    <i class="pi pi-check-circle mr-2 text-green-600"></i>
                    Respuesta1, Respuesta2, Respuesta3, Respuesta4
                  </li>
                  <li class="flex items-center">
                    <i class="pi pi-check-circle mr-2 text-green-600"></i>
                    RespuestaCorrecta
                  </li>
                </ul>
              </div>
              
              <div>
                <h5 class="font-semibold text-blue-700 dark:text-blue-300 mb-3">Tipos de pregunta:</h5>
                <ul class="text-blue-700 dark:text-blue-300 text-sm space-y-2">
                  <li><strong>01:</strong> Opción múltiple</li>
                  <li><strong>02:</strong> Verdadero/Falso</li>
                  <li><strong>03:</strong> Respuesta corta</li>
                  <li><strong>05:</strong> Ensayo</li>
                </ul>
              </div>
            </div>
            
            <div class="mt-6 flex justify-center">
              <button
                pButton
                label="Descargar Plantilla Excel"
                icon="pi pi-download"
                class="p-button-info p-button-lg"
                (click)="downloadTemplate()"
              ></button>
            </div>
          </div>

          <form [formGroup]="excelForm" (ngSubmit)="onSubmit()">
            <!-- Información básica -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <i class="pi pi-cog mr-3 text-purple-600"></i>
                Configuración del Examen
              </h4>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Programa Académico *
                  </label>
                  <p-select
                    formControlName="programId"
                    [options]="programs()"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Seleccione un programa"
                    class="w-full"
                    [class.p-invalid]="excelForm.get('programId')?.invalid && excelForm.get('programId')?.touched"
                  ></p-select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Puntaje Mínimo para Aprobar *
                  </label>
                  <p-inputNumber
                    formControlName="passingScore"
                    [min]="1"
                    [max]="500"
                    placeholder="60"
                    class="w-full"
                    [class.p-invalid]="excelForm.get('passingScore')?.invalid && excelForm.get('passingScore')?.touched"
                  ></p-inputNumber>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Intentos Permitidos
                  </label>
                  <p-inputNumber
                    formControlName="attemptsAllowed"
                    [min]="1"
                    [max]="5"
                    placeholder="1"
                    class="w-full"
                  ></p-inputNumber>
                </div>

                <div class="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p-checkbox
                    formControlName="shuffleQuestions"
                    [binary]="true"
                    inputId="shuffleExcel"
                  ></p-checkbox>
                  <label for="shuffleExcel" class="text-sm font-medium text-blue-700 dark:text-blue-300">
                    <i class="pi pi-random mr-2"></i>
                    Mezclar preguntas
                  </label>
                </div>
              </div>
            </div>

            
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <i class="pi pi-calendar mr-3 text-green-600"></i>
                Programación
              </h4>
              
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Fecha y Hora de Inicio *
                  </label>
                  <p-datePicker
                    formControlName="startDateTime"
                    [showTime]="true"
                    dateFormat="dd/mm/yy"
                    placeholder="Seleccione fecha y hora"
                    class="w-full"
                    [class.p-invalid]="excelForm.get('startDateTime')?.invalid && excelForm.get('startDateTime')?.touched"
                  ></p-datePicker>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Fecha y Hora de Fin *
                  </label>
                  <p-datePicker
                    formControlName="endDateTime"
                    [showTime]="true"
                    dateFormat="dd/mm/yy"
                    placeholder="Seleccione fecha y hora"
                    class="w-full"
                    [class.p-invalid]="excelForm.get('endDateTime')?.invalid && excelForm.get('endDateTime')?.touched"
                  ></p-datePicker>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ubicación
                  </label>
                  <input
                    pInputText
                    formControlName="location"
                    placeholder="Ej: Aula Magna"
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 mb-8">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="pi pi-upload mr-3 text-green-600 text-xl"></i>
                Archivo Excel con Preguntas *
              </h4>
              
              <div class="flex flex-col items-center space-y-4">
                <div class="w-full max-w-md">
                  <p-fileUpload
                    mode="basic"
                    chooseLabel="Seleccionar archivo Excel"
                    accept=".xlsx,.xls"
                    [maxFileSize]="10000000"
                    (onSelect)="onFileSelect($event)"
                    styleClass="w-full p-button-success p-button-lg"
                  ></p-fileUpload>
                </div>
                
                @if (selectedFile()) {
                  <div class="bg-white dark:bg-gray-700 rounded-lg p-4 border border-green-300 dark:border-green-600 w-full max-w-md">
                    <div class="flex items-center justify-center text-green-600 dark:text-green-400">
                      <i class="pi pi-check-circle mr-2 text-xl"></i>
                      <span class="font-medium">{{ selectedFile()?.name }}</span>
                    </div>
                    <p class="text-xs text-center text-gray-500 mt-1">
                      Archivo seleccionado correctamente
                    </p>
                  </div>
                }
                
                <p class="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                  Seleccione un archivo Excel (.xlsx o .xls) con las preguntas del examen. 
                  Tamaño máximo: 10MB
                </p>
              </div>
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                pButton
                label="Cancelar"
                icon="pi pi-times"
                class="p-button-outlined p-button-secondary"
                (click)="cancelled.emit()"
              ></button>
              
              <button
                type="submit"
                pButton
                label="Crear Examen desde Excel"
                icon="pi pi-upload"
                class="p-button-success p-button-lg"
                [loading]="loading()"
                [disabled]="excelForm.invalid || !selectedFile() || loading()"
              ></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ExcelExamUploadComponent implements OnInit {
  @Output() examCreated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() switchToManual = new EventEmitter<void>();

  excelForm!: FormGroup;
  programs = signal<ProgramResponse[]>([]);
  selectedFile = signal<File | null>(null);
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private applicantService: ApplicantService,
    private messageService: MessageService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadPrograms();
  }

  createForm(): void {
    this.excelForm = this.fb.group({
      programId: [null, Validators.required],
      passingScore: [60, [Validators.required, Validators.min(1)]],
      attemptsAllowed: [1, [Validators.min(1)]],
      shuffleQuestions: [false],
      startDateTime: [null, Validators.required],
      endDateTime: [null, Validators.required],
      location: ['']
    });
  }

  loadPrograms(): void {
    this.applicantService.getPrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los programas'
        });
      }
    });
  }

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.selectedFile.set(file);
      this.messageService.add({
        severity: 'success',
        summary: 'Archivo seleccionado',
        detail: `${file.name} se ha seleccionado correctamente`
      });
    }
  }

  downloadTemplate(): void {
    // template Excel básico
    const template = [
      ['Pregunta', 'TipoPregunta', 'Puntos', 'Respuesta1', 'Respuesta2', 'Respuesta3', 'Respuesta4', 'RespuestaCorrecta'],
      ['¿Cuál es la capital de Perú?', '01', '5', 'Lima', 'Cusco', 'Arequipa', 'Trujillo', '1'],
      ['La Tierra es redonda', '02', '3', 'Verdadero', 'Falso', '', '', 'Verdadero'],
      ['¿Cuántos continentes hay?', '03', '4', '7', '', '', '', '7'],
      ['Explique la importancia del agua', '05', '10', 'Respuesta libre', '', '', '', 'Respuesta libre']
    ];

    
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_examen_admision.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.substring(base64String.indexOf(',') + 1);
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.excelForm.invalid || !this.selectedFile()) {
      return;
    }

    this.loading.set(true);

    try {
      const file = this.selectedFile()!;
      const base64Data = await this.convertFileToBase64(file);
      const formValue = this.excelForm.value;

      const examRequest: ExamByExcelRequest = {
        file: {
          fileName: file.name,
          fileType: file.type,
          data: base64Data
        },
        programId: formValue.programId,
        examType: 'ADMISSION',
        passingScore: formValue.passingScore,
        attemptsAllowed: formValue.attemptsAllowed,
        shuffleQuestions: formValue.shuffleQuestions,
        schedule: {
          startDateTime: new Date(formValue.startDateTime).toISOString(),
          endDateTime: new Date(formValue.endDateTime).toISOString(),
          location: formValue.location,
          scheduleType: ScheduleType.EXAM
        }
      };

      this.applicantService.createExamByExcel(examRequest).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Examen creado',
            detail: response.message
          });
          this.examCreated.emit();
        },
        error: (error) => {
          console.error('Error creating exam from Excel:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el examen desde Excel. Verifique el formato del archivo.'
          });
          this.loading.set(false);
        }
      });
    } catch (error) {
      console.error('Error processing file:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al procesar el archivo'
      });
      this.loading.set(false);
    }
  }
}