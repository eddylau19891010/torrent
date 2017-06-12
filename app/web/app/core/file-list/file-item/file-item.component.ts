import { FileViewComponent } from './../../file-view/file-view.component';
import { TorrentsService } from './../../torrents/torrents.service';
import { TorrentItem } from './../../torrents/torrent.model';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject, forwardRef } from '@angular/core';
const shell = require('electron').shell;

import './file-item.component.scss';

@Component({
  selector: 'file-item',
  template: require('./file-item.component.pug'),
  styles: [require('./file-item.component.scss')],
})
export class FileItemComponent implements OnChanges {
  @Input()
  torrent?: TorrentItem;

  @Input()
  showItems: boolean;

  @Input()
  level = 0;

  @Input()
  showControls: boolean;

  @Input()
  showPlayControl: boolean;

  playing = false;
  collapsed = true;

  @Output() play: EventEmitter<any> = new EventEmitter();
  @Output() pause: EventEmitter<any> = new EventEmitter();

  constructor(private torrentService: TorrentsService,
    @Inject(forwardRef(() => FileViewComponent)) private fileView: FileViewComponent) {
  }

  extractNames(torrent) {
    let pattern = /^(.+)(\.[0-9a-z]+)$/i,
      matched = torrent.name.match(pattern);

    if (matched && torrent.type !== 'folder') {
      torrent.fileName = matched[1];
      torrent.ext = matched[2];
    } else {
      torrent.fileName = name;
    }
  }

  getFileIcon(torrent) {
    if (torrent.type === 'folder') {
      return 'file-type-folder';
    }

    if (torrent.audio) {
      return 'file-type-audio';
    }

    if (torrent.video) {
      return 'file-type-video';
    }

    if (/\.(txt|doc|docx|rtf)$/i.test(torrent.path)) {
      return 'file-type-text';
    }

    if (/\.(rar|zip|7z|gz)$/i.test(torrent.path)) {
      return 'file-type-archive';
    }

    if (/\.pdf$/i.test(torrent.path)) {
      return 'file-type-pdf';
    }

    if (/\.(js|css|ts|coffee|cpp|cs|pas|xml)$/i.test(torrent.path)) {
      return 'file-type-code';
    }

    if (/\.(app|dmg|exe|sh|iso|msi|apk|jar)$/i.test(torrent.path)) {
      return 'file-type-bin';
    }

    if (/\.(doc|docx|odt)$/i.test(torrent.path)) {
      return 'file-type-word';
    }

    if (/\.(xls|xlsx)$/i.test(torrent.path)) {
      return 'file-type-excel';
    }

    if (/\.(htm|html)$/i.test(torrent.path)) {
      return 'file-type-html';
    }

    if (/\.(png|gif|jpeg|jpg|bmp|tiff)$/i.test(torrent.path)) {
      return 'file-type-image';
    }

    return 'file-type-default';
  }

  togglePlay() {
    this.playing = !this.playing;
    if (this.playing) {
      this.play.emit(this.torrent);
    } else {
      this.pause.emit(this.torrent);
    }
  }

  selectItem(torrent: TorrentItem) {
    torrent.expanded = !torrent.expanded;
    if (torrent.type === 'file') {
      this.fileView.selectItem(torrent);
    }
  }

  openItem(torrent: TorrentItem) {
    if (torrent.type === 'file') {
      shell.openItem(torrent.absolutePath);
    }
  }

  isSelected(torrent: TorrentItem) {
    return this.fileView.selectedFile === this.torrent;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['torrent'] && this.torrent) {
      this.torrent.fileIcon = this.getFileIcon(this.torrent);
      this.extractNames(this.torrent);
    }
  }
}
