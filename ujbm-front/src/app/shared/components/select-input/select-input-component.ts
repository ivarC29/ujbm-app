import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-select-input',
  imports: [CommonModule,ReactiveFormsModule,SelectModule],
  template: `
    <div [formGroup]="form" class="flex flex-col gap-2">
      <label [for]="controlName" class="text-sm font-medium">{{ label }}</label>
      <p-select
        [options]="displayedOptions"
        [formControlName]="controlName"
        [optionLabel]="optionLabel"
        [optionValue]="optionValue"
        [placeholder]="placeholder"
        class="w-full"
        [appendTo]="appendTo"
        [filter]="filter"
      ></p-select>
    </div>
  `
})
export class SelectInputComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() label!: string;
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'code';
  @Input() placeholder: string = '';
  @Input() appendTo: string = 'body';
  @Input() filter: boolean = false;


 isTinyScreen = false;
 smallerScreen = false;

  @HostListener('window:resize')
  onResize() {
    this.isTinyScreen = window.innerWidth <= 375;
    this.smallerScreen = window.innerWidth <= 415 && window.innerWidth > 375;
  }

  ngOnInit() {
    this.onResize();
  }

  get displayedOptions() {
    // Solo truncar si es el select de carrera y en pantalla pequeña
    if (this.controlName === 'program' && this.isTinyScreen) {
      return this.options.map(opt => ({
        ...opt,
        [this.optionLabel]: this.truncate(opt[this.optionLabel])
      }));
    }
    if (this.controlName === 'program' && this.smallerScreen) {
      return this.options.map(opt => ({
        ...opt,
        [this.optionLabel]: this.truncateSmallerScreen(opt[this.optionLabel])
      }));
    }

    return this.options;
  }

  truncate(text: string): string {
    if (!text) return '';
    return text.length > 35 ? text.slice(0, 26) + '...' : text;
  }
  truncateSmallerScreen(text: string): string {
    if (!text) return '';
    return text.length > 40 ? text.slice(0, 29) + '...' : text;
  }
}