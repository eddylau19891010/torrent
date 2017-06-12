module.exports = {
  init
}

const electron = require('electron')
const get = require('simple-get')

const config = require('./config')
const log = require('electron-log')

var AUTO_UPDATE_URL = config.AUTO_UPDATE_URL +
  '/' + process.platform +
  '/' + config.APP_VERSION +
  '/' + config.RELEASE_CHANNEL

function init() {
  if (process.platform === 'linux') {
    initLinux()
  } else {
    initDarwinWin32()
  }
}

function onResponse(err, res, data) {
  if (err) return log(`Update error: ${err.message}`)
  if (res.statusCode === 200) {
    // Update available
    try {
      data = JSON.parse(data)
    } catch (err) {
      log.error(`Update error: Invalid JSON response: ${err.message}`)
    }
    windows.main.dispatch('updateAvailable', data.version)
  } else if (res.statusCode === 204) {
    // No update available
  } else {
    // Unexpected status code
    log.error(`Update error: Unexpected status code: ${res.statusCode}`)
  }
}

function initDarwinWin32() {
  electron.autoUpdater.on(
    'error',
    error => log.error(`Update error: ${error.message}`)
  )

  electron.autoUpdater.on(
    'checking-for-update',
    () => log.info('Checking for update')
  )

  electron.autoUpdater.on(
    'update-available',
    () => log.info('Update available')
  )

  electron.autoUpdater.on(
    'update-not-available',
    () => log.info('No update available')
  )

  electron.autoUpdater.on(
    'update-downloaded',
    (e, notes, name, date, url) => log.info(`Update downloaded: ${name}: ${url}`)
  )

  electron.autoUpdater.setFeedURL(AUTO_UPDATE_URL)
  electron.autoUpdater.checkForUpdates()
}
