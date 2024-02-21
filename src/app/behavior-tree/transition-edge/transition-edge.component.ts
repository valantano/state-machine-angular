import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, HostListener} from '@angular/core';

@Component({
  selector: 'app-transition-edge',
  template: `<svg>
  <line [attr.x1]="startX" [attr.y1]="startY" [attr.x2]="endX" [attr.y2]="endY" />
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



}