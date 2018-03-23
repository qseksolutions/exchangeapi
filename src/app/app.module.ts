import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CoinComponent } from './coin/coin.component';
import { AllexchangeComponent } from './allexchange/allexchange.component';
import { CoinorderbookComponent } from './coinorderbook/coinorderbook.component';
import { HeaderComponent } from './header/header.component';
import { ArbiComponent } from './arbi/arbi.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CoinComponent,
    AllexchangeComponent,
    CoinorderbookComponent,
    HeaderComponent,
    ArbiComponent
  ],
  imports: [
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'coin/:id', component: CoinComponent },
      { path: 'allexchange', component: AllexchangeComponent },
      { path: 'coinorderbook', component: CoinorderbookComponent },
      { path: 'arbi', component: ArbiComponent },
    ]),
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng2SearchPipeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
