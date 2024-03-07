import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, EventEmitter, Output, HostListener, ViewChildren, Query, QueryList} from '@angular/core';

@Component({
  selector: 'app-state-node',
  templateUrl: './state-node.component.html',
  styleUrl: './state-node.component.scss'
})
export class StateNodeComponent {

  // @ViewChild('infoField', { static: false }) infoField!: ElementRef;
  // @ViewChild('bottomCircle', { static: false }) bottomCircle!: ElementRef;
  @ViewChildren('bottomCircle') bottomCircles!: QueryList<ElementRef>;
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
  @Input() infoText: string = 'Information about the state node';
  @Input() nodeId: number = -1;
  @Input() outputGates: string[] = ["Default"];
  @Output() circleDrag: EventEmitter<{nodeId: number, outputGate: string, circlepos: {x: number, y: number}}> = new EventEmitter<{nodeId: number, outputGate: string, circlepos: {x: number, y: number}}>();
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
    console.log('Top circle entered', this.nodeId);
    this.topCircleEnter.emit({nodeId: this.nodeId});
  }

  onTopCircleLeave(event: MouseEvent) {
    console.log('Top circle left', this.nodeId);
    this.topCircleLeave.emit({nodeId: this.nodeId});
  }

  onNodeDrag(event: MouseEvent) {
    console.log('StateNode: Node drag');
    this.nodeDrag.emit();
  }

  onBotCircleDrag(outputGate: string): void {
    console.log('StateNode: Mouse down');
    this.circleDrag.emit({nodeId: this.nodeId, outputGate: outputGate, circlepos: this.getBottomCircleMidpointPosition(outputGate)});
  }


  // Method to get the position of the midpoint of the bottom circle
  getBottomCircleMidpointPosition(outputGate: string): { x: number, y: number } {
    const circleArray = this.bottomCircles.toArray();
    const circle = circleArray.find(circle => circle.nativeElement.getAttribute('data-output-gate') === outputGate);

    if (circle) {
      const rect = circle.nativeElement.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      return {x: x, y: y};
    }

    throw new Error('Circle not found ' + outputGate);
  }

  getTopCircleMidpointPosition(): { x: number, y: number } {
    const rect = this.topCircle.nativeElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    return { x, y };
  }
}
