import { Graph, StateNode, TransitionEdge } from "./data_model";


export abstract class Command {
  // Each operation on the graph is represented by a command.
  // This way each operation can be executed and undone.
  public abstract execute(): void;
  public abstract undo(): void;
}

export class CommandManager {
  // CommandManager manages all commands that were executed on the graph.
  // It is responsible for executing, undoing and redoing commands.
  private history: Command[] = [];
  private undone: Command[] = [];

  public unsavedChanges: boolean = false;

  public execute(command: Command) {
    this.unsavedChanges = true;
    command.execute();
    this.history.push(command);
    this.undone = [];
  }

  public undo() {
    this.unsavedChanges = true;
    const command = this.history.pop();
    if (command) {
      command.undo();
      this.undone.push(command);
    }
  }

  public redo() {
    this.unsavedChanges = true;
    const command = this.undone.pop();
    if (command) {
      command.execute();
      this.history.push(command);
    }
  }

  public canUndo() {
    return this.history.length > 0;
  }
  public canRedo() {
    return this.undone.length > 0;
  }
  public reset() {
    this.history = [];
    this.undone = [];
    this.unsavedChanges = false;
  }

}

export class MoveSelectedNodesCommand extends Command {
  // Move all selected nodes by dx and dy.
  // When the command is executed for the first time, the nodes stay at their current position, because they were already moved by tree-canvas.
  // This is a workaround since the user should get visual feedback when dragging nodes. -> tree-canvas needs to move the nodes for visual feedback.
  // Undo: Move the nodes back to the previous position.

  private graph: Graph;
  private selectedNodes: StateNode[];
  private dx: number;
  private dy: number;

  private firstExecution: boolean = true;

  constructor(dx: number, dy: number, graph: Graph) {
    super();
    this.graph = graph;
    this.selectedNodes = this.graph.getSelectedNodes();
    this.dx = dx;
    this.dy = dy;
  }

  execute(): void {
    this.selectedNodes.forEach(node => {
      const position = node.getGraphPosition();
      if (this.firstExecution) {
        this.graph.moveNode(node.nodeId, position.x, position.y);
      } else {
        this.graph.moveNode(node.nodeId, position.x + this.dx, position.y + this.dy);
      }
    });
    this.firstExecution = false;
  }

  undo(): void {
    this.selectedNodes.forEach(node => {
      const position = node.getGraphPosition();
      this.graph.moveNode(node.nodeId, position.x - this.dx, position.y - this.dy);
    });
  }
}


export class MoveNodeCommand extends Command {
  // Move the node corresponding to nodeId by dX and dY.
  // When the command is executed for the first time, the node stays at its current position, because it was already moved by tree-canvas.
  // This is a workaround since the user should get visual feedback when dragging nodes. -> tree-canvas needs to move the nodes for visual feedback.
  // Undo: Move the node back to the previous position.

  private graph: Graph;
  private nodeId: string;
  private dX: number;
  private dY: number;
  private firstExecution: boolean = true;


  constructor(nodeId: string, dX: number, dY: number, graph: Graph) {
    super();
    this.graph = graph;
    this.nodeId = nodeId;
    this.dX = dX;
    this.dY = dY;
  }

  execute(): void {
    const node = this.graph.getNode(this.nodeId);
    if (this.firstExecution) {
      this.graph.moveNode(this.nodeId, node.x, node.y);
    } else {
      this.graph.moveNode(this.nodeId, node.x + this.dX, node.y + this.dY);
    }
    this.firstExecution = false;
  }

  undo(): void {
    const node = this.graph.getNode(this.nodeId);
    this.graph.moveNode(this.nodeId, node.x - this.dX, node.y - this.dY);
  }
}


export class SetStartNodeCommand extends Command {
  // Set the start node of the graph to the node corresponding to nodeId.
  // Undo: Set the start node back to the previous start node

  private graph: Graph;
  private nodeId: string;
  private previousStartNode: string = "";

  constructor(nodeId: string, graph: Graph) {
    super();
    this.graph = graph;
    this.nodeId = nodeId;
  }

