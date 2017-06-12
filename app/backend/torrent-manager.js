const fs = require('fs')
const ipc = require('electron').ipcMain
const rimraf = require('rimraf');
const parseTorrent = require('parse-torrent')
const mime = require('mime-types')
const path = require('path')
const notifier = require('node-notifier');
const TorrentState = require('./torrent-state.model')
const { app } = require('electron')

const ROOT = 'root'
const FOLDER = 'folder'
const FILE = 'file'

class TorrentManager {
  constructor(client) {
    this.client = client
    this.setupTorrentHandlers()
    this.loadTorrents()
  }

  loadTorrents() {
    var torrents = settings.getTorrents()
    torrents.forEach((torrent) => {
      this.addTorrent(torrent, torrent.state)
    })
  }

  getTorrentProgress(torrent, file) {
    if (torrent) {
      if (file) {
        var numPieces = file._endPiece - file._startPiece + 1
        var numPiecesPresent = 0
        for (let piece = file._startPiece; piece <= file._endPiece; piece++) {
          if (torrent.bitfield.get(piece)) numPiecesPresent++
        }

        return numPiecesPresent / numPieces
      } else {
        return torrent.progress
      }
    }
  }

  processTorrentFolder(folder, fileIndex = 0) {
    let filesCount = 0,
      totalProgress = 0,
      totalFiles = 0,
      totalSize = 0,
      actualSize = 0,
      progress = 0

    if (folder.type === FILE) {
      totalSize += folder.totalSize
      actualSize = folder.totalSize * folder.progress
    }

    folder.items.forEach((file, index) => {
      let progress = file.progress
      if (file.type === FOLDER) {
        fileIndex = this.processTorrentFolder(file, fileIndex)
        totalFiles += file.totalFiles
        totalSize += file.totalSize
        actualSize += file.downloaded
        progress = file.progress
      } else if (file.type === FILE) {
        totalFiles++
        totalSize += file.totalSize
        actualSize += file.totalSize * file.progress
        file.fileIndex = fileIndex++
        this.handleMimeTypes(file)
      }

      totalProgress += file.progress
      filesCount++
    })

    if(folder.type !== ROOT) {
      folder.totalFiles = totalFiles
      folder.totalSize = totalSize
      folder.actualSize = actualSize
      folder.progress = actualSize / totalSize
    }

    return fileIndex
  }

  findOrCreateFolder(torrentTree, path) {
    _.find(torrentTree)
  }

  buildInfo(torrent, file) {
    let item = file || torrent
    return {
      name: item.name,
      path: item.path,
      absolutePath: path.join(config.DOWNLOADS_FOLDER, item.path),
      type: FILE,
      progress: item.downloaded / item.length || this.getTorrentProgress(torrent, file) || item.progress || 0,
      totalSize: item.length
    }
  }

  buildTorrentTree(torrent, showLog) {
    let torrentTree = {
      type: ROOT,
      name: torrent.name,
      path: torrent.path,
      sourcePath: config.getTorrentPath(torrent.infoHash),
      dl_speed: torrent.downloadSpeed,
      up_speed: torrent.uploadSpeed,
      eta: torrent.timeRemaining,
      state: torrent.state,
      infoHash: torrent.infoHash,
      progress: torrent.received / torrent.length || this.getTorrentProgress(torrent) || torrent.progress || 0,
      items: [],
      totalSize: torrent.length
    }

    if (torrent.files) {
      torrent.files.forEach((file) => {
        let fileInfo = this.buildInfo(torrent, file)
        let pathParts = process.platform === 'win32' ? file.path.split('\\') : file.path.split('/')
        if (pathParts.length === 1) {
          torrentTree.items.push(fileInfo)
        } else {
          let folder = torrentTree
          for (let [index, part] of pathParts.entries()) {
            if (index === pathParts.length - 1) {
              folder.items.push(fileInfo)
              continue
            }

            let childFolder = _.find(folder.items, (item) => item.type === FOLDER && item.path === part)
            if (!childFolder) {
              childFolder = {
                name: part,
                path: part,
                type: FOLDER,
                items: []
              }
              folder.items.push(childFolder)
            }
            folder = childFolder
          }
        }
      })
    }

    this.processTorrentFolder(torrentTree)
    return torrentTree
  }

