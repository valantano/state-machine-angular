import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { io, Socket } from 'socket.io-client';

const address = 'http://localhost:8323/';


@Injectable({
  providedIn: 'root'
})
export class BehaviorTreeService {
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io(address);
  
  }
  
  
  ////////// loader -> backend //////////
  getAvailableSMsandConfigs(): Observable<any> {
    return this.http.get<any>(address + 'api/available_state_machines_and_configs');
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
  createNewConfig(smId: number, name: string, description: any): Observable<any> {
    console.log('createNewConfig', smId, name, description);
    return this.http.post<any>(address + 'api/create_new_config_file', {smId: smId, name: name, description: description});
  }
  ///////////////////////////////////////



  ////////// editor -> backend //////////
  getConfigData(smId: number, filename: string): Observable<any> {
    return this.http.post<any>(address + 'api/config_data', {smId: smId, filename: filename});
  }
  getInterfaceData(smId: number): Observable<any> {
    return this.http.post<any>(address + 'api/interface_data', {smId: smId});
  }
  saveConfigData(smId: number, filename: string, config_data: any): Observable<any> {
    return this.http.post<any>(address + 'api/save_config_data', {smId: smId, filename: filename, config: config_data});
  }
  startStateMachine(smId: number, config_data: any): Observable<any> {
    return this.http.post<any>(address + 'api/start_state_machine', {smId: smId, config: config_data});
  }
  stopStateMachine(smId: number): Observable<any> {
    return this.http.post<any>(address + 'api/stop_state_machine', {smId: smId});
  }
  ///////////////////////////////////////

  ////////// backend -> editor //////////
  recvStatusUpdates(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('status_update', (data) => {
        observer.next(data);
      });
    });
  }
  ///////////////////////////////////////

  

  

  

}
