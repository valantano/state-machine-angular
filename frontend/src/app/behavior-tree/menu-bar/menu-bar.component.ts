import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.scss'
})
export class MenuBarComponent {

  @Output() saveClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() loadClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() undoClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() redoClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() configNameChange: EventEmitter<string> = new EventEmitter<string>();

  @Output() importClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() exportClick: EventEmitter<void> = new EventEmitter<void>();

  @Input() executionRunning: boolean = true;
  @Input() not_saved: boolean = false;
  @Input() canUndo: boolean = false;
  @Input() canRedo: boolean = false;

  @Input() configName: string = '';
  configNameTmp: string = '';


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
    if (this.canUndo) {
      console.log('MenuBar: Undo button clicked');
      this.undoClick.emit();
    }
  }
  onClickRedo(event: any): void {
    // event.stopPropagation();
    if (this.canRedo) {
      console.log('MenuBar: Redo button clicked');
      this.redoClick.emit();
    }
  }

  // Send configNameChanged event if the field is changed
  onFieldEnter(): void {
    console.log('MenuBar: Field entered');
    this.configNameTmp = this.configName;
  }
  onFieldLeft(): void {
    console.log('MenuBar: Field left');
    if (this.configNameTmp !== this.configName) {
      this.configNameChange.emit(this.configName);
    }
  }

}
