import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SharedServiceService } from '../editor/shared-service.service';

@Component({
  selector: 'app-start-node',
  templateUrl: './start-node.component.html',
  styleUrl: './start-node.component.scss'
})
export class StartNodeComponent {

  @ViewChild('bottomCircle', { static: false }) bottomCircle!: ElementRef;

  constructor(private sharedService: SharedServiceService) {

   }

  readonly title: string = 'Start Node';
  infoText: string = 'InfoText';
  readonly nodeId: string = "start-node"; 
  readonly outputGate: string = "Start";

  @Output() circleDrag: EventEmitter<{nodeId: string, outputGate: string, circlepos: {x: number, y: number}}> = new EventEmitter<{nodeId: string, outputGate: string, circlepos: {x: number, y: number}}>();


  onBotCircleDrag(): void {
    console.log('StartNode -> TreeCanvas: BotCircle Drag');
    this.circleDrag.emit({nodeId: this.nodeId, outputGate: this.outputGate, circlepos: this.getBottomCircleScreenPosition(this.outputGate)});
  }


  // Method to get the position of the midpoint of the bottom circle
  getBottomCircleScreenPosition(outputGate: string): { x: number, y: number } {
    const circle = this.bottomCircle.nativeElement;
    // const circleArray = this.bottomCircles.toArray();
    // const circle = circleArray.find(circle => circle.nativeElement.getAttribute('data-output-gate') === outputGate);
    

    if (circle) {
      const rect = circle.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      return {x: x, y: y};
    }

    throw new Error('StartNode: Circle not found');
  }

  onStart() {
    console.log('StartNode --sharedService--> Editor: Start clicked');
    this.sharedService.startEvent.emit();
  }
}
