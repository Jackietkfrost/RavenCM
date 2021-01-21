import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateCharacterComponent } from './create-character/create-character.component';
import { HomeComponent } from './home/home.component';
import { RaceComponent } from './menu-build/race/race.component';
import { ClassComponent } from './menu-build/class/class.component';
import { BackgroundComponent } from './menu-build/background/background.component';
import { AbilityScoresComponent } from './menu-build/ability-scores/ability-scores.component';
import { LanguagesComponent } from './menu-build/languages/languages.component';
import { ProficienciesComponent } from './menu-build/proficiencies/proficiencies.component';
import { FeatsComponent } from './menu-build/feats/feats.component';

const routes: Routes =
[
	{ path: '', redirectTo:'home', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent },
	{ path: 'create-character', component: CreateCharacterComponent},
	{ path: 'race', component: RaceComponent},
	{ path: 'class', component: ClassComponent},
	{ path: 'background', component: BackgroundComponent},
	{ path: 'ability-scores', component: AbilityScoresComponent},
	{ path: 'languages', component: LanguagesComponent},
	{ path: 'proficiencies', component: ProficienciesComponent},
	{ path: 'feats', component: FeatsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
