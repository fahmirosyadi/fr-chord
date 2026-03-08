import { Component, OnInit } from '@angular/core';
import { DataTableComponent, TableColumn } from '../../components/data-table-component/data-table-component';
import { SharedModule } from '../../shared.module';
import { Router } from '@angular/router';
import { SongService } from '../../services/song-service';

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

  constructor(private service: SongService, private router: Router) {}

  async ngOnInit() {
    this.data = await this.service.getAll();
  }

  editSong(song: any) {
    this.router.navigate(['/song-editor', song.id]);
  }

  viewSong(song: any) {
    this.router.navigate(['/song-view', song.id]);
  }

  addSong() {
    this.router.navigate(['/song-editor']);
  }

}
