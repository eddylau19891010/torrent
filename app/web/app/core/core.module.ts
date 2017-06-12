import { FileViewerComponent } from './file-viewer/file-viewer.component';
import { TorrentInfoComponent } from './torrent-info/torrent-info.component';
import { TimePipe } from './time.pipe';
import { BytesPipe } from './bytes.pipe';
import { FormsModule } from '@angular/forms';
import { SafePipe } from './safe.pipe';
import { ModalFooterComponent } from './modal/modal-footer';
import { ModalHeaderComponent } from './modal/modal-header';
import { ModalBodyComponent } from './modal/modal-body';
import { ModalComponent } from './modal/modal';
import { RouterModule } from '@angular/router';
import { ModalShareAppComponent } from './modal/share_app/share_app.component';
import { FileItemComponent } from './file-list/file-item/file-item.component';
import { FilePlayerComponent } from './file-player/file-player.component';
import { SideBarComponent } from './sidebar/sidebar.component';
import { FileViewComponent } from './file-view/file-view.component';
import { FileListComponent } from './file-list/file-list.component';
import { ProgressStateComponent } from './progress-state/progress-state.component';
import { ProgressCircleComponent } from './progress-state/progress-circle.component';
import { NgModule, ModuleWithProviders} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from 'ng2-translate';
import { LocalStorageModule } from 'angular-2-local-storage';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule,
    FormsModule,
    NgbModule,
    TranslateModule,
    LocalStorageModule.withConfig({
      prefix: 'donutglaze',
      storageType: 'localStorage'
    })
  ],
  exports: [
    ModalShareAppComponent,
    ProgressStateComponent,
    ProgressCircleComponent,
    FileListComponent,
    FileItemComponent,
    FileViewComponent,
    FileViewerComponent,
    FilePlayerComponent,
    SideBarComponent,
    ModalBodyComponent,
    ModalHeaderComponent,
    ModalFooterComponent,
    ModalComponent,
    SafePipe
  ],
  declarations: [
    ModalShareAppComponent,
    ProgressStateComponent,
    ProgressCircleComponent,
    FileListComponent,
    FileItemComponent,
    FileViewComponent,
    FileViewerComponent,
    FilePlayerComponent,
    TorrentInfoComponent,
    SideBarComponent,
    ModalBodyComponent,
    ModalHeaderComponent,
    ModalFooterComponent,
    ModalComponent,
    SafePipe,
    BytesPipe,
    TimePipe
  ],
  providers: [
  ],
})
export class CoreModule {
  static forRoot(config: any): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
      ]
    };
  }
}
