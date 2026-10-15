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
import { Vocalist, VocalistService } from '../../services/vocalist-service';

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
  vocalists: Vocalist[] = [];
  selectedVocalistId: number | null = null;
  showRangePopup = false;
  vocalistLoadError = '';

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
    private sanitizer: DomSanitizer,
    private vocalistService: VocalistService
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
    await this.loadVocalists();

  }

  private async loadVocalists() {
    try {
      this.vocalists = await this.vocalistService.getAll();
    } catch {
      this.vocalistLoadError = 'Could not load vocalists.';
    }
  }

  onVocalistSelected(id: number | null) {
    this.selectedVocalistId = id;
    this.showRangePopup = id !== null;
  }

  get selectedVocalist(): Vocalist | undefined {
    return this.vocalists.find(vocalist => vocalist.id === this.selectedVocalistId);
  }

  transposeSong(semitones: number) {
    this.song.transpose(semitones);
    if (this.selectedVocalist) this.showRangePopup = true;
  }

  get transpositionSemitones(): number {
    const original = this.getPitchClass(this.song?.key ?? '');
    const current = this.getPitchClass(this.song?.tmpCurrentKey ?? '');
    if (original === null || current === null) return 0;

    let offset = (current - original + 12) % 12;
    if (offset > 6) offset -= 12;
    return offset;
  }

  get vocalistRange() {
    const vocalist = this.selectedVocalist;
    if (!vocalist) return null;

    return this.makeRange(vocalist.lowest_note, vocalist.highest_note, 0);
  }

  get songRange() {
    const low = this.songNoteToMidi(this.song?.lowestNote);
    const high = this.songNoteToMidi(this.song?.highestNote);
    if (low === null || high === null || low > high) return null;

    return {
      low,
      high,
      lowLabel: this.midiToNote(low),
      highLabel: this.midiToNote(high)
    };
  }

  get songOctaveShift(): number {
    const songRange = this.songRange;
    const vocalistRange = this.vocalistRange;
    if (!songRange || !vocalistRange) return 0;

    let bestShift = 0;
    let bestOverlap = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let shift = -8; shift <= 8; shift++) {
      const low = songRange.low + shift * 12;
      const high = songRange.high + shift * 12;
      const fits = low >= vocalistRange.low && high <= vocalistRange.high;
      const distance = Math.abs(shift);
      const overlap = Math.max(
        0,
        Math.min(high, vocalistRange.high) - Math.max(low, vocalistRange.low) + 1
      );

      if (fits) {
        if (bestOverlap !== Number.POSITIVE_INFINITY || distance < bestDistance) {
          bestShift = shift;
          bestOverlap = Number.POSITIVE_INFINITY;
          bestDistance = distance;
        }
      } else if (bestOverlap !== Number.POSITIVE_INFINITY &&
        (overlap > bestOverlap || (overlap === bestOverlap && distance < bestDistance))) {
        bestShift = shift;
        bestOverlap = overlap;
        bestDistance = distance;
      }
    }

    return bestShift;
  }

  get displaySongRange() {
    const range = this.songRange;
    if (!range) return null;

    const shift = this.songOctaveShift * 12;
    return {
      low: range.low + shift,
      high: range.high + shift,
      lowLabel: this.midiToNote(range.low + shift),
      highLabel: this.midiToNote(range.high + shift)
    };
  }

  get rangeFit(): 'fits' | 'partial' | 'outside' | 'invalid' {
    const songRange = this.displaySongRange;
    const vocalistRange = this.vocalistRange;
    if (!songRange || !vocalistRange) return 'invalid';
    if (songRange.low >= vocalistRange.low && songRange.high <= vocalistRange.high) return 'fits';
    if (songRange.high < vocalistRange.low || songRange.low > vocalistRange.high) return 'outside';
    return 'partial';
  }

  get songRangeLabel(): string {
    const range = this.displaySongRange;
    return range ? `${range.lowLabel} – ${range.highLabel}` : '';
  }

  get rangeStatusMessage(): string {
    if (this.rangeFit === 'invalid') return 'Range comparison needs valid note values';
    if (this.rangeFit === 'fits') {
      if (this.songOctaveShift === 0) return 'Song range fits this vocalist';
      const direction = this.songOctaveShift < 0 ? 'lower' : 'higher';
      const count = Math.abs(this.songOctaveShift);
      return `Song range fits when sung ${count} octave${count === 1 ? '' : 's'} ${direction}`;
    }

    const status = this.rangeFit === 'partial'
      ? 'Part of the song range is outside this vocalist range'
      : 'Song range is outside this vocalist range';
    if (this.songOctaveShift === 0) return status;

    const direction = this.songOctaveShift < 0 ? 'lower' : 'higher';
    const count = Math.abs(this.songOctaveShift);
    return `${status}, even when sung ${count} octave${count === 1 ? '' : 's'} ${direction}`;
  }

  get vocalistRangeLabel(): string {
    const range = this.vocalistRange;
    return range ? `${range.lowLabel} – ${range.highLabel}` : '';
  }

  rangeBarStyle(range: { low: number; high: number } | null) {
    if (!range) return {};
    const min = 24; // C1
    const max = 96; // C7
    const span = max - min;
    const left = Math.max(0, Math.min(100, ((range.low - min) / span) * 100));
    const right = Math.max(0, Math.min(100, ((range.high - min) / span) * 100));
    return {
      left: `${left}%`,
      width: `${Math.max(1, right - left)}%`
    };
  }

  private makeRange(lowNote: string | null | undefined, highNote: string | null | undefined, offset: number) {
    const low = this.noteToMidi(lowNote);
    const high = this.noteToMidi(highNote);
    if (low === null || high === null || low > high) return null;

    return {
      low: low + offset,
      high: high + offset,
      lowLabel: this.midiToNote(low + offset),
      highLabel: this.midiToNote(high + offset)
    };
  }

  private songNoteToMidi(note?: string | null): number | null {
    if (!note) return null;

    const degreeMatch = note.trim().match(/^([1-7])([#b]?)\((-?\d+)\)$/);
    if (degreeMatch) {
      const keyPitch = this.getPitchClass(this.song?.key ?? '');
      if (keyPitch === null) return null;

      const scaleDegrees = [0, 2, 4, 5, 7, 9, 11];
      const degree = Number(degreeMatch[1]) - 1;
      let semitones = scaleDegrees[degree];
      if (degreeMatch[2] === '#') semitones += 1;
      if (degreeMatch[2] === 'b') semitones -= 1;

      const octave = Number(degreeMatch[3]);
      const originalPitch = (octave + 1) * 12 + keyPitch + semitones;
      return originalPitch + this.transpositionSemitones;
    }

    // Continue to accept absolute pitches for songs entered before degree notation.
    const absolutePitch = this.noteToMidi(note);
    return absolutePitch === null ? null : absolutePitch + this.transpositionSemitones;
  }

  private noteToMidi(note?: string | null): number | null {
    if (!note) return null;
    const match = note.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
    if (!match) return null;

    const semitoneByLetter: Record<string, number> = {
      C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
    };
    let pitch = semitoneByLetter[match[1].toUpperCase()];
    if (match[2] === '#') pitch += 1;
    if (match[2] === 'b') pitch -= 1;
    return (Number(match[3]) + 1) * 12 + pitch;
  }

  private midiToNote(midi: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const normalized = ((midi % 12) + 12) % 12;
    return `${noteNames[normalized]}${Math.floor(midi / 12) - 1}`;
  }

  private getPitchClass(key: string): number | null {
    const match = key.trim().match(/^([A-Ga-g])([#b]?)$/);
    if (!match) return null;
    const pitchClass: Record<string, number> = {
      C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
    };
    let pitch = pitchClass[match[1].toUpperCase()];
    if (match[2] === '#') pitch += 1;
    if (match[2] === 'b') pitch -= 1;
    return ((pitch % 12) + 12) % 12;
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
