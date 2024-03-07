import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateNodeComponent } from './state-node/state-node.component';
import { TransitionEdgeComponent } from './transition-edge/transition-edge.component';
import { TreeCanvasComponent } from './tree-canvas/tree-canvas.component';
import { OverlayComponent } from './overlay/overlay.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { EditorComponent } from './editor/editor.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { StateNodeBlueprintComponent } from './state-node-blueprint/state-node-blueprint.component';



@NgModule({
  declarations: [
    StateNodeComponent,
    TransitionEdgeComponent,
    TreeCanvasComponent,
    OverlayComponent,
    ControlPanelComponent,
    EditorComponent,
    MenuBarComponent,
    StateNodeBlueprintComponent
  ],
  imports: [
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class BehaviorTreeModule { }

