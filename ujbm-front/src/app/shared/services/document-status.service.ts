import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DocumentStatus {
  dni: boolean;
  certificado: boolean;
  foto: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentStatusService {
  private documentStatus = new BehaviorSubject<DocumentStatus>({
    dni: false,
    certificado: false,
    foto: false
  });

  documentStatus$ = this.documentStatus.asObservable();

  updateDocumentStatus(documentType: keyof DocumentStatus, status: boolean) {
    const currentStatus = this.documentStatus.getValue();
    const newStatus = { ...currentStatus, [documentType]: status };
    this.documentStatus.next(newStatus);

    // Verificar si todos los documentos están aprobados
    if (Object.values(newStatus).every(value => value === true)) {
      this.onAllDocumentsApproved();
    }
  }

  private onAllDocumentsApproved() {
  }
}
