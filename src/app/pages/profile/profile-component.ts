import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-profile',
  imports: [SharedModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  fullName = '';
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    try {
      const profile = await this.authService.getProfile();
      this.fullName = profile.full_name ?? '';
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not load your profile.';
    } finally {
      this.loading = false;
    }
  }

  async save() {
    const fullName = this.fullName.trim();
    if (!fullName) {
      this.errorMessage = 'Name is required.';
      this.successMessage = '';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.updateProfile(fullName);
      this.fullName = fullName;
      this.successMessage = 'Profile updated.';
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not update your profile.';
    } finally {
      this.saving = false;
    }
  }
}
