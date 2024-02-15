import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';

import { catchError, max } from 'rxjs';
import { WzlStateMachineService } from './wzl-state-machine.service';
import { MatDialog } from '@angular/material/dialog';
import { ControlPopupComponent } from '../control-popup/control-popup.component';


@Component({
  selector: 'app-wzl-state-machine',
  templateUrl: './wzl-state-machine.component.html',
  styleUrl: './wzl-state-machine.component.scss'
})
export class WzlStateMachineComponent implements OnInit {
  states: string[] = [];
  cy: any;
 

  data: any;
  connectionStatus: boolean = false;
  ongoingActionStatus: boolean = false;
  logs: string[] = [];

  log(message: string) {
    this.logs.push(message);
    console.log(message);
  }

  constructor(private wzlSMService: WzlStateMachineService, public dialog: MatDialog) {
    this.changeActivationStatus = this.changeActivationStatus.bind(this);
  }

  openControlArmDialog(): void {
    const dialogRef = this.dialog.open(ControlPopupComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.log('Selected option: ');
      this.controlArm(result);
    });
  }
  controlArm(data: any) { // data = {option: "pose/joint/named", data: "PoseVals/JointVals/Defalut"}
    this.log('Control Arm signal sent, waiting to finish action'  + data['option'] + ', data: ' + data['data'])
    this.ongoingActionStatus = true;
    this.wzlSMService.sendControlArm(data).subscribe(response => {
      this.log('Arm movement finished.');
      this.ongoingActionStatus = false;
    });
  }

  getLampTitle(): string {
    if (this.ongoingActionStatus) {
      return 'Action is ongoing';
    } else if (this.connectionStatus) {
      return 'Connection is active';    
    } else {
      return 'Connection is interrupted';
    }
  }


  simulateSolelyState(stateName: string) {
    this.ongoingActionStatus = true;
    this.log('Executing selected states: ' + stateName + ', waiting to finish action...');
    this.wzlSMService.sendSimulateSolelyState(stateName).subscribe(response => {
      this.log('Execution Complete.');
      this.ongoingActionStatus = false;
    });
  }

  openGripper() {
    this.log('Open Gripper signal sent, waiting to finish action...');
    this.wzlSMService.sendOpenGripper().subscribe(response => {
      this.log('Gripper opened');
    });
  }

  closeGripper() {
    this.log('Close Gripper signal sent, waiting to finish action...');
    this.wzlSMService.sendCloseGripper().subscribe(response => {
      this.log('Gripper closed');
    });
  }

  

  // spinRobot() {
  //   this.log('Spin Robot signal sent, waiting to finish action...')
  //   this.wzlSMService.sendSpinRobot().subscribe(response => {
  //     this.log('Robot spun around.');
  //   });
  // }

  // checkLocalization() {
  //   this.log('Check Localization signal sent, waiting to finish action...')
  //   this.wzlSMService.sendCheckLocalization().subscribe(response => {
  //     this.log('Localization checked.');
  //   });
  // }

  // moveBaseToPos() {
  //   this.log('Move Base to Position signal sent, waiting to finish action...')
  //   this.wzlSMService.sendMoveBaseToPos().subscribe(response => {
  //     this.log('Base moved to position.');
  //   });
  // }

  // moveArmToScanPoses() {
  //   this.log('Move Arm to Scan Poses signal sent, waiting to finish action...')
  //   this.wzlSMService.sendMoveArmToScanPoses().subscribe(response => {
  //     this.log('Arm moved to scan poses.');
  //   });
  // }

  // checkStableDetect() {
  //   this.log('Check Stable Object Detection signal sent, waiting to finish action...')
  //   this.wzlSMService.sendCheckStableDetect().subscribe(response => {
  //     this.log('Stable object detected.');
  //   });
  // }




  // Clicking on Nodes to change the corresponding state's activation status.
  // If a state is not active the state machine in the backend will skip it.
  changeActivationStatus(event: any) {
    const node = event.target;
    const nodeName = node.id();
    var oldNodeClass = '';  var newNodeClass = '';

    if (node.hasClass('active')) {
      newNodeClass = 'inactive';    oldNodeClass = 'active';
    } else if (node.hasClass('inactive')) {
      newNodeClass = 'active';      oldNodeClass = 'inactive';
    } else {
      return;   // Nothing to do here
    }

    this.log('Trying to update status of ' + nodeName + ' from ' + oldNodeClass + ' to ' + newNodeClass + '.');
    this.wzlSMService.updateNodeStatus(nodeName, newNodeClass).subscribe(response => {
      if (response.success) {
        node.removeClass(oldNodeClass);
        node.addClass(newNodeClass);
        this.log('Updated status of ' + nodeName + ' from ' + oldNodeClass + ' to ' + newNodeClass + '.');
      } else {
        this.log('Failed to update node status.');
      }
    }, error => {
      console.error('Error', error);
    });

  }


  ngOnInit(): void {

    this.wzlSMService.startCheckingBackendConnection(5000).subscribe(response => {
      if (response.connectionActive != this.connectionStatus) {
        this.log(this.connectionStatus ? 'Connection lost.' : 'Connection established.');
      }
      this.connectionStatus = response.connectionActive;
      this.ongoingActionStatus = response.ongoingActions;
      console.log(response);
    });

    this.wzlSMService.getData().pipe(catchError((error) => {
      console.error('Error', error, "Using mock data instead.");
      this.log('Could not fetch State Machine States. Using mock data instead.');
      return this.wzlSMService.getMockData();
    })).subscribe(response => {
      this.data = response;
      console.log('Data:', this.data);

      for (const stateKey in this.data) {
        if (this.data.hasOwnProperty(stateKey)) {
          const state = stateKey;
          this.states.push(state);
        }
      }

      this.initCytoscape();

      this.cy.on('tap', 'node', this.changeActivationStatus);
    });
  }

  getMaxStateNameLength() {
    let max = 0;
    for (const stateKey in this.data) {
      if (this.data.hasOwnProperty(stateKey)) {
        const state = this.data[stateKey];
        if (state.state.length > max) {
          max = state.state.length;
        }
      }
    }
    return max;
  }

  // Many Initialization steps for cytoscape.
  initCytoscape() {
    const nodes = [];
    const edges = [];

    const maxStateNameLength = this.getMaxStateNameLength();

    // Create nodes and edges
    for (const stateKey in this.data) {
      if (this.data.hasOwnProperty(stateKey)) {
        const state = this.data[stateKey];
        if (stateKey == 'START') {
          nodes.push({ data: { id: state.state }, classes: 'start' });
        } else {
          nodes.push({ data: { id: state.state }, classes: 'active' });
        }
        for (const transitionKey in state.transitions) {
          if (state.transitions.hasOwnProperty(transitionKey)) {
            edges.push({ data: { source: state.state, target: state.transitions[transitionKey] } });
          }
        }
      }
    }
    cytoscape.use(cola);

    const layoutOptions = {
      name: 'cola',
      animate: false, // whether to show the layout as it's running
      refresh: 1, // number of ticks per frame; higher is faster but more jerky
      maxSimulationTime: 50000, // max length in ms to run the layout
      ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
      fit: true, // on every layout reposition of nodes, fit the viewport
      padding: 20, // padding around the simulation
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

      // layout event callbacks
      ready: function () { }, // on layoutready
      stop: function () { }, // on layoutstop
      nodeSpacing: 10,
      // nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes

      // positioning options
      randomize: false, // use random node positions at beginning of layout
      avoidOverlap: true, // if true, prevents overlap of node bounding boxes
      handleDisconnected: true, // if true, avoids disconnected components from overlapping
      convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
      flow: { axis: 'x', minSeparation: 300 }, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
      alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
      gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
      centerGraph: false, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

      // different methods of specifying edge length
      // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
      edgeLength: 150, // sets edge length directly in simulation
      edgeSymDiffLength: 50, // symmetric diff edge length in simulation
      edgeJaccardLength: 50, // jaccard edge length in simulation

      // iterations of cola algorithm; uses default values on undefined
      unconstrIter: undefined, // unconstrained initial layout iterations
      userConstIter: undefined, // initial layout iterations with user-specified constraints
      allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
    };

    // Initialize Cytoscape
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      elements: {
        nodes: nodes,
        edges: edges
      },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'black',
            'label': 'data(id)',
            'shape': 'rectangle',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': maxStateNameLength * 11 / 2 + 'px',
            'width': 'label',
            'height': 35 + 'px',
            'border-color': '#000',
            'border-width': '1px',
            'text-overflow-wrap': 'anywhere', // Ensure text overflow is handled
            // 'text-padding': '10px',
            // 'white-space': 'pre-wrap',
            'opacity': 1,
          }
        },
        {
          selector: 'node.start',
          style: {
            'shape': 'star',
            'width': '70px',
            'height': '70px',
            'background-color': 'grey'
          }
        },
        {
          selector: 'node.active',
          style: {
            'background-color': 'green',
            'opacity': 0.8
          }
        },
        {
          selector: 'node.inactive',
          style: {
            'background-color': 'red'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': 'grey',
            'target-arrow-color': 'black',
            'target-arrow-shape': 'triangle',
            'curve-style': 'unbundled-bezier'
          }
        },
      ],
      layout: layoutOptions
    });

  }
}