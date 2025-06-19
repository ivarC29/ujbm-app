import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {ChangePasswordComponent} from "../../components/change-password/change-password.component";

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [CommonModule, ChangePasswordComponent],
  template: `
    <div class="card">
     <app-change-password></app-change-password>
  </div>
  `,
  styles: [`
    .change-password-container {
      width: 100%;
      margin: 0 auto;
    }
  `]
})
export default class ChangePasswordPage {}
