import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export default class SettingsPageComponent {}
