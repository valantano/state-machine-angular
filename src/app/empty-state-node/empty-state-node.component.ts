import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state-node',
  templateUrl: './empty-state-node.component.html',
  styleUrl: './empty-state-node.component.scss'
})
export class EmptyStateNodeComponent {

  @Input() grid: number = 0;
  @Input() row: number = 0;
}
