import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WzlStateMachineComponent } from './wzl-state-machine/wzl-state-machine.component';

export const routes: Routes = [
// {path: '', redirectTo: '/home', pathMatch: 'full'},
// {path: 'home/wzl-state-machine', component: ProjectWzlStateMachineComponent},
{path: '**', component: WzlStateMachineComponent},   // Wildcard route for a 404 page

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}