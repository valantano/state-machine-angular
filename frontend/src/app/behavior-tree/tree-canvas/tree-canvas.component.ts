import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, QueryList, ViewChildren, ChangeDetectorRef, OnInit } from '@angular/core';
import { StateNodeComponent } from '../state-node/state-node.component';
import { TransitionEdgeComponent } from '../transition-edge/transition-edge.component';
import { StateNode } from '../state-node/state-node';
import { StateNodeInterface } from '../state-node-blueprint/state-node-interface';
import { TransitionEdge } from '../transition-edge/transition-edge';
import { BehaviorTreeService } from '../behavior-tree.service';
import { state } from '@angular/animations';
import { v4 as uuidv4 } from 'uuid';



@Component({
  selector: 'app-tree-canvas',
  templateUrl: './tree-canvas.component.html',
  styleUrl: './tree-canvas.component.scss',
})
export class TreeCanvasComponent implements AfterViewInit, OnInit{

  @ViewChildren(StateNodeComponent) stateNodes!: QueryList<StateNodeComponent>;   // if x,y values change the corresponding x,y values in nodes also changes
  @ViewChildren(TransitionEdgeComponent) transitionEdges!: QueryList<TransitionEdgeComponent>;

  nodes: { [id: string]: StateNode } = {};
  node_interfaces: {[id: number]: StateNodeInterface } = {};
  edges: { [id: string]: TransitionEdge } = {};
  
  startXCircle: number = 0;
  startYCircle: number = 0;
  private startXNode: number = 0;
  private startYNode: number = 0;
  currentX: number = 0;
  currentY: number = 0;
  isDrawing: boolean = false;
  private outputGate: string = "Default";
  private sourceNodeId: string = "";        // The id of the node that the line is being drawn from ("" if nothing is being drawn currently)
  private targetNodeId: string = "";        // The id of the node that the line is being drawn to ("" if no node is being hovered over while drawing)

  

  private isDragging = false;
  private draggedNode: any; // Change the type as per your node structure

  

  constructor(private cdRef: ChangeDetectorRef, private behaviorTreeService: BehaviorTreeService) { 
  }

