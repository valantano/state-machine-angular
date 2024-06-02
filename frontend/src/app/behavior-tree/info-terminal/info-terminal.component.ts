import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { BehaviorTreeService } from '../behavior-tree.service';

@Component({
  selector: 'app-info-terminal',
  templateUrl: './info-terminal.component.html',
  styleUrl: './info-terminal.component.scss'
})
export class InfoTerminalComponent implements OnInit {

  @Input() message_buffer: string[] = [];
  isMinimized = false;
  constructor(private behaviorTreeService: BehaviorTreeService) { }

  ngOnInit(): void {
    this.behaviorTreeService.recvTerminalMessage().subscribe((message: string) => {
      this.message_buffer.push(message);
    });
  }
  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  minimizeButtonContent(): string {
    return this.isMinimized ? '▲' : '▼';
  }
}
