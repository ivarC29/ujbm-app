import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-shared-radio-group',
  standalone: true,
  imports: [ReactiveFormsModule, RadioButtonModule, CommonModule],
  template: `
    <div class="flex gap-4 items-center" [formGroup]="form">
      @if (label) {
        <label class="font-semibold mr-2">{{ label }}</label>
      }
      @for (option of options; track option.value) {
        <div class="flex items-center">
          <p-radioButton
            [formControlName]="controlName"
            [value]="option.value"
            [inputId]="option.inputId || (controlName + '-' + option.value)"
          ></p-radioButton>
          <label 
            [attr.for]="option.inputId || (controlName + '-' + option.value)"
            class="ml-1 cursor-pointer"
          >
            {{ option.label }}
          </label>
        </div>
      }
    </div>
  `,
  styles: []
})
export class RadioGroupComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() options!: { value: string; label: string; inputId?: string }[];
  @Input() label?: string;
}