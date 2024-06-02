import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorTreeService } from '../behavior-tree.service';
import { TransitionEdge, StateNode, StateNodeInterface, ExecutionStatus, TransitionStatus } from './data_model';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { SharedServiceService } from './shared-service.service';
import { Subscription, interval, switchMap } from 'rxjs';



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
  startStateNodeId: string = "";

  // Data structures passed to the tree-canvas component
  nodes: { [id: string]: StateNode } = {};
  node_interfaces: { [id: number]: StateNodeInterface } = {};
  node_interfaces_list: StateNodeInterface[] = [];
  edges: { [id: string]: TransitionEdge } = {};
  freshlyCreatedNodeId: string = "";

  infoTerminalMsgs: string[] = [""];

  unsavedChanges: boolean = false;
  executing: boolean = false;


  nodeDeleteSub: Subscription;
  edgeDeleteSubWorkaround: Subscription;
  edgeDeleteSub: Subscription;
  setStartNodeSub: Subscription;
  startEventSub: Subscription;
  stopEventSub: Subscription;
  resetEventSub: Subscription;

  statusUpdateSub!: Subscription;
  
  constructor(private router: Router, private behaviorTreeService: BehaviorTreeService, private sharedService: SharedServiceService) {
    const navigation = this.router.getCurrentNavigation();
    if (!navigation) {
      throw new Error('Navigation is null');
    }

    const state = navigation.extras.state as { filename: string, smId: number };
    this.stateMachineId = state.smId;
    this.filename = state.filename;
    console.log('Editor: Opened File', state.filename, "with StateMachineId", state.smId);

    this.nodeDeleteSub = this.sharedService.nodeDeleteEvent.subscribe((event) => {
      this.deleteNode(event.nodeId);
    });
    this.edgeDeleteSubWorkaround = this.sharedService.edgeDeleteEventWorkaround.subscribe((event) => {
      this.deleteEdgeWorkaround(event.sourceNodeId, event.targetNodeId, event.outputGate);
    });
    this.edgeDeleteSub = this.sharedService.edgeDeleteEvent.subscribe((event) => {
      this.deleteEdge(event.edgeId);
    });
    this.setStartNodeSub = this.sharedService.setStartNodeEvent.subscribe((event) => {
      this.setStartNode(event.targetNodeId);
    });
    this.startEventSub = this.sharedService.startEvent.subscribe(() => {
      this.handleStartClick();
    });
    this.stopEventSub = this.sharedService.stopEvent.subscribe(() => {
      this.handleStopClick();
    });
    this.resetEventSub = this.sharedService.resetEvent.subscribe(() => {
      this.handleResetClick();
    });

    this.loadComponent();

  }

  loadComponent() {   // TODO: ensure InterfaceData is received first before getConfigData is called.
    this.behaviorTreeService.getInterfaceData(this.stateMachineId).subscribe((data: any) => {
      console.log('Editor <- backend: getInterfaceData', data);
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
      console.log('Editor <- backend: getConfigData', data);
      this.name = data.state_machine_config.name;
      this.lastModified = data.state_machine_config.lastModified;
      this.creationDate = data.state_machine_config.creationDate;
      this.description = data.state_machine_config.description;
      this.startStateNodeId = data.state_machine_config.startStateNode;
      for (let node of data.state_machine_config.stateNodes) {
        if (node.input_parameters === undefined) {
          node.input_parameters = {};
        }
        this.createNode(node.title, node.x, node.y, this.node_interfaces[node.stateId], node.input_parameters, node.nodeId);
        for (let transition in node.transitions) {
          this.addEdge(node.nodeId, node.transitions[transition], transition);
        }
      }
      const converted_data = this.convertToConfigData();
      if (!_.isEqual(converted_data, data)) {
        throw new Error('Editor: Data conversion failed - convertToConfigData() function does not work correctly!!!');
      }
    });
  }


  handleNodeCreate(eventWithStateId: any) {
    const mouse = eventWithStateId.mouseEvent;
    const stateId = eventWithStateId.stateId;
    this.freshlyCreatedNodeId = this.createNode('State Node', mouse.clientX, mouse.clientY, this.node_interfaces[stateId], {});
    console.log('Editor -> TreeCanvas: Node created', stateId);
    this.sharedService.nodeCreatedEvent.emit({mouseEvent: mouse, nodeId: this.freshlyCreatedNodeId});
  }

  createNode(title: string, x: number, y: number, state_interface: StateNodeInterface, input_parameters: {}, nodeId?: string): string {
    nodeId = nodeId ? nodeId : uuidv4();
    if (this.nodes[nodeId]) {
      throw new Error(`Editor: Node with id ${nodeId} already exists`);
    }
    const newNode: StateNode = {
      nodeId: nodeId,
      x: x,
      y: y,
      title: title,
      state_interface: state_interface,
      input_parameters: input_parameters,
      executionStatus: ExecutionStatus.Unknown
    }
    this.nodes[newNode.nodeId] = newNode;
    return newNode.nodeId;
  }

  deleteNode(nodeId: string): void {
    console.log('Editor <--sharedService-- StateNode: deleteNode', nodeId);
    this.unsavedChanges = true;
    delete this.nodes[nodeId];
    for (let edgeId in this.edges) {
      let edge = this.edges[edgeId];
      if (edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId) {
        delete this.edges[edgeId];
      }
    }
    if (this.startStateNodeId === nodeId) {
      this.startStateNodeId = "";
    }
  }

  // Workaround on how to delete edges.
  deleteEdgeWorkaround(sourceNodeId: string, targetNodeId: string, outputGate: string): void {
    console.log('Editor: deleteEdge', sourceNodeId, targetNodeId, outputGate);
    this.unsavedChanges = true;
    if (sourceNodeId === "start-node") {
      this.startStateNodeId = "";
    } else {
      const edge = this.findEdge(sourceNodeId, outputGate);
      if (edge) {
        delete this.edges[edge.id];
      }
    }
  }
  findEdge(sourceNodeId: string, sourceNodeOutputGate: string): any {
    return Object.values(this.edges).find(edge => 
      edge.sourceNodeId === sourceNodeId && edge.sourceNodeOutputGate === sourceNodeOutputGate
    );
  }
  deleteEdge(edgeId: string): void {
    console.log('Editor: deleteEdge', edgeId);
    this.unsavedChanges = true;
    delete this.edges[edgeId];
  }

  handleNodeDragEvent(): void {
    console.log('Editor <- TreeCanvas: Node was dragged. Unsaved Changes.');
    this.unsavedChanges = true;
  }

  handleAddEdgeEvent(event: any): void {
    // sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string
    console.log("Editor <- TreeCanvas: Add Edge")
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
      targetNodeId: targetNodeId,
      transitionStatus: TransitionStatus.Unknown
    }

    console.log('Editor: addEdge', newEdge);
    this.edges[newEdge.id] = newEdge;
  }
  setStartNode(nodeId: string): void {
    this.unsavedChanges = true;
    this.startStateNodeId = nodeId;
  }

  // Warn user if they try to leave the page with unsaved changes
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.unsavedChanges) {
      $event.returnValue = true;
    } else {
      $event.returnValue = "";
    }
  }

  handleStopClick(): void {
    console.log('Editor <--sharedService-- StartNode: Stop button clicked');
  }

  handleResetClick(): void {
    this.resetNodeStatus(ExecutionStatus.Unknown);
    this.updateInfoTerminal([""]);
  }

  handleStartClick(): void {
    console.log('Editor <--sharedService-- StartNode: Start button clicked');
    const configData = this.convertToConfigData();
    this.executing = true;
    this.resetNodeStatus(ExecutionStatus.NotExecuted);
    this.startAskingForStatusUpdates();
    this.behaviorTreeService.startStateMachine(this.stateMachineId, configData).subscribe((data: any) => {
      console.log('Editor -> backend: startStateMachine', data);
      this.executing = false;
      this.stopAskingForStatusUpdates();
      this.behaviorTreeService.getStatusUpdate(this.stateMachineId).subscribe((data: any) => this.handleStatusUpdate(data))}); // receive final status update
  }
  
