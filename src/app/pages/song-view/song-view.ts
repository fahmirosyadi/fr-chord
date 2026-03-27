import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Supabase } from '../../services/supabase';
import { SharedModule } from '../../shared.module';
import { Song } from '../../models/song.model';
import { SongService } from '../../services/song-service';
import { PartPreviewComponent } from '../../components/part-preview-component/part-preview-component';

@Component({
  selector: 'app-song-view',
  standalone: true,
  imports: [SharedModule, PartPreviewComponent],
  templateUrl: './song-view.html',
  styleUrl: './song-view.scss'
})
export class SongView implements OnInit {

  currentIndex = 0;

  song = new Song();


  constructor(
    private route: ActivatedRoute,
    private service: SongService
  ) {}

  async ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      const song = await this.service.getById(id);

      if (song) {
        this.song = new Song(song);
      }

    }

  }

  nextPart() {

    if (this.currentIndex < this.song.parts.length - 1) {
      this.currentIndex++;
    }

  }

  prevPart() {

    if (this.currentIndex > 0) {
      this.currentIndex--;
    }

  }

  selectPart(i: number) {

    this.currentIndex = i;

  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      this.nextPart();
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      this.prevPart();
    }

  }

}
