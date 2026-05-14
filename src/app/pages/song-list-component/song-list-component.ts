import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SongService } from '../../services/song-service';
import { Song } from '../../models/song.model';
import { SharedModule } from '../../shared.module';
import { FormsModule } from '@angular/forms';
import { PaginatedComponent } from '../../components/parent-component/paginated-component';

@Component({
	selector: 'app-song-list',
	standalone: true,
	imports: [SharedModule, FormsModule],
	templateUrl: './song-list-component.html',
	styleUrl: './song-list-component.scss'
})
export class SongListComponent extends PaginatedComponent<Song> implements OnInit {

  constructor(
		private service: SongService,
		private router: Router
	) {
    super();
  }

	async ngOnInit() {
    await this.loadData();
	}

  protected override fetchData(): Promise<{ data: Song[]; total: number; }> {
    return this.service.getPaged(this.page, this.pageSize, this.search, 1);
  }

	viewSong(song: Song) {

		this.router.navigate([
			'/song-view',
			song.id
		]);

	}

}
