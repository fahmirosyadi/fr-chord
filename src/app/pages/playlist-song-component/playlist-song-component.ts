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
import { AuthService } from '../../services/auth-service';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-playlist-song-component',
  imports: [
    SharedModule,
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
  isDeleteMode = false;
  isLoggedIn = false;
  errorMessage = '';
  editedPlaylistName = '';

  async toggleEditMode() {
    if (!this.isEditMode) {
      this.errorMessage = '';
      this.editedPlaylistName = this.playlist.name ?? '';
      this.isEditMode = true;
      return;
    }

    const name = this.editedPlaylistName.trim();
    if (!name) {
      this.errorMessage = 'Setlist title cannot be empty.';
      return;
    }

    try {
      if (name !== this.playlist.name) {
        await this.service.updateName(this.playlist.id, name);
        this.playlist.name = name;
      }
      this.errorMessage = '';
      this.isEditMode = false;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not save setlist title.';
    }
  }

  toggleDeleteMode() {
    this.isDeleteMode = !this.isDeleteMode;
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

  addSong() {
    this.router.navigate(['/'], {
      queryParams: {
        playlistId: this.playlist.id
      }
    });
  }

  async deleteSong(event: Event, songId: number) {
    event.stopPropagation();
    await this.service.removeSong(this.playlist.id, songId);
    // Refresh the playlist songs
    const updatedPlaylist = await this.service.getById(this.playlist.id);
    if (updatedPlaylist) {
      this.playlist = new Playlist(updatedPlaylist);
    }
  }

}
