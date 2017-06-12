import { TorrentsListComponent } from './torrents/torrents-list/torrents-list.component';
import { CannyIframeComponent } from './torrents/canny-iframe/canny-iframe.component';
import { TorrentsComponent } from './torrents/torrents.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'torrents/all', pathMatch: 'full' },
  {
    path: 'torrents', component: TorrentsComponent,
    children: [
    	{ path: 'canny/:id', component: CannyIframeComponent },
      	{ path: ':filter', component: TorrentsListComponent }
    ]
  }
];


export const routing = RouterModule.forRoot(routes, { useHash: true });
