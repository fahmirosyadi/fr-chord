import { Component } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { SharedModule } from '../shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [SharedModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    const { error } = await this.auth.signIn(this.email, this.password);

    if (error) {
      alert(error.message);
    } else {
      await this.router.navigate(['/']);
    }
  }
}