  ngOnInit(): void {
    this.behaviorTreeService.getMockInterfaceData().subscribe((data: any) => {
      console.log('TreeCanvas: getMockInterfaceData', data);
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

    this.behaviorTreeService.getMockNodeData().subscribe((data: any) => {
      console.log('TreeCanvas: getMockNodeData', data);
      for (let node of data.StateMachine.stateNodes) {
        this.createNode(node.title, node.x, node.y, this.node_interfaces[node.stateId], node.nodeId);
        for (let transition in node.transitions) {
          this.addEdge(node.nodeId, node.transitions[transition], transition);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.redrawEdges();
    this.cdRef.detectChanges();
  }

  // Redraws the edges between the nodes
  // This is either called by the redrawEdgesJob or when the nodes are being dragged
  // Or in the end of the mouseUp event to also draw the possible new edge
  redrawEdges() {
    this.transitionEdges.forEach(edge => {
      const sourceNode = this.getStateNodeComponentById(edge.sourceId);
      const targetNode = this.getStateNodeComponentById(edge.targetId);
      if (sourceNode && targetNode) {
        const sourceCircle = sourceNode.getBottomCircleScreenPosition(edge.sourceNodeOutputGate);
        const targetCircle = targetNode.getTopCircleMidpointPosition();

        [edge.startX, edge.startY] = this.offsetXYCoords(sourceCircle.x, sourceCircle.y);
        [edge.endX, edge.endY] = this.offsetXYCoords(targetCircle.x, targetCircle.y);
      }
    });
  }

  private scale = 1;
  // @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    console.log('TreeCanvas: Wheel');
    // Zoom in or out
    event.preventDefault();
    if (event.deltaY < 0) {
      this.scale *= 1.1;
    } else {
      this.scale *= 0.9;
    }
    const state_nodes = document.querySelectorAll('.state-node') as NodeListOf<HTMLElement>;
    // const drawing_edge = document.querySelector('.drawing-edge') as HTMLElement;
    // const drawn_edges = document.querySelectorAll('.drawn-edge') as NodeListOf<HTMLElement>;

    if (state_nodes) {
      state_nodes.forEach(node => { node.style.transform = `scale(${this.scale})` });
    }
    // if (drawing_edge) {
    //   drawing_edge.style.transform = `scale(${this.scale})`;
    // }
    // if (drawn_edges) {
    //   drawn_edges.forEach(edge => { 
    //     const path = edge.querySelector('.pathclass') as HTMLElement;
    //     path.style.setProperty('--stroke-width', `${1 / this.scale}px`) });
    // }
    this.redrawEdges();
  }

  // Either draws a line between the clicked bottom circle and the current mouse position
  // or drags the node that was clicked
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    // console.log('TreeCanvas: Mouse move');
    if (this.isDrawing) {
      [this.currentX, this.currentY] = this.offsetXYCoords(event.clientX, event.clientY);
    }
    if (this.isDragging && this.draggedNode) {
      this.draggedNode.x = event.x - this.startXNode;
      this.draggedNode.y = event.y - this.startYNode;
      this.redrawEdges();
      console.log('TreeCanvas: Dragged node', this.nodes[this.draggedNode.nodeId].x);
    }
  }

  // If mouse is released stop drawing and dragging. And delete all temporary variables used for drawing and dragging
  // Also update positions such that the edges are drawn correctly.
  @HostListener('document:mouseup', ['$event'])
  onMouseUp() {
    console.log('TreeCanvas: Mouse up');
    if (this.isDrawing) {
      const sourceId = this.sourceNodeId;   // make sure values are not changed during the drawing
      const targetId = this.targetNodeId;
      const outputGate = this.outputGate;
      if (sourceId == "" || targetId == "") {
        console.error('TreeCanvas: Invalid source or target id');
      } else {
        this.addEdge(sourceId, targetId, outputGate);
      }
  
      this.isDrawing = false;
      this.sourceNodeId = "";
      this.targetNodeId = "";
    }
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedNode = null;
    }
    this.redrawEdges();
  }

  // Listens to Output circleDrag from StateNodeComponent
  // If app-state-node emits the circleDrag event it means that the bottom circle was clicked
  // Then everything is prepared to start drawing a line from the bottom circle to the current mouse position
  // The actual drawing happens in the onMouseMove event
  handleCircleDrag(eventWithId: any) {
    console.log('TreeCanvas: handleCircleDrag', eventWithId);
    const circlepos = eventWithId.circlepos;
    this.outputGate = eventWithId.outputGate
    this.isDrawing = true;
    this.sourceNodeId = eventWithId.nodeId;

    [this.startXCircle, this.startYCircle] = this.offsetXYCoords(circlepos.x, circlepos.y);
    [this.currentX, this.currentY] = this.offsetXYCoords(circlepos.x, circlepos.y);
  }

  handleTopCircleEnter(eventWithId: any) {
    console.log('TreeCanvas: handleTopCircleEnter', eventWithId);
    if (this.isDrawing) { this.targetNodeId = eventWithId.nodeId; }
  }
  handleTopCircleLeave() {
    console.log('TreeCanvas: handleTopCircleLeave');
    if (this.isDrawing) { this.targetNodeId = ""; }
  }

  // Listens to Output nodeDrag from StateNodeComponent
  // If app-state-node emits the nodeDrag event it means that the outer rectangle was clicked
  // Then everything is prepared to start dragging the node
  // The actual dragging happens in the onMouseMove event
  handleNodeDrag(eventWithId: any) {
    console.log('TreeCanvas: handleNodeDrag', eventWithId);
    const event = eventWithId.mouseEvent;
    this.draggedNode = this.getStateNodeById(eventWithId.nodeId);
    this.startXNode = event.clientX - this.draggedNode.x;
    this.startYNode = event.clientY - this.draggedNode.y;
    this.isDragging = true;
  }

  offsetXYCoords(x: number, y: number): [number, number] {
    const graphRect = (document.querySelector('.graph') as HTMLElement).getBoundingClientRect();  // for offest to get screen position to graph container position
    return [x - graphRect.left, y - graphRect.top];
  }

  getStateNodeComponentById(id: string): StateNodeComponent | undefined {
    if (this.stateNodes) {
    return this.stateNodes.find(node => node.nodeId === id);
    } else {
      return undefined;
    }
  }

  getStateNodeById(id: number): StateNode | undefined {
    return this.nodes[id];
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
