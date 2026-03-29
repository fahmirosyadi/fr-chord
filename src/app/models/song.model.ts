import { BaseModel } from "./base-model.model";

export class SongPart {
  name: string = "";
  lines: SongLine[][] = [];
  transpose: number = 0;

  label() {
    return this.name[0].toUpperCase() + this.name.slice(1);
  }

  constructor(sp: Partial<SongPart>) {
    Object.assign(this, sp);
  }
}

export interface SongLine {
  chords: string;
  lyric: string;
}

export class Song extends BaseModel {
  id?: string;
  title?: string;
  artist?: string;
  chord: string = '';
  key: string = 'C';
  lowestNote?: string;
  highestNote?: string;

  static readonly CHORDS = [
    'C','C#','D','D#','E','F','F#','G','G#','A','A#','B'
  ];

  // constructor(data?: Partial<Song>) {
  //   super(data);
  //   if (data) {
  //     Object.assign(this, this.toCamelCase(data));
  //   }
  // }

  constructor(data?: any) {
    super(data);
    if(data.title.includes(" - ")){
      this.title = data.title.split(" - ")[0];
      this.artist = data.title.split(" - ")[1];
    }else{
      this.title = data.title;
    }
    this.key = data.key;
    if(data.range && data.range.includes(" – ")){
      this.lowestNote = data.range.split(" – ")[0];
      this.highestNote = data.range.split(" – ")[1];
    }
  }

  getScale(key: string): string[] {
    const index = Song.CHORDS.indexOf(key);
    if (index === -1) return Song.CHORDS;

    return Array.from({ length: 7 }, (_, i) =>
      Song.CHORDS[(index + [0,2,4,5,7,9,11][i]) % 12]
    );
  }

  convertNumberToNote(input: string): string {
    const match = input.match(/^([1-7])$/);
    if (!match) return input;

    const degree = parseInt(match[1], 10) - 1;
    return this.getScale(this.key)[degree];
  }

  convertNumberChord(input: string): string {
    const match = input.match(/^([1-7])(M|m)?(?:\(([^)]+)\))?(?:\/([1-7]))?$/);
    if (!match) return input;

    const degree = parseInt(match[1], 10) - 1;
    const override = match[2];
    let extension = match[3] || '';
    const bassRaw = match[4];

    const scale = this.getScale(this.key);
    let root = scale[degree];

    // 🔥 handle accidental (b / #)
    if (extension === 'b' || extension === '#') {
      const index = Song.CHORDS.indexOf(root);
      root =
        extension === 'b'
          ? Song.CHORDS[(index - 1 + 12) % 12]
          : Song.CHORDS[(index + 1) % 12];
      extension = '';
    }

    const defaultQualities = ['M', 'm', 'm', 'M', 'M', 'm', 'dim'];
    let quality = defaultQualities[degree];
    if (override) quality = override;

    let suffix = '';
    if (quality === 'm') suffix = 'm';
    else if (quality === 'dim') suffix = 'dim';

    let chord = root + suffix;

    if (extension) {
      chord += extension.toLowerCase() === 'maj7' ? 'maj7' : extension;
    }

    if (bassRaw) {
      const bassNote = this.getScale(this.key)[parseInt(bassRaw, 10) - 1];
      chord += `/${bassNote}`;
    }

