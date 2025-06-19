import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip-help',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center">
      <i 
        class="pi pi-info-circle text-blue-500 text-lg cursor-pointer"
        (mouseenter)="showTooltip = true"
        (mouseleave)="showTooltip = false"
      ></i>
      @if (showTooltip) {
        <div 
          class="tooltip"
          [class]="tooltipPositionClass"
          role="tooltip"
        >
          {{ text }}
          <div class="tooltip-arrow" [class]="arrowPositionClass"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .tooltip {
      position: absolute;
      z-index: 50;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      background-color: #1f2937;
      border-radius: 0.375rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: max-content;
      max-width: 200px;
      word-wrap: break-word;
    }

    .tooltip-right {
      left: calc(100% + 0.5rem);
      top: 50%;
      transform: translateY(-50%);
    }

    .tooltip-left {
      right: calc(100% + 0.5rem);
      top: 50%;
      transform: translateY(-50%);
    }

    .tooltip-arrow {
      position: absolute;
      width: 0.5rem;
      height: 0.5rem;
      background-color: #1f2937;
      transform: rotate(45deg);
    }

    .arrow-right {
      left: -0.25rem;
      top: calc(50% - 0.25rem);
    }

    .arrow-left {
      right: -0.25rem;
      top: calc(50% - 0.25rem);
    }

    @media (max-width: 640px) {
      .tooltip {
        max-width: 150px;
      }
    }
  `]
})
export class TooltipHelpComponent {
  @Input() text = '';
  @Input() position: 'left' | 'right' = 'right';
  showTooltip = false;

  get tooltipPositionClass(): string {
    return `tooltip-${this.position}`;
  }

  get arrowPositionClass(): string {
    return `arrow-${this.position}`;
  }
}