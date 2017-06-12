'use strict';

const electron = require('electron');
const app = electron.app;

const path = require('path');
const menu = require('./menu')
const config = require('./config')
const livereload = require('electron-connect').client;
const BrowserWindow = electron.BrowserWindow;
const handlers = require('./handlers');
const npmLifecycle = process.env.npm_lifecycle_event;
const log = require('electron-log');
var EventEmitter = require('events').EventEmitter
EventEmitter.defaultMaxListeners = 20

const backendClass = require(path.join(__dirname, 'app/backend'));
const backend = new backendClass(EventEmitter);

let filesQueue = [];
app.ipcReady = false;

let shouldQuit = false
let argv = sliceArgv(process.argv)

if (process.platform === 'win32') {
  const squirrelWin32 = require('./squirrel-win32')
  shouldQuit = squirrelWin32.handleEvent(argv[0])
  argv = argv.filter((arg) => !arg.includes('--squirrel'))
}

// wcjs player fix for windows
if (process.platform === 'win32') {
  if (!config.IS_PRODUCTION) {
    process.env['VLC_PLUGIN_PATH'] = require('path').join(__dirname, 'node_modules/wcjs-prebuilt/bin/plugins')
  } else {
    process.env['VLC_PLUGIN_PATH'] = require('path').join(process.resourcesPath, 'app.asar.unpacked/node_modules/wcjs-prebuilt/bin/plugins')
  }
}

if (!shouldQuit) {
  // Prevent multiple instances of app from running at same time. New instances
  // signal this instance and quit. Note: This feature creates a lock file in
  // %APPDATA%\Roaming\DonutGlaze so we do not do it for the Portable App since
  // we want to be "silent" as well as "portable".
  shouldQuit = app.makeSingleInstance(onAppOpen)
  if (shouldQuit) {
    app.quit()
  }
}

if (!shouldQuit) {
  init()
}

// Remove leading args.
// Production: 1 arg, eg: /Applications/WebTorrent.app/Contents/MacOS/WebTorrent
// Development: 2 args, eg: electron .
// Test: 4 args, eg: electron -r .../mocks.js .

// our app 3
// [ '/...../DonutGlaze/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron',
//   '-r process',
//   '/..../DonutGlaze' ]

// MAC ARGS
// function sliceArgv (argv) {
//   return argv.slice(config.IS_PRODUCTION ? 1
//     : 3)
// }

// WINDOWS ARGS
function sliceArgv (argv) {
  return argv.slice(config.IS_PRODUCTION ? 1
    : process.env.npm_lifecycle_event == 'start' ? 2
    : process.env.npm_lifecycle_event == 'webpack' ? 3
    : 2)
}

var mainWindow = null;
app.on('before-quit', function() {
  backend.saveTorrents();
});
app.on('quit', function() {
  backend.stop();
  app.quit();
});

function checkForUpdates() {
  const updater = require('./updater')
  updater.init()
}

function init () {
  function onReady () {
    if (mainWindow === null) {
      mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        "webPreferences": {
          "webSecurity": false
        },
        titleBarStyle: 'hidden-inset',
        resizable: true,
        movable: true
      });

      menu.init(mainWindow)
      checkForUpdates()
      handlers.install()

      var ipcMain = mainWindow.webContents;
      backend.start(ipcMain)

      mainWindow.maximize();
      mainWindow.loadURL(`file://${__dirname}/src/index.html`);

      if (npmLifecycle === 'webpack') {
        livereload.create(mainWindow)
      }

      mainWindow.on('closed', function() {
        app.quit()
      });
    } else {
      mainWindow.focus();
    }
  };

  app.on('ready', function() {
    onReady();
  });

  app.on('open-file', onOpen)
  app.on('open-url', onOpen)
}

app.once('ipcReady', function (e) {
  processArgv(argv)
})

function onAppOpen (newArgv) {
  if (app.ipcReady) {
    console.log('Second app instance opened, but was prevented:', newArgv)
    mainWindow.show()

    processArgv(newArgv)
  } else {
    argv.push(...newArgv)
  }
}

function onOpen (e, torrentId) {
  e.preventDefault()

  // Magnet links opened from Chrome won't focus the app without a setTimeout.
  // The confirmation dialog Chrome shows causes Chrome to steal back the focus.
  // Electron issue: https://github.com/atom/electron/issues/4338
  setTimeout(() => mainWindow.show(), 100)

  // add torrent to app when opening file or url with torrent data
  if (app.ipcReady) {
    processArgv([torrentId]);
  } else {
    filesQueue.push(torrentId);
  }
}

function processArgv (argv) {
  argv.forEach(function (arg) {
    if (arg === '-n' || arg === '-o' || arg === '-u') {
      // do something here
    } else if (arg === '--hidden') {
      // Ignore hidden argument, already being handled
    } else if (arg.startsWith('-psn')) {
      // Ignore Mac launchd "process serial number" argument
      // Issue: https://github.com/webtorrent/webtorrent-desktop/issues/214
    } else if (arg.startsWith('--')) {
      // Ignore Spectron flags
    } else if (arg === 'data:,') {
      // Ignore weird Spectron argument
    } else if (arg !== '.') {
      // Ignore '.' argument, which gets misinterpreted as a torrent id, when a
      // development copy of WebTorrent is started while a production version is
      // running.
      filesQueue.push(arg)
    }
  })
  if (filesQueue.length > 0) {
    filesQueue.forEach(torrentId => {
      torrentId = torrentId.replace("donutglaze", "magnet")
      global.ipcMain.send('app:opentorrent', { 'torrentId': torrentId })
    });
    filesQueue = []
  }
}
