import { Injectable, EventEmitter, QueryList } from '@angular/core';
import { StateNodeComponent } from '../state-node/state-node.component';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {
  
  // editor -> tree-canvas
  public nodeCreatedEvent: EventEmitter<{mouseEvent: MouseEvent, nodeId: string}> = new EventEmitter<{mouseEvent: MouseEvent, nodeId: string}>();
  
  // state-node -> editor
  public nodeDeleteEvent: EventEmitter<{nodeId: string}> = new EventEmitter<{nodeId: string}>();
  
  // tree-canvas -> editor
  public edgeDeleteEventWorkaround: EventEmitter<{sourceNodeId: string, targetNodeId: string, outputGate: string}> = new EventEmitter<{sourceNodeId: string, targetNodeId: string, outputGate: string}>();
  
  // tree-canvas -> editor
  public edgeDeleteEvent: EventEmitter<{edgeId: string}> = new EventEmitter<{edgeId: string}>();
  
  // tree-canvas -> editor
  public setStartNodeEvent: EventEmitter<{targetNodeId: string}> = new EventEmitter<{targetNodeId: string}>();


  // start-node -> editor
  public startEvent: EventEmitter<void> = new EventEmitter<void>();
  public resetEvent: EventEmitter<void> = new EventEmitter<void>();
  public stopEvent: EventEmitter<void> = new EventEmitter<void>();


  constructor() {
  }
}