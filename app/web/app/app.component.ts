import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate';

import '../style/app.scss';
import '../style/theme/scss/pages.scss';

@Component({
  selector: 'donutglaze',
  template: require('./app.component.pug'),
  styles: [require('./app.component.scss')],
})
export class AppComponent {
  constructor(translate: TranslateService) {
    const osLocale = require('os-locale');
    translate.addLangs(['de_DE', 'en_US', 'it_IT', 'pt_BR', 'ko_KR', 'zh_CN', 'es_ES', 'fr_FR', 'ja_JP', 'nl_NL', 'ru_RU']);
    translate.setDefaultLang('en_US');
    translate.use(osLocale.sync());
    console.log(osLocale.sync());
  }
}
