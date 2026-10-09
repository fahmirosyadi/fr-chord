import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-register',
  imports: [SharedModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss'
})
export class RegisterComponent {

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async register() {
    this.errorMessage = '';

    if (!this.fullName.trim()) {
      this.errorMessage = 'Name is required';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;

    const { error } = await this.auth.signUp(this.email, this.password, this.fullName.trim());

    this.loading = false;

    if (error) {
      this.errorMessage = error.message;
    } else {
      // redirect after success
      this.router.navigate(['/login']);
    }
  }
}
