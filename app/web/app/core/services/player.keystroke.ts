import { NgZone } from '@angular/core';

enum keyCodes {
    spacebar	= 32,
    leftArrow	= 37,
    upArrow		= 38,
    rightArrow	= 39,
    downArrow	= 40,
    escape	= 27
};

export class PlayerKeyStroke {
  
  private handleKeyDown;
  private player;

  constructor(private zone: NgZone, player) {
    this.player = player;
    this.handleKeyDown = this.onHandleKeyDown.bind(this);
  }

  startOrPause() {
		this.player.togglePause();
	}

  onHandleKeyDown(e: KeyboardEvent) {
    switch (e.which) {
      case keyCodes.spacebar:
        this.zone.run(() => { 
          this.startOrPause();
        });
        break;
      case keyCodes.leftArrow:
        break;
      case keyCodes.rightArrow:
        break;
      case keyCodes.downArrow:
        break;
      case keyCodes.upArrow:
        break;
      default:
        return;
    }
  }

  subscribeEvent() {
    document.addEventListener('keydown', this.handleKeyDown, true);
  }

  unsubscribeEvent() {
    document.removeEventListener('keydown', this.handleKeyDown, true);
  }
}