import { BaseModel } from "./base-model.model";

export interface SongPart {
  name: string;
  lines: SongLine[];
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
        currentPart = { name, lines: [] };
        parts.push(currentPart);
        partMap[name] = currentPart; // store original part
        continue;
      }

      // Check for jump lines like [To Chorus]
      const jumpMatch = trimmed.match(jumpRegex);
      if (jumpMatch) {
        const targetName = jumpMatch[2].replace(/[\[\]]/g, '').trim().toLowerCase();
        const targetPart = partMap[targetName];
        if (targetPart) {
          // Create a NEW part with the target name (duplicate lines)
          const newPart: SongPart = {
            name: targetName,
            lines: targetPart.lines.map(line => ({ ...line })) // shallow copy of lines
          };
          parts.push(newPart);
          currentPart = newPart; // set currentPart to the new one
        } else {
          console.warn(`Jump target part "${targetName}" not found!`);
        }
        continue; // skip normal chord parsing
      }

      // If no current part yet, create a default
      if (!currentPart) {
        currentPart = { name: 'song', lines: [] };
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
        const transposed = this.transposeChord(match[1], step);
        chords += transposed;
        pos = match.index + match[0].length;
      }
      lyric += line.substring(pos);

      currentPart.lines.push({ chords, lyric });
    }

    return parts;
  }

}
