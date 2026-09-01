import { Component, OnInit } from '@angular/core';
import { Playlist } from '../../models/playlist.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaylistService } from '../../services/playlist-service';
import { DomSanitizer } from '@angular/platform-browser';
import {
  CdkDrag,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatIcon } from "@angular/material/icon";
import { Song } from '../../models/song.model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-playlist-song-component',
  imports: [
    MatIcon,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
  ],
  templateUrl: './playlist-song-component.html',
  styleUrl: './playlist-song-component.scss',
})
export class PlaylistSongComponent implements OnInit  {

  playlist = new Playlist();
  isEditMode = false;
  isLoggedIn = false;

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: PlaylistService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    const user = await this.authService.getUser();
    this.isLoggedIn = !!user.id;
    console.log("user", user);

    if (id) {

      const playlist = await this.service.getById(parseInt(id));

      if (playlist) {
        this.playlist = new Playlist(playlist);
      }

    }
  }

  async onDrop(event: any) {

    const songs = this.playlist.playlistSong;
    console.log('onDrop', event, songs);
    if (!songs) {
      return;
    }

    moveItemInArray(
      songs,
      event.previousIndex,
      event.currentIndex
    );

    // Save the new order
    await this.service.updateSongOrder(
      this.playlist.id,
      songs.map(x => x.song.id)
    );

  }

  view(songId: number) {

		this.router.navigate(
      ['/setlist-view', this.playlist.id],
      {
        queryParams: {
          songId: songId
        }
      }
    );

	}

}
