const appConfig = require('application-config')('DonutGlaze')
const path = require('path')
const fs = require('fs')

module.exports = {
  APP_WORK_FOLDER: getAppWorkFolder(),
  DOWNLOADS_FOLDER: getDefaultDownloadPath(),
  SETTINGS_PATH: getConfigPath(),

  TORRENT_PATH: path.join(getConfigPath(), 'torrents'),
  getTorrentPath: getTorrentPath,
  getTorrentContentPath: getTorrentContentPath
}

function getUserHome() {
  return process.env.HOME || process.env.USERPROFILE;
}

function getAppWorkFolder() {
  let appPath = path.join(path.dirname(appConfig.filePath))
  if (!fs.existsSync(appPath)) fs.mkdirSync(appPath)
  return appPath
}

function getDefaultDownloadPath() {
  let downloadPath = path.join(getUserHome(), 'Downloads')
  if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath)
  return downloadPath
}

function getConfigPath() {
  return path.join(path.dirname(appConfig.filePath), 'config.json')
}

function getTorrentContentPath(name) {
  if (name) {
    let filePath = path.join(getDefaultDownloadPath(), name)
    if (fs.existsSync(filePath)) {
      return path.join(getDefaultDownloadPath(), name)
    }
  }
  return false
}

function getTorrentPath(infoHash) {
  let torrentPath = path.join(path.dirname(appConfig.filePath), 'torrents')
  if (!fs.existsSync(torrentPath)) fs.mkdirSync(torrentPath)
  torrentPath = path.join(torrentPath, infoHash + '.torrent')

  return torrentPath
}
