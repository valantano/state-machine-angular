import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, HostListener, ViewChild, ElementRef, OnInit} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { SharedServiceService } from '../editor/shared-service.service';
import { TransitionEdge } from '../editor/data_model';

@Component({
  selector: 'app-transition-edge',
  templateUrl: './transition-edge.component.html',
  styleUrl: './transition-edge.component.scss'
})
export class TransitionEdgeComponent {

  @Input() startX: number = 0;
  @Input() startY: number = 0;
  @Input() endX: number = 0;
  @Input() endY: number = 0;

  @Input() edgeId: string = "";
  @Input() sourceId: string = "";
  @Input() targetId: string = "";
  @Input() sourceNodeOutputGate: string = "Default";

  @ViewChild(MatMenuTrigger) contextMenuTrigger!: MatMenuTrigger;

  // This way only the last drawn edge is available to be hovered or selected
  // This is since for each edge a new svg is created and obscuring the previous one
  // To fix this one would need to only create one svg and draw all paths in this svg
  // This requires a different approach to draw the edges
  // TODO: Implement this

  getPath(): string { // Path is drawn in redrawEdges. There the soure and target ids are used. See tree-canvas
    console.log('TransitionEdge: getPath');
    if (this.startY > this.endY) {
      const belowStartY = this.startY + 50;
      const aboveEndY = this.endY - 50;
      let besideX;
      if (this.startX > this.endX) {
      
        besideX = Math.max(this.startX + 200, this.endX + 200);
      } else {
        besideX = Math.min(this.startX - 200, this.endX - 200);
      }

      return `M ${this.startX} ${this.startY} L ${this.startX} ${belowStartY} L ${besideX} ${belowStartY} L ${besideX} ${aboveEndY} L ${this.endX} ${aboveEndY} L ${this.endX} ${this.endY}`;
    } else {
      const controlPointStartX = this.startX;
      const controlPointEndX = this.endX;
      const controlPointStartY = this.startY + 100;
      const controlPointEndY = this.endY - 100;
      return `M ${this.startX} ${this.startY} C ${controlPointStartX} ${controlPointStartY} ${controlPointEndX} ${controlPointEndY} ${this.endX} ${this.endY}`;

    }
  }


  constructor(private sharedService: SharedServiceService) {
  }

  onRightClick(event: MouseEvent) {
    console.log('TransitionEdge: Right click', event);
    // event.preventDefault();
    // this.contextMenuTrigger.openMenu();
  }

  onDelete(){
    console.log('TransitionEdge: Delete', this.edgeId);
    // this.sharedService.edgeDeleteEvent.emit({edgeId: this.edgeId});
  }
  onMouseOver(event: MouseEvent) {
    // const target = event.target as SVGElement;
    // target.parentNode?.appendChild(target);
  }


}