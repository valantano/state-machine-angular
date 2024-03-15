import { StateNodeInterface } from "../state-node-blueprint/state-node-interface";

export interface StateNode {
    nodeId: string;
    x: number
    y: number;
    title: string;
    state_interface: StateNodeInterface;
}