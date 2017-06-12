import { TorrentsListComponent } from './torrents-list/torrents-list.component';
import { CannyIframeComponent } from './canny-iframe/canny-iframe.component';
import { TorrentsComponent } from './torrents.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', component: TorrentsComponent,
    children: [
    	{ path: 'canny/:id', component: CannyIframeComponent },
      	{ path: '/:filter', component: TorrentsListComponent }
    ]
  }];


export const routing = RouterModule.forRoot(routes, { useHash: true });
