import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorTreeService } from '../behavior-tree.service';
import { TransitionEdge, StateNode, StateNodeInterface, ExecutionStatus, TransitionStatus, Graph } from './data_model';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { SharedServiceService } from './shared-service.service';
import { Subscription, interval, switchMap } from 'rxjs';
import { AddEdgeCommand, AddNodeCommand, CommandManager, DeleteEdgeCommand, DeleteNodeCommand, DeleteSelectionCommand, SetStartNodeCommand } from './command_manager';



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

  // Data structures passed to the tree-canvas component
  graph: Graph;
  node_interfaces: { [id: number]: StateNodeInterface } = {};
  freshlyCreatedNodeId: string = "";

  infoTerminalMsgs: string[] = [];
  commandManager: CommandManager = new CommandManager(); 

  unsavedChanges: boolean = false;
  executing: boolean = false;

  addNodeSub: Subscription;
  deleteNodeSub: Subscription;
  addEdgeSub: Subscription;
  deleteEdgeSubWorkaround: Subscription;
  deleteEdgeSub: Subscription;
  setStartNodeSub: Subscription;
  deleteSelectionSub: Subscription;

  startEventSub: Subscription;
  stopEventSub: Subscription;
  resetEventSub: Subscription;

  recvStatusUpdateSub!: Subscription;
  statusUpdateSub!: Subscription;

  constructor(private router: Router, private behaviorTreeService: BehaviorTreeService, private sharedService: SharedServiceService) {
    const navigation = this.router.getCurrentNavigation();
    if (!navigation) {
      throw new Error('Navigation is null');
    }
    this.graph = new Graph();

    const state = navigation.extras.state as { filename: string, smId: number };
    this.stateMachineId = state.smId;
    this.filename = state.filename;
    console.log('Editor: Opened File', state.filename, "with StateMachineId", state.smId);

    this.addNodeSub = this.sharedService.createNode.subscribe((event) => {
      this.handleNodeCreate(event);
    });
    this.deleteNodeSub = this.sharedService.nodeDeleteEvent.subscribe((event) => {
      this.deleteNode(event.nodeId);
    });
    this.addEdgeSub = this.sharedService.addEdgeEvent.subscribe((event) => {
      this.addEdge(event.srcNodeId, event.targetNodeId, event.outputGate);
    });
    this.deleteEdgeSubWorkaround = this.sharedService.edgeDeleteEventWorkaround.subscribe((event) => {
      this.deleteEdgeWorkaround(event.srcNodeId, event.targetNodeId, event.outputGate);
    });
    this.deleteEdgeSub = this.sharedService.edgeDeleteEvent.subscribe((event) => {
      this.deleteEdge(event.edgeId);
    });
    this.deleteSelectionSub = this.sharedService.deleteSelectedEvent.subscribe(() => {
      this.deleteSelection()
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
        console.log('Editor: State', state.global_vars_interface);
        const node_interface: StateNodeInterface = {
          stateId: state.stateId,
          name: state.name,
          infoText: state.infoText,
          input_par_interface: state.input_par_interface,
          output_interface: state.output_interface,
          global_vars_interface: state.global_vars_interface
        }
        this.node_interfaces[state.stateId] = node_interface;
      }
    });

    this.behaviorTreeService.getConfigData(this.stateMachineId, this.filename).subscribe((data: any) => {
      console.log('Editor <- backend: getConfigData', data);
      this.name = data.state_machine_config.name;
      this.lastModified = data.state_machine_config.lastModified;
      this.creationDate = data.state_machine_config.creationDate;
      this.description = data.state_machine_config.description;
      this.graph.setStartNode(data.state_machine_config.startStateNode);
      for (let node of data.state_machine_config.stateNodes) {
        if (node.input_parameters === undefined) {
          node.input_parameters = {};
        }
        this.createNode(node.title, node.x, node.y, this.node_interfaces[node.stateId], node.input_parameters, node.nodeId);
        for (let transition in node.transitions) {
          
          this.graph.addEdge(node.nodeId, node.transitions[transition], transition);
        }
      }
      const converted_data = this.convertToConfigData();
      if (!_.isEqual(converted_data, data)) {
        throw new Error('Editor: Data conversion failed - convertToConfigData() function does not work correctly!!!');
      }

      this.commandManager.reset();
    });
  }


  handleNodeCreate(eventWithStateId: any) {
    const mouse = eventWithStateId.mouseEvent;
    const stateId = eventWithStateId.stateId;
    this.freshlyCreatedNodeId = this.createNode('State Node', mouse.clientX, mouse.clientY, this.node_interfaces[stateId], {});
    console.log('Editor -> TreeCanvas: Node created', stateId);
    this.sharedService.nodeCreatedEvent.emit({ mouseEvent: mouse, nodeId: this.freshlyCreatedNodeId });
  }

  createNode(title: string, x: number, y: number, state_interface: StateNodeInterface, input_parameters: {}, nodeId?: string): string {
    nodeId = nodeId ? nodeId : uuidv4();
    if (this.graph.getNode(nodeId)) {
      throw new Error(`Editor: Node with id ${nodeId} already exists`);
    }
    const newNode: StateNode = new StateNode(nodeId, x, y, title, state_interface, input_parameters, ExecutionStatus.Unknown);
    this.commandManager.execute(new AddNodeCommand(newNode, this.graph));
    // this.graph.addNode(newNode);
    return newNode.nodeId;
  }

  deleteNode(nodeId: string): void {
    console.log('Editor <--sharedService-- StateNode: deleteNode', nodeId);
    this.unsavedChanges = true;
    this.commandManager.execute(new DeleteNodeCommand(this.graph.getNode(nodeId), this.graph));
  }

  // Workaround on how to delete edges.
  deleteEdgeWorkaround(sourceNodeId: string, targetNodeId: string, outputGate: string): void {
    console.log('Editor: deleteEdge', sourceNodeId, targetNodeId, outputGate);
    this.unsavedChanges = true;
    if (sourceNodeId === "start-node") {
      this.setStartNode("");
    } else {
      this.commandManager.execute(new DeleteEdgeCommand(this.graph.findEdge(sourceNodeId, outputGate).id, this.graph));
    }
  }
  
  deleteEdge(edgeId: string): void {
    console.log('Editor: deleteEdge', edgeId);
    this.unsavedChanges = true;
    this.commandManager.execute(new DeleteEdgeCommand(edgeId, this.graph));
  }

  deleteSelection(): void {
    console.log('Editor <--sharedService-- TreeCanvas: deleteSelection');
    this.unsavedChanges = true;
    this.commandManager.execute(new DeleteSelectionCommand(this.graph));
  }

  handleNodeDragEvent(): void {
    console.log('Editor <- TreeCanvas: Node was dragged. Unsaved Changes.');
    this.unsavedChanges = true;
  }

  addEdge(sourceNodeId: string, targetNodeId: string, outputGate: string): void {
    console.log("Editor <- TreeCanvas: Add Edge")
    this.commandManager.execute(new AddEdgeCommand(sourceNodeId, targetNodeId, outputGate, this.graph));
    this.unsavedChanges = true;
  }

  setStartNode(nodeId: string): void {
    this.unsavedChanges = true;
    this.commandManager.execute(new SetStartNodeCommand(nodeId, this.graph));
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
    console.log('Editor -> backend: stopStateMachine');
    if (this.executing) {
      this.behaviorTreeService.stopStateMachine(this.stateMachineId).subscribe((data: any) => {
        console.log('Editor ', data)
        if (data.success && this.executing) {
          this.executing = false;
          this.stopAskingForStatusUpdates();
          this.infoTerminalMsgs.push('<<<<<<<<<< Execution stopped by user. >>>>>>>>>>>');
        } else {
          this.infoTerminalMsgs.push('Backend could not interrupt state machine... What :C???? -> This should not happen.');
        }
      });
    } else {
      this.infoTerminalMsgs.push('State Machine not running -> Cannot be stopped.');
    }
  }

  handleResetClick(): void {
    console.log('Editor <--sharedService-- StartNode: Reset button clicked');
    if (this.executing) {
      console.log('Editor: Resetting while executing not possible');
    } else {
      this.resetNodeStatus(ExecutionStatus.Unknown);
      this.updateInfoTerminal([]);
    }
  }

  handleStartClick(): void {
    console.log('Editor <--sharedService-- StartNode: Start button clicked');
    const configData = this.convertToConfigData();
    this.executing = true;
    this.resetNodeStatus(ExecutionStatus.NotExecuted);
    this.startAskingForStatusUpdates();
    console.log('Editor -> backend: startStateMachine');
    this.behaviorTreeService.startStateMachine(this.stateMachineId, configData).subscribe((data: any) => {
      console.log('Editor <- backend: state machine exection funished', data);
      this.executing = false;
      // this.behaviorTreeService.getStatusUpdate(this.stateMachineId).subscribe((data: any) => this.handleStatusUpdate(data))
    }); // receive final status update
  }

  ////////////////////////////// Status Update Code //////////////////////////////
  startAskingForStatusUpdates(): void {
    // Uses iosocket to receive status updates from the backend - does not request it but listens for it
    this.recvStatusUpdateSub = this.behaviorTreeService.recvStatusUpdates().subscribe((data: any) => {
      if (data['state_machine_status'] == 'Running') {
        this.handleStatusUpdate(data);
      } else {  // In the last status update before the sm is finished the status is not 'Running' but 'Finished' -> stop asking for status updates after last update
        this.stopAskingForStatusUpdates();
      }
    })
  }
  stopAskingForStatusUpdates(): void {
    console.log('Editor: stopAskingForStatusUpdates')
    if (this.recvStatusUpdateSub) {
      this.recvStatusUpdateSub.unsubscribe();
    }
  }

  handleStatusUpdate(statusUpdate: any): void {
    console.log('Backend -> Editor: Status Update:', statusUpdate);
    this.updateNodeStatus(statusUpdate['node_status'])
    this.updateInfoTerminal(statusUpdate['log_msgs'])
  }

  updateInfoTerminal(logMsgs: any): void {
    this.infoTerminalMsgs = logMsgs;
  }

  updateNodeStatus(nodeStatusData: any): void {
    // nodeStatusData is a dict with stateId as key and the status as value
    for (const nodeId in nodeStatusData) {
      this.graph.setNodeStatus(nodeId, nodeStatusData[nodeId]);
    }
  }

  resetNodeStatus(status: ExecutionStatus): void {
    for (const nodeId in this.graph.nodes) {
      this.graph.setNodeStatus(nodeId, status);
    }
  }
  ////////////////////////////// Status Update Code //////////////////////////////
  handleUndoClick(): void {
    this.commandManager.undo();
  }
  handleRedoClick(): void {
    this.commandManager.redo();
  }


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
    for (const edge of Object.values(this.graph.edges)) { // for each node store the transitions
      if (!transitions[edge.sourceNodeId]) {
        transitions[edge.sourceNodeId] = {};
      }
      transitions[edge.sourceNodeId][edge.sourceNodeOutputGate] = edge.targetNodeId;
    }

    let stateNodes: {}[] = [];
    for (let node of Object.values(this.graph.nodes)) {   // convert each node to the format that the backend expects incorporating the transitions from above
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
        "startStateNode": this.graph.startNode, // Assuming the first node is the start node
        "stateNodes": stateNodes
      }
    };
    console.log('Editor: convertToConfigData', jsonObject);
    return jsonObject
  }
}
