import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth-service';

export const supabaseAdminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const session = await authService.getSession();

  if (!session) return router.createUrlTree(['/login']);
  if (session.user.app_metadata?.['role'] === 'admin') return true;

  return router.createUrlTree(['/']);
};
