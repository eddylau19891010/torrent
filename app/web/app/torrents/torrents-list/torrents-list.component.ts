import { TorrentItem } from '../../core/torrents/torrent.model';
import { TorrentsService } from '../../core/torrents/torrents.service';
import { Component, ViewChild, ElementRef, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'torrents',
  template: require('./torrents-list.component.pug'),
  styles: [require('./torrents-list.component.scss')]
})
export class TorrentsListComponent implements OnInit {
  private torrentsFilter: string;
  private torrentPath: string;
  private torrents: TorrentItem[] = [];
  private selectedTorrent: TorrentItem;
  public onboardingFinished: boolean;
  public onboardingMagnet: boolean;
  public onboardingStream: boolean;

  obfSubs: Subscription;

  @ViewChild('fileInput')
  fileInput: ElementRef;

  subscription: Subscription;

  constructor(route: ActivatedRoute, private torrentService: TorrentsService, public zone: NgZone, private playerService: PlayerService) {
    this.onboardingFinished = this.torrentService.settings.onboardingFinished;
    if (!this.onboardingFinished) {
      this.onboardingMagnet = true;
    }

    route.params.subscribe(params => {
      this.torrentsFilter = params['filter'];
      this.torrents = torrentService.getTorrents(this.torrentsFilter);
      torrentService.torrentsUpdated().subscribe(torrents => {

        let foundTorrents = _.filter(torrents, torrent => torrentService.hasState(torrent, this.torrentsFilter));
        this.torrentService.updateTorrents(foundTorrents, this.torrents);

        if (this.selectedTorrent && !_.find(this.torrents, { infoHash: this.selectedTorrent.infoHash })) {
          this.selectedTorrent = null;
        }
      });

      if (!this.torrents) torrentService.findAll();
    });

    this.subscription = torrentService.torrentString.subscribe(
      torrentString => {
        this.createTorrent(torrentString);
      });
  }

  ngOnInit() {
    this.obfSubs = this.torrentService.onboardingFinishedSubject.subscribe(res => {
      this.onboardingFinished = res;
    });
  }

  onTorrentSelected(event: TorrentItem) {
    this.selectedTorrent = event;
    this.playerService.enableEmit = true;
    this.playerService.next(null);
  }

  selectFile() {
    const { dialog } = require('electron').remote;
    const ipc = require('electron').remote;
    const options = {
      properties: ['openFile', 'multiSelections'],
      filters: [{
        name: 'Custom File Type',
        extensions: ['torrent']
      }]
    };
    dialog.showOpenDialog(ipc.getCurrentWindow(), options, (selectedTorrents) => {
      this.zone.run(() => {
        if (selectedTorrents) selectedTorrents.forEach(this.createTorrent.bind(this));
      });
    });
  }

  createTorrent(torrentPath: string) {
    this.torrentService.addTorrent(torrentPath);
  }

  pasteData(torrentPath: string) {
    setTimeout(() => {
      this.torrentService.addTorrent(this.torrentPath);
      this.torrentPath = null;
    });
  }

  nextOnboarding() {
    this.onboardingMagnet = false;
    this.onboardingStream = true;
  }

  finishOnboarding() {
    this.onboardingFinished = true;
    this.torrentService.finishOnboarding();
  }
}
