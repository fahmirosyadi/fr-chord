export interface SongPart {
  name: string;
  lines: SongLine[];
}

export interface SongLine {
  chords: string;
  lyric: string;
}

export class Song {

  id?: string;
  title?: string;
  artist?: string;
  chord: string = '';
  key: string = 'C';

  static readonly CHORDS = [
    'C','C#','D','D#','E','F','F#','G','G#','A','A#','B'
  ];

  constructor(data?: Partial<Song>) {
    console.log(data)
    Object.assign(this, data);
  }

  get payload() {
    const { id, ...data } = this;
    return data;
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

  get parts() {

    const step = this.getTransposeSteps();
    const lines = this.chord.split('\n');

    const parts: SongPart[] = [];
    let currentPart: SongPart | null = null;

    const partRegex = /^\[?(intro|verse|chorus|bridge|outro)(\s*\d*)\]?$/i;

    for (const line of lines) {

      const trimmed = line.trim();

      const isPart = partRegex.test(trimmed);

      if (isPart) {

        const name = trimmed.replace(/[\[\]]/g, '');

        currentPart = {
          name,
          lines: []
        };

        parts.push(currentPart);
        continue;

      }

      if (!currentPart) {

        currentPart = {
          name: 'Song',
          lines: []
        };

        parts.push(currentPart);

      }

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

      currentPart.lines.push({
        chords,
        lyric
      });

    }

    console.log(parts)
    return parts;

  }

}
