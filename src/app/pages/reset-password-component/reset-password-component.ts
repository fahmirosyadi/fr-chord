import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-reset-password-component',
  imports: [SharedModule],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.scss',
})
export class ResetPasswordComponent {

  password = '';

  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  async reset() {
    const { error } = await this.authService.updatePassword(this.password);

    if (error) {
      this.snackBar.open(error.message, 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
      return;
    }

    this.snackBar.open('Password updated successfully!', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }
}
