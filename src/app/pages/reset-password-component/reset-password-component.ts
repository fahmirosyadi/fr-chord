import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-reset-password-component',
  imports: [SharedModule],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.scss',
})
export class ResetPasswordComponent {

  password = '';
  confirmPassword = '';
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  async reset() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.saving = true;
    try {
      const { error } = await this.authService.updatePassword(this.password);
      if (error) throw error;
      this.successMessage = 'Password updated successfully. You can now log in with your new password.';
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not update your password.';
    } finally {
      this.saving = false;
    }

  }
}
