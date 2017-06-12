import { Pipe } from '@angular/core';

@Pipe({ name: 'time' })
export class TimePipe {
  constructor() {
  }

  transform(value?: number) {
    let days, hours, mins, seconds;
    if (!value) return true;

    value = value / 1000;

    switch (true) {
      case value < 60:
        return Math.round(value) + 's';

      case value >= 60 && value < 3600:
        mins = Math.round(value / 60);
        seconds = Math.round(value % 60);
        return mins + ' min ' + seconds + 's';

      case value >= 3600 && value < 3600 * 24:
        hours = Math.round(value / 3600);
        mins = Math.round((value % 3600) / 60);
        return hours + ' hour ' + mins + 'm';

      case value >= 3600 * 24:
        days = Math.round(value / (3600 * 24));
        hours = Math.round((value % (3600 * 24)) / 3600);
        return days + ' day ' + hours + 'h';
    }

    return false;
  }
}
