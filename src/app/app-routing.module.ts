import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateCharacterComponent } from './create-character/create-character.component';
import { HomeComponent } from './home/home.component';

const routes: Routes =
[
	{ path: '', component: HomeComponent },
	{ path: 'create-character', component: CreateCharacterComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
