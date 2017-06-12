import { Settings } from './../settings';
import { API_CONFIG } from '../config';
import { TorrentItem, TorrentState, TorrentStateType } from './torrent.model';
import { Injectable, NgZone } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { PlayerService } from '../services/player.service';

import * as _ from 'lodash';
const ipcRenderer = require('electron').ipcRenderer;
declare let ga: Function;

@Injectable()
export class TorrentsService {
  torrentsSubject: Subject<TorrentItem[]> = new Subject();
  streamingSubject: Subject<TorrentItem> = new Subject();
  torrents: TorrentItem[] = [];
  settings: Settings;
  torrentPath: Subject<string> = new Subject();
  torrentString = this.torrentPath.asObservable();
  torrentIdSubject: Subject<any> = new Subject();
  onboardingFinishedSubject: Subject<boolean> = new Subject();

  private convertTorrent(torrent) {
    let t = new TorrentItem();
    Object.assign(t, torrent);
    t.items = torrent.items && torrent.items.map((item) => {
      return this.convertTorrent(item);
    });
    return t;
  }

  constructor(private http: Http, public zone: NgZone, private playerService: PlayerService) {
    let torrents = ipcRenderer.sendSync('torrent:list');
    this.torrents = torrents.map((torrent) => this.convertTorrent(torrent));
    this.settings = ipcRenderer.sendSync('settings:load');

    ipcRenderer.on('app:opentorrent', (event, msg) => {
      this.torrentIdSubject.next(msg.torrentId)
    });

    ipcRenderer.on('torrent:notification', (event, msg) => {
      if (!this.playerService.isFullScreen) {
        zone.run(() => {
          new Notification(msg.title, {
            body: msg.body
          });
        });
      }
    });

    ipcRenderer.on('torrent:create_item', (event, infoHash, checking = false, name) => {
      zone.run(() => {
        let torrent: TorrentItem = new TorrentItem();
        torrent.state = (checking === true) ? TorrentStateType.CHECKING : TorrentStateType.DOWNLOADING
        torrent.infoHash = infoHash;
        torrent.name = name || 'Checking...';

        this.torrents.unshift(torrent);
        this.torrentsSubject.next(this.torrents);
      });
    });

    ipcRenderer.on('torrent:removed', (event, item) => {
      zone.run(() => {
        let torrent = this.findTorrent(this.torrents, item);
        if (torrent && this.torrents) {
          this.torrents.splice(this.torrents.indexOf(torrent), 1);
        }
        this.torrentsSubject.next(this.torrents);
      });
    });

    ipcRenderer.on('torrent:pause', (event, item) => {
      zone.run(() => {
        let torrent = this.findTorrent(this.torrents, item);
        if (torrent) {
          torrent.state = item.state;
          this.torrentsSubject.next(this.torrents);
        }
      });
    });

    ipcRenderer.on('torrent:resume', (event, item) => {
      zone.run(() => {
        let torrent = this.findTorrent(this.torrents, item);
        if (torrent) {
          torrent.state = item.state;
          this.torrentsSubject.next(this.torrents);
        }
      });
    });

    ipcRenderer.on('torrent:error', (event, item) => {
      zone.run(() => {
        let torrent = this.findTorrent(this.torrents, item);

        if (torrent) {
          this.extendTorrent(torrent, item);
          torrent.state = TorrentStateType.ERROR;
          torrent.name = item.error || item.warning;
        }
        this.torrentsSubject.next(this.torrents);
      });
    });

    ipcRenderer.on('torrent:updated', (event, item) => {
      zone.run(() => {
        let torrent = this.findTorrent(this.torrents, item);

        if (torrent) {
          this.extendTorrent(torrent, item);
        }
        this.torrentsSubject.next(this.torrents);
      });
    });

    ipcRenderer.on('torrent:streamed', (event, item) => {
      zone.run(() => {
        let torrent = this.findTorrent(this.torrents, item);
        if (torrent) {
          this.extendTorrent(torrent, item);
        }
        this.streamingSubject.next(torrent);
      });
    });
  }

  private findTorrent(torrents: TorrentItem[], item) {
    let torrent = item.infoHash && _.find(torrents, { infoHash: item.infoHash });
    if (!torrent) {
      torrent = item.sourcePath && _.find(torrents, { sourcePath: item.sourcePath });
    }

    return torrent;
  }

