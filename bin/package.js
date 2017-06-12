#!/usr/bin/env node

/**
 * Builds app binaries for Mac, Windows, and Linux.
 */

const cp = require('child_process')
const electronPackager = require('electron-packager')
const fs = require('fs')
const minimist = require('minimist')
const path = require('path')
const rimraf = require('rimraf')
const zip = require('cross-zip')
const os = require('os')
const series = require('run-series')
const mkdirp = require('mkdirp')

const config = require('../config')
const pkg = require('../package.json')

const BUILD_NAME = config.APP_NAME + '-v' + config.APP_VERSION
const BUILD_PATH = path.join(config.ROOT_PATH, 'build')
const DIST_PATH = path.join(config.ROOT_PATH, 'src')
const NODE_MODULES_PATH = path.join(config.ROOT_PATH, 'node_modules')

const argv = minimist(process.argv.slice(2), {
  boolean: [
    'sign'
  ],
  string: [
    'package'
  ],
  default: {
    package: 'all',
    sign: false
  }
})

function build() {
  console.log('Reinstalling node_modules...')
  rimraf.sync(NODE_MODULES_PATH)
  cp.execSync('npm install', {
    stdio: 'inherit'
  })
  cp.execSync('npm dedupe', {
    stdio: 'inherit'
  })

  console.log('Nuking build/...')
  rimraf.sync(BUILD_PATH)

  console.log('Temp solution for deleting ._* files')
  rimraf.sync(path.join(config.ROOT_PATH, 'node_modules', 'wcjs-prebuilt', 'bin', 'lib', 'vlc', 'share'))
  rimraf.sync(path.join(config.ROOT_PATH, 'node_modules', 'wcjs-prebuilt', 'bin', 'lib', 'vlc', 'plugins', '._plugins.dat'))

  const platform = argv._[0]
  if (platform === 'darwin') {
    buildDarwin(printDone)
  } else if (platform === 'win32') {
    buildWin32(printDone)
  } else {
    buildDarwin(function (err) {
      printDone(err)
      buildWin32(printDone)
    })
  }
}

const all = {
  // The human-readable copyright line for the app. Maps to the `LegalCopyright` metadata
  // property on Windows, and `NSHumanReadableCopyright` on Mac.
  'appCopyright': config.APP_COPYRIGHT,

  // The release version of the application. Maps to the `ProductVersion` metadata
  // property on Windows, and `CFBundleShortVersionString` on Mac.
  'appVersion': pkg.version,

  // Package the application's source code into an archive, using Electron's archive
  // format. Mitigates issues around long path names on Windows and slightly speeds up
  // require().
  asar: {
  // A glob expression, that unpacks the files with matching names to the
  // "app.asar.unpacked" directory.
    unpackDir: 'node_modules/wcjs-prebuilt/*',
    unpack: 'DonutGlaze*'
  },

  // The build version of the application. Maps to the FileVersion metadata property on
  // Windows, and CFBundleVersion on Mac. Note: Windows requires the build version to
  // start with a number. We're using the version of the underlying DonutGlaze library.
  'buildVersion': pkg.version,

  // The application source directory.
  dir: config.ROOT_PATH,

  // Pattern which specifies which files to ignore when copying files to create the
  // package(s).
  ignore: /^\/dist|^\/(appveyor.yml|\.appveyor.yml|\.github|._plugin.dat|appdmg|AUTHORS|CONTRIBUTORS|bench|benchmark|benchmark\.js|bin|bower\.json|component\.json|coverage|doc|docs|docs\.mli|dragdrop\.min\.js|example|examples|example\.html|example\.js|externs|ipaddr\.min\.js|Makefile|min|minimist|perf|rusha|simplepeer\.min\.js|simplewebsocket\.min\.js|static\/screenshot\.png|test|tests|test\.js|tests\.js|donutglaze\.min\.js|\.[^/]*|.*\.md|.*\.markdown)$/,
  ignore: "vlc/share",

  // The application name.
  name: config.APP_NAME,

  // The base directory where the finished package(s) are created.
  out: BUILD_PATH,

  // Replace an already existing output directory.
  overwrite: true,

  // Runs `npm prune --production` which remove the packages specified in
  // "devDependencies" before starting to package the app.
  prune: true,

  // The Electron version that the app is built with (without the leading 'v')
  electronVersion: require('electron/package.json').version
}

