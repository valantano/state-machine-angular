import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {

  stateMachineId: number = 0;
  configId: number = 0;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (!navigation) {
      throw new Error('Navigation is null');
    }
  
    const state = navigation.extras.state as {configId: number, smId: number};
    this.stateMachineId = state.smId;
    this.configId = state.configId;
    console.log('EditorComponent: File', state.configId, state.smId);
  }
}
