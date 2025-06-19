import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-menu-settings',
  standalone: true,
  imports: [CommonModule, PageTitleComponent],
  templateUrl: './menu-settings.component.html',
  styleUrls: ['./menu-settings.component.scss']
})
export class MenuSettingsComponent implements OnInit {
  menuItems: MenuItem[] = [];

  constructor(
    private router: Router,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.settingsService.getMenuItems().subscribe(items => {
      this.menuItems = items;
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
