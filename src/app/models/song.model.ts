import { BaseModel } from "./base-model.model";

export class SongPart {
  name: string = "";
  lines: SongLine[] = [];
  label() {
    return this.name[0].toUpperCase() + this.name.slice(1);
  }
  constructor(sp: Partial<SongPart>){
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
    const override = match[2];        // M | m
    const extension = match[3] || ''; // 7, 9, maj7, etc.
    const bassRaw = match[4];         // slash

    const scale = this.getScale(this.key);
    const root = scale[degree];

    // 🎯 Default qualities
    const defaultQualities = ['M', 'm', 'm', 'M', 'M', 'm', 'dim'];
    let quality = defaultQualities[degree];

    if (override) {
      quality = override;
    }

    // 🎼 Base chord
    let suffix = '';
    if (quality === 'm') suffix = 'm';
    else if (quality === 'M') suffix = '';
    else if (quality === 'dim') suffix = 'dim';

    let chord = root + suffix;

    // 🎹 Add extension
    if (extension) {
      // Special handling
      if (extension.toLowerCase() === 'maj7') {
        chord += 'maj7';
      } else {
        chord += extension;
      }
    }

    // 🎸 Slash chord
    if (bassRaw) {
      const bassDegree = parseInt(bassRaw, 10) - 1;
      const bassNote = scale[bassDegree];
      chord += `/${bassNote}`;
    }

    return chord;
  }

  getTransposeSteps(): number {
    const steps = Song.CHORDS.indexOf(this.key);
    return steps;
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
    const step = this.getTransposeSteps();
    const lines = this.chord.split('\n');

    const parts: SongPart[] = [];
    const partMap: Record<string, SongPart> = {}; // store original parts by name
    let currentPart: SongPart | null = null;

    const partRegex = /^\[?(intro|verse|chorus|bridge|outro)(\s*\d*)\]?$/i;
    const jumpRegex = /^\[?\s*(to|back to)\s+(.+)\]?$/i;

    for (const line of lines) {
      const trimmed = line.trim();

      // Check if this line is a part header
      const partMatch = trimmed.match(partRegex);
      if (partMatch) {
        const name = trimmed.replace(/[\[\]]/g, '').toLowerCase();
        currentPart = new SongPart({name, lines: [] });
        parts.push(currentPart);
        partMap[name] = currentPart; // store original part
        continue;
      }

      // Check for jump lines like [To Chorus]
      const jumpMatch = trimmed.match(jumpRegex);
      if (jumpMatch) {
        // jumpMatch[2] = "Chorus | -3" or just "Chorus"
        let targetPartName = jumpMatch[2].replace(/[\[\]]/g, '').trim();
        let modStep = 0;

        // Check if there is a modulation step
        const modSplit = targetPartName.split('|');
        if (modSplit.length === 2) {
          targetPartName = modSplit[0].trim(); // "Chorus"
          modStep = parseFloat(modSplit[1].trim()); // -3
        }

        const targetPart = partMap[targetPartName.toLowerCase()];
        if (targetPart) {
          // Create a new part as a copy with optional transpose
          const newPart: SongPart = new SongPart(
            {
              name: targetPartName,
              lines: targetPart.lines.map(line => ({
                chords: line.chords
                  .split(' ')
                  .map(ch => this.transposeChord(ch, modStep))
                  .join(' '),
                lyric: line.lyric
              }))
            }
          )
          parts.push(newPart);
          currentPart = newPart;
        } else {
          console.warn(`Jump target part "${targetPartName}" not found!`);
        }
        continue; // skip normal chord parsing
      }

      // If no current part yet, create a default
      if (!currentPart) {
        currentPart = new SongPart({ name: 'song', lines: [] });
        parts.push(currentPart);
        partMap['song'] = currentPart;
      }

      // Regular chord line parsing
      let chords = '';
      let lyric = '';
      let pos = 0;
      const regex = /\[([^\]]+)\]/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        const before = line.substring(pos, match.index);
        lyric += before;
        chords += ' '.repeat(before.length);
        const converted = this.convertNumberChord(match[1]);
        const transposed = this.transposeChord(converted, step);
        chords += transposed;
        pos = match.index + match[0].length;
      }
      lyric += line.substring(pos);

      currentPart.lines.push({ chords, lyric });
    }

    return parts;
  }

}
