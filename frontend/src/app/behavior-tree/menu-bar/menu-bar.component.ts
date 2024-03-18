import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.scss'
})
export class MenuBarComponent {

  @Output() saveClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() loadClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() importClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() exportClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() undoClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() redoClick: EventEmitter<void> = new EventEmitter<void>();


  onClickSave(): void {
    console.log('MenuBar: Save button clicked');
    this.saveClick.emit();
  }

  onClickLoad(): void {
    console.log('MenuBar: Load button clicked');
    this.loadClick.emit();
  }
  onClickImport(): void {
    console.log('MenuBar: Import button clicked');
    this.importClick.emit();
  }
  onClickExport(): void {
    console.log('MenuBar: Export button clicked');
    this.exportClick.emit();
  }
  onClickUndo(): void {
    console.log('MenuBar: Undo button clicked');
    this.undoClick.emit();
  }
  onClickRedo(): void {
    console.log('MenuBar: Redo button clicked');
    this.redoClick.emit();
  }

}
