import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StateNodeInterface } from '../editor/data_model';
import { SharedServiceService } from '../editor/shared-service.service';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.scss'
})
export class ControlPanelComponent {

  activated: boolean = true;

  constructor(private sharedService: SharedServiceService) {
  }

  @Input() node_interfaces: { [id: number]: StateNodeInterface } = {};

  switchActivationState(): void {
    this.activated = !this.activated;
  }

  onMouseDown(event: MouseEvent, stateId: number): void {
    console.log('ControlPanel: Mouse down', stateId);
    this.sharedService.createNode.emit({mouseEvent: event, stateId: stateId.toString()});
  }

}
