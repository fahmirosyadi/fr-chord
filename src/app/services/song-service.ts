import { Injectable } from '@angular/core';
import { Supabase } from './supabase';
import { Song } from '../models/song.model';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SongService {

  private query: SupabaseClient;

  constructor(private supabase: Supabase) {
    this.query = this.supabase.supabase;
  }

  async getAll(): Promise<Song[]> {

    const { data, error } = await this.query
      .from('song').select(`*, genre (*)`);

    if (error) throw error;

    return data.map(d => new Song(d)) ?? [];
  }

  async getById(id: string): Promise<Song> {

    const { data, error } = await this.query
      .from('song').select('*').eq('id', id).single();

    if (error) throw error;
    const result = new Song(data);
    console.log(result)
    return result;
  }

  async create(song: Song): Promise<void> {
    const payload = song.payload;
    const { error } = await this.query
      .from('song').insert(payload);

    if (error) throw error;
  }

  async update(id: string, song: Song): Promise<void> {
    console.log(song, song.payload)
    const payload = song.payload;
    const { error } = await this.query
      .from('song').update(payload).eq('id', id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {

    const { error } = await this.query
      .from('song').delete().eq('id', id);

    if (error) throw error;
  }

}
