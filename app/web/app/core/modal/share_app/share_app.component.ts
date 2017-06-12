import { Component, OnInit } from '@angular/core';
import { shell, remote }  from 'electron';
import { LocalStorageService } from 'angular-2-local-storage';

let {dialog} = remote;


@Component({
  selector: 'modal-content',
  template: require('./share_app.component.pug'),
  styles: [require('./share_app.component.scss')]
})

export class ModalShareAppComponent implements OnInit {
  down_folder: string;
  user_lang: string;

  constructor(private localStorageService: LocalStorageService) {

  }

  ngOnInit(): void {
    //this.user_lang = navigator.language || navigator.userLanguage;
    localStorage.setItem('user_lang', 'French');
    this.user_lang = localStorage.getItem('user_lang');
    this.down_folder = 'Users/donuteater/Downloads';
    console.log(this.user_lang);
    console.log(this.down_folder);
  }

  facebook() {
    shell.openExternal('https://www.facebook.com/sharer/sharer.php?u=https%3A//goo.gl/5fwzWH');
  }
  twitter() {
    shell.openExternal('https://twitter.com/home?status=Download%20and%20stream%20torrents%20with%20DonutGlaze%20%F0%9F%8D%A9%20https%3A//goo.gl/C8PWQi%20%F0%9F%8D%A9%20%23donut%20%23torrent%20%23download%20%23free%20%23stream%0A');
  }
  email() {
    shell.openExternal('mailto:?subject=Cool new torrent client&body=Check out this new torrent client called DonutGlaze you can download and stream torrents with: https://donutglaze.com/delish');
  }
  qzone() {
    shell.openExternal('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=https://goo.gl/wthoxs');
  }
  weibo() {
    shell.openExternal('http://service.weibo.com/share/share.php?url=https://goo.gl/Rw387C&appkey=&title=Download%20and%20stream%20torrents%20with%20DonutGlaze%20%23donut%20%23torrent%20%23download%20%23free%20%23stream&pic=&ralateUid=');
  }
  vk() {
    shell.openExternal('http://vk.com/share.php?url=https://goo.gl/nSKPjD');
  }
  translateurl() {
    shell.openExternal('https://osqxed4.oneskyapp.com/collaboration/project?id=110806');
  }
  onchange() {
    console.log(this.down_folder);
    dialog.showOpenDialog({title: 'Select a folder', properties:['openDirectory']}, 
    (folderPath) => {
      if (folderPath === undefined) {
        console.log("You didn't select a folder");
        return;
      }
      this.down_folder = folderPath[0];
      var inputPathEdit = <HTMLInputElement>document.getElementById('pathedit');
      inputPathEdit.value = this.down_folder;
      console.log(this.down_folder);
      return;
    });
  }
}
