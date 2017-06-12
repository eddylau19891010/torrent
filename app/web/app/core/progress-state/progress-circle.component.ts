import { Component, Input } from '@angular/core';

@Component({
  selector: 'progress-circle',
  template: require('./progress-circle.component.pug'),
  styles: [require('./progress-circle.component.scss')],
})
export class ProgressCircleComponent {
  @Input() value = 0.0;
  @Input() info: string;
  @Input() color: string;
  @Input() backgroundColor: string;
  @Input() infinite: boolean;
  constructor() {
  }

  getSmallAngle() {
    let angle = Math.round(180 * (this.value || 0));
    return `rotate(${angle}deg)`;
  }

  getLargeAngle() {
    let angle = Math.round(360 * (this.value || 0));
    return `rotate(${angle}deg)`;
  }
}