////////////////////////////// Status Update Code //////////////////////////////
  startAskingForStatusUpdates(): void {
    this.statusUpdateSub = interval(500)
      .pipe(
        switchMap(() => this.behaviorTreeService.getStatusUpdate(this.stateMachineId))
      )
      .subscribe((data: any) => {
        this.handleStatusUpdate(data);
      });
  }
  stopAskingForStatusUpdates(): void {
    if (this.statusUpdateSub) {
      this.statusUpdateSub.unsubscribe();
    }
  }

  handleStatusUpdate(statusUpdate: any): void {
    console.log('Data from backend:', statusUpdate);
    this.updateNodeStatus(statusUpdate['node_status'])
    this.updateInfoTerminal(statusUpdate['log_msgs'])
  }

  updateInfoTerminal(logMsgs: any): void {
    this.infoTerminalMsgs = logMsgs;
  }

  updateNodeStatus(nodeStatusData: any): void {
    // nodeStatusData is a dict with stateId as key and the status as value
    for (const nodeId in nodeStatusData) {
      this.nodes[nodeId].executionStatus = nodeStatusData[nodeId]
    }
  }

  resetNodeStatus(status: ExecutionStatus): void {
    for (const nodeId in this.nodes) {
      this.nodes[nodeId].executionStatus = status
    }
  }
////////////////////////////// Status Update Code //////////////////////////////

  

  handleSaveClick(): void {
    console.log('Editor <- MenuBar: Save button clicked');
    this.saveStateMachineConfig();
  }
  saveStateMachineConfig(): void {
    const configData = this.convertToConfigData();
    this.behaviorTreeService.saveConfigData(this.stateMachineId, this.filename, configData).subscribe((data: any) => {
      console.log('Editor -> backend: saveStateMachineConfig', data);
      if (data.success) {
        this.unsavedChanges = false;
      }
    });
  }
  renameConfig(newName: string): void {
    this.name = newName;
    this.unsavedChanges = true;
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
        "transitions": nodeTransitions,
        "input_parameters": node.input_parameters
      });
    }

    const jsonObject = {    // store the data in the format that the backend expects including the stateNodes from above
      "state_machine_config": {
        "name": this.name,
        "lastModified": this.lastModified,
        "creationDate": this.creationDate,
        "description": this.description,
        "startStateNode": this.startStateNodeId, // Assuming the first node is the start node
        "stateNodes": stateNodes
      }
    };
    console.log('Editor: convertToConfigData', jsonObject);
    return jsonObject
  }
}
