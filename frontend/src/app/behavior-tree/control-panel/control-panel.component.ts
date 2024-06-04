import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StateNodeInterface } from '../editor/data_model';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.scss'
})
export class ControlPanelComponent {

  activated: boolean = true;

  // @Input() node_interfaces: StateNodeInterface[] = [];
  @Input() node_interfaces: { [id: number]: StateNodeInterface } = {};


  @Output() nodeCreate: EventEmitter<{mouseEvent: MouseEvent, stateId: string}> = new EventEmitter<{mouseEvent: MouseEvent, stateId: string}>();


  switchActivationState(): void {
    this.activated = !this.activated;
  }

  onMouseDown(event: MouseEvent, stateId: number): void {
    console.log('ControlPanel: Mouse down', stateId);
    this.nodeCreate.emit({mouseEvent: event, stateId: stateId.toString()});
  }

}
