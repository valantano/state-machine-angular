from os import PathLike
from flask import Flask, jsonify, request
from flask_cors import CORS
import copy
import threading

from state_machine import StateMachine


class FlaskBackend:

    def __init__(self, state_machines: list[StateMachine]):
        self.app = Flask(__name__)
        CORS(self.app, resources={"/api/*": {"origins": "http://localhost:4200"}})

        self.state_machines = {}
        for sm in state_machines:
            self.state_machines[sm.id] = sm


       
        self.add_endpoint('/api/available_state_machines_and_configs', 'get_available_state_machines', self.send_available_state_machines_and_configs, methods=['GET'])
        self.add_endpoint('/api/state_machine_interface', 'get_state_machine_interface', self.send_state_machine_interface, methods=['POST'])

        self.add_endpoint('/api/config_data', 'get_config_data', self.send_config_data, methods=['POST'])
        self.add_endpoint('/api/interface_data', 'get_interface_data', self.send_interface_data, methods=['POST'])
        self.add_endpoint('/api/save_config_data', 'save_config_data', self.save_config_data, methods=['POST'])

        # self.add_endpoint('/api/check_connection', 'check_connection', self.check_connection, methods=['GET'])
        # self.add_endpoint('/api/get_states', 'get_states', self.send_states, methods=['GET'])
        # self.add_endpoint('/api/update_state_status', 'updates_states', self.activate_deactivate_states, methods=['POST'])
        # # self.add_endpoint('/api/start_state_machine', 'start_state_machine', self.start_state_machine, methods=['POST'])
        # self.add_endpoint('/api/simulate_solely_state', 'simulate_state', self.simulate_state, methods=['POST'])



    def start(self, **kwargs):
        self.app.run(port=8323, **kwargs)


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
        data = request.get_json()
        sm_id = int(data['smId'])
        filename = str(data['filename'])
        print(f'Loading config file {filename} for state machine {sm_id}')

        config = self.state_machines[sm_id].load_config_file(filename)
        return jsonify(config)
    
    def send_interface_data(self):
        data = request.get_json()
        sm_id = int(data['smId'])

        return jsonify(self.state_machines[sm_id].to_json_interface())
    
    def save_config_data(self):
        data = request.get_json()
        sm_id = int(data['smId'])
        filename = str(data['filename'])
        config = data['config']
        print(f'Saving config file {filename} for state machine {sm_id}')
        success = self.state_machines[sm_id].save_config(filename, config)
        return jsonify({'success': success})

    

    def add_endpoint(self, endpoint=None, endpoint_name=None, handler=None, methods=['GET'], *args, **kwargs):
        self.app.add_url_rule(endpoint, endpoint_name, handler, methods=methods, *args, **kwargs)



    ############################# ENDPOINTS #############################
    # def check_connection(self):
    #     """Is called periodically from Angular Frontend to check if the backend is still running."""
    #     ongoing_actions = self.ongoing_actions_mutex.is_locked()
    #     return jsonify({'connectionActive': True, 'ongoingActions': ongoing_actions})

