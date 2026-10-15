import { Injectable } from '@angular/core';
import { Supabase } from './supabase';

export interface Vocalist {
  id: number;
  name: string;
  lowest_note: string;
  highest_note: string;
}

export type VocalistInput = Omit<Vocalist, 'id'>;

@Injectable({ providedIn: 'root' })
export class VocalistService {
  constructor(private supabase: Supabase) {}

  async getAll(): Promise<Vocalist[]> {
    const { data, error } = await this.supabase.supabase
      .from('vocalist')
      .select('*')
      .order('name');

    if (error) throw error;
    return data ?? [];
  }

  async create(vocalist: VocalistInput): Promise<Vocalist> {
    const { data, error } = await this.supabase.supabase
      .from('vocalist')
      .insert(vocalist)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: number, vocalist: VocalistInput): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('vocalist')
      .update(vocalist)
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('vocalist')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