const darwin = {
  // Build for Mac
  platform: 'darwin',

  // Build x64 binaries only.
  arch: 'x64',

  // The bundle identifier to use in the application's plist (Mac only).
  'appBundleId': 'org.donutglaze.app',

  // The application category type, as shown in the Finder via "View" -> "Arrange by
  // Application Category" when viewing the Applications directory (Mac only).
  'appCategoryType': 'public.app-category.utilities',

  // The bundle identifier to use in the application helper's plist (Mac only).
  'helperBundleId': 'org.donutglaze.app-helper',

  // Application icon.
  icon: config.APP_ICON + '.icns'
}

const win32 = {
  // Build for Windows.
  platform: 'win32',

  // Build ia32 and x64 binaries.
  arch: ['ia32'],

  // Object hash of application metadata to embed into the executable (Windows only)
  win32metadata: {

    // Company that produced the file.
    CompanyName: config.APP_NAME,

    // Name of the program, displayed to users
    FileDescription: config.APP_NAME,

    // Original name of the file, not including a path. This information enables an
    // application to determine whether a file has been renamed by a user. The format of
    // the name depends on the file system for which the file was created.
    OriginalFilename: config.APP_NAME + '.exe',

    // Name of the product with which the file is distributed.
    ProductName: config.APP_NAME,

    // Internal name of the file, if one exists, for example, a module name if the file
    // is a dynamic-link library. If the file has no internal name, this string should be
    // the original filename, without extension. This string is required.
    InternalName: config.APP_NAME
  },

  // Application icon.
  icon: config.APP_ICON + '.ico'
}

build()

