import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileInputComponent } from '../file-input/file-input.component';

@Component({
  selector: 'shared-file-upload-group',
  standalone: true,
  imports: [CommonModule, FileInputComponent],
  template: `
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 col-span-full">
    @for (file of files; track file.controlName) {
      <app-file-input
        [form]="form"
        [controlName]="file.controlName"
        [label]="file.label"
        [accept]="file.accept || '.pdf,.jpg,.png'"
        [multiple]="file.controlName === 'syllabusFile'"
      />
    }
  </div>
`
})
export class FileUploadGroupComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) files!: { controlName: string; label: string; accept?: string; icon?: string }[];
}