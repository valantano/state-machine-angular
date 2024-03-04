import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateNodeComponent } from './state-node/state-node.component';
import { TransitionEdgeComponent } from './transition-edge/transition-edge.component';
import { TreeCanvasComponent } from './tree-canvas/tree-canvas.component';



@NgModule({
  declarations: [
    StateNodeComponent,
    TransitionEdgeComponent,
    TreeCanvasComponent
  ],
  imports: [
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class BehaviorTreeModule { }

