import { TorrentsService } from './../torrents/torrents.service';
import { TorrentItem } from '../../core';
import { Component, Input, ViewChild } from '@angular/core';
const pkg = require('../../../../../package.json')

@Component({
  selector: 'sidebar',
  template: require('./sidebar.component.pug'),
  styles: [require('./sidebar.component.scss')]
})

export class SideBarComponent {
  @Input()
  torrents: TorrentItem[];

  constructor(private torrentService: TorrentsService) {
  }

  getCount(state: string) {
    return this.torrentService.getCount(state);
  }

  getVersion() {
    return pkg.version.split('-')[1];
  }
}