    return chord;
  }

  getTransposeSteps(): number {
    return Song.CHORDS.indexOf(this.key);
  }

  transposeChord(chord: string, step: number): string {
    const chordPattern = /^[A-G](#|b)?/i;
    const rootMatch = chord.match(chordPattern);
    if (!rootMatch) return chord;

    let root = rootMatch[0];

    // normalize flat → sharp system
    const flatMap: Record<string, string> = {
      Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#'
    };

    if (flatMap[root]) root = flatMap[root];

    const index = Song.CHORDS.indexOf(root);
    if (index === -1) return chord;

    const newIndex = (index + step + 12) % 12;
    const newRoot = Song.CHORDS[newIndex];

    return newRoot + chord.slice(rootMatch[0].length);
  }

  transpose(step: number) {
    const index = Song.CHORDS.indexOf(this.key);
    this.key = Song.CHORDS[(index + step + 12) % 12];
  }

  get parts(): SongPart[] {
    const baseStep = this.getTransposeSteps();
    const lines = this.chord.split('\n');

    const parts: SongPart[] = [];
    const partMap: Record<string, SongPart> = {};

    let currentPart: SongPart | null = null;

    const partRegex = /^\[?\s*(intro|interlude|verse|pre-chorus|chorus|bridge|outro)(\s*\d*)?(?:\s*\|\s*([+-]?\d+))?\s*\]?$/i;
    const jumpRegex = /^\[?\s*to\s+(.+?)(?:\s*\|\s*([+-]?\d+))?\s*\]?$/i;
    const modRegex = /^\[\s*([+-]\d+)\s*\]$/;

    let currentMod = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // 🎯 PART DEFINE
      const partMatch = trimmed.match(partRegex);
      if (partMatch) {
        const name = (partMatch[1] + (partMatch[2] || '')).toLowerCase().trim();
        const modStep = partMatch[3] ? parseInt(partMatch[3], 10) : 0;

        currentPart = new SongPart({ name, lines: [], transpose: modStep });
        parts.push(currentPart);
        partMap[name] = currentPart;

        currentMod = 0;
        continue;
      }

      // 🔁 CALL PART
      const jumpMatch = trimmed.match(jumpRegex);
      if (jumpMatch) {
        const targetName = jumpMatch[1].toLowerCase().trim();
        const extraStep = jumpMatch[2] ? parseInt(jumpMatch[2], 10) : 0;

        const targetPart = partMap[targetName];
        if (!targetPart) continue;

        const newPart = new SongPart({
          name: targetName,
          lines: targetPart.lines.map(row =>
            row.map(seg => ({
              chords: this.transposeChord(seg.chords, extraStep),
              lyric: seg.lyric
            }))
          )
        });

        parts.push(newPart);
        currentPart = newPart;
        currentMod = 0;
        continue;
      }

      // 🎚 MODULATION
      const modMatch = trimmed.match(modRegex);
      if (modMatch) {
        currentMod += parseInt(modMatch[1], 10);
        continue;
      }

      if (!currentPart) {
        currentPart = new SongPart({ name: 'song', lines: [] });
        parts.push(currentPart);
      }

      const matches = [...line.matchAll(/\[([^\]]+)\]/g)];
      const row: SongLine[] = [];

      const step = baseStep + (currentPart.transpose || 0) + currentMod;

      if (!matches.length) {
        row.push({ chords: '', lyric: line });
      } else {
        if (matches[0].index! > 0) {
          row.push({
            chords: '',
            lyric: line.substring(0, matches[0].index)
          });
        }

        for (let i = 0; i < matches.length; i++) {
          const chordRaw = matches[i][1];

          let chordConverted = '';

          if (chordRaw.includes('/')) {
            const [main, bass] = chordRaw.split('/');

            const mainChord = this.transposeChord(
              this.convertNumberChord(main),
              step
            );

            const bassNote = this.transposeChord(
              this.convertNumberToNote(bass),
              step
            );

            chordConverted = `${mainChord}/${bassNote}`;
          } else {
            chordConverted = this.transposeChord(
              this.convertNumberChord(chordRaw),
              step
            );
          }

          const start = matches[i].index! + matches[i][0].length;
          const end = i + 1 < matches.length ? matches[i + 1].index! : line.length;

          row.push({
            chords: chordConverted,
            lyric: line.substring(start, end)
          });
        }
      }

      currentPart.lines.push(row);
    }

    return this.trimPart(parts);
  }

  trimPart(parts: SongPart[]): SongPart[] {
    return parts.map(part => {
      const lines = [...part.lines];

      while (
        lines.length &&
        lines[lines.length - 1].every(
          seg => !seg.lyric?.trim() && !seg.chords?.trim()
        )
      ) {
        lines.pop();
      }

      return new SongPart({ ...part, lines });
    });
  }
}
