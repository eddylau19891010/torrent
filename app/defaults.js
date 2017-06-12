module.exports = {
  install,
  uninstall
}

const debug = require('debug')('defaults');
const path = require('path');
const EXEC_COMMAND = [process.execPath];

function install() {
  switch (true) {
    case process.platform === 'darwin':
      installDarwin();
      break;

    case process.platform === 'win32':
      installWin32();
      break;

    case process.platform === 'linux':
      installLinux();
      break;
  }
}

function uninstall() {
  switch (true) {
    case process.platform === 'darwin':
      uninstallDarwin();
      break;

    case process.platform === 'win32':
      uninstallWin32();
      break;

    case process.platform === 'linux':
      uninstallLinux();
      break;
  }
}

/* Darwin */
function installDarwin() {
  const electron = require('electron');
  const app = electron.app;

  /* On Mac, only protocols that are listed in `Info.plist` can be set as the */
  /* default handler at runtime. */
  app.setAsDefaultProtocolClient('magnet');
  app.setAsDefaultProtocolClient('stream-magnet');

  /* File handlers are defined in `Info.plist`. */
}

function uninstallDarwin() {}

/* Windows */
function installWin32() {
  const Registry = require('winreg');
  const iconPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'DonutGlaze.ico');

  registerProtocolHandlerWin32('magnet', 'URL:BitTorrent Magnet URL', iconPath, EXEC_COMMAND);
  registerProtocolHandlerWin32('stream-magnet', 'URL:BitTorrent Stream-Magnet URL', iconPath, EXEC_COMMAND);
  registerFileHandlerWin32('.torrent', 'com.donutglaze.torrent', 'BitTorrent Document', iconPath, EXEC_COMMAND)


  function registerProtocolHandlerWin32(protocol, name, icon, command) {
    const protocolKey = new Registry({
      hive: Registry.HKCU, // HKEY_CURRENT_USER
      key: '\\Software\\Classes\\' + protocol
    });

    setProtocol();

    function setProtocol(err) {
      if (err) debug(err.message);
      protocolKey.set('', Registry.REG_SZ, name, setURLProtocol);
    }

    function setURLProtocol(err) {
      if (err) debug(err.message);
      protocolKey.set('URL Protocol', Registry.REG_SZ, '', setIcon);
    }

    function setIcon(err) {
      if (err) debug(err.message);

      const iconKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Classes\\' + protocol + '\\DefaultIcon'
      });
      iconKey.set('', Registry.REG_SZ, icon, setCommand);
    }

    function setCommand(err) {
      if (err) debug(err.message);

      const commandKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Classes\\' + protocol + '\\shell\\open\\command'
      });
      commandKey.set('', Registry.REG_SZ, `${commandToArgs(command)} "%1"`, done);
    }

    function done(err) {
      if (err) debug(err.message);
    }
  }

  function registerFileHandlerWin32(ext, id, name, icon, command) {
    setExt();

    function setExt() {
      const extKey = new Registry({
        hive: Registry.HKCU, // HKEY_CURRENT_USER
        key: '\\Software\\Classes\\' + ext
      });
      extKey.set('', Registry.REG_SZ, id, setId);
    }

    function setId(err) {
      if (err) debug(err.message);

      const idKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Classes\\' + id
      });
      idKey.set('', Registry.REG_SZ, name, setIcon);
    }

    function setIcon(err) {
      if (err) debug(err.message);

      const iconKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Classes\\' + id + '\\DefaultIcon'
      });
      iconKey.set('', Registry.REG_SZ, icon, setCommand);
    }

    function setCommand(err) {
      if (err) debug(err.message);

      const commandKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Classes\\' + id + '\\shell\\open\\command'
      });
      commandKey.set('', Registry.REG_SZ, `${commandToArgs(command)} "%1"`, done);
    }

    function done(err) {
      if (err) debug(err.message);
    }
  }
}

