import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth-service.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, ButtonModule,
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    PasswordModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  providers: [MessageService]
})
export class ChangePasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    // Método moderno de creación de formularios en Angular
    this.form = this.fb.nonNullable.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    });
    // Añadir validador a nivel de formulario
    this.form.addValidators(this.passwordsMatchValidator);
  }

  ngOnInit(): void {}

  passwordStrengthValidator = (control: FormControl) => {
    const value = control.value || '';
    if (!value) return null;
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    
    const isValid = hasUpperCase && hasLowerCase && hasNumeric;
    
    return !isValid ? { weakPassword: true } : null;
  }

  passwordsMatchValidator: import('@angular/forms').ValidatorFn = (control: import('@angular/forms').AbstractControl) => {
    const formGroup = control as FormGroup;
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const confirmPasswordControl = formGroup.get('confirmPassword');
      // Solo limpiar el error de passwordMismatch si existe
      if (confirmPasswordControl?.hasError('passwordMismatch')) {
        const errors = confirmPasswordControl.errors ? { ...confirmPasswordControl.errors } : null;
        if (errors) {
          delete errors['passwordMismatch'];
          confirmPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
      return null;
    }
  }

  submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.loading = true;
  const passwordData = {
    currentPassword: this.form.get('currentPassword')?.value,
    newPassword: this.form.get('newPassword')?.value,
    confirmPassword: this.form.get('confirmPassword')?.value
  };
  this.authService.changePassword(passwordData)
    .subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contraseña cambiada',
          detail: 'Tu contraseña fue actualizada correctamente.'
        });
        this.form.reset();
        this.loading = false;
      setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        let msg = 'Error al cambiar la contraseña';
        if (err.status === 401) msg = 'La contraseña actual es incorrecta';
        else if (err.status === 400) msg = 'Las nuevas contraseñas no coinciden';
        else if (err.status === 0) msg = 'No se pudo conectar con el servidor';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        this.loading = false;
      },
      complete: () => this.loading = false
    });
}
}
