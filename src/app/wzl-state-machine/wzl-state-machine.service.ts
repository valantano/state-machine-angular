import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of, switchMap, map, catchError } from 'rxjs';

const adress = 'http://localhost:8080/';

@Injectable({
  providedIn: 'root'
})
export class WzlStateMachineService {


  constructor(private http: HttpClient) { }

  // Node status control connecting frontend graph nodes to backend to activate and deactivate states in the state machine
  updateNodeStatus(nodeName: string, action: string): Observable<any> {
    return this.http.post<any>(adress + 'api/update_state_status', {node_name: nodeName, action});
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////

  // Check backend connection status every intervalMs milliseconds
  startCheckingBackendConnection(intervalMs: number): Observable<{connectionActive: boolean, ongoingActions: boolean}> {
    return interval(intervalMs).pipe(
      switchMap(() => this.checkBackendConnection())
    );
  }
  checkBackendConnection(): Observable<{connectionActive: boolean, ongoingActions: boolean}> {
    return this.http.get<{connectionActive: boolean, ongoingActions: boolean}>(adress + '/api/check_connection')
      .pipe(
        map(response => ({connectionActive: response.connectionActive, ongoingActions: response.ongoingActions})),
        catchError(() => of({connectionActive: false, ongoingActions: false}))
      );
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////

  // Button control connecting frontend buttons to corresponding actions in the backend////////////////
  sendSimulateSolelyState(stateName: string): Observable<any> {
    return this.http.post<any>(adress + 'api/simulate_solely_state', {'stateName': stateName});
  }

  sendOpenGripper(): Observable<any> {
    return this.http.post<any>(adress + 'api/open_gripper', {});
  }

  sendCloseGripper(): Observable<any> {
    return this.http.post<any>(adress + 'api/close_gripper', {});
  }

  sendSpinRobot(): Observable<any> {
    return this.http.post<any>(adress + 'api/spin_robot', {});
  }

  sendCheckLocalization(): Observable<any> {
    return this.http.post<any>(adress + 'api/check_localization', {});
  }

  sendMoveBaseToPos(): Observable<any> {
    return this.http.post<any>(adress + 'api/move_base_to_pos', {});
  }

  sendMoveArmToScanPoses(): Observable<any> {
    return this.http.post<any>(adress + 'api/move_arm_to_scan_poses', {});
  }

  sendCheckStableDetect(): Observable<any> {
    return this.http.post<any>(adress + 'api/check_stable_detect', {});
  }

  sendControlArm(data: any): Observable<any> {  // data = {option: "pose/joint/named", data: "PoseVals/JointVals/Defalut"}
    return this.http.post<any>(adress + 'api/control_arm', data);
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////


  // Get states from backend. If backend not reachable return mock data////////////////////////////
  getData() {
    return this.http.get<any>(adress + 'api/get_states');
  }

  getMockData(): Observable<any>{
    return this.mockData;
  }

  private mockData: Observable<any> = of({
    "START": { "state": "START", "transitions": {"start": "IDLE" } },
    "CHECKLOCALIZATION": { "state": "CHECKLOCALIZATION", "transitions": { "move_base_to_goal": "MOVEBASETOGOAL", "spin": "SPIN" } },
    "CHECKSTABLEOBJECTPOSEDETECTED": { "state": "CHECKSTABLEOBJECTPOSEDETECTED", "transitions": { "move_arm_to_grasp_pose": "MOVEARMTOGRIPPINGPOSE", "move_arm_to_scan_pose": "MOVEARMTOSCANPOSE" } },
    "CLOSEGRIPPER": { "state": "CLOSEGRIPPER", "transitions": { "move_arm_to_transport_pose": "MOVEARMTOTRANSPORTPOSE" } },
    "IDLE": { "state": "IDLE", "transitions": { "move_base_to_goal": "MOVEBASETOGOAL", "spin": "SPIN" } },
    "MOVEARMTOGRIPPINGPOSE": { "state": "MOVEARMTOGRIPPINGPOSE", "transitions": { "close_gripper": "CLOSEGRIPPER" } },
    "MOVEARMTORELEASEPOSE": { "state": "MOVEARMTORELEASEPOSE", "transitions": { "open_gripper": "OPENGRIPPER" } },
    "MOVEARMTOSCANPOSE": { "state": "MOVEARMTOSCANPOSE", "transitions": { "check_stable_object_pose_detected": "CHECKSTABLEOBJECTPOSEDETECTED", "idle": "IDLE" } },
    "MOVEARMTOTRANSPORTPOSE": { "state": "MOVEARMTOTRANSPORTPOSE", "transitions": { "move_base_to_goal": "MOVEBASETOGOAL" } },
    "MOVEBASETOGOAL": { "state": "MOVEBASETOGOAL", "transitions": { "move_arm_to_release_pose": "MOVEARMTORELEASEPOSE", "move_arm_to_scan_pose": "MOVEARMTOSCANPOSE" } },
    "OPENGRIPPER": { "state": "OPENGRIPPER", "transitions": { "idle": "IDLE" } },
    "SPIN": { "state": "SPIN", "transitions": { "check_localization": "CHECKLOCALIZATION" } }
  });
  /////////////////////////////////////////////////////////////////////////////////////////////////

}
