import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemParameter, SystemParameterDto } from '../../interfaces/system-parameter.interface';
import { ValueTypeOption } from '../../interfaces/value-type.interface';
import { SettingsService } from '../../services/settings.service';
import { EnumService } from '../../../shared/services/enum-service';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-system-parameter',
  standalone: true,  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    InputSwitchModule,
    InputNumberModule,
    ProgressSpinnerModule,
    TableModule,
    ToastModule,
    TooltipModule,
    TextareaModule,
    CalendarModule,
    TagModule,
    SelectModule
  ],
  providers: [MessageService],
  templateUrl: './system-parameter.component.html',
  styleUrls: ['./system-parameter.component.scss']
})
export class SystemParameterComponent implements OnInit {  parameters: SystemParameter[] = [];
  loading: boolean = false;
  saving: Record<string, boolean> = {};
  showCreateDialog: boolean = false;
  createForm: FormGroup;
  valueTypes: ValueTypeOption[] = [];
  dataTypeOptions = [
    { label: 'Texto', value: 'STRING' },
    { label: 'Número Entero', value: 'INTEGER' },
    { label: 'Número Decimal', value: 'DECIMAL' },
    { label: 'Booleano', value: 'BOOLEAN' },
    { label: 'Fecha', value: 'DATE' }
  ];

  
  
  
  editingParameters: Set<string> = new Set();
  editingValues: Record<string, any> = {};
  originalValues: Record<string, any> = {};    constructor(
    private router: Router,
    private settingsService: SettingsService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private enumService: EnumService
  ) {
      this.createForm = this.fb.group({
  key: ['', [Validators.required]],
  dataType: ['', [Validators.required]],
  value: ['', [Validators.required]],
  description: ['', [Validators.required]]
});

    
    this.createForm.get('dataType')?.valueChanges.subscribe((dataType: string) => {
      const valueControl = this.createForm.get('value');
      if (valueControl) {
       
        if (this.isBooleanType(dataType)) {
          valueControl.setValue(false);
        } else if (this.isNumberType(dataType)) {
          valueControl.setValue(0);
        } else if (this.isDateType(dataType)) {
          valueControl.setValue(new Date());
        } else {
          valueControl.setValue('');
        }
      }
    });
  }
  ngOnInit(): void {
    this.loadValueTypes();
    this.loadParameters();
  }

  loadValueTypes(): void {
    this.enumService.getValueTypes().subscribe({
      next: (types) => {
        this.valueTypes = types;
      },
      error: (error) => {
        console.error('Error loading value types:', error);
      }
    });
  }

