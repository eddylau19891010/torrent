export const TorrentStateType = {
  FINISHED: 'finished',
  PAUSED: 'paused',
  METADATA: 'metadata',
  DOWNLOADING: 'downloading',
  SEEDING: 'seeding',
  CHECKING: 'checking',
  STALLED: 'stalled',
  FILE_PAUSED: 'file_paused',
  ALLOCATING: 'allocating',
  UNKNOWN: 'unknown',
  ERROR: 'error',
  CALCULATING: 'calculating'
};

export const TorrentState = {
  ALL: 'all',
  DOWNLOADING: 'downloading',
  PAUSED: 'paused',
  SEEDING: 'seeding',
  DONE: 'done',
  ERROR: 'error',
  CALCULATING: 'calculating'
};

export class TorrentItem {
  sourcePath?: string;
  error?: string;
  expanded?: boolean;
  warning?: string;
  id?: string;
  salt?: string;
  eta?: number;
  infoHash?: string;
  key?: string;
  downloadedSize?: number;
  actualSize?: number;
  totalSize?: number;
  fileIndex?: number;
  name?: string;
  path?: string;
  absolutePath?: string;
  save_path?: string;
  mime_type?: string;
  video?: boolean;
  audio?: boolean;
  media?: boolean;
  type?: string;
  state?: string;
  paused?: boolean;
  items?: TorrentItem[] = [];
  progress?: number;
  need_save?: boolean;
  dl_speed?: number;
  ul_speed?: number;
  fileIcon?: string;
  magnetURI?: string;

  isError() {
    return this.state === TorrentStateType.ERROR;
  }

  isChecking() {
    return this.state === TorrentStateType.CHECKING;
  }

  isPaused() {
    return this.state === TorrentStateType.PAUSED;
  }

  public isFinished() {
    return this.state === TorrentStateType.FINISHED || this.progress >= 1;
  }

  isNotFinished() {
    return this.state !== TorrentStateType.FINISHED && this.progress < 1;
  }

  isWorking() {
    return this.state === TorrentStateType.DOWNLOADING ||
      this.state === TorrentStateType.SEEDING;
  }

  isSeeding() {
    return this.state === TorrentStateType.SEEDING;
  }

  isDownloading() {
    return this.state === TorrentStateType.DOWNLOADING;
  }

  isActive() {
    return this.isDownloading() || this.isPaused() ||
      (!this.isError() && !this.isChecking() && !this.isSeeding() && this.isNotFinished());
  }
}

export class TorrentInfo {
  torrents: TorrentItem[];
}
