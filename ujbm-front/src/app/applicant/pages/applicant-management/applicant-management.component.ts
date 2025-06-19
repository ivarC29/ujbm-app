import { Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageTitleComponent } from '@shared/components/page-title/page-title.component';
import { ApplicantsTableComponent } from "../../components/applicants-table/applicants-table.component";
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
@Component({
  selector: 'applicant-management',
  imports: [
    FormsModule,
    PageTitleComponent,
    ApplicantsTableComponent
  ],
  providers: [MessageService,DynamicDialogRef],
  templateUrl: './applicant-management.component.html',
  styleUrl: './applicant-management.component.scss'
})
export default class ApplicantManagementComponent{
  title = 'Gestion de postulantes';
  private messageService = inject(MessageService);
  private ref = inject(DynamicDialogRef);
  validateDocument(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Validación exitosa',
      detail: 'El documento ha sido validado correctamente.',
    });
    this.ref.close();
  }

  rejectDocument(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Documento rechazado',
      detail: 'El documento ha sido rechazado.',
    });
    this.ref.close();
  }
}
