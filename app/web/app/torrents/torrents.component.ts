import { TorrentItem, TorrentState } from '../core/torrents/torrent.model';
import { TorrentsService } from '../core/torrents/torrents.service';
import { AfterViewInit, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TorrentsListComponent } from './torrents-list/torrents-list.component'
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'torrents',
  template: require('./torrents.component.pug'),
  styles: [require('./torrents.component.scss')],
  providers: [TorrentsListComponent]
})
export class TorrentsComponent implements AfterViewInit, OnInit, OnDestroy {
  private torrentsFilter: string;
  private torrents: TorrentItem[] = [];
  private _torrentIdSub: Subscription;
  constructor(route: ActivatedRoute, private torrentService: TorrentsService, private torrentList: TorrentsListComponent) {
    route.params.subscribe(params => {
      this.torrentsFilter = params['filter'];
      torrentService.torrentsUpdated().subscribe(torrents => torrentService.updateTorrents(torrents, this.torrents));
      let foundTorrents = torrentService.getTorrents(TorrentState.ALL);
      this.torrentService.updateTorrents(foundTorrents, this.torrents);
      if (!this.torrents) {
        this.torrentService.findAll();
      }
    });
  }

  ngOnInit() {
    this._torrentIdSub = this.torrentService.torrentIdSubject.subscribe((torrentId) => {
      this.torrentList.createTorrent(torrentId);
    });
  }

  ngAfterViewInit() {
    const dragDrop = require('drag-drop');
    const dropElement = document.getElementById('file-drop-input-overlay');
    dragDrop('#file-drop-input', {
      onDragEnter: () => {
        dropElement.hidden = false;
      }
    });

    dragDrop('#file-drop-input-overlay', {
      onDrop: (files, pos) => {
        files.forEach((file) => {
          this.torrentList.createTorrent(file.path);
        });
      },
      onDragLeave: ()  => {
        dropElement.hidden = true;
      }
    });
  }

  ngOnDestroy() {
    if (this._torrentIdSub) {
      this._torrentIdSub.unsubscribe();
    }
  }
}
