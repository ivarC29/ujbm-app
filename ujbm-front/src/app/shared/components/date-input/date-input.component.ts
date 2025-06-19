import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { ValidationMessageComponent } from '../validation-message/validation-message.component';
import { CalendarModule } from 'primeng/calendar';


@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerModule,ValidationMessageComponent],
  template: `
    <div [formGroup]="form" class="flex flex-col gap-2">
      <label [for]="controlName">{{ label }}</label>
      <p-date-picker
        [formControlName]="controlName"
        [inputId]="controlName"
        showIcon
        class="w-full"
      ></p-date-picker>
      <app-validation-message [control]="control"></app-validation-message>
    </div>
  `
})
export class DateInputComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() label!: string;

  get control() {
    return this.form.get(this.controlName);
  }
}