function buildDarwin(cb) {
  const plist = require('plist')

  console.log('Mac: Packaging electron...')
  electronPackager(Object.assign({}, all, darwin), function(err, buildPath) {
    if (err) return cb(err)
    console.log('Mac: Packaged electron. ' + buildPath)

    const appPath = path.join(buildPath[0], config.APP_NAME + '.app')
    const contentsPath = path.join(appPath, 'Contents')
    const resourcesPath = path.join(contentsPath, 'Resources')
    const infoPlistPath = path.join(contentsPath, 'Info.plist')
    const infoPlist = plist.parse(fs.readFileSync(infoPlistPath, 'utf8'))

    infoPlist.CFBundleDocumentTypes = [{
        CFBundleTypeExtensions: ['torrent'],
        CFBundleTypeIconFile: path.basename(config.APP_FILE_ICON) + '.icns',
        CFBundleTypeName: 'BitTorrent Document',
        CFBundleTypeRole: 'Editor',
        LSHandlerRank: 'Owner',
        LSItemContentTypes: ['org.bittorrent.torrent']
      },
      {
        CFBundleTypeName: 'Any',
        CFBundleTypeOSTypes: ['****'],
        CFBundleTypeRole: 'Editor',
        LSHandlerRank: 'Owner',
        LSTypeIsPackage: false
      }
    ]

    infoPlist.CFBundleURLTypes = [{
        CFBundleTypeRole: 'Editor',
        CFBundleURLIconFile: path.basename(config.APP_FILE_ICON) + '.icns',
        CFBundleURLName: 'BitTorrent Magnet URL',
        CFBundleURLSchemes: ['magnet']
      },
      {
        CFBundleTypeRole: 'Editor',
        CFBundleURLIconFile: path.basename(config.APP_FILE_ICON) + '.icns',
        CFBundleURLName: 'BitTorrent Stream-Magnet URL',
        CFBundleURLSchemes: ['stream-magnet']
      },
      {
        CFBundleTypeRole: 'Editor',
        CFBundleURLIconFile: path.basename(config.APP_FILE_ICON) + '.icns',
        CFBundleURLName: 'DonutGlaze Magnet URL',
        CFBundleURLSchemes: ['donutglaze']
      }
    ]

    infoPlist.UTExportedTypeDeclarations = [{
      UTTypeConformsTo: [
        'public.data',
        'public.item',
        'com.bittorrent.torrent'
      ],
      UTTypeDescription: 'BitTorrent Document',
      UTTypeIconFile: path.basename(config.APP_FILE_ICON) + '.icns',
      UTTypeIdentifier: 'org.bittorrent.torrent',
      UTTypeReferenceURL: 'http://www.bittorrent.org/beps/bep_0000.html',
      UTTypeTagSpecification: {
        'com.apple.ostype': 'TORR',
        'public.filename-extension': ['torrent'],
        'public.mime-type': 'application/x-bittorrent'
      }
    }]

    fs.writeFileSync(infoPlistPath, plist.build(infoPlist))

    // Copy torrent file icon into app bundle
    cp.execSync(`cp ${config.APP_FILE_ICON + '.icns'} ${resourcesPath}`)
    cp.execSync('ln -sf libvlc.5.dylib '+path.join(buildPath[0], config.APP_NAME + '.app', 'Contents', 'Resources', 'app.asar.unpacked', 'node_modules', 'wcjs-prebuilt', 'bin', 'lib')+'/libvlc.dylib')
    cp.execSync('ln -sf libvlccore.8.dylib '+path.join(buildPath[0], config.APP_NAME + '.app', 'Contents', 'Resources', 'app.asar.unpacked', 'node_modules', 'wcjs-prebuilt', 'bin', 'lib')+'/libvlccore.dylib')
    cp.execSync('mkdir '+path.join(buildPath[0], config.APP_NAME + '.app', 'Contents', 'Resources', 'app.asar.unpacked', 'node_modules', 'wcjs-prebuilt', 'bin', 'lib', 'vlc', 'lib'))
    cp.execSync('ln -sf ../../libvlccore.8.dylib '+path.join(buildPath[0], config.APP_NAME + '.app', 'Contents', 'Resources', 'app.asar.unpacked', 'node_modules', 'wcjs-prebuilt', 'bin', 'lib', 'vlc', 'lib')+'/libvlccore.8.dylib')

    if (process.platform === 'darwin') {
      if (argv.sign) {
        signApp(function(err) {
          if (err) return cb(err)
          pack(cb)
        })
      } else {
        printWarning()
        pack(cb)
      }
    } else {
      printWarning()
    }

    function signApp(cb) {
      const sign = require('electron-osx-sign')

      /*
       * Sign the app with Apple Developer ID certificates. We sign the app for 2 reasons:
       *   - So the auto-updater (Squirrrel.Mac) can check that app updates are signed by
       *     the same author as the current version.
       *   - So users will not a see a warning about the app coming from an "Unidentified
       *     Developer" when they open it for the first time (Mac Gatekeeper).
       *
       * To sign an Mac app for distribution outside the App Store, the following are
       * required:
       *   - Xcode
       *   - Xcode Command Line Tools (xcode-select --install)
       *   - Membership in the Apple Developer Program
       */
      const signOpts = {
        app: appPath,
        platform: 'darwin',
        verbose: true
      }

      console.log('Mac: Signing app...')
      sign(signOpts, function(err) {
        if (err) return cb(err)
        console.log('Mac: Signed app.')
        cb(null)
      })
    }

    function pack(cb) {
      packageZip() // always produce .zip file, used for automatic updates

      if (argv.package === 'dmg' || argv.package === 'all') {
        packageDmg(cb)
      }
    }

    function packageZip() {
      // Create .zip file (used by the auto-updater)
      console.log('Mac: Creating zip...')

      const inPath = path.join(buildPath[0], config.APP_NAME + '.app')
      const outPath = path.join(BUILD_PATH, BUILD_NAME + '-darwin.zip')
      zip.zipSync(inPath, outPath)

      console.log('Mac: Created zip.')
    }

    function packageDmg(cb) {
      console.log('Mac: Creating dmg...')

      const appDmg = require('appdmg')

      const targetPath = path.join(BUILD_PATH, BUILD_NAME + '.dmg')
      rimraf.sync(targetPath)

      // Create a .dmg (Mac disk image) file, for easy user installation.
      const dmgOpts = {
        basepath: config.ROOT_PATH,
        target: targetPath,
        specification: {
          title: config.APP_NAME,
          icon: config.APP_ICON + '.icns',
          background: path.join(config.STATIC_PATH, 'dmg_background.png'),
          'icon-size': 128,
          contents: [{
              x: 130,
              y: 230,
              type: 'file',
              path: appPath
            },
            {
              x: 460,
              y: 230,
              type: 'link',
              path: '/Applications'
            },
            // Hide hidden icons out of view, for users who have hidden files shown.
            // https://github.com/LinusU/node-appdmg/issues/45#issuecomment-153924954
            {
              x: 50,
              y: 500,
              type: 'position',
              path: '.background'
            },
            {
              x: 100,
              y: 500,
              type: 'position',
              path: '.DS_Store'
            },
            {
              x: 150,
              y: 500,
              type: 'position',
              path: '.Trashes'
            },
            {
              x: 200,
              y: 500,
              type: 'position',
              path: '.VolumeIcon.icns'
            }
          ]
        }
      }

      const dmg = appDmg(dmgOpts)
      dmg.once('error', cb)
      dmg.on('progress', function(info) {
        if (info.type === 'step-begin') console.log(info.title + '...')
      })
      dmg.once('finish', function(info) {
        console.log('Mac: Created dmg.')
        cb(null)
      })
    }
  })
}

