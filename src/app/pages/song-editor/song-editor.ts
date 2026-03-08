import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { Supabase } from '../../services/supabase';
import { SongService } from '../../services/song-service';
import { Song } from '../../models/song.model';

@Component({
  selector: 'app-song-editor',
  standalone: true,
  imports: [SharedModule, FormsModule],
  templateUrl: './song-editor.html',
  styleUrl: './song-editor.scss'
})
export class SongEditor implements OnInit {

  songId: string | null = null;

  song = new Song();

  loadSong(data: Partial<Song>) {
    this.song = new Song(data);
  }

  constructor(private route: ActivatedRoute, private router: Router, public service: SongService) {}

  async ngOnInit() {

    this.songId = this.route.snapshot.paramMap.get('id');

    if (this.songId) {
      const song = await this.service.getById(this.songId);
      if (song) {
        this.loadSong(song);
      }
    }

  }

  async saveSong() {

    if (this.songId) {
      await this.service.update(this.songId, this.song);
    } else {
      await this.service.create(this.song);
    }

    this.router.navigate(['/song']);

  }

}