  private extendTorrent(torrent: TorrentItem, item: TorrentItem) {
    torrent.name = item.name;
    torrent.infoHash = item.infoHash;
    torrent.downloadedSize = item.downloadedSize;
    torrent.dl_speed = item.dl_speed;
    torrent.ul_speed = item.ul_speed;
    torrent.progress = item.progress;
    torrent.state = item.state;
    torrent.path = item.path;
    torrent.audio = item.audio;
    torrent.video = item.video;
    torrent.media = item.media;
    torrent.fileIndex = item.fileIndex;
    torrent.absolutePath = item.absolutePath;
    torrent.eta = item.eta;
    torrent.totalSize = item.totalSize;
    if (!torrent.items) {
      torrent.items = [];
    }

    if (item.items) {
      item.items.forEach((childItem) => {
        let torrentItem = _.find(torrent.items, (currentItem) => currentItem.name === childItem.name);
        if (!torrentItem) {
          torrent.items.push(this.convertTorrent(childItem));
        } else {
          this.extendTorrent(torrentItem, childItem);
        }
      });
    }
  }

  public updateTorrents(torrents: TorrentItem[], target: TorrentItem[]) {
    torrents.forEach((item: TorrentItem) => {
      let torrent = this.findTorrent(target, item);

      if (torrent) {
        this.extendTorrent(torrent, item);
      } else {
        target.push(this.convertTorrent(item));
      }
    });

    target.forEach((item: TorrentItem) => {
      let torrent = this.findTorrent(torrents, item);

      if (!torrent) {
        target.splice(target.indexOf(item), 1);
      }
    });
  }

  private extractTorrents(res: Response): TorrentItem[] {
    let body = res.json();
    let updatedTorrents = (body || {}).torrents;

    if (!this.torrents) {
      this.torrents = updatedTorrents;
    } else {
      this.updateTorrents(updatedTorrents, this.torrents);
    }

    return this.torrents;
  }

  torrentsUpdated(): Observable<TorrentItem[]> {
    return this.torrentsSubject.asObservable();
  }

  findAll() {
    return this.http.get(`${API_CONFIG.BaseApiUrl}/torrents`).map(this.extractTorrents)
      .subscribe(torrents => this.torrentsSubject.next(torrents));
  }

  addTorrent(torrentPath: string) {
    ga('send', 'event', 'Torrent', 'add');
    ipcRenderer.send('torrent:add', torrentPath);
    this.finishOnboarding();
  }

  deleteTorrent(torrent: TorrentItem) {
    ipcRenderer.send('torrent:remove', torrent.infoHash);
    let item = this.findTorrent(this.torrents, torrent);
    this.torrents.splice(this.torrents.indexOf(item), 1);
    this.torrentsSubject.next(this.torrents);
  }

  archiveTorrent(torrent: TorrentItem) {
    ipcRenderer.send('torrent:archive', torrent.infoHash);
    let item = this.findTorrent(this.torrents, torrent);
    this.torrents.splice(this.torrents.indexOf(item), 1);
    this.torrentsSubject.next(this.torrents);
  }

  pauseTorrent(torrent: TorrentItem) {
    ipcRenderer.send('torrent:pause', torrent.infoHash);
    torrent.state = 'paused';
  }

  resumeTorrent(torrent: TorrentItem) {
    ipcRenderer.send('torrent:resume', torrent);
    torrent.state = 'calculating';
  }

  hasState(torrent: TorrentItem, state: string): boolean {
    if (state === TorrentState.ALL) {
      return true;
    } else if (state === TorrentState.DONE || state === TorrentStateType.FINISHED) {
      return torrent.state === TorrentStateType.FINISHED;
    } else if (state === TorrentState.DOWNLOADING) {
      return [TorrentStateType.DOWNLOADING, TorrentStateType.METADATA,
        TorrentStateType.CHECKING, TorrentStateType.ALLOCATING].indexOf(torrent.state) !== -1;
    } else if (state === TorrentState.PAUSED) {
      return torrent.state === TorrentStateType.PAUSED;
    } else if (state === TorrentState.SEEDING) {
      return torrent.state === TorrentStateType.SEEDING;
    }

    return false;
  }

  getCount(state: string): number {
    return this.getTorrents(state).length;
  }

  getTorrents(state: string): TorrentItem[] {
    return _.filter(this.torrents, (torrent) => {
      return this.hasState(torrent, state);
    });
  }

  startTorrent(torrent: TorrentItem, fileIndex = 0) {
    ipcRenderer.send('torrent:start', { infoHash: torrent.infoHash, index: fileIndex });
  }

  finishOnboarding() {
    ipcRenderer.send('onboarding:finished');
    this.onboardingFinishedSubject.next(true);
  }
}
