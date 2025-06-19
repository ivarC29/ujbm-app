import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static onlyLettersAndSpaces(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(control.value);
      return valid ? null : { onlyLettersAndSpaces: true };
    };
  }

  static maxLength(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = control.value.length <= max;
      return valid ? null : { maxLength: { max, current: control.value.length } };
    };
  }

  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[0-9]{7,15}$/.test(control.value);
      return valid ? null : { invalidPhone: true };
    };
  }

  static dateFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const dateStr = control.value instanceof Date 
        ? control.value.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : control.value;

      const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!regex.test(dateStr)) {
        return { invalidDateFormat: true };
      }

      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== year
      ) {
        return { invalidDate: true };
      }

      return null;
    };
  }

  static validDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const date = new Date(control.value);
      const valid = !isNaN(date.getTime());
      if (!valid) return { invalidDate: true };

      const dateStr = control.value;
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!regex.test(dateStr)) return { invalidDateFormat: true };

      return null;
    };
  }
  static validEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(control.value);
      return valid ? null : { invalidEmailFormat: true };
    };
  }
  static documentNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[0-9]{8,12}$/.test(control.value);
      return valid ? null : { invalidDocumentNumber: true };
    };
  }
  static validAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const formatError = CustomValidators.dateFormat()(control);
      if (formatError) return formatError;

      let dateStr = control.value;
      if (control.value instanceof Date) {
        dateStr = control.value.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      const [day, month, year] = dateStr.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      
      let age = today.getFullYear() - birthDate.getFullYear();
      
      if (
        today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      
      return age >= minAge ? null : { invalidAge: { minAge, currentAge: age } };
    };
  }

  static fileType(allowedTypes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const files = Array.isArray(control.value) ? control.value : [control.value];
    
    for (const file of files) {
      if (!file) continue;
      
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedTypes.includes(extension)) {
        return { fileType: true };
      }
    }
    
    return null;
  };
}

  static fileSize(maxSizeMB: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const files = Array.isArray(control.value) ? control.value : [control.value];
    
    for (const file of files) {
      if (!file) continue;
      
      if (file.size > maxSizeBytes) {
        return { fileSize: true };
      }
    }
    
    return null;
  };
}
static fileTypeForMultiple(allowedTypes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.length === 0) return null;

    
    const files = Array.isArray(control.value) ? control.value : [control.value];
    
    for (const file of files) {
      if (!file) continue;
      
      const fileName = file.name || '';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      
      if (!allowedTypes.includes(extension)) {
        return { fileType: true };
      }
    }
    
    return null;
  };
}

static fileSizeForMultiple(maxSizeMB: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.length === 0) return null;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const files = Array.isArray(control.value) ? control.value : [control.value];
    
    for (const file of files) {
      if (!file) continue;
      
      if (file.size > maxSizeBytes) {
        return { fileSize: { maxSize: maxSizeMB, actualSize: Math.round(file.size / (1024 * 1024)) } };
      }
    }
    
    return null;
  };
}
  static graduationYearValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Verificar que sea un valor
      if (control.value === '') return null;
      
      // Verificar que sea un número
      if (!/^\d+$/.test(control.value)) {
        return { invalidYearFormat: true };
      }
      
      const currentYear = new Date().getFullYear();
      const year = parseInt(control.value);
      
      // Validar rango 
      if (year < 1940) {
        return { yearTooOld: { min: 1950, current: year } };
      }
      
      if (year > currentYear) {
        return { yearTooRecent: { max: currentYear, current: year } };
      }
      
      return null;
    };
  }
}