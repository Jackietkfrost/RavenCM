import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CreateCharacterComponent } from './create-character/create-character.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RaceComponent } from './menu-build/race/race.component';
import { ClassComponent } from './menu-build/class/class.component';
import { BackgroundComponent } from './menu-build/background/background.component';
import { AbilityScoresComponent } from './menu-build/ability-scores/ability-scores.component';
import { LanguagesComponent } from './menu-build/languages/languages.component';
import { ProficienciesComponent } from './menu-build/proficiencies/proficiencies.component';
import { FeatsComponent } from './menu-build/feats/feats.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CreateCharacterComponent,
    RaceComponent,
    ClassComponent,
    BackgroundComponent,
    AbilityScoresComponent,
    LanguagesComponent,
    ProficienciesComponent,
    FeatsComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
