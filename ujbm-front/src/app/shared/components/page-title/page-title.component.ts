import { Component, input } from '@angular/core';

@Component({
  selector: 'page-title',
  imports: [],
  template: `
      <div class="font-semibold text-xl mb-4"> {{ title() }}</div>
  `,
})
export class PageTitleComponent {
  title = input.required<string>();
}
