import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ValidationMessageComponent } from '../validation-message/validation-message.component';


@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,ValidationMessageComponent],
  template: `
 <div [formGroup]="form" class="flex flex-col w-full">
      <label class="font-semibold text-md text-gray-700 dark:text-gray-200 mb-2">{{ label }}</label>
      <div class="relative">
        <input
          type="file"
          [accept]="accept"
          [multiple]="multiple"
          (change)="onFileSelect($event)"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          #fileInput
        />
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 border border-primary-600 rounded-lg text-white font-semibold hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-400"
          tabindex="-1"
        >
          <i class="pi pi-upload text-white"></i>
          <span>{{ chooseLabel || (multiple ? 'Seleccionar archivos' : 'Adjuntar archivo') }}</span>
        </button>
      </div>
      <!-- Vista de archivos múltiples -->
      @if (multiple && files.length > 0) {
        <div class="mt-2 space-y-1">
          @for (file of files; track file.name) {
            <div class="flex items-center justify-between gap-2 px-2 py-1 bg-green-50 dark:bg-green-900 rounded border border-green-200 dark:border-green-700">
              <span class="truncate text-sm text-green-800 dark:text-green-200">{{ file.name }}</span>
              <button
                type="button"
                class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                (click)="removeFileFromArray(file)"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          }
        </div>
        <div class="mt-1 text-xs text-gray-500">
          {{ files.length }} {{ files.length === 1 ? 'archivo seleccionado' : 'archivos seleccionados' }}
        </div>
      }
      
      <!-- Vista de archivo único -->
      @if (!multiple && fileName) {
        <div class="flex items-center justify-between gap-2 mt-2 px-2 py-1 bg-green-50 dark:bg-green-900 rounded border border-green-200 dark:border-green-700">
          <span class="truncate text-sm text-green-800 dark:text-green-200">{{ fileName }}</span>
          <button
            type="button"
            class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            (click)="removeFile()"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      }
      
      <app-validation-message [control]="control"></app-validation-message>
    </div>
  `,
styles: [`
    .relative {
      position: relative;
    }
    input[type="file"] {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
      z-index: 10;
    }
    button[tabindex="-1"]:focus {
      outline: none;
    }
  `]
})
export class FileInputComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() label!: string;
  @Input() accept: string = '';
  @Input() chooseLabel?: string;
  @Input() multiple: boolean = false;

  files: File[] = [];
  ngOnInit() {
      // inicializar el array de archivos si ya hay valores en el formulario
      const currentValue = this.form.get(this.controlName)?.value;
      if (this.multiple && currentValue) {
        this.files = Array.isArray(currentValue) ? currentValue : [currentValue];
      }
    }
  get fileName(): string | null {
    const file = this.form.get(this.controlName)?.value;
    return file && file.name ? file.name : null;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    if (this.multiple) {
      // Modo múltiple: añadir a la colección existente
      const newFiles = Array.from(input.files);
      this.files = [...this.files, ...newFiles];
      this.form.get(this.controlName)?.setValue(this.files);
    } else {
      // Modo único: un solo archivo
      const file = input.files[0];
      this.form.get(this.controlName)?.setValue(file);
    }
    
    this.form.get(this.controlName)?.markAsTouched();
    this.form.get(this.controlName)?.updateValueAndValidity();
    input.value = '';
  }

  removeFile(): void {
    this.form.get(this.controlName)?.setValue(null);
    this.form.get(this.controlName)?.markAsDirty();
    this.form.get(this.controlName)?.updateValueAndValidity();
  }
  removeFileFromArray(fileToRemove: File): void {
    this.files = this.files.filter(file => file !== fileToRemove);
    
    if (this.files.length > 0) {
      this.form.get(this.controlName)?.setValue(this.files);
    } else {
      // Si no quedan archivos, establecer a null o [] dependiendo del caso
      this.form.get(this.controlName)?.setValue(this.multiple ? [] : null);
    }
    
    this.form.get(this.controlName)?.markAsTouched();
    this.form.get(this.controlName)?.updateValueAndValidity();
    
  }
  
  get control() {
    return this.form.get(this.controlName);
  }
}
