import { Component } from '@angular/core';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.scss'
})
export class ControlPanelComponent {

  activated: boolean = true;

  switchActivationState(): void {
    this.activated = !this.activated;
  }

}
