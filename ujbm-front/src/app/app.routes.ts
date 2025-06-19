import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Forbidden } from './shared/pages/errors/forbidden';
import { Unauthorized } from './shared/pages/errors/unauthorized';
import { adminGuard } from './core/guards/admin-role.guard';
import { authGuard } from './core/guards/auth.guard';
import { SETTINGS_ROUTES } from './settings/settings.routes';
import { studentGuard } from './core/guards/student-role.guard';
import { teacherGuard } from './core/guards/teacher-role.guard';
import { roleRedirectGuard } from './core/guards/role-redirect.guard';


export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./core/pages/login/login.component'),
  },
  {
    path: 'payment-receipt',
    loadComponent: () => import('./applicant/pages/payment-receipt-upload/payment-receipt-upload.component'),
  },
  {
        path: 'applicant-registry',
        loadComponent: () => import('./applicant/pages/applicant-registry/applicant-registry.component'),
      },
    {
      path: 'admission-exam',
      loadComponent: () => import('./applicant/pages/applicant-exam-page/applicant-exam-page.component')
    },
    {
      path: 'applicant-interview',
      loadComponent: () => import('./applicant/pages/applicant-interview-page/applicant-interview-page.component')
    },
    {
      path: 'admission-score',
      loadComponent: () => import('./applicant/pages/admission-score-page/admission-score-page.component')
    },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [roleRedirectGuard],
        component: AppLayout 
      },
      {
        path: 'applicant-management',
        loadComponent: () => import('./applicant/pages/applicant-management/applicant-management.component'),
        canActivate: [adminGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'admin-dashboard',
        loadComponent: () => import('./dashboard/pages/management-dashboard-page/management-dashboard-page.component'),
        canActivate: [adminGuard],
      },
      {
        path: 'enrollment',
        loadComponent: () => import('./student/pages/student-enrollment-registry-page/student-enrollment-registry-page.component'),
        canActivate: [studentGuard],
        data: { roles: ['ROLE_STUDENT'] }
      },      
      {
        path: 'courses',
        loadComponent: () => import('./student/pages/student-enrollment-courses-page/student-enrollment-courses-page.component'),
        canActivate: [studentGuard],
        data: { roles: ['ROLE_STUDENT'] }
      },        {
        path: 'course-sections',
        loadComponent: () => import('./enrollment/pages/course-section-management/course-section-management.component').then(m => m.CourseSectionManagementComponent),
        canActivate: [adminGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'course-management',
        loadComponent: () => import('./enrollment/pages/course-management/course-management.component'),
        canActivate: [adminGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/pages/settings/settings.component'),
        children: SETTINGS_ROUTES,
        canActivate: [adminGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'change-password',
        loadComponent: () => import('./shared/pages/change-password/change-password.page'),
      },
      {
        path: 'teacher-management',
        loadComponent: () => import('./teacher/pages/teacher-management/teacher-management.component'),
        canActivate: [adminGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },      {
        path: 'student-management',
        loadComponent: () => import('./student/pages/student-management/student-management.page'),
        canActivate: [adminGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'teacher/my-sections',
        loadComponent: () => import('./teacher/pages/teacher-course-sections-page/teacher-course-sections-page.component'),
        canActivate: [teacherGuard],
        data: { roles: ['ROLE_TEACHER'] }
      },
      {
        path: 'teacher/schedule',
        loadComponent: () => import('./teacher/pages/teacher-schedule-page/teacher-schedule-page.component'),
        canActivate: [teacherGuard],
        data: { roles: ['ROLE_TEACHER'] }
      },
      {
        path: 'student-enrollment-admin',
        loadComponent: () => import('./student/pages/student-enrollment-admin-page/student-enrollment-admin-page.component'),
        canActivate: [adminGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'exam-management',
        loadComponent: () => import('./applicant/pages/applicant-exam-management-page/applicant-exam-management-page.component'),
        canActivate: [adminGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'interview-management',
        loadComponent: () => import('./applicant/pages/applicant-interview-management-page/applicant-interview-management-page.component'),
        canActivate: [adminGuard],
        data: { roles: ['ROLE_ADMIN'] }
      }

    ],
  },
  { path: 'notfound', loadComponent: () => import('./shared/pages/errors/notfound') },
  { path: 'forbidden', component: Forbidden },
  { path: 'unauthorized', component: Unauthorized },
  { path: '**', redirectTo: '/notfound' }

];