function uninstallWin32() {
  const Registry = require('winreg');

  unregisterProtocolHandlerWin32('magnet', EXEC_COMMAND);
  unregisterProtocolHandlerWin32('stream-magnet', EXEC_COMMAND);
  unregisterFileHandlerWin32('.torrent', 'com.donutglaze.torrent', EXEC_COMMAND);

  function unregisterProtocolHandlerWin32(protocol, command) {
    getCommand();

    function getCommand() {
      const commandKey = new Registry({
        hive: Registry.HKCU, // HKEY_CURRENT_USER
        key: '\\Software\\Classes\\' + protocol + '\\shell\\open\\command'
      });
      commandKey.get('', function(err, item) {
        if (!err && item.value.indexOf(commandToArgs(command)) >= 0) {
          destroyProtocol();
        }
      });
    }

    function destroyProtocol() {
      const protocolKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Classes\\' + protocol
      });
      protocolKey.destroy(function() {});
    }
  }

  function unregisterFileHandlerWin32(ext, id, command) {
    eraseId();

    function eraseId() {
      const idKey = new Registry({
        hive: Registry.HKCU, // HKEY_CURRENT_USER
        key: '\\Software\\Classes\\' + id
      });
      idKey.destroy(getExt);
    }

    function getExt() {
      const extKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Classes\\' + ext
      });
      extKey.get('', function(err, item) {
        if (!err && item.value === id) {
          destroyExt();
        }
      });
    }

    function destroyExt() {
      const extKey = new Registry({
        hive: Registry.HKCU, // HKEY_CURRENT_USER
        key: '\\Software\\Classes\\' + ext
      });
      extKey.destroy(function() {});
    }
  }
}

function commandToArgs(command) {
  return command.map((arg) => `"${arg}"`).join(' ');
}

/* Linux */
function installLinux() {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');

  // Do not install in user dir if running on system
  if (/^\/opt/.test(process.execPath)) return;

  installDesktopFile();
  installIconFile();

  function installDesktopFile() {
    const templatePath = path.join(process.resourcesPath, 'Donutglaze.desktop');
    fs.readFile(templatePath, 'utf8', writeDesktopFile);
  }

  function writeDesktopFile(err, desktopFile) {
    if (err) return debug(err.message)

    const appPath = path.dirname(process.execPath);

    desktopFile = desktopFile.replace(/\$APP_NAME/g, 'Donutglaze');
    desktopFile = desktopFile.replace(/\$APP_PATH/g, appPath);
    desktopFile = desktopFile.replace(/\$EXEC_PATH/g, EXEC_COMMAND.join(' '));
    desktopFile = desktopFile.replace(/\$TRY_EXEC_PATH/g, process.execPath);

    const desktopFilePath = path.join(
      os.homedir(),
      '.local',
      'share',
      'applications',
      'Donutglaze.desktop'
    );

    fs.mkdirp(path.dirname(desktopFilePath));
    fs.writeFile(desktopFilePath, desktopFile, function(err) {
      if (err) return debug(err.message);
    });
  }

  function installIconFile() {
    const iconStaticPath = path.join(process.resourcesPath, 'icon.png');
    fs.readFile(iconStaticPath, writeIconFile);
  }

  function writeIconFile(err, iconFile) {
    if (err) return debug(err.message);

    const mkdirp = require('mkdirp');

    const iconFilePath = path.join(
      os.homedir(),
      '.local',
      'share',
      'icons',
      'donutglaze.png'
    );
    mkdirp(path.dirname(iconFilePath), function(err) {
      if (err) return debug(err.message);
    });
    fs.writeFile(iconFilePath, iconFile, function(err) {
      if (err) debug(err.message);
    });
  }
}

function uninstallLinux() {
  const os = require('os');
  const path = require('path');
  const rimraf = require('rimraf');

  const desktopFilePath = path.join(
    os.homedir(),
    '.local',
    'share',
    'applications',
    'Donutglaze.desktop'
  );
  rimraf(desktopFilePath);

  const iconFilePath = path.join(
    os.homedir(),
    '.local',
    'share',
    'icons',
    'donutglaze.png'
  );
  rimraf(iconFilePath);
}
