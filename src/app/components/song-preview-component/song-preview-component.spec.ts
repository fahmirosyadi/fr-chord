import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongPreviewComponent } from './song-preview-component';

describe('SongPreviewComponent', () => {
  let component: SongPreviewComponent;
  let fixture: ComponentFixture<SongPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
