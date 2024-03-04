import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, EventEmitter, Output, HostListener} from '@angular/core';

@Component({
  selector: 'app-state-node',
  templateUrl: './state-node.component.html',
  styleUrl: './state-node.component.scss'
})
export class StateNodeComponent {

  // @ViewChild('infoField', { static: false }) infoField!: ElementRef;
  @ViewChild('bottomCircle', { static: false }) bottomCircle!: ElementRef;
  @ViewChild('topCircle', { static: false }) topCircle!: ElementRef;

  rectangleHeight: number = 0;

  ngAfterViewInit(): void {
    // Set initial rectangle height based on the text field height
    // this.rectangleHeight = this.infoField.nativeElement.offsetHeight;
    // let bottomCirclePos = this.getBottomCircleMidpointPosition();
  }

  // You might need to call this method whenever the informationText changes.
  updateRectangleHeight(): void {
    // this.rectangleHeight = this.infoField.nativeElement.offsetHeight;
  }

  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() title: string = 'State Node';
  @Input() informationText: string = 'Information about the state node';
  @Input() id: number = -1;
  @Output() circleDrag: EventEmitter<{nodeId: number}> = new EventEmitter<{nodeId: number}>();
  @Output() nodeDrag: EventEmitter<void> = new EventEmitter<void>();
  @Output() topCircleEnter: EventEmitter<{nodeId: number}> = new EventEmitter<{nodeId: number}>();
  @Output() topCircleLeave: EventEmitter<{nodeId: number}> = new EventEmitter<{nodeId: number}>();


  // @HostListener('mouseenter') onMouseEnter() {
  //   console.log('Mouse entered');
  // }

  // @HostListener('mouseleave') onMouseLeave() {
  //   console.log('Mouse left');
  // }

  onTopCircleEnter(event: MouseEvent) {
    console.log('Top circle entered', this.id);
    this.topCircleEnter.emit({nodeId: this.id});
  }

  onTopCircleLeave(event: MouseEvent) {
    console.log('Top circle left', this.id);
    this.topCircleLeave.emit({nodeId: this.id});
  }

  

  onNodeDrag(event: MouseEvent) {
    console.log('StateNode: Node drag');
    this.nodeDrag.emit();
  }

  onBotCircleDrag(event: MouseEvent): void {
    console.log('StateNode: Mouse down');
    this.circleDrag.emit({nodeId: this.id});
  }


  // Method to get the position of the midpoint of the bottom circle
  getBottomCircleMidpointPosition(): { x: number, y: number } {
    const rect = this.bottomCircle.nativeElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    return { x, y };
  }

  getTopCircleMidpointPosition(): { x: number, y: number } {
    const rect = this.topCircle.nativeElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    return { x, y };
  }
}
