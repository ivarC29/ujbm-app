import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  template: `
    @if (control?.errors && (control?.dirty || control?.touched)) {
      @if (control?.hasError('required')) {
        <p class="text-red-500 text-sm">Este campo es obligatorio</p>
      }
      @if (control?.hasError('onlyLettersAndSpaces')) {
        <p class="text-red-500 text-sm">Solo se permiten letras y espacios</p>
      }
      @if (control?.hasError('maxLength')) {
        <p class="text-red-500 text-sm">
          Máximo {{ control?.getError('maxLength')?.max }} caracteres
        </p>
      }
      @if (control?.hasError('invalidPhone')) {
        <p class="text-red-500 text-sm">El número de teléfono no es válido</p>
      }
      @if (control?.hasError('invalidEmailFormat')) {
        <p class="text-red-500 text-sm">El correo electrónico no es válido</p>
      }
      @if (control?.hasError('invalidDocumentNumber')) {
        <p class="text-red-500 text-sm">El número de documento no es válido</p>
      }
      @if (control?.hasError('invalidDateFormat')) {
        <p class="text-red-500 text-sm">La fecha no tiene el formato correcto</p>
      }
      @if (control?.hasError('invalidAge')) {
        <p class="text-red-500 text-sm">
          Debes tener al menos {{ control?.getError('invalidAge')?.minAge }} años
        </p>
      }
      @if (control?.hasError('invalidFileType')) {
        <p class="text-red-500 text-sm">
          Tipo de archivo no permitido. Permitidos: {{ control?.getError('invalidFileType')?.allowed.join(', ') }}
        </p>
      }
      @if (control?.hasError('invalidFileSize')) {
        <p class="text-red-500 text-sm">
          Tamaño máximo: {{ control?.getError('invalidFileSize')?.max }} MB
        </p>
      }
      @if (control?.hasError('invalidYearFormat')) {
        <p class="text-red-500 text-sm">Ingrese solo números</p>
      }
      @if (control?.hasError('yearTooOld')) {
        <p class="text-red-500 text-sm">
          El año debe ser posterior a {{ control?.getError('yearTooOld')?.min }}
        </p>
      }
      @if (control?.hasError('yearTooRecent')) {
        <p class="text-red-500 text-sm">
          El año debe ser {{ control?.getError('yearTooRecent')?.max }} o anterior
        </p>
      }
    }
  `
})
export class ValidationMessageComponent {
  @Input() control!: AbstractControl | null;
}