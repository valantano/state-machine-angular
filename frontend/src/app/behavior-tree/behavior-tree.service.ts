import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

const address = 'http://localhost:8323/';

const states = [
    { name: "Idle", stateId: 45, infoText: "This is an Info Text and also especially long. So I mean very very very long. But not that long either", input_par_interface: {}, output_interface: ["Fail", "Success", "What?"] },
    { name: "MoveBaseToGoal", stateId: 46, infoText: "This is an Info Text", input_par_interface: {'GoalPose': {'type': 'enum', 'values': ['GoalPose1', 'GoalPose2']}, 'Number-Select': {'type': 'number'}, 'String-Enter': {'type': 'string'}, 'Boolean-Select': {'type': 'boolean'}}, output_interface: ["Fail", "Success", "What?"] },
    { name: "Spin", stateId: 47, infoText: "This is an Info Text", input_par_interface: {}, output_interface: ["Fail", "Success"] },
  ]

const configs = [
  { 'name': 'File 1', 'id': 0, 'description': 'Description 1', 'creationDate': new Date(), 'lastModified': new Date() },
  { 'name': 'File 2', 'id': 1, 'description': 'Description 2', 'creationDate': new Date(), 'lastModified': new Date() },
  { 'name': 'File 3', 'id': 2, 'description': 'Description 3', 'creationDate': new Date(), 'lastModified': new Date() },
  { 'name': 'File 4', 'id': 3, 'description': 'Description 4', 'creationDate': new Date(), 'lastModified': new Date() }
]

@Injectable({
  providedIn: 'root'
})
export class BehaviorTreeService {

  constructor(private http: HttpClient) {}


  // getAvailableConfigs(id: number): Observable<any> {
  //   // return this.getMockAvailableConfigs();
  //   return this.http.post<any>(address + 'api/get_available_configs', {id: id});
  // }

  getAvailableSMsandConfigs(): Observable<any> {
    // return this.getMockAvailableStateMachinesConfigs();
    return this.http.get<any>(address + 'api/available_state_machines_and_configs');
  }

  getConfigData(smId: number, filename: string): Observable<any> {
    return this.http.post<any>(address + 'api/config_data', {smId: smId, filename: filename});
  }

  getInterfaceData(smId: number): Observable<any> {
    // return this.getMockInterfaceData();
    return this.http.post<any>(address + 'api/interface_data', {smId: smId});
  }

  saveConfigData(smId: number, filename: string, config_data: any): Observable<any> {
    return this.http.post<any>(address + 'api/save_config_data', {smId: smId, filename: filename, config: config_data});
  }

  createNewConfig(smId: number, name: string, description: any): Observable<any> {
    console.log('createNewConfig', smId, name, description);
    return this.http.post<any>(address + 'api/create_new_config_file', {smId: smId, name: name, description: description});
  }

  deleteConfig(smId: number, filename: string): Observable<any> {
    return this.http.post<any>(address + 'api/delete_config_file', {smId: smId, filename: filename});
  }

  startStateMachine(smId: number, config_data: any): Observable<any> {
    return this.http.post<any>(address + 'api/start_state_machine', {smId: smId, config: config_data});
  }

  

  recvTerminalMessage(): Observable<string> {
    return this.http.get<string>(address + 'api/recv_terminal_message');
  }

















  
  // getMockNodeData(): Observable<any> {
  //   return this.mockNodeData;
  // }

  // getMockInterfaceData(): Observable<any> {
  //   return this.mockInterfaceData;
  // }

  // getMockAvailableConfigs(): Observable<any> {
  //   return this.mockAvailableConfigs;
  // }

  // getMockAvailableStateMachines(): Observable<any> {
  //   return this.mockAvailableStateMachines;
  // }

  // getMockAvailableStateMachinesConfigs(): Observable<any> {
  //   return this.mockAvailableConfigs;
  // }



  private mockAvailableStateMachines: Observable<any> = of({
    'state_machines': [ {'name': 'WZL1', 'id': 0, 'states': states}, {'name': 'WZL2', 'id': 1, 'states': states}]
  });

  private mockAvailableConfigs: Observable<any> = of({
    'sm_configs': [{'name': 'WZL1', 'id': 0, 'configs': configs}]
  });


  private mockInterfaceData: Observable<any> = of({'states': states});

  private mockNodeData: Observable<any> = of({
    "state_machine_config": {
      name: "WZLStateMachine",
      "startStateNode": "22048495-fa82-4347-a78c-e6daa705ad1c",
      "stateNodes": [
        { title: "State 1", nodeId: "22048495-fa82-4347-a78c-e6daa705ad1c", stateId: 45, x: 100, y: 100, transitions: { "Fail": "22048495-fa82-4347-a78c-e6daa705ad1e", "Success": "22048495-fa82-4347-a78c-e6daa705ad1d" } },
        { title: "State 2", nodeId: "22048495-fa82-4347-a78c-e6daa705ad1d", stateId: 46, x: 400, y: 300, transitions: {} },
        { title: "State 3", nodeId: "22048495-fa82-4347-a78c-e6daa705ad1e", stateId: 47, x: 200, y: 500, transitions: {} },
      ],
    }
  });
}