function buildWin32 (cb) {
  const installer = require('electron-winstaller')
  console.log('Windows: Packaging electron...')

  /*
   * Path to folder with the following files:
   *   - Windows Authenticode private key and cert (authenticode.p12)
   *   - Windows Authenticode password file (authenticode.txt)
   */
  let CERT_PATH
  try {
    fs.accessSync('D:')
    CERT_PATH = 'D:'
  } catch (err) {
    CERT_PATH = path.join(os.homedir(), 'Desktop')
  }

  electronPackager(Object.assign({}, all, win32), function (err, buildPath) {
    if (err) return cb(err)
    console.log('Windows: Packaged electron. ' + buildPath)

    let signWithParams
    if (process.platform === 'win32') {
      if (argv.sign) {
        const certificateFile = path.join(CERT_PATH, 'authenticode.p12')
        const certificatePassword = fs.readFileSync(path.join(CERT_PATH, 'authenticode.txt'), 'utf8')
        const timestampServer = 'http://timestamp.comodoca.com'
        signWithParams = `/a /f "${certificateFile}" /p "${certificatePassword}" /tr "${timestampServer}" /td sha256`
      } else {
        printWarning()
      }
    } else {
      printWarning()
    }

    const tasks = []
    buildPath.forEach(function (filesPath) {
      const destArch = filesPath.split('-').pop()

      if (argv.package === 'exe' || argv.package === 'all') {
        tasks.push((cb) => packageInstaller(filesPath, destArch, cb))
      }
      if (argv.package === 'portable' || argv.package === 'all') {
        tasks.push((cb) => packagePortable(filesPath, destArch, cb))
      }
    })
    series(tasks, cb)

    function packageInstaller (filesPath, destArch, cb) {
      console.log(`Windows: Creating ${destArch} installer...`)

      const archStr = destArch === 'ia32' ? '-ia32' : ''

      installer.createWindowsInstaller({
        appDirectory: filesPath,
        authors: config.APP_TEAM,
        description: config.APP_NAME,
        exe: config.APP_NAME + '.exe',
        iconUrl: 'https://resources.donutglaze.com/img/DonutGlaze.ico',
        loadingGif: path.join(config.STATIC_PATH, 'DonutGlaze_installing.gif'),
        name: config.APP_NAME,
        noMsi: true,
        outputDirectory: BUILD_PATH,
        productName: config.APP_NAME,
        /**
         * Only create delta updates for the Windows x64 build because 90% of our
         * users have Windows x64 and the delta files take a *very* long time to
         * generate. Also, the ia32 files on GitHub have non-standard Squirrel
         * names (i.e. RELEASES-ia32 instead of RELEASES) and so Squirrel won't
         * find them unless we proxy the requests.
         */
        // TODO: Re-enable Windows 64-bit delta updates when we confirm that they
        //       work correctly in the presence of the "ia32" .nupkg files. I
        //       (feross) noticed them listed in the 64-bit RELEASES file and
        //       manually edited them out for the v0.17 release. Shipping only
        //       full updates for now will work fine, with no ill-effects.
        // remoteReleases: destArch === 'x64'
        //   ? config.GITHUB_URL
        //   : undefined,
        /**
         * If you hit a "GitHub API rate limit exceeded" error, set this token!
         */
        setupExe: config.APP_NAME + 'Setup-v' + config.APP_VERSION + archStr + '.exe',
        setupIcon: config.APP_ICON + '.ico',
        //signWithParams: signWithParams,
        title: config.APP_NAME,
        usePackageJson: false,
        version: pkg.version
      })
      .then(function () {
        console.log(`Windows: Created ${destArch} installer.`)

        /**
         * Delete extraneous Squirrel files (i.e. *.nupkg delta files for older
         * versions of the app)
         */
        fs.readdirSync(BUILD_PATH)
          .filter((name) => name.endsWith('.nupkg') && !name.includes(pkg.version))
          .forEach((filename) => {
            fs.unlinkSync(path.join(BUILD_PATH, filename))
          })

        if (destArch === 'ia32') {
          console.log('Windows: Renaming ia32 installer files...')

          // RELEASES -> RELEASES-ia32
          const relPath = path.join(BUILD_PATH, 'RELEASES-ia32')
          fs.renameSync(
            path.join(BUILD_PATH, 'RELEASES'),
            relPath
          )

          // DonutGlaze-vX.X.X-full.nupkg -> DonutGlaze-vX.X.X-ia32-full.nupkg
          fs.renameSync(
            path.join(BUILD_PATH, `${config.APP_NAME}-${config.APP_VERSION}-full.nupkg`),
            path.join(BUILD_PATH, `${config.APP_NAME}-${config.APP_VERSION}-ia32-full.nupkg`)
          )

          // Change file name inside RELEASES-ia32 to match renamed file
          const relContent = fs.readFileSync(relPath, 'utf8')
          const relContent32 = relContent.replace('full.nupkg', 'ia32-full.nupkg')
          fs.writeFileSync(relPath, relContent32)

          if (relContent === relContent32) {
            // Sanity check
            throw new Error('Fixing RELEASES-ia32 failed. Replacement did not modify the file.')
          }

          console.log('Windows: Renamed ia32 installer files.')
        }

        cb(null)
      })
      .catch(cb)
    }

    function packagePortable (filesPath, destArch, cb) {
      console.log(`Windows: Creating ${destArch} portable app...`)

      const portablePath = path.join(filesPath, 'Portable Settings')
      mkdirp.sync(portablePath)

      const downloadsPath = path.join(portablePath, 'Downloads')
      mkdirp.sync(downloadsPath)

      const tempPath = path.join(portablePath, 'Temp')
      mkdirp.sync(tempPath)

      const archStr = destArch === 'ia32' ? '-ia32' : ''

      const inPath = path.join(BUILD_PATH, path.basename(filesPath))
      const outPath = path.join(BUILD_PATH, BUILD_NAME + '-win' + archStr + '.zip')
      zip.zipSync(inPath, outPath)

      console.log(`Windows: Created ${destArch} portable app.`)
      cb(null)
    }
  })
}

function printDone(err) {
  if (err) console.error(err.message || err)
}

/*
 * Print a large warning when signing is disabled so we are less likely to accidentally
 * ship unsigned binaries to users.
 */
function printWarning() {
  console.log(fs.readFileSync(path.join(__dirname, 'warning.txt'), 'utf8'))
}
