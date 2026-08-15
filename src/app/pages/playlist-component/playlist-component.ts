import { Component, OnInit } from '@angular/core';
import { PlaylistService } from '../../services/playlist-service';
import { Router } from '@angular/router';
import { PaginatedComponent } from '../../components/parent-component/paginated-component';
import { Playlist } from '../../models/playlist.model';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-playlist-component',
  imports: [SharedModule],
  templateUrl: './playlist-component.html',
  styleUrl: './playlist-component.scss',
})
export class PlaylistComponent extends PaginatedComponent<Playlist> implements OnInit {
  constructor(
		private service: PlaylistService,
		private router: Router
	) {
    super();
  }

	async ngOnInit() {
    await this.loadData();
	}

  protected override fetchData(): Promise<{ data: Playlist[]; total: number; }> {
    return this.service.getPaged(this.page, this.pageSize, this.search, 1);
  }

	view(playlist: Playlist) {

		this.router.navigate([
			'/setlist-view',
			playlist.id
		]);

	}
}
