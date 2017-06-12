import { FormsModule } from '@angular/forms';
import { TorrentsListComponent } from './torrents-list/torrents-list.component';
import { CannyIframeComponent } from './canny-iframe/canny-iframe.component';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../core/core.module';
import { TorrentsService } from '../core/torrents/torrents.service';
import { TorrentsComponent } from './torrents.component';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { PlayerService } from '../core/services/player.service';
import { TranslateModule } from 'ng2-translate';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    CoreModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  exports: [
    TorrentsComponent,
    TorrentsListComponent,
    CannyIframeComponent
  ],
  declarations: [
    TorrentsComponent,
    TorrentsListComponent,
    CannyIframeComponent
  ],
  providers: [
    TorrentsService,
    PlayerService
  ]
})
export class TorrentsModule {
  static forRoot(config: any): ModuleWithProviders {
    return {
      ngModule: TorrentsModule,
      providers: [
        TorrentsService,
        PlayerService
      ]
    };
  }
}
