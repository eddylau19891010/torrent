import {DomSanitizer} from '@angular/platform-browser';
import {Pipe} from '@angular/core';

@Pipe({ name: 'safe' })
export class SafePipe {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }
}
