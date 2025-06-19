import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
// import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth-service.service';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from '@shared/components/text-input/text-input.component';
import { ToastModule } from 'primeng/toast';
import { LayoutService } from 'src/app/layout/service/layout.service';
import { AppFloatingConfigurator } from "../../../layout/component/app.floatingconfigurator";
import { encrypt,decrypt } from '@shared/utils/crypto.util';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    PasswordModule,
    ReactiveFormsModule, // <-- Solo ReactiveFormsModule
    RouterModule,
    RippleModule,
    TextInputComponent,
    ToastModule,
    AppFloatingConfigurator
],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export default class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  darkMode:boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    public layoutService: LayoutService
  ) {
    if (this.authService.getAccessToken() && !this.authService.isTokenExpired()) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false] 
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.loginForm.controls; }
  ngOnInit(): void {
    this.darkMode = this.layoutService.isDarkTheme() ?? false;
    (async () => {
    let username = '';
    let password = '';
    let rememberMe = false;
    const encryptedUsername = localStorage.getItem('remembered_username');
    const encryptedPassword = localStorage.getItem('remembered_password');
    
    if (encryptedUsername && encryptedPassword) {
      try {
        username = await decrypt(encryptedUsername);
        password = await decrypt(encryptedPassword);
        rememberMe = true;
        
        // Rellenar el formulario con las credenciales guardadas
        this.loginForm.setValue({
          username,
          password,
          rememberMe
        });
        
      } catch (error) {
        console.error('Error descifrando credenciales:', error);
        localStorage.removeItem('remembered_username');
        localStorage.removeItem('remembered_password');
      }
    }
  })();
}
  

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    this.darkMode = this.layoutService.isDarkTheme() ?? false;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }
    if (this.loading) {
    return;
  }

    this.loading = true;
    const { username, password, rememberMe } = this.loginForm.value;
    this.authService.login(this.loginForm.value).subscribe({
     next: async () => {
      try {
        if (rememberMe) {
          try {
            const encryptedUsername = await encrypt(username);            
            const encryptedPassword = await encrypt(password);
            
            localStorage.setItem('remembered_username', encryptedUsername);
            localStorage.setItem('remembered_password', encryptedPassword);
          } catch (error) {
            console.error("Error específico:", error);

          } } else {
          // Si no quiere ser recordado, eliminar credenciales guardadas
          localStorage.removeItem('remembered_username');
          localStorage.removeItem('remembered_password');
        }
      
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Inicio de sesión correcto',
        });
        
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      } catch (error) {
        console.error("Error en el procesamiento post-login:", error);
        this.loading = false; // Reactivar el botón en caso de error
      }
    },
    error: (error) => {
      console.error("Error de inicio de sesión:", error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Credenciales incorrectas',
      });
      this.loading = false; 
    }
  });
}
}