import { Component, OnInit } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { DataTableComponent, TableColumn } from '../../components/data-table-component/data-table-component';
import { SharedModule } from '../../shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  templateUrl: './song.html',
})
export class Song implements OnInit {

  data: any[] = [];


  columns: TableColumn[] = [
    // { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'artist', label: 'Artist' },
    { key: 'genre.name', label: 'Genre' },
    { key: 'key', label: 'Key' },
    { key: 'male_key', label: 'Male Key' },
    { key: 'female_key', label: 'Female Key' },
  ];

  constructor(private supabase: Supabase, private router: Router) {}

  async ngOnInit() {
    this.data = await this.supabase.getSongs();
  }

  editSong(song: any) {
    this.router.navigate(['/song-editor', song.id]);
  }

  addSong() {
    this.router.navigate(['/song-editor']);
  }

}
