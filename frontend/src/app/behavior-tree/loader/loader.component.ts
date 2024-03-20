import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BehaviorTreeService } from '../behavior-tree.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateConfigDialogComponent } from '../create-config-dialog/create-config-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';


interface StateMachineList {
  [key: number]: StateMachine;
}

export interface File {
  name: string;
  filename: string;
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
  constructor(private router: Router, private service: BehaviorTreeService, private dialog: MatDialog) {
    this.loadComponent();
  }

  loadComponent() {
    this.service.getAvailableSMsandConfigs().subscribe((data: any) => {
      console.log('LoaderComponent: getAvailableSMsandConfigs', data);

      for (let sm_data of data.state_machines) {
        const sm: StateMachine = {name: sm_data.name, id: sm_data.id, configs: sm_data.configs};
        console

        this.state_machines[sm.id] = sm;
      }
      if (Object.keys(this.state_machines).length > 0 && this.selectedOption === "") {
        this.selectedOption = Object.keys(this.state_machines)[0];
      }

      console.log(this.state_machines)

    });
  }

  onFileClick(file: File) {
    const navigationExtras: NavigationExtras = {
      state: {
        filename: file.filename,
        smId: this.selectedOption
      }
    };
    this.router.navigate(['/editor'], navigationExtras);
  }

  onRename(file: File) {
    console.log('LoaderComponent: Rename file', file);
  }
  onDelete(file: File) {
    console.log('LoaderComponent: Delete file', file);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: {
        message: 'Are you sure you want to delete ' + file.filename + '?'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.deleteConfig(this.selectedOption, file.filename).subscribe((data: any) => {
          console.log('LoaderComponent: deleteConfig', data);
          this.loadComponent();
        });
      }
    });
    
  }

  onAdd() {
    console.log('LoaderComponent: Open Create Config Dialog');
    const dialogRef = this.dialog.open(CreateConfigDialogComponent, {
      width: '450px',
      // height: '400px',
      data: {},
      // panelClass: 'create-config-dialog'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('LoaderComponent: Create Config Dialog was closed with: ', result);
      if (result) {
        this.service.createNewConfig(this.selectedOption, result.config_name, result.description).subscribe((data: any) => {
          console.log('LoaderComponent: createNewConfig', data);
          this.loadComponent();
        });
      }
      // You can use the result here
    });
  }

}