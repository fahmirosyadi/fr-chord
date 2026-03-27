import { Component } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'app-login',
  imports: [SharedModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService) {}

  async login() {
    const { error } = await this.auth.signIn(this.email, this.password);

    if (error) {
      alert(error.message);
    } else {
      alert('Login success!');
    }
  }

  async register() {
    const { error } = await this.auth.signUp(this.email, this.password);

    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for verification!');
    }
  }
}
