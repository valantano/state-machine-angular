import { Graph, StateNode, TransitionEdge } from "./data_model";


export class CommandManager {
  private history: Command[] = [];
  private undone: Command[] = [];

  public execute(command: Command) {
    command.execute();
    this.history.push(command);
    this.undone = [];
  }

  public undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
      this.undone.push(command);
    }
  }

  public redo() {
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
  }

}

export abstract class Command {
  public abstract execute(): void;
  public abstract undo(): void;
}

export class DeleteSelectionCommand extends Command {
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
    console.log("Selection", this.graph.startNode);
  }

  undo(): void {
    for (let i = this.deleteCommands.length -1; i>=0; i--) {
      this.deleteCommands[i].undo()
    }
  }
}

export class SetStartNodeCommand extends Command {
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
    console.log(this.deletedEdges);
    this.graph.addNode(this.node);
    this.deletedEdges.forEach(edge => {
      this.graph.addEdge(edge.sourceNodeId, edge.targetNodeId, edge.sourceNodeOutputGate);
    });
    if (this.wasStartNode) {
      this.graph.setStartNode(this.node.nodeId);
    }
  }
}