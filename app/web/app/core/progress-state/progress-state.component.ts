import { TorrentItem } from './../torrents/torrent.model';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'progress-state',
  template: require('./progress-state.component.pug'),
  styles: [require('./progress-state.component.scss')],
})
export class ProgressStateComponent implements OnChanges {
  @Input() torrent: TorrentItem;
  constructor() {
  }

  getValue() {
    if (!this.torrent) return 0;
    return Math.floor(this.torrent.progress*100)/100;
  }

  ngOnChanges(changes: SimpleChanges) {
  }
}