  loadParameters(): void {
    this.loading = true;
    this.settingsService.getSystemParameters()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (params) => {
          this.parameters = params;
          params.forEach(param => {
            this.saving[param.key] = false;
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los parámetros del sistema'
          });
          console.error('Error loading parameters:', error);
        }
      });
  }  
  isEditing(key: string): boolean {
    return this.editingParameters.has(key);
  }

  startEdit(parameter: SystemParameter): void {
    this.editingParameters.add(parameter.key);
    this.originalValues[parameter.key] = parameter.value;
    this.editingValues[parameter.key] = this.formatParameterValue(parameter);
  }

  cancelEdit(key: string): void {
    this.editingParameters.delete(key);
    delete this.editingValues[key];
    delete this.originalValues[key];
  }

  saveEdit(parameter: SystemParameter): void {
    if (this.saving[parameter.key]) return;
    
    this.saving[parameter.key] = true;
    
    
    let valueToSave = this.editingValues[parameter.key];
    
    if (this.isBooleanType(parameter.dataType)) {
      valueToSave = String(valueToSave);
    } else if (this.isDateType(parameter.dataType)) {
      valueToSave = valueToSave instanceof Date ? valueToSave.toISOString() : valueToSave;
    } else {
      valueToSave = String(valueToSave);
    }
      const dto: SystemParameterDto = {
      key: parameter.key,
      value: valueToSave,
      description: parameter.description,
      dataType: parameter.dataType
    };
    
    this.settingsService.updateParameter(dto)
      .pipe(finalize(() => {
        setTimeout(() => {
          this.saving[parameter.key] = false;
        }, 1000);
      }))
      .subscribe({
        next: (updatedParam) => {
          
          const index = this.parameters.findIndex(p => p.key === parameter.key);
          if (index !== -1) {
            this.parameters[index] = updatedParam;
          }
        
          this.cancelEdit(parameter.key);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Parámetro actualizado correctamente`
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el parámetro'
          });
          console.error('Error updating parameter:', error);
        }
      });
  }

  formatDisplayValue(parameter: SystemParameter): string {
    const code = this.getValueTypeCode(parameter.dataType);
    switch (code) {
      case '3': 
        return parameter.value === 'true' ? 'Sí' : 'No';
      case '4': 
        try {
          const date = new Date(parameter.value);
          return date.toLocaleDateString('es-ES');
        } catch {
          return parameter.value;
        }
      default:
        return parameter.value;
    }
  }

  saveParameter(parameter: SystemParameter): void {
    if (this.saving[parameter.key] || !parameter.editable) return;
    
    this.saving[parameter.key] = true;
      const dto: SystemParameterDto = {
      key: parameter.key,
      value: String(parameter.value),
      description: parameter.description,
      dataType: parameter.dataType
    };
    
    this.settingsService.updateParameter(dto)
      .pipe(finalize(() => {
        setTimeout(() => {
          this.saving[parameter.key] = false;
        }, 1000);
      }))
      .subscribe({
        next: (updatedParam) => {
          const index = this.parameters.findIndex(p => p.key === parameter.key);
          if (index !== -1) {
            this.parameters[index] = updatedParam;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Parámetro actualizado correctamente`
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el parámetro'
          });
          console.error('Error updating parameter:', error);
        }
      });
  }
  toggleEditable(parameter: SystemParameter): void {
    this.settingsService.setParameterEditable(parameter.key, !parameter.editable)
      .subscribe({
        next: (updatedParam) => {
          
          const index = this.parameters.findIndex(p => p.key === parameter.key);
          if (index !== -1) {
            this.parameters[index] = updatedParam;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Estado de edición actualizado`
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cambiar el estado de edición'
          });
          console.error('Error toggling editable:', error);
        }
      });
  }

  openCreateDialog(): void {
    this.createForm.reset();
    this.showCreateDialog = true;
  }
  closeCreateDialog(): void {
    this.showCreateDialog = false;
    this.createForm.reset({ dataType: 'STRING', value: '' });
  }createParameter(): void {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      const dto: SystemParameterDto = {
        key: formValue.key,
        dataType: formValue.dataType,
        value: this.prepareValueForBackend(formValue.value, formValue.dataType),
        description: formValue.description
      };
      
      this.settingsService.createParameter(dto)
        .subscribe({
          next: (newParam) => {
            this.parameters.unshift(newParam);
            this.saving[newParam.key] = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Parámetro creado correctamente'
            });
            this.closeCreateDialog();
            this.createForm.reset({ dataType: 'STRING' });
            
            this.loadParameters();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear el parámetro'
            });
            console.error('Error creating parameter:', error);
          }
        });
    }
  }
  deleteParameter(parameter: SystemParameter): void {
    this.settingsService.deleteParameter(parameter.key)
      .subscribe({
        next: () => {
          this.parameters = this.parameters.filter(p => p.key !== parameter.key);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Parámetro eliminado correctamente'
          });
          
          this.loadParameters();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el parámetro'
          });
          console.error('Error deleting parameter:', error);
        }
      });
  }
  goBack(): void {
    this.router.navigate(['/settings']);
  }

  formatKey(key: string): string {
    return key
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getValueTypeCode(dataType: string): string {
    const valueType = this.valueTypes.find(vt => vt.label === dataType);
    return valueType ? valueType.code : '0';
  }

  getInputType(dataType: string): string {
    const code = this.getValueTypeCode(dataType);
    switch (code) {
      case '0': return 'text';     // STRING
      case '1': return 'number';   // INTEGER
      case '2': return 'number';   // DECIMAL
      case '3': return 'boolean';  // BOOLEAN
      case '4': return 'date';     // DATE
      default: return 'text';
    }
  }

  isNumberType(dataType: string): boolean {
    const code = this.getValueTypeCode(dataType);
    return code === '1' || code === '2'; // INTEGER or DECIMAL
  }

  isBooleanType(dataType: string): boolean {
    const code = this.getValueTypeCode(dataType);
    return code === '3'; // BOOLEAN
  }

  isDateType(dataType: string): boolean {
    const code = this.getValueTypeCode(dataType);
    return code === '4'; // DATE
  }

  isTextType(dataType: string): boolean {
    const code = this.getValueTypeCode(dataType);
    return code === '0'; // STRING
  }

  formatParameterValue(parameter: SystemParameter): any {
    const code = this.getValueTypeCode(parameter.dataType);
    switch (code) {
      case '1': // INTEGER
        return parseInt(parameter.value) || 0;
      case '2': // DECIMAL
        return parseFloat(parameter.value) || 0;
      case '3': // BOOLEAN
        return parameter.value === 'true';
      case '4': // DATE
        return new Date(parameter.value);
      default: // STRING
        return parameter.value;
    }
  }
  getTagSeverity(dataType: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
    switch (dataType?.toLowerCase()) {
      case 'texto':
      case 'string':
        return 'info';
      case 'entero':
      case 'integer':
        return 'success';
      case 'decimal':
        return 'warn';
      case 'booleano':
      case 'boolean':
        return 'secondary';
      case 'fecha':
      case 'date':
        return 'contrast';
      default:
        return 'info';
    }
  }

  get selectedDataType(): string {
    return this.createForm.get('dataType')?.value || 'STRING';
  }

  onDataTypeChange(): void {
    const dataType = this.selectedDataType;
    const valueControl = this.createForm.get('value');
    
    valueControl?.setValue('');
    
    if (dataType === 'DATE') {
      valueControl?.setValidators([Validators.required]);
    } else {
      valueControl?.setValidators([Validators.required]);
    }
    valueControl?.updateValueAndValidity();
  }

  formatValueForDisplay(parameter: SystemParameter): string {
    if (parameter.dataType === 'DATE' && parameter.value) {
      try {
        const date = new Date(parameter.value);
        return date.toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return parameter.value;
      }
    }
    return parameter.value;
  }

  prepareValueForBackend(value: any, dataType: string): string {
    if (dataType === 'DATE' && value instanceof Date) {
      return value.toISOString();
    }
    return String(value);
  }

  parseValueFromBackend(value: string, dataType: string): any {
    if (dataType === 'DATE' && value) {
      return new Date(value);
    }
    if (dataType === 'BOOLEAN') {
      return value === 'true';
    }
    if (dataType === 'NUMBER') {
      return Number(value);
    }
    return value;
  }
}