  handleMimeTypes(item) {
    let name = path.parse(item.path).base
    let mimeType = mime.lookup(name) || 'application/octet-stream'
    item.audio = mimeType.startsWith('audio')
    item.video = mimeType.startsWith('video')
    item.media = item.audio || item.video
  }

  // Check if torrent is paused in the beginning
  setupEvents(torrent, paused = false) {
    if (paused) {
      torrent.state = torrent.state
      ipc.on('ipcReady', () => {
        ipcMain.send('torrent:updated', this.buildTorrentTree(torrent))
      })
      return;
    }

    torrent.peersAttempts = 0
    var throttleFn = _.throttle(() => {
      if(torrent.state !== 'paused') {
        torrent.state = torrent.progress >= 1 ? 'finished' : 'downloading'
        settings.updateTorrent(this.getTorrentInfo(torrent))
        ipcMain.send('torrent:updated', this.buildTorrentTree(torrent))
      }
    }, 1000, {
      leading: false
    })

    torrent.on('download', () => {
      throttleFn(torrent)
    })

    torrent.on('noPeers', () => {
      if (torrent.peersAttempts >= 100) {
        torrent.state = 'error'
        torrent.error = 'No Peers'
        ipcMain.send('torrent:error', torrent)
        torrent.destroy()
      } else {
        torrent.peersAttempts++;
      }
    })

    torrent.on('done', () => {
      if (torrent.progress === 1) {
        torrent.state = 'finished'
        settings.updateTorrent(this.getTorrentInfo(torrent))
        ipcMain.send('torrent:updated', this.buildTorrentTree(torrent))
        ipcMain.send('torrent:notification', {
          title: 'Download Complete!',
          body: torrent.name
        })
      }
    })

    // torrent.on('ready', () => {
    //   ipcMain.send('torrent:updated', this.buildTorrentTree(torrent))
    // })
  }

  // Produces a JSON saveable summary of a torrent
  getTorrentInfo(torrent) {
    return {
      infoHash: torrent.infoHash,
      magnetURI: torrent.magnetURI || `magnet:?xt=urn:btih:${torrent.infoHash}`,
      name: torrent.name,
      path: torrent.path || '',
      bytesReceived: torrent.received || 0,
      length: torrent.length,
      progress: torrent.progress,
      state: torrent.state,
      files: torrent.files.map(this.getTorrentFileInfo)
    }
  }

  // Produces a JSON saveable summary of a file in a torrent
  getTorrentFileInfo(file) {
    return {
      name: file.name,
      path: file.path,
      bytesReceived: file.downloaded || 0,
      length: file.length,
      progress: file.downloaded / file.length > 1 ? 1 : file.downloaded / file.length
    }
  }

  addTorrent(torrentId, state) {
    if (state === TorrentState.PAUSED || state === TorrentState.FINISHED) {
      this.setupEvents(torrentId, true)
      if(state === TorrentState.FINISHED) {
        this.client.add(torrentId)
      }
    } else {
      parseTorrent.remote(torrentId, (err, parsedTorrent) => {
        if (err) {
          ipcMain.send('torrent:notification', {
            title: 'Invalid Media!',
            body: 'Use magnet, .torrent or info hash'
          })
          return
        }

        if (this.client.torrents.find(t => t.infoHash === parsedTorrent.infoHash)) {
          ipcMain.send('torrent:notification', {
            title: 'Torrent already added!',
            body: parsedTorrent.name
          })
        } else {
          if (parsedTorrent.dn && parsedTorrent.infoHash) {
            ipcMain.send('torrent:create_item', parsedTorrent.infoHash, true, parsedTorrent.dn)
          } else {
            ipcMain.send('torrent:create_item', parsedTorrent.infoHash, true)
          }

          if (state === TorrentState.PAUSED) {
            this.setupEvents(parsedTorrent, true)
          } else {
            let torrent = this.client.add(parsedTorrent, {
              path: config.DOWNLOADS_FOLDER
            })
            torrent.files.forEach((file) => file.select())

            settings.addTorrent(this.getTorrentInfo(torrent))
            var torrentPath = config.getTorrentPath(torrent.infoHash)

            torrent.on('ready', () => {
              fs.exists(torrentPath, (exists) => {
                if (!exists) {
                  fs.writeFile(torrentPath, torrent.torrentFile, (err) => {
                    if (err) {
                      console.log('error saving torrent file %s: %o', torrentPath, err)
                    }
                    this.setupEvents(torrent)
                  })
                } else {
                  this.setupEvents(torrent)
                }
              })
            })
          }

        }
      })
    }
  }

