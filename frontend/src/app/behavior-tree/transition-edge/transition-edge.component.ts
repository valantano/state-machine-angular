import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, HostListener} from '@angular/core';

@Component({
  selector: 'app-transition-edge',
  template: `<svg>
  <!-- <line [attr.x1]="startX" [attr.y1]="startY" [attr.x2]="endX" [attr.y2]="endY" /> -->
  <path [attr.d]="getPath()" stroke="black" fill="transparent" stroke-linejoin="round" stroke-linecap="round" stroke-width="10"/>

</svg>`,
  styleUrl: './transition-edge.component.scss'
})
export class TransitionEdgeComponent {
  @Input() startX: number = 0;
  @Input() startY: number = 0;
  @Input() endX: number = 0;
  @Input() endY: number = 0;

  @Input() sourceId: number = -1;
  @Input() targetId: number = -1;

  getPath(): string {

    
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