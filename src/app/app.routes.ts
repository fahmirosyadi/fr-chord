import { RouterModule, Routes } from '@angular/router';
import { Role } from './pages/role/role';
import { Genre } from './pages/genre/genre';
import { Song } from './pages/song/song';
import { SongEditor } from './pages/song-editor/song-editor';
import { NgModule } from '@angular/core';
import { SongView } from './pages/song-view/song-view';

export const routes: Routes = [
  {
    path: 'role',
    component: Role
  },
  {
    path: 'genre',
    component: Genre
  },
  {
    path: 'song',
    component: Song
  },
  {
    path: 'song-editor',
    component: SongEditor
  },
  {
    path: 'song-editor/:id',
    component: SongEditor
  },
  {
    path: 'song-view/:id',
    component: SongView
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
