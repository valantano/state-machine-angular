import { AfterViewInit, Component, HostListener, QueryList, ViewChildren, ChangeDetectorRef, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { StateNodeComponent } from '../state-node/state-node.component';
import { StateNode, TransitionEdge, StateNodeInterface, Graph } from '../editor/data_model';
import { SharedServiceService } from '../editor/shared-service.service';
import { Subscription } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { StartNodeComponent } from '../start-node/start-node.component';


@Component({
  selector: 'app-tree-canvas',
  templateUrl: './tree-canvas.component.html',
  styleUrl: './tree-canvas.component.scss',
})
export class TreeCanvasComponent implements AfterViewInit, OnInit {

  @ViewChildren(StateNodeComponent) stateNodes!: QueryList<StateNodeComponent>;   // if x,y values change the corresponding x,y values in nodes also changes
  @ViewChild(StartNodeComponent) startNode!: StartNodeComponent;

  // @Input() nodes: { [id: string]: StateNode } = {};                     // Given by EditorComponent by reference.
  @Input() node_interfaces: { [id: number]: StateNodeInterface } = {};  // Given by EditorComponent by reference.
  // @Input() edges: { [id: string]: TransitionEdge } = {};                // Given by EditorComponent by reference.
  @Input() startNodeId: string = "";
  @Input() graph: Graph = new Graph();

  @Output() addEdgeEvent: EventEmitter<{ sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string }> = new EventEmitter<{ sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string }>();
  @Output() nodeDragEvent: EventEmitter<void> = new EventEmitter<void>();

  // Used to drag nodes
  private startXNode: number = 0;
  private startYNode: number = 0;
  private draggingNode = false;
  private mouseDownOnNode = false;
  private draggedNode: any; // Change the type as per your node structure

  // Used to draw current drawing edge
  startXCircle: number = 0;
  startYCircle: number = 0;
  currentX: number = 0;
  currentY: number = 0;
  isDrawing: boolean = false;
  // Used to add Edge after successful drawing
  private outputGate: string = "";
  private sourceNodeId: string = "";        // The id of the node that the line is being drawn from ("" if nothing is being drawn currently)
  private targetNodeId: string = "";        // The id of the node that the line is being drawn to ("" if no node is being hovered over while drawing)


  nodeCreationSubscription: Subscription;

  constructor(private cdRef: ChangeDetectorRef, private sharedService: SharedServiceService) {
    this.nodeCreationSubscription = this.sharedService.nodeCreatedEvent.subscribe((event) => {
      console.log('TreeCanvas <--sharedService-- Editor: Node created', event);
      const [clientX, clientY] = this.graphXYToScreenXY(event.mouseEvent.clientX+200, event.mouseEvent.clientY+100);  // handleNodeDrag expects screen coordinates
      this.handleNodeDrag({ mouseEvent: { clientX: clientX, clientY: clientY }, nodeId: event.nodeId });
    });
  }

  ngOnInit() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      console.log('TreeCanvas: Delete key pressed');
      this.sharedService.deleteSelectionEvent.emit();
      this.sharedService.edgeDeleteEvent.emit({ edgeId: this.selectedEdgeId });
    }
  }

  ngAfterViewInit(): void {}

  // Scaling Not workin at the moment /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
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
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Either draws a line between the clicked bottom circle and the current mouse position
  // or moves the node that was dragged to cursor position
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const [mouseX, mouseY] = this.screenXYToGraphXY(event.clientX, event.clientY);
    if (this.isDrawing) {
      [this.currentX, this.currentY] = [mouseX, mouseY];
    }
    if (this.mouseDownOnNode && this.draggedNode) {
      console.log('TreeCanvas: Mouse move', mouseX, mouseY);
      this.draggingNode = true;
      this.draggedNode.x = mouseX - this.startXNode;
      this.draggedNode.y = mouseY - this.startYNode;
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
      if (sourceId != "" && targetId != "") {
        if (sourceId == "start-node") {
          this.setStartNode(targetId);
        }
        else {
          this.addEdge(sourceId, targetId, outputGate);
        }
      } else if (sourceId != "" && targetId == "") {
        this.deleteEdge(sourceId, targetId, outputGate);
      } else {
        console.error('TreeCanvas: Invalid source or target id');
      }
      this.isDrawing = false;
      this.sourceNodeId = "";
      this.targetNodeId = "";
    }
    if (this.draggingNode) {
      this.mouseDownOnNode = false;
      this.draggingNode = false;
      this.graph.deselectNode(this.draggedNode.nodeId);
      // this.graph.deselectAllNodes();
      this.draggedNode = null;
      this.nodeDragEvent.emit();
    } else if (this.mouseDownOnNode) {
      this.mouseDownOnNode = false;
    }
  }

  anythingClickedHandler() {
    console.log('TreeCanvas: Anything clicked');
    this.graph.deselectAllNodes();
  }

  addEdge(sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string): void {
    console.log('TreeCanvas -> Editor: addEdge', sourceNodeId, targetNodeId, sourceNodeOutputGate);
    this.sharedService.addEdgeEvent.emit({ srcNodeId: sourceNodeId, targetNodeId: targetNodeId, outputGate: sourceNodeOutputGate });
  }
  deleteEdge(sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string): void {
    console.log('TreeCanvas -> Editor: deleteEdge Workaround', sourceNodeId, targetNodeId, sourceNodeOutputGate);
    this.sharedService.edgeDeleteEventWorkaround.emit({ srcNodeId: sourceNodeId, targetNodeId: targetNodeId, outputGate: sourceNodeOutputGate });
  }
  setStartNode(targetNodeId: string): void {
    console.log('TreeCanvas -> Editor: setStartNode', targetNodeId);
    this.sharedService.setStartNodeEvent.emit({ targetNodeId: targetNodeId });
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Listens to Output circleDrag from StateNodeComponent
  // If app-state-node emits the circleDrag event it means that the bottom circle was clicked
  // Then everything is prepared to start drawing a line from the bottom circle to the current mouse position
  // The actual drawing happens in the onMouseMove event
  handleCircleDrag(eventWithId: any) {
    console.log('TreeCanvas <- StateNode: handleCircleDrag', eventWithId);
    const circlepos = eventWithId.circlepos;
    this.outputGate = eventWithId.outputGate
    this.isDrawing = true;
    this.sourceNodeId = eventWithId.nodeId;

    [this.startXCircle, this.startYCircle] = this.screenXYToGraphXY(circlepos.x, circlepos.y);
    [this.currentX, this.currentY] = this.screenXYToGraphXY(circlepos.x, circlepos.y);
  }
  handleTopCircleEnter(eventWithId: any) {
    console.log('TreeCanvas <- StateNode: handleTopCircleEnter', eventWithId);
    if (this.isDrawing) { this.targetNodeId = eventWithId.nodeId; }
  }
  handleTopCircleLeave() {
    console.log('TreeCanvas <- StateNode: handleTopCircleLeave');
    if (this.isDrawing) { this.targetNodeId = ""; }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Listens to Output nodeDrag from StateNodeComponent
  // If app-state-node emits the nodeDrag event it means that the outer rectangle was clicked
  // Then everything is prepared to start dragging the node
  // The actual dragging happens in the onMouseMove event
  handleNodeDrag(eventWithId: any) {
    console.log('TreeCanvas <- StateNode: handleNodeDrag', eventWithId);
    const event = eventWithId.mouseEvent;
    this.graph.selectNode(eventWithId.nodeId);
    this.draggedNode = this.graph.getNode(eventWithId.nodeId);

    const [x,y] = this.screenXYToGraphXY(event.clientX, event.clientY);

    this.startXNode = x - this.draggedNode.x;
    this.startYNode = y - this.draggedNode.y;
    this.mouseDownOnNode = true;
  }
  getStateNodeById(id: number): StateNode | undefined {
    return this.graph.getNode(String(id));
  }

  screenXYToGraphXY(x: number, y: number): [number, number] {
    const graphRect = (document.querySelector('.graph') as HTMLElement).getBoundingClientRect();  // for offest to get screen position to graph container position
    return [x - graphRect.left, y - graphRect.top];
  }

  graphXYToScreenXY(x: number, y: number): [number, number] {
    const graphRect = (document.querySelector('.graph') as HTMLElement).getBoundingClientRect();  // for offest to get screen position to graph container position
    return [x + graphRect.left, y + graphRect.top];
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  // Drawing Edges ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getPath(sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string): string {
    const [startX, startY, endX, endY] = this.getStartEndPos(sourceNodeId, targetNodeId, sourceNodeOutputGate);
    if (startY > endY) {
      const belowStartY = startY + 50;
      const aboveEndY = endY - 50;
      let besideX;
      if (startX > endX) {

        besideX = Math.max(startX + 200, endX + 200);
      } else {
        besideX = Math.min(startX - 200, endX - 200);
      }

      return `M ${startX} ${startY} L ${startX} ${belowStartY} L ${besideX} ${belowStartY} L ${besideX} ${aboveEndY} L ${endX} ${aboveEndY} L ${endX} ${endY}`;
    } else {
      const controlPointStartX = startX;
      const controlPointEndX = endX;
      const controlPointStartY = startY + 100;
      const controlPointEndY = endY - 100;
      return `M ${startX} ${startY} C ${controlPointStartX} ${controlPointStartY} ${controlPointEndX} ${controlPointEndY} ${endX} ${endY}`;
    }
  }
  getStartEndPos(sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string): [number, number, number, number] {
    // console.log('TreeCanvas: getStartEndPos');
    const sourceNode = sourceNodeId === "start-node" ? this.startNode : this.getStateNodeComponentById(sourceNodeId);
    const targetNode = this.getStateNodeComponentById(targetNodeId);
    if (sourceNode && targetNode) {
      const sourceCircle = sourceNode.getBottomCircleScreenPosition(sourceNodeOutputGate);
      const targetCircle = targetNode.getTopCircleMidpointPosition();

      const [startX, startY] = this.screenXYToGraphXY(sourceCircle.x, sourceCircle.y);
      const [endX, endY] = this.screenXYToGraphXY(targetCircle.x, targetCircle.y);
      return [startX, startY, endX, endY];
    } else {
      // console.log('TreeCanvas: getStartEndPos: Could not find source or target node');
      return [0, 0, 0, 0]
    }
  }
    // Used to get the StateNodeComponent to get the start and end positions for the edges later on
  getStateNodeComponentById(id: string): StateNodeComponent | undefined {
    if (this.stateNodes) {
      return this.stateNodes.find(node => node.nodeId === id);
    } else {
      return undefined;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // On Edge Right Click and Edge Hover
  @ViewChild(MatMenuTrigger) contextMenuTrigger!: MatMenuTrigger;
  private selectedEdgeId: string = "";
  onRightClick(event: MouseEvent, edgeId: string) {
    console.log('TreeCanvas: Right click', event);
    event.preventDefault();
    this.selectedEdgeId = edgeId;
    // this.contextMenuTrigger.menuPositionX = 
    this.contextMenuTrigger.openMenu();
  }
  onDelete() {
    console.log('TreeCanvas --sharedService--> Editor: Delete', this.selectedEdgeId);
    this.sharedService.edgeDeleteEvent.emit({ edgeId: this.selectedEdgeId });
  }
  onMouseOver(event: MouseEvent, edgeId: string) {
    // const target = event.target as SVGElement;
    // target.parentNode?.appendChild(target);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}