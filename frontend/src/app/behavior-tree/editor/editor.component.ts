import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorTreeService } from '../behavior-tree.service';
import { StateNode } from '../state-node/state-node';
import { StateNodeInterface } from '../state-node-blueprint/state-node-interface';
import { TransitionEdge } from '../transition-edge/transition-edge';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {

  stateMachineId: number = 0;
  filename: string = "";

  nodes: { [id: string]: StateNode } = {};
  node_interfaces: {[id: number]: StateNodeInterface } = {};
  edges: { [id: string]: TransitionEdge } = {};

  constructor(private router: Router, private behaviorTreeService: BehaviorTreeService) {
    const navigation = this.router.getCurrentNavigation();
    if (!navigation) {
      throw new Error('Navigation is null');
    }
  
    const state = navigation.extras.state as {filename: string, smId: number};
    this.stateMachineId = state.smId;
    this.filename = state.filename;
    console.log('EditorComponent: File', state.filename, state.smId);

    this.behaviorTreeService.getInterfaceData(this.stateMachineId).subscribe((data: any) => {
      console.log('TreeCanvas: getInterfaceData', data);
      for (let state of data.states) {
        this.node_interfaces[state.stateId] = {
          stateId: state.stateId,
          name: state.name,
          infoText: state.infoText,
          input_par_interface: state.input_par_interface,
          output_interface: state.output_interface
        }
      }
    });

    this.behaviorTreeService.getConfigData(this.stateMachineId, this.filename).subscribe((data: any) => {
      console.log('TreeCanvas: getConfigData', data);
      for (let node of data.state_machine_config.stateNodes) {
        this.createNode(node.title, node.x, node.y, this.node_interfaces[node.stateId], node.nodeId);
        for (let transition in node.transitions) {
          this.addEdge(node.nodeId, node.transitions[transition], transition);
        }
      }
    });
  }

  createNode(title: string, x: number, y: number, state_interface: StateNodeInterface, nodeId?: string): void {
    nodeId = nodeId ? nodeId : uuidv4();
    if (this.nodes[nodeId]) {
      throw new Error(`Node with id ${nodeId} already exists`);
    }
    const newNode: StateNode = {
      nodeId: nodeId,
      x: x,
      y: y,
      title: title,
      state_interface: state_interface
    }
    this.nodes[newNode.nodeId] = newNode;
  }

  handleAddEdgeEvent(event: any): void {
    // sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string
    const sourceNodeId = event.sourceNodeId;
    const targetNodeId = event.targetNodeId;
    const sourceNodeOutputGate = event.sourceNodeOutputGate;
    this.addEdge(sourceNodeId, targetNodeId, sourceNodeOutputGate);

  }

  addEdge(sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string): void {
    let existingEdgeId: string | null = null;

    for (let edgeId in this.edges) {
        let edge = this.edges[edgeId];
        if (edge.sourceNodeId === sourceNodeId && edge.sourceNodeOutputGate === sourceNodeOutputGate) {
            existingEdgeId = edge.id;
            break;
        }
    }

    const newEdge: TransitionEdge = {
        id: existingEdgeId !== null ? existingEdgeId : uuidv4(),
        sourceNodeId: sourceNodeId,
        sourceNodeOutputGate: sourceNodeOutputGate,
        targetNodeId: targetNodeId
    }

    console.log('TreeCanvas: addEdge', newEdge);
    this.edges[newEdge.id] = newEdge;
  }
}
