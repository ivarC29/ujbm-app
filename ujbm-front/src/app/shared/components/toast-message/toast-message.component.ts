import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast-message',
  standalone: true,
  imports: [ToastModule],
  template: `<p-toast></p-toast>`,
  providers: [MessageService]
})
export class ToastMessageComponent {
  constructor(public messageService: MessageService) {}

  showSuccess(summary: string, detail: string): void {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  showError(summary: string, detail: string): void {
    this.messageService.add({ severity: 'error', summary, detail });
  }
}