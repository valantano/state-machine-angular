import { v4 as uuidv4 } from 'uuid';

export class Settings {
    coloredEdges: boolean = true;
}


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

    getGraphPosition(): { x: number, y: number } {
        return { x: this.getGraphX(), y: this.getGraphY() };
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

    x_offset_left?: number;
    y_offset_left?: number;
    x_offset_right?: number;
    y_offset_right?: number;
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
    childSelectionMode: boolean = false;


    addNode(node: StateNode): void {
        this.nodes[node.nodeId] = node;
    }

    // Deletes Node corresponding to nodeId but also all edges connected with this node
    // If the node was the start node, then set startNode to empty string.
    deleteNode(nodeId: string): [TransitionEdge[], boolean] {
        delete this.nodes[nodeId];
        let removedEdges = []
        for (let edgeId in this.edges) {
            const edge = this.edges[edgeId];
            if (edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId) {
                removedEdges.push(edge);
                this.deleteEdge(edgeId);
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
        console.log(newEdge);

        // const n_output_gates = this.nodes[sourceNodeId].state_interface.output_interface.length;
        // const offset_id = this.nodes[targetNodeId].state_interface.output_interface.indexOf(sourceNodeOutputGate);
        // const width = 420;
        // const width_split = width / (n_output_gates + 1) + 20;

        // newEdge.x_offset_left = width_split * (offset_id + 1);
        // newEdge.y_offset_left = 20 + 10 * (offset_id + 1);

        // newEdge.x_offset_right = width_split * (n_output_gates - offset_id + 1);
        // newEdge.y_offset_right = 20 + 10 * (n_output_gates - offset_id + 1);

        this.edges[newEdge.id] = newEdge;
        try {
            this.initOffsets();
        } catch (e) {
            console.log(e);
        }

        return newEdge.id;
      }

    initOffsets(): void {
        // Workaround helper function to make edges avoid each other
        for (let edgeId in this.edges) {
            const edge = this.edges[edgeId];
            const n_output_gates = this.nodes[edge.sourceNodeId].state_interface.output_interface.length;
            const offset_id = this.nodes[edge.targetNodeId].state_interface.output_interface.indexOf(edge.sourceNodeOutputGate);
            const width = 420;
            const width_split = width / (n_output_gates + 1) + 20;

            edge.x_offset_left = width_split * (offset_id + 1);
            edge.y_offset_left = 20 + 10 * (offset_id + 1);

            edge.x_offset_right = width_split * (n_output_gates - offset_id);
            edge.y_offset_right = 20 + 10 * (n_output_gates - offset_id);
        }
    }

    moveNode(nodeId: string, x: number, y: number): void {
        this.nodes[nodeId].updatePosition(x, y);
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

    getAllDescendants(nodeId: string, descendants: string[]): string[] {
        let childrenIds = this.getAllChildren(nodeId);
        for (let childId of childrenIds) {
            if (!descendants.includes(childId)) {
                descendants.push(childId);
                descendants = descendants.concat(this.getAllDescendants(childId, descendants));
            }
        }
        return descendants;
    }

    getAllChildren(nodeId: string): string[] {
        let children: string[] = [];
        for (let edgeId in this.edges) {
            if (this.edges[edgeId].sourceNodeId === nodeId) {
                children.push(this.nodes[this.edges[edgeId].targetNodeId].nodeId);
            }
        }
        return children;
    }

    // if control is pressed add new node to the selection
    // if control is pressed and node already selected, deselect the node
    // if control is not pressed, deselect all nodes and select the new node
    selectNode(nodeId: string): void {
        if (!this.multipleSelectionMode) {
            this.deselectAllNodes();
            this.nodes[nodeId].selected = true;
            if (this.childSelectionMode) {
                let descendants = this.getAllDescendants(nodeId, []);
                for (let descendantId of descendants) {
                    this.nodes[descendantId].selected = true;
                }
            }
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

    setChildSelectionMode(enabled: boolean): void {
        this.childSelectionMode = enabled;
    }
}

export interface StateNodeInterface {
    name: string;
    stateId: number;
    infoText: string;
    input_par_interface: {[key: string]: any};
    output_interface: string[];
    global_vars_interface: {
        requires: string[];
        sets: string[];
    };
}
