import { Component, ViewChild, ElementRef, Input, Output, OnChanges, SimpleChanges, ViewEncapsulation, EventEmitter, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TorrentsService } from './../torrents/torrents.service';
import { API_CONFIG } from './../config';
import { TorrentItem } from './../torrents/torrent.model';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'file-player',
  template: require('./file-player.component.pug'),
  styles: [require('./file-player.component.scss')],
  encapsulation: ViewEncapsulation.None
})

export class FilePlayerComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input()
  torrent?: TorrentItem;

  @Input()
  file?: TorrentItem;

  @Input()
  hidden: Boolean;

  @Output()
  created: EventEmitter<any> = new EventEmitter();

  @ViewChild('player')
  player: ElementRef;

  // videoPlayer: any;
  playerReady: boolean;

  constructor(public playerService: PlayerService) {
  }

  playFile(immediate = true) {
    this.playerService.playFile('#player', this.file, immediate);
  }

  play() {
    this.playerService.play();
  }

  pause() {
    this.playerService.pause();
  }

  stop() {
    this.playerService.stop();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnDestroy() {
    this.playerService.destroy();
  }

  ngAfterViewInit() {
    this.created.emit(this.file);
  }
}
