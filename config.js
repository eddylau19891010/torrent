const path = require('path')

const IS_PRODUCTION = isProduction()

module.exports = {
  GOOGLE_ID: 'UA-97835756-3',
  GOOGLE_ID_DEBUGGING: 'UA-97835756-4',
  APP_NAME: 'DonutGlaze',
  APP_TEAM: 'DonutGlaze',
  AUTO_UPDATE_URL: 'https://app.donutglaze.com/update',
  APP_VERSION: require('./package.json').version,
  RELEASE_CHANNEL: 'alpha',
  ROOT_PATH: path.join(__dirname),

  APP_COPYRIGHT: 'Copyright © 2014-2017 DonutGlaze',
  APP_FILE_ICON: path.join(__dirname, 'resources', 'DonutGlazeFile'),
  APP_ICON: path.join(__dirname, 'resources', 'DonutGlaze'),
  STATIC_PATH: path.join(__dirname, 'resources'),

  WINDOW_ABOUT: 'file://' + path.join(__dirname, 'resources', 'about.html'),

  IS_PRODUCTION: IS_PRODUCTION
}

function isProduction () {
  return process.mainModule.filename.indexOf('app.asar') !== -1;
}
