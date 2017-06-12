var low = require('lowdb');
const fs = require('fs')
const uuidV4 = require('uuid/v4');

if (!fs.existsSync(config.DOWNLOADS_FOLDER)) fs.mkdirSync(config.DOWNLOADS_FOLDER)

const db = low(config.SETTINGS_PATH)
db.defaults({
  torrents: [],
  settings: {}
}).write()

exports.getTorrents = function(query) {
  if (query && typeof query === 'object') {
    return db.get('torrents').find(query).value()
  }
  return db.get('torrents').value()
}


exports.getSettings = function() {
  return db.get('settings').value()
}

exports.finishOnboarding = function() {
  db.get('settings').assign({
    onboardingFinished: true
  }).write()
}

exports.clientId = function() {
  if (!db.has('settings.clientId').value()) {
    return db.get('settings').assign({
      clientId: uuidV4()
    }).write()
  } else {
    return db.get('settings.clientId')
  }
}

exports.addTorrent = function(torrent, cb) {
  if (!db.get('torrents').find({
      infoHash: torrent.infoHash
    }).value()) {
    db.get('torrents').unshift(torrent).write()
  }
}

exports.updateTorrent = function(torrent, cb) {
  db.get('torrents').find({
      infoHash: torrent.infoHash
    })
    .assign(torrent).write()
}

exports.pauseTorrent = function(torrent, cb) {
  db.get('torrents').find({
      infoHash: torrent.infoHash
    })
    .assign(torrent)
    .assign({
      state: 'paused'
    }).write()
}

exports.resumeTorrent = function(torrent, cb) {
  db.get('torrents').find({
      infoHash: torrent.infoHash
    })
    .assign(torrent)
    .assign({
      state: 'downloading'
    }).write()
}

exports.removeTorrent = function(infoHash) {
  db.get('torrents').remove({
    infoHash: infoHash
  }).write()
}
