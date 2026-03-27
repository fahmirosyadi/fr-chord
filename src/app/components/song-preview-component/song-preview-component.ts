import { Component, Input } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { Song } from '../../models/song.model';
import { PartPreviewComponent } from '../part-preview-component/part-preview-component';

@Component({
  selector: 'app-song-preview',
  standalone: true, // ✅ THIS IS THE FIX
  imports: [SharedModule, PartPreviewComponent],
  templateUrl: './song-preview-component.html',
  styleUrl: './song-preview-component.scss',
})
export class SongPreviewComponent {
  @Input() song: Song = new Song();
}
