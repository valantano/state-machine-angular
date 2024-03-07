import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WzlStateMachineComponent } from './wzl-state-machine/wzl-state-machine.component';
import { TreeCanvasComponent } from './behavior-tree/tree-canvas/tree-canvas.component';
import { EditorComponent } from './behavior-tree/editor/editor.component';

export const routes: Routes = [
// {path: '', redirectTo: '/home', pathMatch: 'full'},
// {path: 'home/wzl-state-machine', component: ProjectWzlStateMachineComponent},

{path: 'home', component: WzlStateMachineComponent},   // Wildcard route for a 404 page
{path: 'behavior-tree', component: EditorComponent},
{path: '**', component: EditorComponent}, 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}