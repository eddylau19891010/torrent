import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import './style/app.scss';
import './style/paddings.scss';
import './style/borders.scss';
declare let ga: Function;

const config = require('config');
const ipcRenderer = require('electron').ipcRenderer;

let settings = ipcRenderer.sendSync('settings:load');

let google_id = config.IS_PRODUCTION ?
  config.GOOGLE_ID :
  config.GOOGLE_ID_DEBUGGING;

// depending on the env mode, enable prod mode or add debugging modules
if (process.env.ENV != 'start' && process.env.ENV != 'webpack') {
  enableProdMode();
}

export function main() {
  return platformBrowserDynamic().bootstrapModule(AppModule);
}

if (document.readyState === 'complete') {
  main();
  window.setTimeout(delayedInit, 3000)
} else {
  document.addEventListener('DOMContentLoaded', main);
  window.setTimeout(delayedInit, 3000)
}

function delayedInit () {
  function ga_heartbeat() {
    ga('send', 'event', 'Heartbeat', '360bpm', {'nonInteraction': true});
    setTimeout(ga_heartbeat, 29*60*1000);
  }
  ga_heartbeat();
  ga('create', google_id, {'storage': 'none', 'clientId': settings.clientId});
  ga('set', 'appVersion', config.APP_VERSION);
  ga('set', 'appName', config.APP_NAME);
  ga('set', 'dimension1', process.platform +' '+ require('os').release());
  ga('set', 'dimension2', settings.clientId);
  ga('set', 'checkProtocolTask', function(){ /* nothing */ });
  ga('send', 'screenView', {'screenName': 'Init View', 'sessionControl': 'start'})
  ga('send', 'event', 'App', 'start');
  ipcRenderer.send('ipcReady');

  window.onbeforeunload = function() {
    ga('send', 'event', 'App', 'quit', {'sessionControl': 'end'});
  }
}
