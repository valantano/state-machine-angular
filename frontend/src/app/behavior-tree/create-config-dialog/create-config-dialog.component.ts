import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-your-dialog',
  template: `
    <h1 mat-dialog-title>{{dialog_type}} State Machine Config</h1>
    <div mat-dialog-content>
      <mat-form-field>
        <input matInput placeholder="Config Name (not filename)" [(ngModel)]="config_name" required>
      </mat-form-field>
      <mat-form-field>
        <input matInput placeholder="Description" [(ngModel)]="description">
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button [disabled]="!config_name" (click)="onCreate()">{{dialog_type}}</button>
    </div>
  `,
  styleUrl: './create-config-dialog.component.scss'
})
export class CreateConfigDialogComponent {
  config_name = '';
  description = '';
  create = true;
  dialog_type = 'Create';

  constructor(
    public dialogRef: MatDialogRef<CreateConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Injecting data
  ) {
    // Initialize form fields with injected data if available
    if (data) {
      this.config_name = data.config_name || '';
      this.description = data.description || '';
      this.create = data.create || true;
      if (!this.create) {
        this.dialog_type = 'Edit';
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    this.dialogRef.close({ config_name: this.config_name, description: this.description });
  }
}