import { Directive, signal, ViewChild, OnInit } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';

export interface BaseFilterRequest {
  page: number;
  size: number;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
  [key: string]: any; // Para campos específicos de cada tabla
}

export interface BasePage<T> {
  content: T[];
  page: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface BaseEntity {
  id: number;
  name: string;
  [key: string]: any;
}

@Directive()
export abstract class BaseTableComponent<T extends BaseEntity, F extends BaseFilterRequest> implements OnInit {
  @ViewChild('dt') dt!: Table;

  // Señales base
  items = signal<T[]>([]);
  loading = signal<boolean>(false);

  // Propiedades de paginación
  rows = 10;
  first = 0;
  totalRecords = 0;

  // Control de acciones
  protected isProcessingAction = false;

  // Debounce subjects
  protected searchTerms = new Subject<string>();
  protected columnFilterTerms = new Subject<{field: string, value: any}>();

  // Filtro actual
  currentFilter: F;

  constructor(
    protected messageService: MessageService,
    protected confirmationService: ConfirmationService
  ) {
    this.currentFilter = this.getInitialFilter();
    this.setupDebounceHandlers();
  }

  ngOnInit(): void {
    this.loadItems();
  }

  // Métodos abstractos que deben implementar las clases hijas
  abstract getInitialFilter(): F;
  abstract loadItems(): void;
  abstract deleteItem(item: T): void;
  abstract getItemDisplayName(item: T): string;

  // Métodos de paginación
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.currentFilter.page = Math.floor(event.first / event.rows);
    this.currentFilter.size = event.rows;
    this.loadItems();
  }

  // Búsqueda global
  onGlobalSearch(value: string): void {
    this.searchTerms.next(value);
  }

  protected handleGlobalSearch(value: string): void {
    if (this.isProcessingAction) return;

    const searchValue = value?.trim();
    this.resetPagination();

    if (searchValue) {
      this.applyGlobalFilter(searchValue);
    } else {
      this.clearGlobalFilter();
    }

    this.clearTableFilters();
    this.loadItems();
  }

  // Filtros de columna
  onColumnFilter(field: string, value: any): void {
    this.columnFilterTerms.next({field, value});
  }

  protected handleColumnFilter(field: string, value: any): void {
    if (this.isProcessingAction) return;
    
    this.resetPagination();
    this.applyColumnFilter(field, value);
    this.loadItems();
  }

  // Ordenamiento
  onSort(event: any): void {
    if (this.isProcessingAction) return;

    const newSortBy = event.field;
    const newSortDirection = event.order === 1 ? 'ASC' : 'DESC';

    if (this.currentFilter.sortBy !== newSortBy || this.currentFilter.sortDirection !== newSortDirection) {
      this.currentFilter.sortBy = newSortBy;
      this.currentFilter.sortDirection = newSortDirection;
      this.resetPagination();
      this.loadItems();
    }
  }

  // Limpiar filtros
  clear(table: Table): void {
    if (this.isProcessingAction) return;

    table.clear();
    this.resetToInitialState();
    this.loadItems();
  }

  refreshTable(): void {
    this.clear(this.dt);
  }

  // Eliminar con confirmación
  onDeleteWithConfirmation(item: T): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar "${this.getItemDisplayName(item)}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteItem(item);
      }
    });
  }

  // Mostrar mensajes toast
  protected showSuccessMessage(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 5000
    });
  }

  protected showErrorMessage(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 6000
    });
  }

  // Métodos de utilidad protegidos
  protected resetPagination(): void {
    this.first = 0;
    this.currentFilter.page = 0;
  }

  protected resetToInitialState(): void {
    this.first = 0;
    this.currentFilter = this.getInitialFilter();
  }

  protected clearTableFilters(): void {
    if (this.dt) {
      this.dt.filteredValue = null;
    }
  }

  // Setup de debounce handlers
  private setupDebounceHandlers(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.handleGlobalSearch(term);
    });

    this.columnFilterTerms.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => 
        prev.field === curr.field && prev.value === curr.value
      )
    ).subscribe(filter => {
      this.handleColumnFilter(filter.field, filter.value);
    });
  }

  // Métodos que pueden ser sobrescritos por las clases hijas
  protected applyGlobalFilter(searchValue: string): void {
    // Implementación por defecto - las clases hijas pueden sobrescribir
    (this.currentFilter as any).name = searchValue;
  }

  protected clearGlobalFilter(): void {
    // Implementación por defecto - las clases hijas pueden sobrescribir
    delete (this.currentFilter as any).name;
  }

  protected applyColumnFilter(field: string, value: any): void {
    // Implementación por defecto - las clases hijas pueden sobrescribir
    const filterValue = value?.trim ? value.trim() : value;
    
    if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
      (this.currentFilter as any)[field] = typeof filterValue === 'string' ? filterValue : Number(filterValue);
    } else {
      delete (this.currentFilter as any)[field];
    }
  }
}