import { AfterViewChecked, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { BehaviorTreeService } from '../behavior-tree.service';

@Component({
  selector: 'app-info-terminal',
  templateUrl: './info-terminal.component.html',
  styleUrl: './info-terminal.component.scss'
})
export class InfoTerminalComponent implements OnInit, AfterViewChecked {

  @Input() message_buffer: string[] = [];
  @ViewChild('textterminal') infoTerminal!: ElementRef;
  isMinimized = false;
  constructor(private behaviorTreeService: BehaviorTreeService) { }

  ngOnInit(): void {
    
  }
  ngAfterViewChecked(): void {
    this.infoTerminal.nativeElement.scrollTop = this.infoTerminal.nativeElement.scrollHeight;
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  minimizeButtonContent(): string {
    return this.isMinimized ? '▲' : '▼';
  }
}
