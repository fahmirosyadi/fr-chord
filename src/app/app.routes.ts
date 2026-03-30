import { RouterModule, Routes } from '@angular/router';
import { Role } from './pages/role/role';
import { Genre } from './pages/genre/genre';
import { SongComponent } from './pages/song/song-component';
import { SongEditor } from './pages/song-editor/song-editor';
import { NgModule } from '@angular/core';
import { SongView } from './pages/song-view/song-view';
import { authGuard } from './auth-guard';
import { LoginComponent } from './login-component/login-component';
import { RegisterComponent } from './pages/register-component/register-component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'role', component: Role },
      { path: 'genre', component: Genre },
      { path: 'song', component: SongComponent },
      { path: 'song-editor', component: SongEditor },
      { path: 'song-editor/:id', component: SongEditor },
      { path: 'song-view/:id', component: SongView },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
