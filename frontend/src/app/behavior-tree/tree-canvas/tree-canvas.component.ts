import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, QueryList, ViewChildren, ChangeDetectorRef, OnInit } from '@angular/core';
import { StateNodeComponent } from '../state-node/state-node.component';
import { TransitionEdgeComponent } from '../transition-edge/transition-edge.component';
import { StateNode } from '../state-node/state-node';
import { TransitionEdge } from '../transition-edge/transition-edge';
import { BehaviorTreeService } from '../behavior-tree.service';


@Component({
  selector: 'app-tree-canvas',
  templateUrl: './tree-canvas.component.html',
  styleUrl: './tree-canvas.component.scss',
})
export class TreeCanvasComponent implements AfterViewInit, OnInit{

  @ViewChildren(StateNodeComponent) stateNodes!: QueryList<StateNodeComponent>;
  @ViewChildren(TransitionEdgeComponent) transitionEdges!: QueryList<TransitionEdgeComponent>;

  nodes: { [id: number]: StateNode } = {};
  edges: { [id: number]: TransitionEdge } = {};
  
  startXCircle: number = 0;
  startYCircle: number = 0;
  private startXNode: number = 0;
  private startYNode: number = 0;
  currentX: number = 0;
  currentY: number = 0;
  isDrawing: boolean = false;
  private outputGate: string = "Default";
  private botCircleNodeId: number = -1;
  private topCircleNodeId: number = -1;

  private intervalId: any;

  private isDragging = false;
  private draggedNode: any; // Change the type as per your node structure

  

  constructor(private cdRef: ChangeDetectorRef, private behaviorTreeService: BehaviorTreeService) { 
    // this.createNode('State 1', 'Information about state 1sdfjdsjfklaefjnfkjgnflkjgbkflrhj ldkeoijnvkdejosdkl', 100, 100);
    // this.createNode('State 2', 'Information about state 1', 400, 200);
    // this.createNode('State 3', 'Information about state 1', 400, 600);
    // this.addEdge(0, 1);
    console.log(this.nodes);
  }

