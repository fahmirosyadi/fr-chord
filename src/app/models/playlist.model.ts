import { BaseModel } from "./base-model.model";
import { Song } from "./song.model";


export class Playlist extends BaseModel {
  id!: number;
  name?: string;
  playlistSong?: { song: Song }[];

  constructor(data?: Partial<Playlist>) {
    super(data);
    if (data) {
      Object.assign(this, this.toCamelCase(data));
    }
  }

}
