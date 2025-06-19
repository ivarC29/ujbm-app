import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ValidationMessageComponent } from '../validation-message/validation-message.component';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [ReactiveFormsModule,ValidationMessageComponent],
  template: `
    <div [formGroup]="form" class="flex flex-col gap-2">
      <label [for]="controlName">{{ label }}</label>
      <input
        pInputText
        [formControlName]="controlName"
        [id]="controlName"
        [placeholder]="label"
        class="p-inputtext w-full"
      />
      <app-validation-message [control]="control"></app-validation-message>
    </div>
  `
})
export class TextInputComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() label!: string;
  @Input() placeholder!: string;

  get control() {
    return this.form.get(this.controlName);
  }
}
