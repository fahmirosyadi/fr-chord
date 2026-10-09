import { Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Supabase } from '../../services/supabase';
import { SharedModule } from '../../shared.module';
import { Song } from '../../models/song.model';
import { SongService } from '../../services/song-service';
import { PartPreviewComponent } from '../../components/part-preview-component/part-preview-component';
import { SongPreviewComponent } from "../../components/song-preview-component/song-preview-component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Factory } from 'vexflow';

@Component({
  selector: 'app-song-view',
  standalone: true,
  imports: [SharedModule, PartPreviewComponent, SongPreviewComponent],
  templateUrl: './song-view.html',
  styleUrl: './song-view.scss'
})
export class SongView implements OnInit, OnChanges, OnDestroy  {

  currentIndex = 0;
  @ViewChild('partsContainer', { static: false })
  partsContainer!: ElementRef<HTMLDivElement>;
  youtubeEmbedUrl: SafeResourceUrl | null = null;
  metronomeRunning = false;
  currentBeat = 0;
  private metronomeTimer?: ReturnType<typeof setInterval>;
  private originalBpm: number | null = null;
  private tempoTapTimes: number[] = [];

  get hasMetronomeSettings(): boolean {
    return this.song?.bpm != null
      && this.song.timeSignatureNumerator != null
      && this.song.timeSignatureDenominator != null;
  }

  get beatsPerBar(): number {
    return Math.max(1, Math.min(12, this.song.timeSignatureNumerator || 4));
  }

  get beatNumbers(): number[] {
    return Array.from({ length: this.beatsPerBar }, (_, index) => index + 1);
  }

  get beatIntervalMs(): number {
    const denominator = this.song.timeSignatureDenominator || 4;
    return 60000 / (this.song.bpm || 120) * (4 / denominator);
  }

  @Input() song!: Song;


  constructor(
    private route: ActivatedRoute,
    private service: SongService,
    private sanitizer: DomSanitizer
  ) {}

  private startMetronome() {
    if (this.metronomeRunning || !this.hasMetronomeSettings || !this.song.bpm) return;
    this.metronomeRunning = true;
    this.currentBeat = 0;
    this.playBeat();
    this.metronomeTimer = setInterval(
      () => this.playBeat(),
      this.beatIntervalMs
    );
  }

  resetTempo() {
    if (this.originalBpm === null) return;
    this.song.bpm = this.originalBpm;
    this.tempoTapTimes = [];
    this.stopMetronome();
    this.startMetronome();
  }

  tapTempo() {
    const now = performance.now();
    const lastTap = this.tempoTapTimes.at(-1);
    if (lastTap !== undefined && now - lastTap > 2000) {
      this.tempoTapTimes = [];
    }

    this.tempoTapTimes.push(now);
    if (this.tempoTapTimes.length > 4) this.tempoTapTimes.shift();
    if (this.tempoTapTimes.length < 4) return;

    const intervals = this.tempoTapTimes.slice(1).map((time, index) => time - this.tempoTapTimes[index]);
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    this.song.bpm = Math.max(20, Math.min(300, Math.round(60000 / averageInterval)));
    this.tempoTapTimes = [];
    this.restartMetronomeIfRunning();
  }

  private restartMetronomeIfRunning() {
    if (this.metronomeRunning) {
      this.stopMetronome();
      void this.startMetronome();
    }
  }

  private playBeat() {
    this.currentBeat = this.currentBeat % this.beatsPerBar + 1;
  }

  private stopMetronome() {
    if (this.metronomeTimer) clearInterval(this.metronomeTimer);
    this.metronomeTimer = undefined;
    this.metronomeRunning = false;
    this.currentBeat = 0;
  }

  ngOnDestroy() {
    this.stopMetronome();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['song'] && this.song) {
      this.song = new Song(this.song);
      this.originalBpm = this.song.bpm;
      this.currentIndex = 0;
      this.setYoutubeUrl();
      if (this.metronomeRunning) {
        this.stopMetronome();
        void this.startMetronome();
      }
    }
  }

  async ngOnInit() {
    // const vf = new Factory({
    //   renderer: {
    //     elementId: 'score',
    //     width: 500,
    //     height: 200
    //   }
    // });

    // const score = vf.EasyScore();
    // const system = vf.System();

    // system.addStave({
    //   voices: [
    //     score.voice(
    //       score.notes('C5/q, D5/8, D5/8, E5/q, F5/q')
    //     )
    //   ]
    // }).addClef('treble');

    // vf.draw();

    console.log(this.song);
    if(!this.song) {
      const id = this.route.snapshot.paramMap.get('id');

      if (id) {

        const song = await this.service.getById(parseInt(id));

        if (song) {
          this.song = new Song(song);
          this.originalBpm = this.song.bpm;
          this.setYoutubeUrl();
          if(this.song.preferredKey) {
            // this.song.tmpCurrentKey = this.song.preferredKey;
          }
        }

      }
    }else{
      this.song = new Song(this.song);
      this.originalBpm = this.song.bpm;
    }

    if (this.song) void this.startMetronome();

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
    if (this.currentIndex < this.song.getParts().length - 1) {
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
