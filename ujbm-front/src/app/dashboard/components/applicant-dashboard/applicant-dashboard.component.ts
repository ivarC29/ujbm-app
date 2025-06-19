import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { ChartCardComponent } from 'src/app/shared/components/chart-card/chart-card.component';
import { ChartDataDTO, DashboardFilterRequest, ChartDimension } from '../../interfaces/applicant-dashboard.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { forkJoin } from 'rxjs';
import { ApplicantService } from 'src/app/applicant/services/applicant.service';
import { ProgramResponse } from 'src/app/shared/interfaces/program.interfaces';
import { EnumOptionResponse } from 'src/app/applicant/interfaces/enrollment-mode.interface';
import { UbigeoResponse } from 'src/app/applicant/interfaces/ubigeo.interface';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { AcademicPeriodService, AcademicPeriodSelectResponse } from 'src/app/shared/services/academic-period.service';
import { Select } from 'primeng/select';

const CHART_CONFIGS: { label: string; value: ChartDimension; chartType: 'bar' | 'pie' | 'doughnut'; icon: string }[] = [
  { label: 'Distribución por Sexo', value: 'gender', chartType: 'pie', icon: 'pi-users' },
  { label: 'Distribución por Edad', value: 'age', chartType: 'bar', icon: 'pi-calendar' },
  { label: 'Tipos de Postulante', value: 'applicantType', chartType: 'doughnut', icon: 'pi-user-plus' },
  { label: 'Programas Académicos', value: 'program', chartType: 'bar', icon: 'pi-book' },
  { label: 'Procedencia (Departamento)', value: 'department', chartType: 'bar', icon: 'pi-map' },
  { label: 'Tipo de Colegio', value: 'schoolType', chartType: 'pie', icon: 'pi-building' },
  { label: 'Medio de Contacto', value: 'contactMethod', chartType: 'doughnut', icon: 'pi-phone' },
  { label: 'Periodo Académico', value: 'academicPeriod', chartType: 'bar', icon: 'pi-calendar-clock' },
];

@Component({
  selector: 'app-applicant-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ChartCardComponent, 
    CardModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    FormsModule,
    InputNumberModule,
    Select
  ],
  templateUrl: './applicant-dashboard.component.html',
  styleUrl: './applicant-dashboard.component.scss',
})
export class ApplicantDashboardComponent implements OnInit {
  chartConfigs = CHART_CONFIGS;
  chartsData = signal<{ [key: string]: ChartDataDTO[] }>({});
  loading = signal(false);
  totalApplicants = signal(0);
  lastUpdated = signal<Date>(new Date());

  // Filtros activos
  filters = signal<Partial<DashboardFilterRequest>>({});

  // Opciones de filtros
  programOptions = signal<ProgramResponse[]>([]);
  applicantTypeOptions = signal<EnumOptionResponse[]>([]);
  departmentOptions = signal<UbigeoResponse[]>([]);
  schoolTypeOptions = signal<EnumOptionResponse[]>([]);
  genderOptions = signal<EnumOptionResponse[]>([]);
  academicPeriodOptions = signal<AcademicPeriodSelectResponse[]>([]);

  ageFrom: number | null = null;
  ageTo: number | null = null;

  // Para debounce simple
  private debounceTimeout: any;

  constructor(
    private dashboardService: DashboardService,
    private applicantService: ApplicantService,
    private academicPeriodService: AcademicPeriodService
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadAllCharts();
  }

