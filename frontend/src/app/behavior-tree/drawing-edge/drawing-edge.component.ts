import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-drawing-edge',
  templateUrl: './drawing-edge.component.html',
  styleUrl: './drawing-edge.component.scss'
})
export class DrawingEdgeComponent {
  @Input() startX: number = 0;
  @Input() startY: number = 0;
  @Input() endX: number = 0;
  @Input() endY: number = 0;


  getPath(): string { // Path is drawn in redrawEdges. There the soure and target ids are used. See tree-canvas
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


}
