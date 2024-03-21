import { Injectable, EventEmitter, QueryList } from '@angular/core';
import { StateNodeComponent } from '../state-node/state-node.component';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {

  public nodeCreatedEvent: EventEmitter<{mouseEvent: MouseEvent, nodeId: string}> = new EventEmitter<{mouseEvent: MouseEvent, nodeId: string}>();
  public nodeDeleteEvent: EventEmitter<{nodeId: string}> = new EventEmitter<{nodeId: string}>();
  public edgeDeleteEventWorkaround: EventEmitter<{sourceNodeId: string, targetNodeId: string, outputGate: string}> = new EventEmitter<{sourceNodeId: string, targetNodeId: string, outputGate: string}>();
  public edgeDeleteEvent: EventEmitter<{edgeId: string}> = new EventEmitter<{edgeId: string}>();


  public sendStateNodeComponents: EventEmitter<{stateNodes: QueryList<StateNodeComponent>}> = new EventEmitter<{stateNodes: QueryList<StateNodeComponent>}>();

  public redrawEdgesEvent: EventEmitter<void> = new EventEmitter<void>();


  constructor() {
  }
}