import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BehaviorTreeService } from '../behavior-tree.service';


interface StateMachineList {
  [key: number]: StateMachine;
}

export interface File {
  name: string;
  id: number;
  description: string;
  creationDate: Date;
  lastModified: Date;
}

export interface StateMachine {
  name: string;
  id: number;
  configs: [];
}

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  state_machines: StateMachineList = {};
  selectedOption: any = "";

  // 'state_machines': [ {'name': 'WZL1', 'id': 0, 'states': states}, {'name': 'WZL2', 'id': 1, 'states': states}]
  constructor(private router: Router, private service: BehaviorTreeService) {
    this.service.getAvailableSMsandConfigs().subscribe((data: any) => {
      console.log('LoaderComponent: getAvailableSMsandConfigs', data);

      for (let sm_data of data.state_machines) {
        const sm: StateMachine = {name: sm_data.name, id: sm_data.id, configs: sm_data.configs};

        this.state_machines[sm.id] = sm;
      }

      console.log(this.state_machines)

    });
  }

  onFileClick(file: File) {
    const navigationExtras: NavigationExtras = {
      state: {
        configId: file.id,
        smId: this.selectedOption
      }
    };
    this.router.navigate(['/editor'], navigationExtras);
  }

  onRename(file: File) {
    console.log('Rename file', file);
  }
  onDelete(file: File) {
    console.log('Delete file', file);
    
  }

}