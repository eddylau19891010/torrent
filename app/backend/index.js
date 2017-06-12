require('./global')

const WebTorrent = require('webtorrent');
var ipc = require('electron').ipcMain;
var fs = require('fs');
const http = require('http');
const TorrentManager = require('./torrent-manager')

class Backend {
  constructor(EventEmitter) {
    this.EventEmitter = EventEmitter;
    this.client = new WebTorrent();
    settings.clientId();
  }

  start(ipcMain) {
    global.ipcMain = ipcMain
    this.manager = new TorrentManager(this.client)
  }
  saveTorrents() {
    this.manager.saveTorrents();
  }
  stop() {
    this.client.destroy();
  }
}

module.exports = Backend;
