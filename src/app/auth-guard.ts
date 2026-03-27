import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Supabase } from './services/supabase';

export const authGuard: CanActivateFn = async () => {
  const supabase = new Supabase().supabase;
  const router = inject(Router);

  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
