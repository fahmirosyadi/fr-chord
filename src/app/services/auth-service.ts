import { Injectable } from '@angular/core';
import { Supabase } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  supabase = new Supabase().supabase;

  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({
      email,
      password
    });
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

  async getUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }
}
