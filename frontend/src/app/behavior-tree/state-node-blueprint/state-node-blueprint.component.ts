import { Component, Input } from '@angular/core';
import { StateNodeInterface } from '../editor/data_model';

@Component({
  selector: 'app-state-node-blueprint',
  templateUrl: './state-node-blueprint.component.html',
  styleUrl: './state-node-blueprint.component.scss'
})
export class StateNodeBlueprintComponent {

  // @Input() title: string = 'State Node';
  // @Input() infoText: string = 'Information about the state node';
  // @Input() nodeId: number = -1;
  // @Input() outputGates: string[] = ["Default"];

  @Input() state_interface!: StateNodeInterface;

  onBlueprintNodeDrag(event: MouseEvent) {
    console.log('StateNodeBlueprint: Blueprint drag');
  }

  getDisplayTitle(): string {
    return this.state_interface.name;
  }

  parInterfaceNotEmpty(): boolean {
    return Object.keys(this.state_interface.input_par_interface).length > 0;
  }

  getRequiredGlobalVars(): string[] {
    return this.state_interface.global_vars_interface.requires;
  }

}
