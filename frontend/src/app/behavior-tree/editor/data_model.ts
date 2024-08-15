import { v4 as uuidv4 } from 'uuid';


export class StateNode {
    nodeId: string;
    x: number;
    y: number;
    parentOffsetX: number = -1;
    parentOffsetY: number = -1;
    title: string;
    state_interface: StateNodeInterface;
    input_parameters: { [key: string ]: any };
    executionStatus: ExecutionStatus;
    selected: boolean = false;

    constructor(nodeId: string, x: number, y: number, title: string, state_interface: StateNodeInterface, input_parameters: { [key: string ]: any }, executionStatus: ExecutionStatus) {
        this.nodeId = nodeId;
        this.x = x;
        this.y = y;
        this.title = title;
        this.state_interface = state_interface;
        this.input_parameters = input_parameters;
        this.executionStatus = executionStatus;
    }

    getGraphX(): number {
        if (this.parentOffsetX === -1) {
            return this.x;
        }
        return this.x;
    }
    getGraphY(): number {
        if (this.parentOffsetY === -1) {
            return this.y;
        }
        return this.y;
    }

    updatePosition(newX: number, newY: number): void {
        this.x = newX;
        this.y = newY;
    }
}

export interface TransitionEdge {
    id: string;
    sourceNodeId: string;
    sourceNodeOutputGate: string;
    targetNodeId: string;
    transitionStatus: TransitionStatus;

    // title: string;
}

export enum ExecutionStatus {
    Executed = "Executed",
    Running = "Running",
    Failed = "Failed",
    NotExecuted = "NotExecuted",
    Unknown = "Unknown",
}

export enum TransitionStatus {
    Taken = "Taken",
    NotTaken = "NotTaken",
    Unknown = "Unknown"
}

export class Graph {
    nodes: { [id: string]: StateNode } = {};
    edges: { [id: string]: TransitionEdge } = {};
    startNode: string = "";
    multipleSelectionMode: boolean = false;

    addNode(node: StateNode): void {
        this.nodes[node.nodeId] = node;
    }

    // Deletes Node corresponding to nodeId but also all edges connected with this node
    // If the node was the start node, then set startNode to empty string.
    deleteNode(nodeId: string): [TransitionEdge[], boolean] {
        console.log('Graph: deleteNode', nodeId);
        delete this.nodes[nodeId];
        let removedEdges = []
        for (let edgeId in this.edges) {
            const edge = this.edges[edgeId];
            if (edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId) {
                removedEdges.push(edge);
                console.log(removedEdges);
                this.deleteEdge(edgeId);
                console.log(removedEdges);
            }
        }
        const isStartNode = this.startNode === nodeId;
        if (isStartNode) {
            this.setStartNode("");
        }
        return [removedEdges, isStartNode];
    }

    setStartNode(nodeId: string): void {
        this.startNode = nodeId;
    }

    deleteEdge(edgeId: string): TransitionEdge {
        const edge =  this.edges[edgeId];
        delete this.edges[edgeId];
        return edge;
    }
    findEdge(sourceNodeId: string, sourceNodeOutputGate: string): any {
        return Object.values(this.edges).find(edge =>
          edge.sourceNodeId === sourceNodeId && edge.sourceNodeOutputGate === sourceNodeOutputGate
        );
    }

    addEdge(sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string): string {
        let existingEdgeId: string | null = null;

        const edge = this.findEdge(sourceNodeId, sourceNodeOutputGate); // search if edge already exists if yes then don't create new edge but use existing one
        if (edge) {
            existingEdgeId = edge.id
        }
    
        const newEdge: TransitionEdge = {
          id: existingEdgeId !== null ? existingEdgeId : uuidv4(),
          sourceNodeId: sourceNodeId,
          sourceNodeOutputGate: sourceNodeOutputGate,
          targetNodeId: targetNodeId,
          transitionStatus: TransitionStatus.Unknown
        }
    
        console.log('Graph: addEdge', newEdge);
        this.edges[newEdge.id] = newEdge;
        return newEdge.id;
      }

    getNode(nodeId: string): StateNode {
        return this.nodes[nodeId];
    }
    getEdge(edgeId: string): TransitionEdge {
        return this.edges[edgeId];
    }

    setNodeStatus(nodeId: string, status: ExecutionStatus): void {
        this.nodes[nodeId].executionStatus = status;
    }

    // if control is pressed add new node to the selection
    // if control is pressed and node already selected, deselect the node
    // if control is not pressed, deselect all nodes and select the new node
    selectNode(nodeId: string): void {
        if (!this.multipleSelectionMode) {
            this.deselectAllNodes();
            this.nodes[nodeId].selected = true;
        } else {
            this.nodes[nodeId].selected = !this.nodes[nodeId].selected;
        }
        
    }
    deselectNode(nodeId: string): void {
        this.nodes[nodeId].selected = false;
    }
    deselectAllNodes(): void {
        for (let nodeId in this.nodes) {
            this.deselectNode(nodeId);
        }
    }

    getSelectedNodes(): StateNode[] {
        let selectedNodes: StateNode[] = [];
        for (let nodeId in this.nodes) {
            if (this.nodes[nodeId].selected) {
                selectedNodes.push(this.nodes[nodeId]);
            }
        }
        return selectedNodes;
    }

    setMultipleSelectionMode(enabled: boolean): void {
        this.multipleSelectionMode = enabled;
    }
}

// states: [
//     { name: "Idle", stateId: 45, infoText: "This is an Info Text", input_par_interface: {}, output_interface: ["Fail", "Success", "What?"] },
//     { name: "MoveBaseToGoal", stateId: 46, infoText: "This is an Info Text", input_par_interface: {}, output_interface: ["Fail", "Success", "What?"] },
//     { name: "Spin", stateId: 47, infoText: "This is an Info Text", input_par_interface: {}, output_interface: ["Fail", "Success", "What?"] },
//   ]

export interface StateNodeInterface {
    name: string;
    stateId: number;
    infoText: string;
    input_par_interface: {};
    output_interface: string[];
    global_vars_interface: {
        requires: string[];
        sets: string[];
    };
}
