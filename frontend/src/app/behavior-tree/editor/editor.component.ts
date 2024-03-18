import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorTreeService } from '../behavior-tree.service';
import { TransitionEdge, StateNode, StateNodeInterface } from './data_model';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';



@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {

  // Needed to load data from backend
  stateMachineId: number = 0;
  filename: string = "";

  // Config properties
  name: string = "";
  lastModified: string = "";
  creationDate: string = "";
  description: string = "";
  startStateNode: string = "";

  // Data structures passed to the tree-canvas component
  nodes: { [id: string]: StateNode } = {};
  node_interfaces: { [id: number]: StateNodeInterface } = {};
  node_interfaces_list: StateNodeInterface[] = [];
  edges: { [id: string]: TransitionEdge } = {};

  unsavedChanges: boolean = false;



  constructor(private router: Router, private behaviorTreeService: BehaviorTreeService) {
    const navigation = this.router.getCurrentNavigation();
    if (!navigation) {
      throw new Error('Navigation is null');
    }

    const state = navigation.extras.state as { filename: string, smId: number };
    this.stateMachineId = state.smId;
    this.filename = state.filename;
    console.log('EditorComponent: File', state.filename, state.smId);

    
  }

  ngOnInit() {
    this.behaviorTreeService.getInterfaceData(this.stateMachineId).subscribe((data: any) => {
      console.log('TreeCanvas: getInterfaceData', data);
      for (let state of data.states) {
        const node_interface: StateNodeInterface = {
          stateId: state.stateId,
          name: state.name,
          infoText: state.infoText,
          input_par_interface: state.input_par_interface,
          output_interface: state.output_interface }
        this.node_interfaces[state.stateId] = node_interface;
        this.node_interfaces_list.push(node_interface);
      }
    });

    this.behaviorTreeService.getConfigData(this.stateMachineId, this.filename).subscribe((data: any) => {
      console.log('TreeCanvas: getConfigData', data);
      this.name = data.state_machine_config.name;
      this.lastModified = data.state_machine_config.lastModified;
      this.creationDate = data.state_machine_config.creationDate;
      this.description = data.state_machine_config.description;
      this.startStateNode = data.state_machine_config.startStateNode;
      for (let node of data.state_machine_config.stateNodes) {
        this.createNode(node.title, node.x, node.y, this.node_interfaces[node.stateId], node.nodeId);
        for (let transition in node.transitions) {
          this.addEdge(node.nodeId, node.transitions[transition], transition);
        }
      }
      const converted_data = this.convertToConfigData();
      if (!_.isEqual(converted_data, data)) {
        throw new Error('EditorComponent: Data conversion failed - convertToConfigData() function does not work correctly!!!');
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

  handleNodeDragEvent(): void {
    console.log('EditorComponent: Node was dragged in tree-canvas. Unsaved Changes.');
    this.unsavedChanges = true;
  }

  handleAddNodeEvent(event: any): void {
    this.unsavedChanges = true;
  }

  handleAddEdgeEvent(event: any): void {
    // sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string
    const sourceNodeId = event.sourceNodeId;
    const targetNodeId = event.targetNodeId;
    const sourceNodeOutputGate = event.sourceNodeOutputGate;
    this.addEdge(sourceNodeId, targetNodeId, sourceNodeOutputGate);
    this.unsavedChanges = true;
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

  // Warn user if they try to leave the page with unsaved changes
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    console.log(this.unsavedChanges);
    if (this.unsavedChanges) {
      $event.returnValue = true;
    } else {
      $event.returnValue = "";
    }
  }

  handleSaveClick(): void {
    console.log('EditorComponent: Save button clicked');
    this.saveStateMachineConfig();
  }
  

  saveStateMachineConfig(): void {
    const configData = this.convertToConfigData();
    this.behaviorTreeService.saveConfigData(this.stateMachineId, this.filename, configData).subscribe((data: any) => {
      console.log('EditorComponent: saveStateMachineConfig', data);
      if (data.success) {
        this.unsavedChanges = false;
      }
    });
    
  }

  // Convert the data to the format that the backend expects
  convertToConfigData() {
    let transitions: { [soureNodeId: string]: { [outputGate: string]: string } } = {};  
    for (const edge of Object.values(this.edges)) { // for each node store the transitions
      if (!transitions[edge.sourceNodeId]) {
        transitions[edge.sourceNodeId] = {};
      }
      transitions[edge.sourceNodeId][edge.sourceNodeOutputGate] = edge.targetNodeId;
    }

    let stateNodes: {}[] = [];
    for (let node of Object.values(this.nodes)) {   // convert each node to the format that the backend expects incorporating the transitions from above
      const nodeTransitions = transitions[node.nodeId] ? transitions[node.nodeId] : {};
      stateNodes.push({
        "title": node.title,
        "nodeId": node.nodeId,
        "stateId": node.state_interface.stateId,
        "x": node.x,
        "y": node.y,
        "transitions": nodeTransitions
      });
    }

    const jsonObject = {    // store the data in the format that the backend expects including the stateNodes from above
      "state_machine_config": {
        "name": this.name,
        "lastModified": this.lastModified,
        "creationDate": this.creationDate,
        "description": this.description,
        "startStateNode": this.startStateNode, // Assuming the first node is the start node
        "stateNodes": stateNodes
      }
    };
    console.log('EditorComponent: convertToConfigData', jsonObject);
    return jsonObject
  }
}
