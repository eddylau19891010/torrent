import { Injectable, NgZone } from '@angular/core';
import * as wcjs from 'wcjs-player';
import * as prebuilt from 'wcjs-prebuilt';
import { PlayerKeyStroke } from './player.keystroke';

import { API_CONFIG } from '../config';
import { TorrentItem } from '../torrents/torrent.model';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PlayerService {
  currentMedia: any;
  playingState: Subject<string> = new BehaviorSubject<string>('stopping');
  enableEmit = false;
  private playerKeyStroke: PlayerKeyStroke;
  private stateHandle;
  constructor(private zone: NgZone) {
    this.stateHandle = this.onState.bind(this);
  }

  get state$(): Observable<string> {
    return this.playingState.asObservable();
  }

  get playing() {
    return this.currentMedia ? this.currentMedia.playing() : false;
  }

  get isFullScreen() {
    return this.currentMedia ? this.currentMedia.fullscreen() : false;
  }

  next(value: string | null) {
    this.playingState.next(value);
  }

  onState(state) {
    if (state && this.enableEmit) {
      this.playingState.next(state);
    }
  }

  playFile(playerId: string, file: TorrentItem, immediate = true) {
    this.enableEmit = false;
    this.destroy();
    this.currentMedia = new wcjs(playerId).addPlayer({ wcjs: prebuilt, buffer: 10000, vlcArgs: ["--network-caching=10000"]});
    this.currentMedia.clearPlaylist();
    this.currentMedia.addPlaylist({ url: `${API_CONFIG.BaseSreamingUrl}/` + file.fileIndex });
    this.playerKeyStroke = new PlayerKeyStroke(this.zone, this.currentMedia);
    this.playerKeyStroke.subscribeEvent();    

    this.zone.run(() => {
      this.currentMedia.onState(this.stateHandle);
    });
    if (immediate) {
      this.play();
    }
    return this.currentMedia;
  }

  play() {
    this.enableEmit = true;
    if (this.currentMedia) {
      this.currentMedia.play();
    }
  }

  pause() {
    if (this.currentMedia) {
      this.currentMedia.pause();
    }
  }

  stop() {
    if (this.currentMedia) {
      this.currentMedia.stop();
    }
  }

  destroy() {
    this.stop();
    this.currentMedia = undefined;
    if (this.playerKeyStroke) {
      this.playerKeyStroke.unsubscribeEvent();
    }
  }
}
