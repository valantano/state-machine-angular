import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, QueryList, ViewChildren, ChangeDetectorRef, OnInit } from '@angular/core';
import { StateNodeComponent } from '../state-node/state-node.component';
import { TransitionEdgeComponent } from '../transition-edge/transition-edge.component';
import { StateNode } from '../state-node/state-node';
import { TransitionEdge } from '../transition-edge/transition-edge';


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
  startXNode: number = 0;
  startYNode: number = 0;
  currentX: number = 0;
  currentY: number = 0;
  isDrawing: boolean = false;
  botCircleNodeId: number = -1;
  topCircleNodeId: number = -1;

  private intervalId: any;

  private isDragging = false;
  private draggedNode: any; // Change the type as per your node structure

  viewInitialized = false;

  

  constructor(private cdRef: ChangeDetectorRef) { 
    this.addNode(100, 100, 'State 1', 'Information about state 1sdfjdsjfklaefjnfkjgnflkjgbkflrhj ldkeoijnvkdejosdkl');
    this.addNode(400, 200, 'State 2', 'Information about state 1');
    this.addNode(400, 600, 'State 3', 'Information about state 1');
    this.addEdge(0, 1);
    console.log(this.nodes);
  }

  ngAfterViewInit(): void {
    
    this.redrawEdges();
    this.cdRef.detectChanges();
  }


  
  ngOnInit(): void {
    // this.intervalId = setInterval(() => this.redrawEdges(), 10);
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
        const sourceCircle = sourceNode.getBottomCircleMidpointPosition();
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
      if (sourceId == -1 && targetId == -1) {
        console.error('TreeCanvas: Invalid source or target id');
      } else {
        this.addEdge(sourceId, targetId);
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
    this.isDrawing = true;
    this.botCircleNodeId = nodeId;
    const circlepos = this.getBottomCirclePosition(nodeId);
    console.log(this.getBottomCirclePosition(nodeId).x);
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
    return this.stateNodes.find(node => node.id === id);
    } else {
      return undefined;
    }
  }

  getBottomCirclePosition(nodeId: number): { x: number, y: number } {
    const node = this.getStateNodeById(nodeId);
    if (node) {
      return node.getBottomCircleMidpointPosition();
    } else {
      return {x: 0, y: 0};
    }
  }

  getTopCirclePosition(nodeId: number): { x: number, y: number } {
    const node = this.getStateNodeById(nodeId);
    if (node) {
      return node.getBottomCircleMidpointPosition();
    } else {
      return {x: 200, y: 200};
    }
  }


  addNode(x: number, y: number, title: string, informationText: string): void {
    const newNode: StateNode = {
      id: Object.keys(this.nodes).length,
      x: x,
      y: y,
      title: title,
      informationText: informationText
    }
    this.nodes[newNode.id] = newNode;
  }

  addEdge(sourceNodeId: number, targetNodeId: number): void {
    const newEdge: TransitionEdge = {
      id: Object.keys(this.edges).length,
      sourceNodeId: sourceNodeId,
      targetNodeId: targetNodeId
    }
    console.log('TreeCanvas: addEdge', newEdge);
    this.edges[newEdge.id] = newEdge;
  }
}