  execute(): void {
    this.previousStartNode = this.graph.startNode;
    this.graph.setStartNode(this.nodeId);
  }

  undo(): void {
    this.graph.setStartNode(this.previousStartNode);
  }
}

export class AddEdgeCommand extends Command {
  // Add a new edge to the graph.
  // Undo: Delete the edge from the graph.

  private sourceNodeId: string;
  private targetNodeId: string;
  private outputGate: string;
  private graph: Graph;
  private edgeId: string = "";

  constructor(sourceNodeId: string, targetNodeId: string, outputGate: string, graph: Graph) {
    super();
    this.sourceNodeId = sourceNodeId;
    this.targetNodeId = targetNodeId;
    this.outputGate = outputGate;
    this.graph = graph;
  }

  execute(): void {
    this.edgeId = this.graph.addEdge(this.sourceNodeId, this.targetNodeId, this.outputGate);
  }

  undo(): void {
    this.graph.deleteEdge(this.edgeId);
  }
}

export class DeleteEdgeCommand extends Command {
  // Delete the edge corresponding to edgeId and remember edge.
  // Undo: Add the edge back to the graph.

  private graph: Graph;
  private edgeId: string;
  private deletedEdge: TransitionEdge = {} as TransitionEdge;

  constructor(edgeId: string, graph: Graph) {
    super();
    this.edgeId = edgeId;
    this.graph = graph;
  }

  execute(): void {
    this.deletedEdge = this.graph.deleteEdge(this.edgeId);
  }

  undo(): void {
    this.edgeId = this.graph.addEdge(this.deletedEdge.sourceNodeId, this.deletedEdge.targetNodeId, this.deletedEdge.sourceNodeOutputGate);
  }
}

export class AddNodeCommand extends Command {
  // Add a new node to the graph.
  // Undo: Delete the node from the graph.

  private node: StateNode;
  private graph: Graph;

  constructor(node: any, graph: any) {
    super();
    this.node = node;
    this.graph = graph;
  }

  execute(): void {
    this.graph.addNode(this.node);
  }

  undo(): void {
    this.graph.deleteNode(this.node.nodeId);
  }
}

export class DeleteNodeCommand extends Command {
  // Delete Node corresponding to nodeId but also all edges connected with this node.
  // If the node was the start node, then set startNode to empty string.
  // Remember also the edges that were deleted and if the node was the start node.
  // Undo: Add the node and edges back to the graph. If the node was the start node, set it back.

  private node: StateNode;
  private graph: Graph;
  private deletedEdges: TransitionEdge[] = [];
  private wasStartNode: boolean = false;

  constructor(node: any, graph: any) {
    super();
    this.node = node;
    this.graph = graph;
  }

  execute(): void {
    [this.deletedEdges, this.wasStartNode] = this.graph.deleteNode(this.node.nodeId);
  }

  undo(): void {
    this.graph.addNode(this.node);
    this.deletedEdges.forEach(edge => {
      this.graph.addEdge(edge.sourceNodeId, edge.targetNodeId, edge.sourceNodeOutputGate);
    });
    if (this.wasStartNode) {
      this.graph.setStartNode(this.node.nodeId);
    }
  }
}

export class DeleteSelectedCommand extends Command {
  // For each selected node, create a DeleteNodeCommand and execute it.
  // Undo: For each DeleteNodeCommand, undo it.

  private graph: Graph;
  private selectedNodes: StateNode[] = [];
  private deleteCommands: Command[] = [];

  constructor(graph: Graph) {
    super();
    this.graph = graph;
    this.selectedNodes = this.graph.getSelectedNodes();
  }

  execute(): void {
    this.selectedNodes.forEach(node => {
      this.deleteCommands.push(new DeleteNodeCommand(node, this.graph));
    });
    this.deleteCommands.forEach(command => {
      command.execute();
    });
  }

  undo(): void {
    for (let i = this.deleteCommands.length -1; i>=0; i--) {
      this.deleteCommands[i].undo()
    }
  }
}