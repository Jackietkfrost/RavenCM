import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateCharacterComponent } from './create-character/create-character.component';
import { HomeComponent } from './home/home.component';

const routes: Routes =
[
	{ path: '', redirectTo:'home', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent },
	{ path: 'create-character', component: CreateCharacterComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
