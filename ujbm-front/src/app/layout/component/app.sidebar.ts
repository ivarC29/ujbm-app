import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';
import { AuthService } from 'src/app/core/services/auth-service.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu,CommonModule, ButtonModule],
    template: ` <div class="layout-sidebar flex flex-col h-full">
        <div class="flex-grow overflow-auto">
            <app-menu></app-menu>
        </div>
        <div class="bottom-buttons w-full">
        @if (isAdmin()) {
            <div class="config-container">
                <button 
                    pButton 
                    type="button" 
                    label="Configuración" 
                    icon="pi pi-cog" 
                    class="p-button-text w-full text-primary font-medium hover:bg-primary hover:text-white transition-colors"
                    (click)="goToConfig()"
                ></button>
            </div>
        }
        
        <div class="logout-container">
                <button 
                    pButton 
                    type="button" 
                    label="Cerrar sesión" 
                    icon="pi pi-sign-out" 
                    class="p-button-text p-button-danger w-full"
                    (click)="logout()"
                ></button>
          </div>
        </div>
    </div>`,
    styles: [`
        .bottom-buttons {
                background-color: var(--surface-card);
          }
        
        .config-container {
            padding: 1rem;
            border-top: 1px solid var(--surface-border);
            background-color: var(--surface-card);
        }
        
        .logout-container {
            padding: 1rem;
            border-top: 1px solid var(--surface-border);
            background-color: var(--surface-card);
        }
    `]
})
export class AppSidebar {
    constructor(
        public el: ElementRef,
        private authService: AuthService,
        private router: Router
    ) {}
     isAdmin(): boolean {
        return this.authService.hasRole('ROLE_ADMIN');
    }
    
    goToConfig(): void {
        this.router.navigate(['/settings']);
    }
     logout(): void {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (error) => {
                console.error('Error during logout:', error);
                this.router.navigate(['/login']);
            }
        });
    }
}
