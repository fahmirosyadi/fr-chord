import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Supabase } from '../../services/supabase';
import { SharedModule } from '../../shared.module';
import { Song } from '../../models/song.model';
import { SongService } from '../../services/song-service';
import { PartPreviewComponent } from '../../components/part-preview-component/part-preview-component';
import { SongPreviewComponent } from "../../components/song-preview-component/song-preview-component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-song-view',
  standalone: true,
  imports: [SharedModule, PartPreviewComponent, SongPreviewComponent],
  templateUrl: './song-view.html',
  styleUrl: './song-view.scss'
})
export class SongView implements OnInit {

  currentIndex = 0;
  @ViewChild('partsContainer', { static: false })
  partsContainer!: ElementRef<HTMLDivElement>;
  youtubeEmbedUrl: SafeResourceUrl | null = null;

  song = new Song();


  constructor(
    private route: ActivatedRoute,
    private service: SongService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      const song = await this.service.getById(parseInt(id));

      if (song) {
        this.song = new Song(song);
        this.setYoutubeUrl();
        if(this.song.preferredKey) {
          // this.song.tmpCurrentKey = this.song.preferredKey;
        }
      }

    }

  }

  setYoutubeUrl() {

    if (!this.song?.youtubeUrl) {
      this.youtubeEmbedUrl = null;
      return;
    }

    const url = this.song.youtubeUrl.trim();

    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/i
    );

    if (!match) {
      this.youtubeEmbedUrl = null;
      return;
    }

    const videoId = match[1];

    this.youtubeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  nextPart() {
    if (this.currentIndex < this.song.parts.length - 1) {
      this.scrollToPart(this.currentIndex + 1);
    }
  }

  prevPart() {
    if (this.currentIndex > 0) {
      this.scrollToPart(this.currentIndex - 1);
    }
  }

  scrollNext() {
    const el = this.partsContainer.nativeElement;

    const item = el.querySelector('.part-item') as HTMLElement;
    if (!item) return;

    const height = item.offsetHeight;

    el.scrollBy({ top: height, behavior: 'smooth' });
  }

  scrollToPart(index: number) {
    const el = document.getElementById('part-' + index);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    this.currentIndex = index;
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
