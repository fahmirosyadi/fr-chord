import { Component, OnInit } from '@angular/core';
import { DataTableComponent, TableColumn } from '../../components/data-table-component/data-table-component';
import { SharedModule } from '../../shared.module';
import { Router } from '@angular/router';
import { SongService } from '../../services/song-service';
import { Song } from '../../models/song.model';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../services/auth-service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  templateUrl: './song-component.html',
  styleUrl: './song-component.scss'
})
export class SongComponent implements OnInit {

  data: any[] = [];

  total = 0;

  pageIndex = 0;
  pageSize = 10;

  loading = false;
  search = '';

  allColumns: TableColumn[] = [
    // { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'artist', label: 'Artist' },
    { key: 'genre.name', label: 'Genre' },
    { key: 'key', label: 'Key' },
    { key: 'lowestNote', label: 'Lowest Note' },
    { key: 'highestNote', label: 'Highest Note' },
    { key: 'profiles.full_name', label: 'Creator' },
  ];

  mobileColumns: TableColumn[] = [
    { key: 'title', label: 'Title' },
    { key: 'artist', label: 'Artist' },
    { key: 'profiles.full_name', label: 'Creator' },
  ];

  columns: TableColumn[] = [];

  constructor(private service: SongService, private authService: AuthService, private router: Router, private breakpointObserver: BreakpointObserver) {}

  async ngOnInit() {
    await this.loadData();

    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.columns = result.matches
          ? this.mobileColumns
          : this.allColumns;
      });
  }

  async loadData() {
    this.loading = true;

    try {
      const result = await this.service.getPaged(
        this.pageIndex,
        this.pageSize,
        this.search
      );

      this.data = result.data;
      this.total = result.total;
    } finally {
      this.loading = false;
    }
  }

  async onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    await this.loadData();
  }

  onSearch(value: string) {
    this.search = value;
    this.pageIndex = 0;
    this.loadData();
  }

  editSong(song: Song) {
    console.log('song:', song);
    this.router.navigate(['/song-editor', song.id]);
  }

  viewSong(song: Song) {
    this.router.navigate(['/song-view', song.id]);
  }

  addSong() {
    this.router.navigate(['/song-editor']);
  }

}
