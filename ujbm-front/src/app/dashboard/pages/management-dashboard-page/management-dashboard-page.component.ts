import { Component, signal } from '@angular/core';
import { ApplicantDashboardComponent } from '../../components/applicant-dashboard/applicant-dashboard.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-management-dashboard-page',
  standalone: true,
  imports: [CommonModule, ApplicantDashboardComponent],
  templateUrl: './management-dashboard-page.component.html',
  styleUrl: './management-dashboard-page.component.scss'
})
export default class ManagementDashboardPageComponent {}
