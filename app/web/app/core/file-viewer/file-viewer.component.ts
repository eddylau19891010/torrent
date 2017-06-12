import { FilePlayerComponent } from './../file-player/file-player.component';
import { TorrentsService } from './../torrents/torrents.service';
import { TorrentItem } from './../torrents/torrent.model';
import { Component, Input, ViewChild, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef, OnDestroy, AfterViewInit, AfterViewChecked } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { Subscription } from 'rxjs/Subscription';
const shell = require('electron').shell;
declare let ga: Function;

@Component({
  selector: 'file-viewer',
  template: require('./file-viewer.component.pug'),
  styles: [require('./file-viewer.component.scss')]
})
export class FileViewerComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('filePlayer')
  filePlayer: FilePlayerComponent;

  @Input()
  torrent?: TorrentItem;

  @Input()
  file?: TorrentItem;

  @Input()
  fileIndex = 0;
  playing = false;
  preventPlay = false;
  autoPlay = true;

  paused = false;
  private currentFile: TorrentItem;
  private stateSubs: Subscription;

  constructor(private torrentService: TorrentsService, private playerService: PlayerService, private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.stateSubs = this.playerService.state$.distinctUntilChanged().subscribe((state: string) => {
      if(state === 'paused') ga('send', 'event', 'Media', 'paused');
      if(state === 'ended') ga('send', 'event', 'Media', 'ended');
      if(state === 'playing') ga('send', 'event', 'Media', 'playing');

      if (state === 'paused') {
        this.preventPlay = false;
        this.playing = false;
        this.paused = true;
      } else if (state === 'playing' || state === 'opening' || state === 'buffering') {
        this.preventPlay = false;
        this.paused = false;
        if (this.playing != true) {
          this.playing = true;
        }
      }
      if (!state) {
        this.preventPlay = false;
      }
    });
    this.playing = this.playerService.playing;
  }

  ngOnChanges(changes: SimpleChanges) {
    ga('send', 'event', 'Media', 'load media');
    if (changes['file']) {
      this.playFile(changes['file'].currentValue as TorrentItem, !this.preventPlay);
    }
  }

  ngAfterViewInit() {
    // if (this.autoPlay && !this.playing && !this.preventPlay && this.filePlayer) {
    //   this.filePlayer.playFile(true);
    //   this.playing = true;
    //   this.autoPlay = false;
    //   this.cdRef.detectChanges();
    // }
  }

  ngAfterViewChecked() {
    if (this.autoPlay && !this.playing && !this.preventPlay && this.filePlayer) {
      this.filePlayer.playFile(true);
      this.playing = true;
      this.autoPlay = false;
      this.cdRef.detectChanges();
    }
  }

  play(torrent: TorrentItem) {

  }

  pausePlay(torrent: TorrentItem, fileIndex: number) {
    this.filePlayer.pause();
  }

  openFile(torrent: TorrentItem) {
    shell.showItemInFolder(torrent.absolutePath);
  }

  playFile(file: TorrentItem, immediate = true) {
    if (this.paused && this.currentFile == file) {
      this.playing = true;
      this.resumePlay();
    } else {
      this.torrentService.startTorrent(this.torrent, file.fileIndex);
      this.currentFile = file;
      if (this.filePlayer) {
        this.filePlayer.file = file;
        this.filePlayer.playFile(immediate);
      }
    }
  }

  onPlayerCreated(event: TorrentItem) {
    // this.playFile(event, !this.preventPlay);
    this.autoPlay = true;
    this.playing = false;
  }

  startPlay() {
  }

  resumePlay() {
    this.filePlayer.play();
  }

  stopPlay() {
  }

  ngOnDestroy() {
    if (this.stateSubs) {
      this.stateSubs.unsubscribe();
    }
  }
}
