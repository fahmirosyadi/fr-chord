import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SongService } from '../../services/song-service';
import { Song } from '../../models/song.model';
import { SharedModule } from '../../shared.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-song-list',
  standalone: true,
  imports: [SharedModule, FormsModule],
  templateUrl: './song-list-component.html',
  styleUrl: './song-list-component.scss'
})
export class SongListComponent implements OnInit {

  data: Song[] = [];
  search: string = '';

  constructor(
    private service: SongService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.data = await this.service.getAll();
  }

  viewSong(song: Song) {
    this.router.navigate(['/song-view', song.id]);
  }

  get filteredData(): Song[] {
    const keyword = this.search.toLowerCase();

    return this.data.filter(song =>
      song.title?.toLowerCase().includes(keyword) ||
      song.artist?.toLowerCase().includes(keyword)
    );
  }

}
