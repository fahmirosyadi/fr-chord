import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { ThemeService } from '../../services/theme-service'
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  standalone: true,
  imports: [SharedModule, MatMenuModule],
  styleUrls: ['./navbar.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();

  constructor(public themeService: ThemeService) {}

  // switchToRose() { this.themeService.setTheme('dark-rose'); }
  // switchToBlue() { this.themeService.setTheme('dark-blue'); }

  // setTheme(theme: 'rose-theme' | 'blue-theme') {
  //   this.themeService.switchTheme(theme);
  // }
}
