import { Routes } from '@angular/router';
import { MenuSettingsComponent } from './components/menu-settings/menu-settings.component';
import { SystemParameterComponent } from './components/system-parameter/system-parameter.component'; 
import { ScheduleConfigurationComponent } from './components/schedule-configuration/schedule-configuration.component'; 

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: MenuSettingsComponent
  },
  {
    path: 'system-parameters',
    component: SystemParameterComponent
  },
  {
    path: 'schedule-configuration',
    component: ScheduleConfigurationComponent
  }
];
