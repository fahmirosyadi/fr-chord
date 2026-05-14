import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
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

  currentIndex = 0;
  @ViewChild('partsContainer', { static: false })
  partsContainer!: ElementRef<HTMLDivElement>;

  nextPart() {
    if (this.currentIndex < this.song.parts.length - 1) {
      this.scrollToPart(this.currentIndex + 1);
    }
  }

  prevPart() {
    if (this.currentIndex > 0) {
      this.scrollToPart(this.currentIndex - 1);
    }
  }

  scrollNext() {
    const el = this.partsContainer.nativeElement;

    const item = el.querySelector('.part-item') as HTMLElement;
    if (!item) return;

    const height = item.offsetHeight;

    el.scrollBy({ top: height, behavior: 'smooth' });
  }

  scrollToPart(index: number) {
    const el = document.getElementById('part-' + index);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    this.currentIndex = index;
  }

  selectPart(i: number) {

    this.currentIndex = i;

  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      this.nextPart();
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      this.prevPart();
    }

  }

}
