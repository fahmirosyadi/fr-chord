import { BaseModel } from "./base-model.model";

export class SongPart {
  name: string = "";
  lines: SongLine[][] = [];
  transpose: number = 0; // 🔥 per-part transpose

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

  constructor(data?: Partial<Song>) {
    super(data);
    if (data) {
      Object.assign(this, this.toCamelCase(data));
    }
  }

  getScale(key: string): string[] {
    const index = Song.CHORDS.indexOf(key);
    if (index === -1) return Song.CHORDS;

    return Array.from({ length: 7 }, (_, i) => {
      return Song.CHORDS[(index + [0,2,4,5,7,9,11][i]) % 12];
    });
  }

  convertNumberChord(input: string): string {
    const match = input.match(/^([1-7])(M|m)?(?:\(([^)]+)\))?(?:\/([1-7]))?$/);
    if (!match) return input;

    const degree = parseInt(match[1], 10) - 1;
    const override = match[2];
    const extension = match[3] || '';
    const bassRaw = match[4];

    const scale = this.getScale(this.key);
    const root = scale[degree];

    const defaultQualities = ['M', 'm', 'm', 'M', 'M', 'm', 'dim'];
    let quality = defaultQualities[degree];

    if (override) quality = override;

    let suffix = '';
    if (quality === 'm') suffix = 'm';
    else if (quality === 'dim') suffix = 'dim';

    let chord = root + suffix;

    if (extension) {
      if (extension.toLowerCase() === 'maj7') chord += 'maj7';
      else chord += extension;
    }

    if (bassRaw) {
      const bassDegree = parseInt(bassRaw, 10) - 1;
      const bassNote = scale[bassDegree];
      chord += `/${bassNote}`;
    }

    return chord;
  }

  getTransposeSteps(): number {
    return Song.CHORDS.indexOf(this.key);
  }

  transposeChord(chord: string, step: number): string {
    const chordPattern = /^[A-G](#|b)?(m|maj|min|sus|dim|aug|add)?[0-9]*\/?[A-G]?#?$/i;
    if (!chordPattern.test(chord)) return chord;

    const root = chord.match(/^[A-G]#?/);
    if (!root) return chord;

    const index = Song.CHORDS.indexOf(root[0]);
    if (index === -1) return chord;

    const newIndex = (index + step + 12) % 12;
    return Song.CHORDS[newIndex] + chord.slice(root[0].length);
  }

  transpose(step: number) {
    const index = Song.CHORDS.indexOf(this.key);
    const newIndex = (index + step + 12) % 12;
    this.key = Song.CHORDS[newIndex];
  }

  get parts(): SongPart[] {
    const baseStep = this.getTransposeSteps();
    const lines = this.chord.split('\n');

    const parts: SongPart[] = [];
    let currentPart: SongPart | null = null;

    const partRegex = /^\[?(intro|verse|chorus|bridge|outro)(\s*\d*)?(?:\s*\|\s*([+-]?\d+))?\]?$/i;
    const modRegex = /^\[\s*([+-]\d+)\s*\]$/;

    let currentMod = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // 🎯 PART HEADER
      const partMatch = trimmed.match(partRegex);
      if (partMatch) {
        const name = (partMatch[1] + (partMatch[2] || '')).toLowerCase().trim();
        const modStep = partMatch[3] ? parseInt(partMatch[3], 10) : 0;

        currentPart = new SongPart({
          name,
          lines: [],
          transpose: modStep
        });

        parts.push(currentPart);
        currentMod = 0; // reset inline modulation per part
        continue;
      }

      // 🎚 INLINE MODULATION
      const modMatch = trimmed.match(modRegex);
      if (modMatch) {
        currentMod += parseInt(modMatch[1], 10);
        continue;
      }

      // 🆕 DEFAULT PART
      if (!currentPart) {
        currentPart = new SongPart({ name: 'song', lines: [] });
        parts.push(currentPart);
      }

      const regex = /\[([^\]]+)\]/g;
      const matches = [...line.matchAll(regex)];

      const row: SongLine[] = [];

      const step =
        baseStep +
        (currentPart?.transpose || 0) +
        currentMod;

      if (matches.length === 0) {
        row.push({
          chords: '',
          lyric: line
        });
      } else {
        const firstMatch = matches[0];
        if (firstMatch.index! > 0) {
          row.push({
            chords: '',
            lyric: line.substring(0, firstMatch.index)
          });
        }

        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const chordRaw = match[1];

          let chordConverted = '';

          if (chordRaw.includes('/')) {
            const [main, bass] = chordRaw.split('/');

            const mainChord = this.transposeChord(
              this.convertNumberChord(main),
              step
            );

            const bassChord = this.transposeChord(
              this.convertNumberChord(bass),
              step
            );

            chordConverted = `${mainChord}/${bassChord}`;
          } else {
            chordConverted = this.transposeChord(
              this.convertNumberChord(chordRaw),
              step
            );
          }

          const start = match.index! + match[0].length;
          const end =
            i + 1 < matches.length
              ? matches[i + 1].index!
              : line.length;

          const lyric = line.substring(start, end);

          if (lyric.trim() || chordConverted) {
            row.push({
              chords: chordConverted,
              lyric
            });
          }
        }
      }

      if (row.length) {
        currentPart.lines.push(row);
      }
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

      return new SongPart({
        ...part,
        lines
      });
    });
  }
}
