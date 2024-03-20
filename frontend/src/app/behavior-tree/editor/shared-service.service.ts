import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {

  public nodeCreatedEvent: EventEmitter<{mouseEvent: MouseEvent, nodeId: string}> = new EventEmitter<{mouseEvent: MouseEvent, nodeId: string}>();
  public nodeDeleteEvent: EventEmitter<{nodeId: string}> = new EventEmitter<{nodeId: string}>();
  public edgeDeleteEvent: EventEmitter<{sourceNodeId: string, targetNodeId: string, outputGate: string}> = new EventEmitter<{sourceNodeId: string, targetNodeId: string, outputGate: string}>();

  public redrawEdgesEvent: EventEmitter<void> = new EventEmitter<void>();


  constructor() {
  }
}