  ngOnInit(): void {
    this.behaviorTreeService.getMockNodeData().subscribe((data: any) => {
      console.log('TreeCanvas: getMockNodeData', data);
      for (let node of data.StateMachine.stateNodes) {
        this.addNode(node.title, node.infoText, node.nodeId, node.outputs, node.x, node.y);
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

  ngOnDestroy() {
    this.stopRedrawEdgesJob();
  }

  // RedrawJob used to draw the edges between the nodes when the nodes are being dragged
  // The interval ensures they are redrawn every 10ms for a smooth dragging experience
  startRedrawEdgesJob() {
    console.log('TreeCanvas: startRedrawEdgesJob');
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.redrawEdges(), 10);
    }
  }
  stopRedrawEdgesJob() {
    console.log('TreeCanvas: stopRedrawEdgesJob');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  // Redraws the edges between the nodes
  // This is either called by the redrawEdgesJob or when the nodes are being dragged
  // Or in the end of the mouseUp event to also draw the possible new edge
  redrawEdges() {
    this.transitionEdges.forEach(edge => {
      const sourceNode = this.getStateNodeById(edge.sourceId);
      const targetNode = this.getStateNodeById(edge.targetId);
      if (sourceNode && targetNode) {
        const sourceCircle = sourceNode.getBottomCircleMidpointPosition(edge.sourceNodeOutputGate);
        const targetCircle = targetNode.getTopCircleMidpointPosition();
        edge.startX = sourceCircle.x;
        edge.startY = sourceCircle.y;
        edge.endX = targetCircle.x;
        edge.endY = targetCircle.y;
      }
    });
    if (!this.isDragging) {
      this.stopRedrawEdgesJob();  // Stop the job if the nodes are not being dragged
    }
  }

  // Either draws a line between the clicked bottom circle and the current mouse position
  // or drags the node that was clicked
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    // console.log('TreeCanvas: Mouse move');
    if (this.isDrawing) {
      // console.log(event.clientX, event.clientY);
      this.currentX = event.clientX;
      this.currentY = event.clientY;
    }
    if (this.isDragging && this.draggedNode) {
      this.draggedNode.x = event.clientX - this.startXNode;
      this.draggedNode.y = event.clientY - this.startYNode;
    }
  }

  // If mouse is released stop drawing and dragging. And delete all temporary variables used for drawing and dragging
  // Also update positions such that the edges are drawn correctly.
  @HostListener('document:mouseup', ['$event'])
  onMouseUp() {
    console.log('TreeCanvas: Mouse up');
    if (this.isDrawing) {
      const sourceId = this.botCircleNodeId;
      const targetId = this.topCircleNodeId;
      const outputGate = this.outputGate;
      if (sourceId == -1 && targetId == -1) {
        console.error('TreeCanvas: Invalid source or target id');
      } else {
        this.addEdge(sourceId, targetId, outputGate); // TODO: remove default
      }
  
      this.isDrawing = false;
      this.botCircleNodeId = -1;
      this.topCircleNodeId = -1;
      // Draw final line or handle other actions here
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
    const nodeId = eventWithId.nodeId;
    const outputGate = eventWithId.outputGate;    // TODO: currently not needed here. Maybe remove it from event
    const circlepos = eventWithId.circlepos;
    this.outputGate = outputGate
    this.isDrawing = true;
    this.botCircleNodeId = nodeId;
    this.startXCircle = circlepos.x;
    this.startYCircle = circlepos.y;
    this.currentX = circlepos.x;
    this.currentY = circlepos.y;
  }

  handleTopCircleEnter(eventWithId: any) {
    console.log('TreeCanvas: handleTopCircleEnter', eventWithId);
    if (this.isDrawing) {
      this.topCircleNodeId = eventWithId.nodeId;
    }
  }
  handleTopCircleLeave(eventWithId: any) {
    console.log('TreeCanvas: handleTopCircleLeave', eventWithId);
    if (this.isDrawing) {
      this.topCircleNodeId = -1;
    }
  }

  // Listens to Output nodeDrag from StateNodeComponent
  // If app-state-node emits the nodeDrag event it means that the outer rectangle was clicked
  // Then everything is prepared to start dragging the node
  // The actual dragging happens in the onMouseMove event
  handleNodeDrag() {
    console.log('TreeCanvas: handleNodeDrag');
    this.isDragging = true;
    this.startRedrawEdgesJob();
  }

  // If app-state-node is clicked save it in this.draggedNode such that it can be used in the onMouseMove event
  onNodeMouseDown(event: MouseEvent, node: any) { // Adjust the type of `node` as per your data structure
    this.draggedNode = node;
    this.startXNode = event.clientX - this.draggedNode.x;
    this.startYNode = event.clientY - this.draggedNode.y;
  }




  getStateNodeById(id: number): StateNodeComponent | undefined {
    if (this.stateNodes) {
    return this.stateNodes.find(node => node.nodeId === id);
    } else {
      return undefined;
    }
  }


  addNode(title: string, infoText: string, nodeId: number, outputGates: string[], x: number, y: number): void {
    if (this.nodes[nodeId]) {
      throw new Error(`Node with id ${nodeId} already exists`);
    }
    const newNode: StateNode = {
      nodeId: nodeId,
      x: x,
      y: y,
      title: title,
      infoText: infoText,
      outputGates: outputGates
    }
    this.nodes[newNode.nodeId] = newNode;
  }

  createNode(title: string, infoText: string, x: number, y: number): void {
    const newNode: StateNode = {
      title: title,
      infoText: infoText,
      nodeId: Object.keys(this.nodes).length,
      outputGates: ["Default"], // TODO: remove default
      x: x,
      y: y,
    }
    if (newNode.nodeId in this.nodes) {
      throw new Error(`Node with id ${newNode.nodeId} already exists`);
    }
    this.nodes[newNode.nodeId] = newNode;
  }

  addEdge(sourceNodeId: number, targetNodeId: number, sourceNodeOutputGate: string): void {
    const newEdge: TransitionEdge = {
      id: Object.keys(this.edges).length,
      sourceNodeId: sourceNodeId,
      sourceNodeOutputGate: sourceNodeOutputGate,
      targetNodeId: targetNodeId
    }
    console.log('TreeCanvas: addEdge', newEdge);
    this.edges[newEdge.id] = newEdge;
  }
}
