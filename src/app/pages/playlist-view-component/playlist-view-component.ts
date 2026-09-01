import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { SongView } from '../song-view/song-view';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaylistService } from '../../services/playlist-service';
import { DomSanitizer } from '@angular/platform-browser';
import { Playlist } from '../../models/playlist.model';

@Component({
  selector: 'app-playlist-view-component',
  imports: [SharedModule, SongView],
  templateUrl: './playlist-view-component.html',
  styleUrl: './playlist-view-component.scss',
})
export class PlaylistViewComponent implements OnInit {

  playlist = new Playlist();

  currentIndex = 0;

  nextSong() {
    if (this.currentIndex < (this.playlist.playlistSong || []).length - 1) {
      this.currentIndex++;
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  previousSong() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: PlaylistService,
    private sanitizer: DomSanitizer
  ) {}

  backToSetlist() {
    this.router.navigate(['/setlist-song/', this.playlist.id]);
  }

  async ngOnInit(): Promise<void> {
    const playlistId = this.route.snapshot.paramMap.get('id');
    const songId = this.route.snapshot.queryParamMap.get('songId');

    if (playlistId) {

      const playlist = await this.service.getById(parseInt(playlistId));

      if (playlist) {

        this.playlist = new Playlist(playlist);

        if (songId) {

          const index = this.playlist.playlistSong?.findIndex(
            ps => ps.song?.id === parseInt(songId)
          ) ?? -1;

          if (index >= 0) {
            this.currentIndex = index;
          }

        }

      }
    }
  }

}
