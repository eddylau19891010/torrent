module.exports = {
  init
}

const electron = require('electron')
const windows = require('./app/web/app/core/windows')
const config = require('./config')

function init(mainWindow) {
  menu = electron.Menu.buildFromTemplate(getMenuTemplate(mainWindow))
  electron.Menu.setApplicationMenu(menu)
}

function getMenuTemplate(mainWindow) {
  const template = [{
      label: 'Edit',
      submenu: [{
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'selectall'
        }
      ]
    },
    {
      role: 'help',
      submenu: [{
        label: 'Learn more about ' + electron.app.getName(),
        click() {
          electron.shell.openExternal('https://donutglaze.com/')
        }
      }]
    }
  ]

  var ENV = process.env.npm_lifecycle_event
  //if(ENV == 'webpack' || ENV == 'start') {
    template.push({
      label: 'Developer',
      submenu: [{
        label: 'Developer Tools',
        accelerator: process.platform === 'darwin' ?
          'Alt+Command+I' :
          'Ctrl+Shift+I',
        click: () => mainWindow.toggleDevTools()
      }]
    })
  //}

  if (process.platform === 'darwin') {
    template.unshift({
      label: electron.app.getName(),
      submenu: [{
          label: 'About ' + config.APP_NAME,
          click: () => windows.about.init()
        },
        // {
        //   label: 'Preferences',
        //   accelerator: 'CmdOrCtrl+,',
        //   //click: () => windows.main.dispatch('preferences')
        // },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })
  }

  // File menu (Windows)
  if (process.platform === 'win32') {
    template.splice(0, 0, {
      label: 'File',
      submenu: [{
          label: 'About ' + config.APP_NAME,
          click: () => windows.about.init()
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })
  }
  return template
}
