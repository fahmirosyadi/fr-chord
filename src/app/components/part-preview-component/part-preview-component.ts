import { Component, Input } from '@angular/core';
import { SongPart } from '../../models/song.model';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-part-preview',
  standalone: true, // ✅ THIS IS THE FIX
  imports: [SharedModule],
  templateUrl: './part-preview-component.html',
  styleUrl: './part-preview-component.scss',
})
export class PartPreviewComponent {
  @Input() part: SongPart = new SongPart({});
  @Input() showTitle: boolean = true;
}
