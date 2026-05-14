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
  id?: number;
  title?: string;
  artist?: string;
  chord: string = '';
  key: string = 'C';
  lowestNote?: string;
  highestNote?: string;
  status?: number;

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
    // ✅ normalize YOUR syntax
    input = input
      .replace(/-M-7/gi, '7')
      .replace(/-m-7/gi, 'm7')
      .replace(/-/g, '');

    const match = input.match(
      /^([1-7])([#b]?)(dim|aug|sus[24]?|add\d+|M|m)?([a-zA-Z0-9]*)?(?:\/([1-7]))?$/
    );

    if (!match) return input;

    const degree = parseInt(match[1], 10) - 1;
    const accidental = match[2];
    let qualityOverride = match[3] || '';
    let extension = match[4] || '';
    const bassRaw = match[5];

    const scale = this.getScale(this.key);
    let root = scale[degree];

    // ✅ apply accidental BEFORE transpose
    if (accidental) {
      const index = Song.CHORDS.indexOf(root);
      root =
        accidental === '#'
          ? Song.CHORDS[(index + 1) % 12]
          : Song.CHORDS[(index - 1 + 12) % 12];
    }

    const explicitMajor = qualityOverride === 'M';

    if (qualityOverride === 'm') qualityOverride = 'm';

    const defaultQualities = ['M', 'm', 'm', 'M', 'M', 'm', 'dim'];
    let quality = explicitMajor ? 'M' : (qualityOverride || defaultQualities[degree]);

    let suffix = '';

    if (quality === 'm') suffix = 'm';
    else if (quality === 'dim') suffix = 'dim';
    else if (quality === 'aug') suffix = 'aug';
    else if (quality.startsWith('sus')) suffix = quality;

    if (extension.toLowerCase() === 'maj7') extension = 'M7';

    let chord = root + suffix + extension;

    if (bassRaw) {
      const bassNote = scale[parseInt(bassRaw, 10) - 1];
      chord += `/${bassNote}`;
    }

    return chord;
  }

  transposeChord(chord: string, step: number): string {
    const chordPattern = /^[A-G](#|b)?/i;
    const rootMatch = chord.match(chordPattern);
    if (!rootMatch) return chord;

    let root = rootMatch[0];

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
    const lines = this.chord.split('\n');

    const parts: SongPart[] = [];
    const partMap: Record<string, SongPart> = {};

    let currentPart: SongPart | null = null;

    const partRegex = /^\[?\s*(intro|interlude|verse|pre-chorus|post-chorus|chorus|bridge|coda|outro)(\s*\d*)?(?:\s*\|\s*([+-]?\d+))?\s*\]?$/i;
    const jumpRegex = /^\[?\s*to\s+(.+?)(?:\s*\|\s*([+-]?\d+))?\s*\]?$/i;
    const modRegex = /^\[\s*([+-]\d+)\s*\]$/;

    let currentMod = 0;

    for (const line of lines) {
      const trimmed = line.trim();

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

      const modMatch = trimmed.match(modRegex);
      if (modMatch) {
        currentMod += parseInt(modMatch[1], 10);
        continue;
      }

      if (!currentPart) {
        currentPart = new SongPart({ name: 'song', lines: [] });
        parts.push(currentPart);
      }

      const step = (currentPart.transpose || 0) + currentMod;

      const matches = [
        ...line.matchAll(/\[([^\]]+)\]/g),
        ...line.matchAll(/\{([^}]+)\}/g)
      ].sort((a, b) => a.index! - b.index!);

      const row: SongLine[] = [];

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
          const raw = matches[i][0];
          const content = matches[i][1];
          const isBar = raw.startsWith('{');

          let chordConverted = '';

          if (isBar) {
            const tokens = content.includes(' ')
              ? content.split(/\s+/)
              : content.split('');

            const formatted = tokens.map(token => {
              if (token === '.') return '.';
              if (token === '|') return '|';

              return this.transposeChord(
                this.convertNumberChord(token),
                step
              );
            }).join(' ');

            chordConverted = `[${formatted}]`;

          } else {
            if (content.includes('/')) {
              const [main, bass] = content.split('/');

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
                this.convertNumberChord(content),
                step
              );
            }
          }

          const start = matches[i].index! + raw.length;
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
