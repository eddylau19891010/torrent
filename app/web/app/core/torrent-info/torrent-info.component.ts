import { TorrentItem, TorrentStateType } from './../torrents/torrent.model';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'torrent-info',
  template: require('./torrent-info.component.pug'),
  styles: [require('./torrent-info.component.scss')]
})
export class TorrentInfoComponent {
  @Input()
  torrent: TorrentItem;

  constructor() {
  }

  getCurrentSize() {
    return this.torrent && Math.round(this.torrent.totalSize * this.torrent.progress);
  }

  isError() {
    return this.torrent && this.torrent.state === TorrentStateType.ERROR;
  }

  isChecking() {
    return this.torrent && this.torrent.state === TorrentStateType.CHECKING;
  }

  isFinished() {
    return this.torrent && this.torrent.state === TorrentStateType.FINISHED;
  }

  isNotFinished() {
    return this.torrent && this.torrent.state !== TorrentStateType.FINISHED;
  }

  isWorking() {
    return this.torrent && (this.torrent.state === TorrentStateType.DOWNLOADING ||
      this.torrent.state === TorrentStateType.SEEDING);
  }

  isDownloading() {
    return this.torrent && this.torrent.state === TorrentStateType.DOWNLOADING;
  }

  getSpeed() {
    return this.torrent && this.torrent.state === TorrentStateType.DOWNLOADING ?
      this.torrent.dl_speed : this.torrent.ul_speed;
  }

  getState() {
    if (!this.torrent) {
      return 'Calculating...';
    }

    switch (this.torrent.state) {
      case TorrentStateType.DOWNLOADING:
        return 'Downloading...';
      case TorrentStateType.FILE_PAUSED:
        return 'File(s) Paused';
      case TorrentStateType.SEEDING:
        return 'Seeding...';
      case TorrentStateType.FINISHED:
        return 'Done';
      case TorrentStateType.PAUSED:
        return 'Paused';
      case TorrentStateType.STALLED:
        return 'Stalled';
      case TorrentStateType.METADATA:
        return 'Downloading metadata...';
      case TorrentStateType.CHECKING:
        return 'Checking...';
      case TorrentStateType.ALLOCATING:
        return 'Allocating space...';
      case TorrentStateType.UNKNOWN:
        return 'Unknown';
      case TorrentStateType.CALCULATING:
        return 'Calculating...';
      default:
        return 'Calculating...';
    }
  }
}