  loadFilterOptions() {
    // Programas
    this.applicantService.getPrograms().subscribe({
      next: (programs) => this.programOptions.set(programs),
      error: () => this.programOptions.set([])
    });
    
    // Tipos de postulante
    this.applicantService.getEnrollmentModes().subscribe({
      next: (types) => {
        const mappedTypes = types
          .filter(t => t.code !== '00' && t.code !== '05') // Filtrar NO_ENROLLMENT y PRE
          .map(t => {
            // Map
            const enumValue = 
              t.code === '01' ? 'EXAM' :
              t.code === '02' ? 'PREFERENTIAL' :
              t.code === '03' ? 'EXEMPTED' :
              t.code === '04' ? 'TRANSFER' : 
              '';
            
            return {
              ...t,
              code: enumValue 
            };
          });
        
        this.applicantTypeOptions.set(mappedTypes);
      },
      error: () => this.applicantTypeOptions.set([])
    });
    
    // Tipos de colegio (usar ENUM: PRIVATE, PUBLIC, PAROCHIAL)
    this.applicantService.getHighSchoolTypes().subscribe({
      next: (types) => {
        let options: any[] = [];
        
        if (Array.isArray(types)) {
          options = types;
        } else if (types && Array.isArray((types as any).options)) {
          options = (types as any).options;
        }
        
        // Mapear códigos a enums
        const mappedTypes = options
          .filter(t => ['01', '02', '03'].includes(t.code))
          .map(t => {
            
            const enumValue = 
              t.code === '01' ? 'PRIVATE' :
              t.code === '02' ? 'PUBLIC' :
              t.code === '03' ? 'PAROCHIAL' : 
              '';
            
            return {
              ...t,
              code: enumValue 
            };
          });
          
        this.schoolTypeOptions.set(mappedTypes);
      },
      error: () => this.schoolTypeOptions.set([])
    });
    
    this.applicantService.getGenders().subscribe({
      next: (genders) => {
        const genderOptions = [
          { code: 'MALE', label: 'Masculino', description: 'Masculino' },
          { code: 'FEMALE', label: 'Femenino', description: 'Femenino' }
        ];
        this.genderOptions.set(genderOptions);
      },
      error: () => this.genderOptions.set([])
    });
    
    // Periodos académicos 
    this.academicPeriodService.getAcademicPeriods().subscribe({
      next: (periods) => this.academicPeriodOptions.set(periods),
      error: () => this.academicPeriodOptions.set([])
    });
    
    // Departamentos
    this.applicantService.getDepartments().subscribe({
      next: (departments) => this.departmentOptions.set(departments),
      error: () => this.departmentOptions.set([])
    });
  }

  // Para inputs de edad con debounce
  onAgeFilterChange() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.updateFiltersAndReload();
    }, 600);
  }

  // Para selects sin debounce
  onFilterChange() {
    this.updateFiltersAndReload();
  }

  private updateFiltersAndReload() {
    const filters = { ...this.filters() };
    
    // Solo agregar edad si tiene valor válido (no null, no undefined, no 0)
    if (this.ageFrom != null && this.ageFrom > 0) {
      filters.ageFrom = this.ageFrom;
    } else {
      delete filters.ageFrom;
    }
    
    if (this.ageTo != null && this.ageTo > 0) {
      filters.ageTo = this.ageTo;
    } else {
      delete filters.ageTo;
    }
    
    this.filters.set(filters);
    this.loadAllCharts();
  }

  clearFilters() {
    this.filters.set({});
    this.ageFrom = null;
    this.ageTo = null;
    this.loadAllCharts();
  }

  loadAllCharts() {
    this.loading.set(true);
    const activeFilters = this.filters();
    const chartRequests = this.chartConfigs.map(config => {
      const filter: DashboardFilterRequest = {
        chartDimension: config.value,
        ...activeFilters
      };
      return this.dashboardService.getApplicantChartData(filter);
    });
    
    forkJoin(chartRequests).subscribe({
      next: (results) => {
        const data: { [key: string]: ChartDataDTO[] } = {};
        let total = 0;
        results.forEach((result, index) => {
          const dimension = this.chartConfigs[index].value;
          data[dimension] = result;
          if (index === 0) {
            total = result.reduce((sum, item) => sum + Number(item.value), 0);
          }
        });
        this.chartsData.set(data);
        this.totalApplicants.set(total);
        this.lastUpdated.set(new Date());
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  refreshData() {
    this.loadAllCharts();
  }

  getChartData(dimension: ChartDimension): ChartDataDTO[] {
    return this.chartsData()[dimension] || [];
  }
}
