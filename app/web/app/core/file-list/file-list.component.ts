import { TorrentsService } from './../torrents/torrents.service';
import { TorrentItem } from '../../core';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { shell }  from 'electron';

declare let ga: Function;

@Component({
  selector: 'file-list',
  template: require('./file-list.component.pug'),
  styles: [require('./file-list.component.scss')],
})
export class FileListComponent {
  @Input()
  torrents: TorrentItem[];
  @Output() torrentChange = new EventEmitter();

  selectedTorrent: TorrentItem;
  constructor(private torrentService: TorrentsService) {
  }

  selectTorrent(torrent: TorrentItem) {
    this.selectedTorrent = torrent;
    this.torrentChange.emit(torrent);
    ga('send', 'event', 'Torrent', 'select');
  }

  removeTorrent(torrent: TorrentItem, $event: Event) {
    this.torrentService.deleteTorrent(torrent);
    $event.preventDefault();
    $event.stopPropagation();
    ga('send', 'event', 'Torrent', 'delete');
  }

  pauseTorrent(torrent: TorrentItem, $event: Event) {
    this.torrentService.pauseTorrent(torrent);
    $event.preventDefault();
    $event.stopPropagation();
    ga('send', 'event', 'Torrent', 'pause');
  }

  resumeTorrent(torrent: TorrentItem, $event: Event) {
    this.torrentService.resumeTorrent(torrent);
    $event.preventDefault();
    $event.stopPropagation();
    ga('send', 'event', 'Torrent', 'resume');
  }

  archiveTorrent(torrent: TorrentItem, $event: Event) {
    this.torrentService.archiveTorrent(torrent);
    $event.preventDefault();
    $event.stopPropagation();
    ga('send', 'event', 'Torrent', 'archive');
  }

  shareTorrent(torrent: TorrentItem, $event: Event) {
    let body = torrent.name + '%0D%0A%0D%0A➖➖ Copy this code below ➖➖' + '%0D%0A%0D%0A' + torrent.infoHash + '%0D%0A%0D%0A➖➖ Then paste the code above in DonutGlaze ➖➖' + '%0D%0A%0D%0Ahttps://donutglaze.com/yummy - Stream and download torrents';
    shell.openExternal('mailto:?subject=Check out this torrent&body=' + body);
    ga('send', 'event', 'Torrent', 'share');
  }
}
