
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

    addNode(node: StateNode): void {
        this.nodes[node.nodeId] = node;
    }
    deleteNode(nodeId: string): void {
        delete this.nodes[nodeId];
        for (let edgeId in this.edges) {
            const edge = this.edges[edgeId];
            if (edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId) {
              this.deleteEdge(edgeId);
            }
        }
    }


    deleteEdge(edgeId: string): void {
        delete this.edges[edgeId];
    }
    deleteEdgeWorkaround(sourceNodeId: string, outputGate: string) {
        const edge = this.findEdge(sourceNodeId, outputGate);
        if (edge) {
            this.deleteEdge(edge.id);
        }
    }
    findEdge(sourceNodeId: string, sourceNodeOutputGate: string): any {
        return Object.values(this.edges).find(edge =>
          edge.sourceNodeId === sourceNodeId && edge.sourceNodeOutputGate === sourceNodeOutputGate
        );
    }

    addEdge(sourceNodeId: string, targetNodeId: string, sourceNodeOutputGate: string): void {
        let existingEdgeId: string | null = null;
    
        for (let edgeId in this.edges) {        // search if edge already exists if yes then don't create new edge but use existing one
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

    getNode(nodeId: string): StateNode {
        return this.nodes[nodeId];
    }
    getEdge(edgeId: string): TransitionEdge {
        return this.edges[edgeId];
    }

    setNodeStatus(nodeId: string, status: ExecutionStatus): void {
        this.nodes[nodeId].executionStatus = status;
    }

    selectNode(nodeId: string): void {
        this.nodes[nodeId].selected = true;
    }
    deselectNode(nodeId: string): void {
        console.log('Graph: deselectNode', nodeId, this.nodes);
        this.nodes[nodeId].selected = false;
    }
    deselectAllNodes(): void {
        console.log('Graph: deselectAllNodes', this.nodes);
        for (let nodeId in this.nodes) {
            this.nodes[nodeId].selected = false;
        }
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

function uuidv4(): string {
    throw new Error("Function not implemented.");
}
