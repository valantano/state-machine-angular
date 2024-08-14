import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { io, Socket } from 'socket.io-client';

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

const status_update = {

}

const run1 = {
    "state_machine_config": {
        "name": "asdf",
        "executionDate": "2024-04-12T11:16:31.846695",
        "description": "asdf1",
        "startStateNode": "45b7e446-4bf1-438f-b370-7ef75048db87",
        "stateNodes": [
            {
                "title": "State Node",
                "nodeId": "0ae9c748-425f-4186-a840-e09f86bc59cd",
                "stateId": 45,
                "x": 1269,
                "y": 384,
                "transitions": {
                    "Fail": "0ae9c748-425f-4186-a840-e09f86bc59cd",
                    "Success": "45b7e446-4bf1-438f-b370-7ef75048db87",
                    "What?": "eb7b6650-f38a-4c8a-b508-c70a6fd60fb1"
                },
                "input_parameters": {}
            },
            {
                "title": "State Node",
                "nodeId": "45b7e446-4bf1-438f-b370-7ef75048db87",
                "stateId": 46,
                "x": 652,
                "y": 531,
                "transitions": {},
                "input_parameters": {}
            },
            {
                "title": "State Node",
                "nodeId": "eb7b6650-f38a-4c8a-b508-c70a6fd60fb1",
                "stateId": 47,
                "x": 1601,
                "y": 611,
                "transitions": {},
                "input_parameters": {}
            }
        ]
    }
}

const statusUpdate = {
  "stateNodes": [
    {
        "nodeId": "0ae9c748-425f-4186-a840-e09f86bc59cd",
        "status": "Executed"
    },
    {
        "nodeId": "45b7e446-4bf1-438f-b370-7ef75048db87",
        "status": "NotExecuted"
    },
    {
        "nodeId": "eb7b6650-f38a-4c8a-b508-c70a6fd60fb1",
        "status": "Running"
    }
]
}

@Injectable({
  providedIn: 'root'
})
export class BehaviorTreeService {
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io(address);
  
  }
  
  recvStatusUpdates(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('status_update', (data) => {
        observer.next(data);
      });
    });
  }


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
  duplicateConfig(smId: number, filename: string): Observable<any> {
    return this.http.post<any>(address + 'api/duplicate_config_file', {smId: smId, filename: filename});
  }
  editConfig(smId: number, filename: string, new_name: string, new_description: string): Observable<any> {
    return this.http.post<any>(address + 'api/edit_config_file', {smId: smId, filename: filename, new_name: new_name, new_description: new_description});
  }

  startStateMachine(smId: number, config_data: any): Observable<any> {
    return this.http.post<any>(address + 'api/start_state_machine', {smId: smId, config: config_data});
  }
  stopStateMachine(smId: number): Observable<any> {
    return this.http.post<any>(address + 'api/stop_state_machine', {smId: smId});
  }

  


//   getStatusUpdate(smId: number): Observable<any>{
// // { "log_msgs": [
// //     "########\nStarting StateMachine WZL1"
// //   ],
// //   "node_status": {
// //     "0ae9c748-425f-4186-a840-e09f86bc59cd": "Unknown",
// //     "45b7e446-4bf1-438f-b370-7ef75048db87": "Running",
// //     "eb7b6650-f38a-4c8a-b508-c70a6fd60fb1": "Unknown"
// //   },
// //   "state_machine_status": "Running"
// // }
//     // return this.http.post<any>(address + 'api/get_status_update', {smId: smId})
//   }

  




  
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

  private mockStatusUpdate: Observable<any> = of(statusUpdate);

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
