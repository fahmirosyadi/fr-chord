import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { ThemeService } from '../../services/theme-service'
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
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
  isAuthenticated = false;

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private router: Router
  ) {
    this.authService.isAuthenticated$.subscribe(value => this.isAuthenticated = value);
  }

  async onAuthAction() {
    if (this.isAuthenticated) {
      await this.authService.signOut();
      await this.router.navigate(['/']);
      return;
    }

    await this.router.navigate(['/login']);
  }

  // switchToRose() { this.themeService.setTheme('dark-rose'); }
  // switchToBlue() { this.themeService.setTheme('dark-blue'); }

  // setTheme(theme: 'rose-theme' | 'blue-theme') {
  //   this.themeService.switchTheme(theme);
  // }
}
