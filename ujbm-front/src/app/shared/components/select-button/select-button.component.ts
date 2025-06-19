import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-select-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectButtonModule],
  template: `
    <div class="flex flex-col gap-2" [formGroup]="form">
      @if (label) {
        <label class="font-semibold text-sm">{{ label }}</label>
      }
      <div class="overflow-x-auto">
        <p-selectButton
          [options]="options"
          [formControlName]="controlName"
          [optionLabel]="optionLabel"
          [optionValue]="optionValue"
          class="class"
        ></p-selectButton>
      </div>
    </div>
  `,
})
export class SelectButtonComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() options: any[] = [];
  @Input() formControlName!: string;
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() label?: string;
  @Input() class: string = 'w-full';
  

}