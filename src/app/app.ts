import { Component, ViewChild, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NavbarComponent } from './components/navbar/navbar';
import { ThemeService } from './services/theme-service';

@Component({
  selector: 'app-root',
  standalone: true,                       // ✅ important
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']               // ✅ plural
})
export class App {
  protected readonly title = signal('fr-system-fe');
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.loadTheme();
  }
}
