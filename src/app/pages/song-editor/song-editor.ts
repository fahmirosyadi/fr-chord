import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { Supabase } from '../../services/supabase';
import { SongService } from '../../services/song-service';
import { Song } from '../../models/song.model';
import { SongPreviewComponent } from "../../components/song-preview-component/song-preview-component";
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth-service';
import { User } from '../../models/user.model';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Artist } from '../../models/artist.model';

@Component({
  selector: 'app-song-editor',
  standalone: true,
  imports: [SharedModule, FormsModule, SongPreviewComponent, MatAutocompleteModule],
  templateUrl: './song-editor.html',
  styleUrl: './song-editor.scss'
})
export class SongEditor implements OnInit {

  songId: number | null = null;
  artistControl = new FormControl('');
  artists: Artist[] = [];

  song = new Song();

  constructor(
    private route: ActivatedRoute
    , private router: Router
    , public service: SongService
    , private snackBar: MatSnackBar
    , private authService: AuthService
  ) {}

  async ngOnInit() {
    const songId = this.route.snapshot.paramMap.get('id');
    if (songId) {
      this.songId = parseInt(songId);
      this.song = await this.service.getById(this.songId);
    }

    this.artistControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(keyword => {
        if (!keyword) {
          return of([]);
        }

        return this.service.getAllArtists(keyword);
      })
    ).subscribe(artists => {
      this.artists = artists;
    });
  }

  async saveSong() {
    if (this.songId) {
      await this.service.update(this.songId, this.song);
    } else {
      const createdSong = await this.service.create(this.song);
      this.songId = createdSong.id;
      this.song = createdSong;

      this.router.navigate(['/song-editor', createdSong.id]);
    }

    this.snackBar.open('Song saved!', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });

  }


}
