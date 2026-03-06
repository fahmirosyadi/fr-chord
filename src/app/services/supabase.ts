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

  async getSongs() {
    const { data, error } = await this.supabase
      .from('song')
      .select(`
        *,
        genre (*)
      `);

    if (error) throw error;

    return data;
  }

  async getSongById(id:string){
    const { data } = await this.supabase
      .from('song')
      .select('*')
      .eq('id', id)
      .single();

    return data;
  }

  async createSong(data:any){

    const { error } = await this.supabase
      .from('song')
      .insert(data);

    if (error) console.error(error);

  }

  async updateSong(id:string, data:any){

    const { error } = await this.supabase
      .from('song')
      .update(data)
      .eq('id', id);

    if (error) console.error(error);

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