  pauseTorrent(infoHash, cb) {
    var torrent = this.client.torrents.find(t => t.infoHash === infoHash)

    if (torrent) {
      torrent.state = TorrentState.PAUSED
      settings.pauseTorrent(this.getTorrentInfo(torrent))
      ipcMain.send('torrent:pause', this.buildTorrentTree(torrent))
      torrent.destroy()
    }
  }

  resumeTorrent(torrent, cb) {
    torrent.state = TorrentState.CALCULATING
    ipcMain.send('torrent:resume', this.buildTorrentTree(torrent))
    var torrentCheck = this.client.torrents.find(t => t.infoHash === torrent.infoHash)
    if(torrentCheck) {
      setTimeout(() => this.resumeTorrent(torrent, cb), 500)
    } else {
      torrent = this.client.add(config.getTorrentPath(torrent.infoHash))
      torrent.on('ready', () => {
        torrent.deselect(0, torrent.pieces.length - 1, false)
        torrent.files.forEach((file) => file.select())
        settings.resumeTorrent(this.getTorrentInfo(torrent))
        this.setupEvents(torrent)
      })
    }

  }

  archiveTorrent(infoHash) {
    settings.removeTorrent(infoHash)
    var torrent = this.client.torrents.find(t => t.infoHash === infoHash)
    if (torrent) this.client.remove(infoHash)
  }

  removeTorrent(infoHash, cb) {
    settings.removeTorrent(infoHash)
    if (fs.existsSync(config.getTorrentPath(infoHash))) {
      fs.unlink(config.getTorrentPath(infoHash), cb)
    }

    var torrent = this.client.torrents.find(t => t.infoHash === infoHash)
    if (torrent) {
      this.client.remove(infoHash)
      var contentPath = config.getTorrentContentPath(torrent.name)
      if (fs.existsSync(contentPath)) {
        var stat = fs.statSync(contentPath)
        if (stat.isDirectory()) {
          rimraf(contentPath, () => {})
        } else {
          fs.unlink(contentPath)
        }
      }
      ipcMain.send('torrent:removed', this.buildTorrentTree(torrent))
    }
  }

  // Create a http Server for torrent content and priorize the selected file
  streamFile(torrent, fileIndex) {
    if (this.server) {
      this.server.destroy();
    }

    this.server = torrent.createServer();
    this.server.listen(9000, () => {
      ipcMain.send('torrent:streamed', this.buildTorrentTree(torrent))
    });
  }

  setupTorrentHandlers() {
    ipc.on('settings:load', (event) => {
      event.returnValue = settings.getSettings()
    })

    ipc.on('onboarding:finished', (event) => {
      settings.finishOnboarding()
    })

    ipc.on('torrent:list', (event) => {
      event.returnValue = settings.getTorrents()
      // this.client.torrents.forEach((torrent) => {
      //   ipcMain.send('torrent:updated', this.buildTorrentTree(torrent))
      // })
    })

    ipc.on('torrent:updateTorrent', (event, torrent) => {
      var torrent = this.client.torrents.find((t) => t.infoHash === torrent.infoHash)
    });

    ipc.on('torrent:add', (event, torrentId) => {
      this.addTorrent(torrentId)
    });

    ipc.on('torrent:remove', (event, infoHash) => {
      this.removeTorrent(infoHash)
    });

    ipc.on('torrent:archive', (event, infoHash) => {
      this.archiveTorrent(infoHash)
    });

    ipc.on('torrent:pause', (event, infoHash) => {
      this.pauseTorrent(infoHash)
    });

    ipc.on('torrent:resume', (event, torrent) => {
      this.resumeTorrent(torrent)
    });

    ipc.on('torrent:start', (event, config) => {
      var torrent = this.client.torrents.find((t) => t.infoHash === config.infoHash)
      if (torrent) {
        if (torrent.ready) {
          this.streamFile(torrent, config.index)
        } else {
          torrent.once('ready', () => this.streamFile(torrent, config.index))
        }
      }
    });

    ipc.once('ipcReady', function (e) {
      app.ipcReady = true
      app.emit('ipcReady')
    });
  }

  saveTorrents() {
    this.client.torrents.forEach(torrent => {
      settings.updateTorrent(this.getTorrentInfo(torrent))
    })
  }
}

module.exports = TorrentManager
