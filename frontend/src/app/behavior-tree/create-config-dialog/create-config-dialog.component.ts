import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-your-dialog',
  template: `
    <h1 mat-dialog-title>Create new State Machine Config</h1>
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
      <button mat-button [disabled]="!config_name" (click)="onCreate()">Create</button>
    </div>
  `,
  styleUrl: './create-config-dialog.component.scss'
})
export class CreateConfigDialogComponent {
  config_name = '';
  description = '';

  constructor(public dialogRef: MatDialogRef<CreateConfigDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    this.dialogRef.close({ config_name: this.config_name, description: this.description });
  }
}