import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-forgot-password',
  imports: [SharedModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async sendResetLink() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { error } = await this.authService.forgotPassword(this.email.trim());
      if (error) throw error;
      this.successMessage = 'If an account exists for that email, a password reset link has been sent.';
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not send the reset link.';
    } finally {
      this.loading = false;
    }
  }
}
