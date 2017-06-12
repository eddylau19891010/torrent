import { Pipe } from '@angular/core';

@Pipe({ name: 'bytes' })
export class BytesPipe {
  UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
  constructor() {
  }

  transform(value: number) {
    let ret, i = 0;

    if (value < 0) {
      return 'Unknown';
    }

    while (value >= 1024 && i++ < 6) {
      value /= 1024;
    }

    ret = (Math.floor(10 * value) / 10).toFixed(1) + ' ' + this.UNITS[i];
    return ret;
  }
}
