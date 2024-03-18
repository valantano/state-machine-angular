import { Component, Input } from '@angular/core';
import { StateNodeInterface } from '../editor/data_model';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.scss'
})
export class ControlPanelComponent {

  activated: boolean = true;

  @Input() node_interfaces: StateNodeInterface[] = [];

  switchActivationState(): void {
    this.activated = !this.activated;
  }

  onMouseDown(event: MouseEvent): void {
    console.log('ControlPanel: Mouse down');
  }

}
