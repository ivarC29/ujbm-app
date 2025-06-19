import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from 'src/app/layout/service/layout.service';


@Component({
  selector: 'app-page-header',
  imports: [CommonModule],
   template:`
  <div class="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-50">
    <div>
      <h1 class="text-xl font-bold mb-0.5 text-white">
        {{ title }}
      </h1>
      <p class="opacity-90 text-sm">
        {{ subtitle }}
      </p>
    </div>
    
    <div class="flex items-center gap-4">
      @if(showDarkModeToggle) {
        <button 
          type="button" 
          class="theme-toggle flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
          (click)="toggleDarkMode()"
        >
          <i [ngClass]="layoutService.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'" class="text-white text-xl"></i>
        </button>
      }
      
      <!-- Logo -->
      <img
        class="h-[45px]"
        [src]="logoPath"
        [alt]="logoAlt"
      />
    </div>
  </div>
  `,
  styles: [`
    .theme-toggle {
      transition: all 0.2s;
      
      &:hover {
        transform: scale(1.1);
        background-color: rgba(255, 255, 255, 0.15);
      }
      
      &:active {
        transform: scale(0.95);
      }
      
      i {
        font-size: 1.2rem;
      }
    }
  `],
  providers: [LayoutService]
})
export class PageHeaderComponent {
  @Input() title: string = 'Título de la Página';
  @Input() subtitle: string = 'Subtítulo de la página';
  @Input() logoPath: string = 'logo.png';
  @Input() logoAlt: string = 'Universidad Jaime Bausate y Meza';
  @Input() showDarkModeToggle: boolean = true;

  constructor(public layoutService: LayoutService) {}

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ 
      ...state, 
      darkTheme: !state.darkTheme 
    }));
  }
}