import { BaseModel } from "./base-model.model";
import { Song } from "./song.model";


export class PlaylistSong extends BaseModel {
  id!: number;
  order?: number;
  song!: Song;

  constructor(data?: Partial<PlaylistSong>) {
    super(data);
    if (data) {
      Object.assign(this, this.toCamelCase(data));
    }
  }

}
