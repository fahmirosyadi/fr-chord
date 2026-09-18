import { Injectable } from '@angular/core';
import { Supabase } from './supabase';
import { Playlist } from '../models/playlist.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { PlaylistSong } from '../models/playlist-song.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {

  private query: SupabaseClient;

  constructor(private supabase: Supabase) {
    this.query = this.supabase.supabase;
  }

	async getPaged(
    page: number,
    pageSize: number,
    search: string = '',
    status?: number
  ) {

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await this.query
      .rpc('search_playlist', {
        search_term: search,
        status_filter: status
      });

    if (error) {
      throw error;
    }

    const paged = data?.slice(from, to + 1) ?? [];

    return {
      data: paged,
      total: data?.length ?? 0,
    };

  }

  async getAll(): Promise<Playlist[]> {

    const { data, error } = await this.query
      .from('playlist').select(`*`);

    if (error) throw error;

    return data.map(d => new Playlist(d)) ?? [];
  }

  async getById(id: number): Promise<Playlist> {

    const { data, error } = await this.query
      .from('playlist')
      .select(`
        *,
        playlist_song(
          id,
          order,
          song(*)
        )
      `)
      .eq('id', id)
      .order('order', {
        referencedTable: 'playlist_song',
        ascending: true
      })
      .single();

    if (error) throw error;
    const result = new Playlist(data);
    console.log(result)
    return result;
  }

  async create(song: Playlist): Promise<Playlist> {

    const payload = song.payload;

    const { data, error } = await this.query
      .from('playlist')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return new Playlist(data);

  }

  async update(id: number, song: Playlist): Promise<void> {
    console.log(song, song.payload)
    const payload = song.payload;
    const { error } = await this.query
      .from('song').update(payload).eq('id', id);

    if (error) throw error;
  }

  async delete(id: number): Promise<void> {

    const { error } = await this.query
      .from('song').delete().eq('id', id);

    if (error) throw error;
  }

  async updateSongOrder(
    playlistId: number,
    songIds: number[]
  ) {
    const { error } = await this.query.rpc(
      'update_playlist_song_order',
      {
        p_playlist_id: playlistId,
        p_song_ids: songIds
      }
    );

    if (error) {
      throw error;
    }
  }

  async addSong(
    playlistId: number,
    songId: number
  ): Promise<PlaylistSong> {

    const { data: lastSong, error: lastSongError } = await this.query
      .from('playlist_song')
      .select('order')
      .eq('playlist_id', playlistId)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastSongError) {
      throw lastSongError;
    }

    const nextOrder = lastSong
      ? lastSong.order + 1
      : 1;

    const payload = {
      playlist_id: playlistId,
      song_id: songId,
      order: nextOrder
    };

    const { data, error } = await this.query
      .from('playlist_song')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new PlaylistSong(data);
  }

  async removeSong(playlistId: number, songId: number): Promise<void> {

    const { error } = await this.query
      .from('playlist_song')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);

    if (error) throw error;
  }

}
