import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://erqutgwxwuzepeugisqh.supabase.co',
      'sb_publishable_joc6Z8G0Jupbbw5LEfqCPQ_wykr-LxQ'
    );
  }

  async getRoles() {
    const { data, error } = await this.supabase
      .from('role')
      .select('*');

    if (error) throw error;

    return data;
  }

  async getUsers() {
    const { data, error } = await this.supabase
      .from('user')
      .select('*');

    if (error) throw error;

    return data;
  }

  async getGenres() {
    const { data, error } = await this.supabase
      .from('genre')
      .select('*');

    if (error) throw error;

    return data;
  }

}
