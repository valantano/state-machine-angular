
export interface StateNode {
    nodeId: string;
    x: number
    y: number;
    title: string;
    state_interface: StateNodeInterface;
    input_parameters: { [key: string ]: any};
}

export interface TransitionEdge {
    id: string;
    sourceNodeId: string;
    sourceNodeOutputGate: string;
    targetNodeId: string;

    // title: string;
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
}