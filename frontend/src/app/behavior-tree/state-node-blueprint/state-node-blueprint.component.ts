import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-state-node-blueprint',
  templateUrl: './state-node-blueprint.component.html',
  styleUrl: './state-node-blueprint.component.scss'
})
export class StateNodeBlueprintComponent {

  @Input() title: string = 'State Node';
  @Input() infoText: string = 'Information about the state node';
  @Input() nodeId: number = -1;
  @Input() outputGates: string[] = ["Default"];

  onBlueprintNodeDrag(event: MouseEvent) {
    console.log('StateNodeBlueprint: Blueprint drag');
  }

}
