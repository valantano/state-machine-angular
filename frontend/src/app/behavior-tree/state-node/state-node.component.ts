import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, EventEmitter, Output, HostListener, ViewChildren, Query, QueryList} from '@angular/core';
import { ExecutionStatus, StateNodeInterface } from '../editor/data_model';
import { MatMenuTrigger } from '@angular/material/menu';
import { SharedServiceService } from '../editor/shared-service.service';

@Component({
  selector: 'app-state-node',
  templateUrl: './state-node.component.html',
  styleUrl: './state-node.component.scss'
})
export class StateNodeComponent {

  @ViewChildren('bottomCircle') bottomCircles!: QueryList<ElementRef>;
  @ViewChild('topCircle', { static: false }) topCircle!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenuTrigger!: MatMenuTrigger;


  constructor(private sharedService: SharedServiceService) {
    if (this.state_interface === null) {
      throw new Error('StateNode: state_interface is null');
    }
   }


  @Input() inputParameters: {[key: string]: any} = {};

  @Input() title: string = "";
  @Input() nodeId: string = "";
  @Input() state_interface!: StateNodeInterface;
  @Input() executionStatus: ExecutionStatus = ExecutionStatus.Unknown;
  ExecutionStatus = ExecutionStatus;

  @Output() circleDrag: EventEmitter<{nodeId: string, outputGate: string, circlepos: {x: number, y: number}}> = new EventEmitter<{nodeId: string, outputGate: string, circlepos: {x: number, y: number}}>();
  @Output() nodeDrag: EventEmitter<{mouseEvent: MouseEvent, nodeId: string}> = new EventEmitter<{mouseEvent: MouseEvent, nodeId: string}>();
  @Output() topCircleEnter: EventEmitter<{nodeId: string}> = new EventEmitter<{nodeId: string}>();
  @Output() topCircleLeave: EventEmitter<void> = new EventEmitter<void>();


  onTopCircleEnter(event: MouseEvent) {
    console.log('StateNode -> TreeCanvas: Top circle entered', this.nodeId);
    this.topCircleEnter.emit({nodeId: this.nodeId});
  }

  onTopCircleLeave(event: MouseEvent) {
    console.log('StateNode -> TreeCanvas: Top circle left', this.nodeId);
    this.topCircleLeave.emit();
  }

  onNodeDrag(event: MouseEvent) {
    if (event.button === 0){
      console.log('StateNode -> TreeCanvas: Node dragged', this.nodeId);
      this.nodeDrag.emit({mouseEvent: event, nodeId: this.nodeId});
    }
  }

  onRightClick(event: MouseEvent) {
    console.log('StateNode: Right click', event);
    event.preventDefault();
    this.contextMenuTrigger.openMenu();
  }

  onDelete(){
    console.log('StateNode --sharedService--> Editor: Delete node', this.nodeId);
    this.sharedService.nodeDeleteEvent.emit({nodeId: this.nodeId});
  }

  onBotCircleDrag(outputGate: string): void {
    console.log('StateNode -> TreeCanvas: BotCircle Drag');
    this.circleDrag.emit({nodeId: this.nodeId, outputGate: outputGate, circlepos: this.getBottomCircleScreenPosition(outputGate)});
  }


  // Method to get the position of the midpoint of the bottom circle
  getBottomCircleScreenPosition(outputGate: string): { x: number, y: number } {
    const circleArray = this.bottomCircles.toArray();
    const circle = circleArray.find(circle => circle.nativeElement.getAttribute('data-output-gate') === outputGate);
    if (circle) {
      const rect = circle.nativeElement.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      return {x: x, y: y};
    }

    throw new Error('StateNode: Circle not found ' + outputGate);
  }

  getTopCircleMidpointPosition(): { x: number, y: number } {
    const rect = this.topCircle.nativeElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    return { x, y };
  }

  getDisplayTitle(): string {
    if (this.state_interface) {
      return this.state_interface.name + ' (' + this.title + ')';
    } else {
      return this.title;
    }
  }

  parInterfaceNotEmpty(): boolean {
    return Object.keys(this.state_interface.input_par_interface).length > 0;
  }
}
