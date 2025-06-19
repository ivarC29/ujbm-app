import { Component } from '@angular/core';
import { environment } from '@environments/environment';


@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer text-center py-4 text-sm text-gray-600">
        {{ envs.companySlogan }} -
        <span class="font-semibold text-primary">{{ envs.companyName2 }}</span>
        &copy; {{ currentYear }}
    </div>`
})
export class AppFooter {
  envs = environment;
  currentYear: number = new Date().getFullYear();
}
