import { FileViewerComponent } from './../file-viewer/file-viewer.component';
import { TorrentsService } from './../torrents/torrents.service';
import { TorrentItem } from './../torrents/torrent.model';
import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';

import './file-view.component.scss';

@Component({
  selector: 'file-view',
  template: require('./file-view.component.pug'),
  styles: [require('./file-view.component.scss')]
})
export class FileViewComponent {
  @Input()
  torrent?: TorrentItem;

  @ViewChild('fileViewer')
  fileViewer: FileViewerComponent;

  selectedFile: TorrentItem;

  constructor(private torrentService: TorrentsService) {
  }

  selectItem(torrent: TorrentItem) {
    this.selectedFile = torrent;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['torrent'] && this.torrent) {
      this.selectedFile = null;
    }
  }
}
