import multiprocessing
import threading

from os import PathLike
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO


from .state_machine import StateMachine


class FlaskBackend:

    def start(self, **kwargs):
        self.socketio.run(self.app, port=8323, **kwargs)

    def __init__(self, state_machines: list[StateMachine]):
        self.app = Flask(__name__)
        self.socketio = SocketIO(self.app, cors_allowed_origins='*')
        CORS(self.app, resources={"/api/*": {"origins": "http://localhost:4200"}})

        self.state_machines = {}
        for sm in state_machines:
            self.state_machines[sm.id] = sm

        self.running_sms = {}
        self.sms_last_messages = {}
        for sm_id in self.state_machines.keys():
            self.running_sms[sm_id] = None
            self.sms_last_messages[sm_id] = None


       
        self.add_endpoint('/api/available_state_machines_and_configs', 'get_available_state_machines', self.send_available_state_machines_and_configs, methods=['GET'])
        self.add_endpoint('/api/state_machine_interface', 'get_state_machine_interface', self.send_state_machine_interface, methods=['POST'])

        self.add_endpoint('/api/config_data', 'get_config_data', self.send_config_data, methods=['POST'])
        self.add_endpoint('/api/interface_data', 'get_interface_data', self.send_interface_data, methods=['POST'])
        self.add_endpoint('/api/save_config_data', 'save_config_data', self.save_config_data, methods=['POST'])
        self.add_endpoint('/api/create_new_config_file', 'create_new_config_file', self.create_new_config_file, methods=['POST'])
        self.add_endpoint('/api/delete_config_file', 'delete_config_file', self.delete_config_file, methods=['POST'])

        self.add_endpoint('/api/start_state_machine', 'start_state_machine', self.start_state_machine, methods=['POST'])
        self.add_endpoint('/api/stop_state_machine', 'stop_state_machine', self.stop_state_machine, methods=['POST'])
        # self.add_endpoint('/api/get_status_update', 'get_status_update', self.get_status_update, methods=['POST'])

        # self.add_endpoint('/api/check_connection', 'check_connection', self.check_connection, methods=['GET'])
        # self.add_endpoint('/api/get_states', 'get_states', self.send_states, methods=['GET'])
        # self.add_endpoint('/api/update_state_status', 'updates_states', self.activate_deactivate_states, methods=['POST'])
        # # self.add_endpoint('/api/start_state_machine', 'start_state_machine', self.start_state_machine, methods=['POST'])
        # self.add_endpoint('/api/simulate_solely_state', 'simulate_state', self.simulate_state, methods=['POST'])


    def send_available_state_machines_and_configs(self):
        sms = []
        for sm in self.state_machines.values():
            sms.append(sm.to_json_config())
        return jsonify({'state_machines': sms})
    
    def send_state_machine_interface(self):
        data = request.get_json()
        sm_id = data['state_machine_id']
        # TODO: also send available/saved configs
        return jsonify({'state_machine_interface': self.state_machines[sm_id].to_json()})
    
    def send_state_machine_configs(self):
        pass

    def send_config_data(self):
        """Loads requested config file, identified by sm_id and filename, and sends it to the frontend."""
        data = request.get_json()
        sm_id = int(data['smId'])
        filename = str(data['filename'])
        self.log(f'Loading config file {filename} for state machine {sm_id}')

        config = self.state_machines[sm_id].load_config_file(filename)
        return jsonify(config)
    
    def send_interface_data(self):
        """Sends the state machine interface data (structure of available states) to the frontend."""
        data = request.get_json()
        sm_id = int(data['smId'])

        return jsonify(self.state_machines[sm_id].to_json_interface())
    
    def save_config_data(self):
        data = request.get_json()
        sm_id = int(data['smId'])
        filename = str(data['filename'])
        config = data['config']
        self.log(f'Saving config file {filename} for state machine {sm_id}')
        success = self.state_machines[sm_id].save_config_file(filename, config)
        return jsonify({'success': success})
    
    def create_new_config_file(self):
        data = request.get_json()
        sm_id = int(data['smId'])
        name = str(data['name'])
        description = str(data['description'])
        self.log(f'Creating new config file {name} for state machine {sm_id}')
        success = self.state_machines[sm_id].create_new_config_file(name, description)
        return jsonify({'success': success})
    
    def delete_config_file(self):
        data = request.get_json()
        sm_id = int(data['smId'])
        filename = str(data['filename'])
        self.log(f'Deleting config file {filename} for state machine {sm_id}')
        success = self.state_machines[sm_id].delete_config_file(filename)
        return jsonify({'success': success})


    # Running the state machine in a way such that it can be stopped even if it ran into a deadlock was 
    # quite hard. The following solution is a bit of a hack, but it works.
    def start_state_machine(self):
        """We use a separate process (not thread, since threads cannot be terminated smoothly when running in a deadlock) to run the state machine. 
        This way we can stop it even if it ran into a deadlock. But since it is a separate process and we want to get status updates from 
        the state machine and send them to te frontend, we need to pipe the status updates from the state machine process to the main process. 
        Then in the main process we can use socketio to send the status updates to the frontend without the frontend needing it to actively
        request the status update."""
        data = request.get_json()
        sm_id = int(data['smId'])
        config = data['config']
        self.log(f'Received state machine {sm_id} with config {config}')

        parent_conn, child_conn = multiprocessing.Pipe()
        process = multiprocessing.Process(target=self.state_machines[sm_id].start, args=[config['state_machine_config'], child_conn])
        self.running_sms[sm_id] = process
        process.start()

        def listen_for_messages():
            while self.running_sms[sm_id] is not None:    # as long as the process is running
                try:
                    if parent_conn.poll(1):     # check if there is a message in the pipe, if not check if process is still running with while loop
                        message = parent_conn.recv()    # blocks until message is received, hence poll is needed to continue checking if process is still running
                        self.sms_last_messages[sm_id] = message
                    self.socketio.emit('status_update', message)
                    if message['state_machine_status'] != 'Running':
                        break
                except EOFError:
                    break
        listener_thread = threading.Thread(target=listen_for_messages)
        listener_thread.start()

        success = True
        
        process.join()  # Ensure that the process is terminated before returning
        listener_thread.join() # Ensure that the listener thread is terminated before returning

        return jsonify({'success': success})
    
    def stop_state_machine(self):
        data = request.get_json()
        sm_id = int(data['smId'])
        process = self.running_sms[sm_id]
        if process:
            process.terminate()
            process.join()   # Ensure that the process is terminated before returning
            success = True
        else:
            success = False
        self.running_sms[sm_id] = None
        return jsonify({'success': success})



    def add_endpoint(self, endpoint=None, endpoint_name=None, handler=None, methods=['GET'], *args, **kwargs):
        self.app.add_url_rule(endpoint, endpoint_name, handler, methods=methods, *args, **kwargs)

    def log(self, msg):
        print(f'[Flask Backend]: {msg}')
    ############################# ENDPOINTS #############################