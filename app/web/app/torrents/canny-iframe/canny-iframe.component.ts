import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'canny_iframe',
	template: require('./canny-iframe.component.pug'),
  	styles: [require('./canny-iframe.component.scss')]
})
export class CannyIframeComponent implements OnInit, OnDestroy {

	canny_url: SafeResourceUrl;
	sub: any;

	constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {

	}

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
			this.canny_url = this.sanitizer.bypassSecurityTrustResourceUrl("https://donutglaze.canny.io/" + params['id']);
		});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}