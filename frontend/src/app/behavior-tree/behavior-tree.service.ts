import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

const address = 'http://localhost:2323/';

@Injectable({
  providedIn: 'root'
})
export class BehaviorTreeService {

  constructor(private http: HttpClient) { }


  // sendControlArm(data: any): Observable<any> {  // data = {option: "pose/joint/named", data: "PoseVals/JointVals/Defalut"}
  //   return this.http.post<any>(address + 'api/control_arm', data);
  // }
  // /////////////////////////////////////////////////////////////////////////////////////////////////


  // // Get states from backend. If backend not reachable return mock data////////////////////////////
  // getData() {
  //   return this.http.get<any>(address + 'api/get_states');
  // }

  getMockNodeData(): Observable<any> {
    return this.mockNodeData;
  }

  getMockInterfaceData(): Observable<any> {
    return this.mockInterfaceData;
  }

  private mockInterfaceData: Observable<any> = of({
    states: [
      { name: "Idle", stateId: 45, infoText: "This is an Info Text", input_par_interface: {}, outputs: ["Fail", "Success", "What?"] },
      { name: "MoveBaseToGoal", stateId: 46, infoText: "This is an Info Text", input_par_interface: {}, outputs: ["Fail", "Success", "What?"] },
      { name: "Spin", stateId: 47, infoText: "This is an Info Text", input_par_interface: {}, outputs: ["Fail", "Success", "What?"] },
    ]
  });

  private mockNodeData: Observable<any> = of({
    "StateMachine": {
      name: "WZLStateMachine",
      "startStateNode": 0,
      "stateNodes": [
        { title: "State 1", nodeId: 0, stateId: 45, infoText: "This is an Info Text", x: 100, y: 100, outputs: ["Fail", "Success", "What?"], transitions: { "Fail": 2, "Success": 1 } },
        { title: "State 2", nodeId: 1, stateId: 46, infoText: "This is an Info Text", x: 400, y: 300, outputs: ["Fail", "Success"], transitions: {} },
        { title: "State 3", nodeId: 2, stateId: 47, infoText: "This is an Info Text", x: 200, y: 500, outputs: ["Fail"], transitions: {} },
      ],
    }
  });
}
