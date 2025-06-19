import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from 'src/app/core/services/auth-service.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu university-menu">
            @for (item of model; track item.label; let i = $index) {
                @if (!item.separator) {
                    <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
                } @else {
                    <li class="menu-separator">
                        <div class="separator-line"></div>
                    </li>
                }
            }
        </ul>
    `,
    styles: [`
        .university-menu {
            .menu-separator {
                margin: 1rem 0;
                padding: 0;
                
                .separator-line {
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
                    margin: 0 1rem;
                }
            }
            
            :host ::ng-deep {
                .layout-menuitem-root-text {
                    font-weight: 600;
                    color: #1f2937;
                    font-size: 0.95rem;
                    letter-spacing: 0.025em;
                }
                
                .layout-menuitem-text {
                    font-weight: 500;
                    color: #374151;
                    transition: all 0.2s ease;
                }
                
                .layout-menuitem:hover .layout-menuitem-text {
                    color: #1e40af;
                    transform: translateX(2px);
                }
                
                .layout-menuitem.active-menuitem .layout-menuitem-text {
                    color: #1d4ed8;
                    font-weight: 600;
                }
                
                .layout-menuitem-icon {
                    color: #6b7280;
                    transition: all 0.2s ease;
                }
                
                .layout-menuitem:hover .layout-menuitem-icon {
                    color: #1e40af;
                }
                
                .layout-submenu {
                    background: #f8fafc;
                    border-radius: 8px;
                    margin: 0.25rem 0;
                    padding: 0.5rem 0;
                    border-left: 3px solid #e5e7eb;
                }
            }
        }
    `]
})
export class AppMenu {
    model: MenuItem[] = [];
     
    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.buildMenu();
    }
    
    private buildMenu() {
        this.model = [];
        
        // Menu para administradores
        if (this.authService.hasRole('ROLE_ADMIN')) {
        this.model.push(
            {
                label: 'Administración',
                items: [
                    { 
                        label: 'Dashboard', 
                        icon: 'pi pi-fw pi-chart-bar', 
                        routerLink: ['admin-dashboard'] 
                    },                    // Submenu "Gestión estudiantil"
                    {
                        label: 'Gestión estudiantil',
                        icon: 'pi pi-fw pi-user-edit',
                        items: [
                            { 
                                label: 'Gestión de Postulantes', 
                                icon: 'pi pi-users', 
                                routerLink: ['/applicant-management'] 
                            },
                            { 
                                label: 'Secciones de Cursos', 
                                icon: 'pi pi-fw pi-list', 
                                routerLink: ['/course-sections'] 
                            },
                            { 
                                label: 'Control Estudiantes', 
                                icon: 'pi pi-fw pi-user', 
                                routerLink: ['/student-management'] 
                            },
                            { 
                                label: 'Matrícula', 
                                icon: 'pi pi-fw pi-calendar-plus', 
                                routerLink: ['/student-enrollment-admin'] 
                            }

                        ]
                    },
                    {
                        label: 'Gestión de Docentes',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/teacher-management']
                    },
                    { 
                                label: 'Gestión de Cursos', 
                                icon: 'pi pi-fw pi-book', 
                                routerLink: ['/course-management']
                },
                {
                        label: 'Evaluaciones de admisión',
                        icon: 'pi pi-fw pi-check-circle',
                        items: [
                            { 
                                label: 'Examen de Admisión', 
                                icon: 'pi pi-fw pi-file', 
                                routerLink: ['/exam-management'] 
                            },
                            { 
                                label: 'Entrevista', 
                                icon: 'pi pi-fw pi-user', 
                                routerLink: ['/interview-management'] 
                            }
                        ]
                    },
                ]
            }
        );
    }
        
        // Menu para estudiantes
        if (this.authService.hasRole('ROLE_STUDENT')) {
            this.model.push(
                {
                    label: 'Portal Estudiante',
                    items: [
                        { label: 'Matrícula', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/enrollment'] },
                        { label: 'Mis Cursos', icon: 'pi pi-fw pi-book', routerLink: ['/courses'] },
                    ]
                }
            );
        }
        
        // Menu para profesores
        if (this.authService.hasRole('ROLE_TEACHER')) {
            this.model.push(
                {
                    label: 'Portal Docente',
                    items: [
                        { 
                            label: 'Mis Secciones', 
                            icon: 'pi pi-fw pi-book', 
                            routerLink: ['/teacher/my-sections']
                        },
                        { 
                            label: 'Horario', 
                            icon: 'pi pi-fw pi-calendar', 
                            routerLink: ['/teacher/schedule']
                            }
                    ]
                }
            );
        }

        // Agregar separadores si hay múltiples categorías
        if (this.model.length > 1) {
            for (let i = 1; i < this.model.length; i++) {
                // Inserta un separador antes de cada categoría excepto la primera
                this.model.splice(i * 2 - 1, 0, { separator: true });
            }
        }
    }

            // OJO: Se comenta esta seccion para que quede como guia la jerarquia de los submenus de no necesitar borrarlo.

            // {
            //     label: 'Hierarchy',
            //     items: [
            //         {
            //             label: 'Submenu 1',
            //             icon: 'pi pi-fw pi-bookmark',
            //             items: [
            //                 {
            //                     label: 'Submenu 1.1',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 1.2',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
            //                 }
            //             ]
            //         },
            //         {
            //             label: 'Submenu 2',
            //             icon: 'pi pi-fw pi-bookmark',
            //             items: [
            //                 {
            //                     label: 'Submenu 2.1',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 2.2',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
            //                 }
            //             ]
            //         }
            //     ]
            // }
        
    }
