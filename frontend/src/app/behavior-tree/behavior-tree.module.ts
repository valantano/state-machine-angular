import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateNodeComponent } from './state-node/state-node.component';
import { TreeCanvasComponent } from './tree-canvas/tree-canvas.component';
import { OverlayComponent } from './overlay/overlay.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { EditorComponent } from './editor/editor.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { StateNodeBlueprintComponent } from './state-node-blueprint/state-node-blueprint.component';
import { LoaderComponent } from './loader/loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CreateConfigDialogComponent } from './create-config-dialog/create-config-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { StartNodeComponent } from './start-node/start-node.component';
import { DrawingEdgeComponent } from './drawing-edge/drawing-edge.component';
import { InfoTerminalComponent } from './info-terminal/info-terminal.component';
import { DragulaModule } from 'ng2-dragula';




@NgModule({
  declarations: [
    StateNodeComponent,
    TreeCanvasComponent,
    OverlayComponent,
    ControlPanelComponent,
    EditorComponent,
    MenuBarComponent,
    StateNodeBlueprintComponent,
    LoaderComponent,
    CreateConfigDialogComponent,
    ConfirmDialogComponent,
    StartNodeComponent,
    DrawingEdgeComponent,
    InfoTerminalComponent,
  ],
  imports: [
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    MatMenuModule,
    // DragulaModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class BehaviorTreeModule { }

