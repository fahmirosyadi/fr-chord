import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { Supabase } from '../../services/supabase';
import { SongService } from '../../services/song-service';
import { Song } from '../../models/song.model';
import { SongPreviewComponent } from "../../components/song-preview-component/song-preview-component";

@Component({
  selector: 'app-song-editor',
  standalone: true,
  imports: [SharedModule, FormsModule, SongPreviewComponent],
  templateUrl: './song-editor.html',
  styleUrl: './song-editor.scss'
})
export class SongEditor implements OnInit {

  songId: string | null = null;

  song = new Song();

  constructor(private route: ActivatedRoute, private router: Router, public service: SongService) {}

  async ngOnInit() {

    this.songId = this.route.snapshot.paramMap.get('id');

    if (this.songId) {
      this.song = await this.service.getById(this.songId);
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
