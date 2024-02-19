import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { StateNodeComponent } from '../state-node/state-node.component';
import { TransitionEdgeComponent } from '../transition-edge/transition-edge.component';
import { StateNode } from '../state-node/state-node';
import { TransitionEdge } from '../transition-edge/transition-edge';


@Component({
  selector: 'app-tree-canvas',
  templateUrl: './tree-canvas.component.html',
  styleUrl: './tree-canvas.component.scss',
})
export class TreeCanvasComponent implements AfterViewInit {

  @ViewChildren(StateNodeComponent) stateNodes!: QueryList<StateNodeComponent>;
  nodes: { [id: number]: StateNode } = {};
  edges: { [id: number]: TransitionEdge } = {};
  bottomCirclePositions: { [id: number]: { x: number, y: number } } = {};
  topCirclePosition: { [id: number]: { x: number, y: number } } = {};

  startX: number = 0;
  startY: number = 0;
  currentX: number = 0;
  currentY: number = 0;
  isDrawing: boolean = false;
  circleNodeId: number = -1;

  constructor() {
    this.addNode(100, 100, 'State 1', 'Information about state 1sdfjdsjfklaefjnfkjgnflkjgbkflrhj ldkeoijnvkdejosdkl');
    this.addNode(400, 200, 'State 1', 'Information about state 1');
    console.log(this.nodes);
  }

  ngAfterViewInit(): void {
    this.stateNodes.forEach((stateNode) => {
      const bottomCirclePos = stateNode.getBottomCircleMidpointPosition();
      this.bottomCirclePositions[stateNode.id] = bottomCirclePos;
      const topCirclePos = stateNode.getTopCircleMidpointPosition();
      this.topCirclePosition[stateNode.id] = topCirclePos;
      //TODO: Add logic to draw edges
    });

    console.log("ngAfterViewInit bottomCirclePositions: ", this.bottomCirclePositions);
    console.log("ngAfterViewInit topCirclePosiitons", this.topCirclePosition);
  }


  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    console.log('Mouse move');
    if (this.isDrawing) {
      console.log(event.clientX, event.clientY);
      this.currentX = event.clientX;
      this.currentY = event.clientY;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp() {
    if (this.isDrawing) {
      this.isDrawing = false;
      // Draw final line or handle other actions here
    }
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedNode = null;
    }
  }

  getCircleStartPosition(nodeId: number): { x: number, y: number } {
    return this.bottomCirclePositions[nodeId];
  }

  getCircleEndPosition(nodeId: number): { x: number, y: number } {
    return this.topCirclePosition[nodeId];
  }

  handleCircleDrag(eventWithId: { event: MouseEvent, nodeId: number }) {
    console.log('TreeCanvas: handleCircleDrag', eventWithId);
    const event = eventWithId.event;
    const nodeId = eventWithId.nodeId;
    this.isDrawing = true;
    this.circleNodeId = nodeId;
    const circlepos = this.getCircleStartPosition(nodeId);
    this.startX = circlepos.x;
    this.startY = circlepos.y;
    this.currentX = circlepos.x;
    this.currentY = circlepos.y;
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
    this.edges[newEdge.id] = newEdge;
  }


  private isDragging = false;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private draggedNode: any; // Change the type as per your node structure

  // Mouse down event handler
  // onMouseDown(event: MouseEvent, node: any) { // Adjust the type of `node` as per your data structure
  //   this.isDragging = true;
  //   this.draggedNode = node;
  //   this.startX = event.clientX - this.draggedNode.x;
  //   this.startY = event.clientY - this.draggedNode.y;
  // }

  // Mouse move event handler
  onNodeSelectedForDrag() {
    if (this.isDragging && this.draggedNode) {
      // this.draggedNode.x = event.clientX - this.startX;
      // this.draggedNode.y = event.clientY - this.startY;
    }
  }


  // handleCircleDrag(eventWithId: { event: MouseEvent, nodeId: number }) {
  //   console.log('TreeCanvas: handleCircleDrag', eventWithId);
  //   const event = eventWithId.event;
  //   const nodeId = eventWithId.nodeId;
  //   this.isDrawing = true;
  //   this.circleNodeId = nodeId;
  //   const circlepos = this.getCircleStartPosition(nodeId);
  //   this.startX = circlepos.x;
  //   this.startY = circlepos.y;
  //   this.currentX = circlepos.x;
  //   this.currentY = circlepos.y;
  // }

}
