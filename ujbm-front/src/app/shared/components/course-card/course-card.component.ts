import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-course-card',
  standalone: true,
  template: `
    <div class="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ course.name }}</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">Ciclo: {{ course.cycle }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">Créditos: {{ course.credits }}</p>

      <button
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        (click)="onEnroll.emit(course)"
      >
        {{ isEnrolled ? 'Quitar' : 'Inscribirse' }}
      </button>
    </div>
  `,
})
export class CourseCardComponent {
  @Input() course!: { name: string; cycle: number; credits: number };
  @Input() isEnrolled: boolean = false;
  @Output() onEnroll = new EventEmitter<any>();
}
