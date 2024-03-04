import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-control-popup',
  templateUrl: './control-popup.component.html',
  styleUrl: './control-popup.component.scss'
})
export class ControlPopupComponent {

  options: string[] = ['Default', 'Left', 'Right'];
  section1Active: boolean = false;
  section2Active: boolean = false;
  section3Active: boolean = false;
  selectedOption1: string = "Default";
  selectedOption2: string = "Default";
  selectedOption3: string = "Default";

  constructor(
    public dialogRef: MatDialogRef<ControlPopupComponent>,
  ) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onStartClick(): void {
    let data: any;
    if (this.section3Active) {
      data = {option: "pose", data: this.selectedOption3};
    } else if (this.section2Active) {
      data = {option: "joint", data: this.selectedOption2};
    } else {
      data = {option: "named", data: this.selectedOption1};
    }

    this.dialogRef.close(data);
  }

}
