import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SongService } from '../../services/song-service';
import { Song } from '../../models/song.model';
import { SharedModule } from '../../shared.module';
import { FormsModule } from '@angular/forms';
import { PaginatedComponent } from '../../components/parent-component/paginated-component';
import { PlaylistService } from '../../services/playlist-service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
	selector: 'app-song-list',
	standalone: true,
	imports: [SharedModule, FormsModule, MatCheckboxModule],
	templateUrl: './song-list-component.html',
	styleUrl: './song-list-component.scss'
})
export class SongListComponent
	extends PaginatedComponent<Song>
	implements OnInit, OnDestroy {

	private searchSubject = new Subject<string>();
	private destroy$ = new Subject<void>();

	playlistId: number | null = null;

	addedSongIds = new Set<number>();

	constructor(
		private service: SongService,
		private router: Router,
		private route: ActivatedRoute,
		private playlistService: PlaylistService
	) {
		super();
	}

	async ngOnInit() {

		this.route.queryParams
			.pipe(takeUntil(this.destroy$))
			.subscribe(async params => {

				this.playlistId = params['playlistId']
					? Number(params['playlistId'])
					: null;

				if (this.playlistId) {
					await this.loadAddedSongs();
				}

			});

		this.searchSubject
			.pipe(
				debounceTime(500),
				distinctUntilChanged(),
				takeUntil(this.destroy$)
			)
			.subscribe(() => {
				this.page = 0;
				this.loadData();
			});

		await this.loadData();
	}

	get isAddMode(): boolean {
		return this.playlistId !== null;
	}

	isSongAdded(songId: number): boolean {
		return this.addedSongIds.has(songId);
	}

	onSearch2(value: string) {
		this.searchSubject.next(value);
	}

	protected override fetchData(): Promise<{ data: Song[]; total: number }> {
		return this.service.getPaged(
			this.page,
			this.pageSize,
			this.search,
			1
		);
	}

	private async loadAddedSongs() {

		if (!this.playlistId) {
			return;
		}

		try {
      let playlist = await this.playlistService.getById(this.playlistId);
			const songs = playlist.playlistSong?.map(ps => ps.song) ?? [];

			this.addedSongIds = new Set(
				songs.map(song => song.id)
			);

		} catch (error) {
			console.error('Failed to load playlist songs', error);
		}
	}

	async toggleSong(song: Song) {

		if (!this.playlistId || !song.id) {
			return;
		}

		const isAdded = this.isSongAdded(song.id);

		try {

			if (isAdded) {

				await this.playlistService.removeSong(
					this.playlistId,
					song.id
				);

				this.addedSongIds.delete(song.id);

			} else {

				await this.playlistService.addSong(
					this.playlistId,
					song.id
				);

				this.addedSongIds.add(song.id);

			}

			// Make Angular detect the Set change
			this.addedSongIds = new Set(this.addedSongIds);

		} catch (error) {
			console.error('Failed to update playlist song', error);
		}
	}

	viewSong(song: Song) {

		if (this.isAddMode) {
			return;
		}

		this.router.navigate([
			'/song-view',
			song.id
		]);
	}

	cancelAdd() {

		if (this.playlistId) {
			this.router.navigate([
				'/playlist',
				this.playlistId
			]);

			return;
		}

		this.router.navigate(['/']);
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
