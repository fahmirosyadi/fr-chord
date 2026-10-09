import { Injectable } from '@angular/core';
import { Supabase } from './supabase';
import { User } from '../models/user.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  readonly supabase: Supabase['supabase'];
  private readonly authenticatedSubject = new BehaviorSubject(false);
  readonly isAuthenticated$ = this.authenticatedSubject.asObservable();

  constructor(supabaseService: Supabase) {
    this.supabase = supabaseService.supabase;
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.authenticatedSubject.next(!!session?.user);
    });
  }

  async signUp(email: string, password: string, fullName: string) {
		const response = await this.supabase.auth.signUp({
  		email,
		  password,
		  options: { data: { full_name: fullName } },
		});

		const user = response.data.user;

		if (user) {
		  await this.supabase.from('profiles').upsert({
				id: user.id,
				full_name: fullName,
		  });
		}

		return response;
  }

  async signIn(email: string, password: string) {
		return await this.supabase.auth.signInWithPassword({
		  email,
		  password
		});
  }

  async signOut() {
		return await this.supabase.auth.signOut();
  }

  async getUser(): Promise<User> {
		const { data } = await this.supabase.auth.getUser();
		return data.user ? new User(data.user) : new User();
  }

  async getSession() {
		const { data } = await this.supabase.auth.getSession();
		return data.session;
  }

  async getProfile() {
    const user = await this.getUser();
    if (!user.id) throw new Error('You must be logged in to view your profile.');

    const { data, error } = await this.supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data ?? { full_name: user.user_metadata?.full_name ?? '' };
  }

  async updateProfile(fullName: string) {
    const user = await this.getUser();
    if (!user.id) throw new Error('You must be logged in to update your profile.');

    const { error } = await this.supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName });

    if (error) throw error;
  }

  // SEND RESET EMAIL
  async forgotPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  }

  // UPDATE PASSWORD AFTER REDIRECT
  async updatePassword(newPassword: string) {
    return await this.supabase.auth.updateUser({
      password: newPassword
    });
  }

}
