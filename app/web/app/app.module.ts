import { TorrentsModule } from './torrents/torrents.module';
import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { TranslateModule } from 'ng2-translate';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    routing,
    TorrentsModule,
    NgbModule.forRoot(),
    TranslateModule.forRoot()
  ],
  declarations: [
    AppComponent
  ],
  providers: [
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef) { }
}
