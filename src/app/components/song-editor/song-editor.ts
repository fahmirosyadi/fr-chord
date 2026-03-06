import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { Supabase } from '../../services/supabase';

@Component({
  selector: 'app-song-editor',
  standalone: true,
  imports: [SharedModule, FormsModule],
  templateUrl: './song-editor.html',
  styleUrl: './song-editor.scss'
})
export class SongEditor implements OnInit {

  chordText = `[C]Amazing grace how sweet the [G]sound
That saved a [Am]wretch like [F]me`;

  songKey = 'C';
  displayKey = 'C';

  private CHORDS = [
    'C','C#','D','D#','E','F','F#','G','G#','A','A#','B'
  ];

  previewLines: any[] = [];
  songId: string | null = null;

  constructor(private route: ActivatedRoute, private supabase: Supabase, private router: Router) {}

  async ngOnInit() {

    this.songId = this.route.snapshot.paramMap.get('id');

    if (this.songId) {

      const song = await this.supabase.getSongById(this.songId);

      if (song) {
        this.chordText = song.chord;
        this.songKey = song.key || 'C';
        this.displayKey = this.songKey;
      }

    }

    this.updatePreview();

  }

  async saveSong() {

    const payload = {
      chord: this.chordText,
      key: this.songKey
    };

    if (this.songId) {

      await this.supabase.updateSong(this.songId, payload);

    } else {

      await this.supabase.createSong(payload);

    }

    this.router.navigate(['/song']);

  }

  updatePreview(){

    const step = this.getTransposeSteps();

    const lines = this.chordText.split('\n');

    this.previewLines = lines.map(line => {

      let chords = '';
      let lyric = '';
      let pos = 0;

      const regex = /\[([^\]]+)\]/g;

      let match;

      while ((match = regex.exec(line)) !== null) {

        const before = line.substring(pos, match.index);
        lyric += before;
        chords += ' '.repeat(before.length);

        const transposed = this.transposeChord(match[1], step);

        chords += transposed;

        pos = match.index + match[0].length;

      }

      lyric += line.substring(pos);

      return { chords, lyric };

    });

  }

  transposeChord(chord:string, step:number){

    const root = chord.match(/^[A-G]#?/);

    if(!root) return chord;

    const index = this.CHORDS.indexOf(root[0]);

    const newIndex = (index + step + 12) % 12;

    return this.CHORDS[newIndex] + chord.slice(root[0].length);

  }

  parseLine(line: string) {

    const chords: {pos:number, chord:string}[] = [];
    let lyric = '';
    let i = 0;

    while (i < line.length) {

      if (line[i] === '[') {

        const end = line.indexOf(']', i);
        const chord = line.substring(i + 1, end);

        chords.push({
          pos: lyric.length,
          chord: chord
        });

        i = end + 1;

      } else {

        lyric += line[i];
        i++;

      }

    }

    return { lyric, chords };
  }

  buildChordLine(lyric: string, chords: any[]) {

    let line = Array(lyric.length).fill(' ');

    chords.forEach(c => {

      for (let i = 0; i < c.chord.length; i++) {
        line[c.pos + i] = c.chord[i];
      }

    });

    return line.join('');
  }

  transpose(step:number){

    const index = this.CHORDS.indexOf(this.displayKey);

    const newIndex = (index + step + 12) % 12;

    this.displayKey = this.CHORDS[newIndex];

    this.updatePreview();
  }

  getTransposeSteps(){

    const original = this.CHORDS.indexOf(this.songKey);
    const current = this.CHORDS.indexOf(this.displayKey);

    return current - original;

  }

}
