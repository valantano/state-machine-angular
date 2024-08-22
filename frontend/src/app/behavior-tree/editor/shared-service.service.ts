import { Injectable, EventEmitter, QueryList } from '@angular/core';
import { StateNodeComponent } from '../state-node/state-node.component';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {
  

  ////////// control-panel -> editor -> tree-canvas //////////
  // control-panel -> editor
  public createNode: EventEmitter<{mouseEvent: MouseEvent, stateId: string}> = new EventEmitter<{mouseEvent: MouseEvent, stateId: string}>();
  // editor -> tree-canvas
  public nodeCreatedEvent: EventEmitter<{mouseEvent: MouseEvent, nodeId: string}> = new EventEmitter<{mouseEvent: MouseEvent, nodeId: string}>();
  ///////////////////////////////////////

  ////////// state-node -> editor //////////
  public nodeDeleteEvent: EventEmitter<{nodeId: string}> = new EventEmitter<{nodeId: string}>();
  public inputParameterChangedEvent: EventEmitter<void> = new EventEmitter<void>();
  ///////////////////////////////////////

  ////////// start-node -> editor //////////
  public startEvent: EventEmitter<void> = new EventEmitter<void>();
  public resetEvent: EventEmitter<void> = new EventEmitter<void>();
  public stopEvent: EventEmitter<void> = new EventEmitter<void>();
  ///////////////////////////////////////
  
  ////////// tree-canvas -> editor //////////
  public nodeDragEvent: EventEmitter<{ nodeId: string,  dX: number, dY: number }> = new EventEmitter<{ nodeId: string,  dX: number, dY: number }>();
  public setStartNodeEvent: EventEmitter<{targetNodeId: string}> = new EventEmitter<{targetNodeId: string}>();
  public addEdgeEvent: EventEmitter<{srcNodeId: string, targetNodeId: string, outputGate: string}> = new EventEmitter<{srcNodeId: string, targetNodeId: string, outputGate: string}>();
  public edgeDeleteEventWorkaround: EventEmitter<{srcNodeId: string, targetNodeId: string, outputGate: string}> = new EventEmitter<{srcNodeId: string, targetNodeId: string, outputGate: string}>();
  public edgeDeleteEvent: EventEmitter<{edgeId: string}> = new EventEmitter<{edgeId: string}>();
  public deleteSelectedEvent: EventEmitter<void> = new EventEmitter<void>();
  ///////////////////////////////////////
  

  constructor() {
  }
}