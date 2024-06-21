import os
import json
from datetime import datetime
from multiprocessing import Lock
import rclpy



from .state import State


class StateMachine:

    def __init__(self, name: str, id: int, state_interface: list[State], config_folder_path: str) -> None:
        self.name: str = name
        self.id: int = id

        self.config_folder: os.path = os.path.normpath(config_folder_path)
        # create path if it does not exist
        if not os.path.exists(self.config_folder):
            os.makedirs(self.config_folder)

        self.states: dict = {}
        for state in state_interface:
            state.set_logging_callback(self.log)
            self.states[state.id] = state       # state that can be executed

        self.global_vars = {}        # global variables, can be changed by states and used by other states (for side effects)

        self.status_update_buffer = {}      # store status of state machine and logs to be sent to the frontend
        self.parent_connection = None


    def start(self, run_config, parent_connection):
        """
        Starts the state machine with the given run_config.
        parent_connection is the connection to the parent process, used to send status updates to the frontend.
        """
        self.parent_connection = parent_connection
        nodes = {}  # each node in the graph corresponds to one of the states in the state machine with different input parameters transitions etc.
        for node in run_config['stateNodes']:
            nodes[node['nodeId']] = node

        self.init_status_update_buffer(nodes.keys())

        self.log(f"########\nStarting StateMachine {self.name}")

        current_node_id = run_config['startStateNode']

        while current_node_id in nodes:
            current_node = nodes[current_node_id]
            state_id = current_node['stateId']
            input_parameters = current_node['input_parameters']

            self.update_node_status(current_node_id, 'Running')
            try:
                outcome: str = self.states[state_id].execute(input_parameters, global_vars=self.global_vars)
                self.update_node_status(current_node_id, 'Executed')
                if outcome in current_node['transitions']:
                    current_node_id = current_node['transitions'][outcome]
                else:
                    break
            except Exception as e:
                self.update_node_status(current_node_id, 'Failed')
                self.log(f'Error in State {self.states[state_id].name}: {e}. -> Execution Failed')
                break

        self.log('State machine finished.\n########')
        self.update_sm_status('Finished')
        return True
    
    ############ Status Update Code ############
    def update_node_status(self, node_id: str, status: str):
        self.status_update_buffer['node_status'][node_id] = status
        self.send_status_update()

    def init_status_update_buffer(self, node_ids: list[str]):
        self.status_update_buffer = {'node_status': {node_id: 'NotExecuted' for node_id in node_ids}}
        self.status_update_buffer['state_machine_status'] = 'Running'
        self.status_update_buffer['log_msgs'] = []

    def update_sm_status(self, status: str):
        self.status_update_buffer['state_machine_status'] = status
        self.send_status_update()
    
    def log(self, log_message: str, to_frontend: bool = True):
        print(f'[SM {self.name}] {log_message}')
        if to_frontend:
            self.status_update_buffer['log_msgs'].append(f'[SM: {self.name}] {log_message}')
            self.send_status_update()

    def send_status_update(self):
        if self.parent_connection:
            self.parent_connection.send(self.status_update_buffer)
    ############ Status Update Code ############

    def to_json_interface(self) -> dict:
        states = [state.to_json() for state in self.states.values()]
        return {'name': self.name, 'id': self.id, 'states': states}

    def to_json_config(self) -> dict:
        return {'name': self.name, 'id': self.id, 'configs': self._load_config_files_info()}

    def _scan_config_folder(self):
        """Scans the config folder for all json files and returns a dictionary with the filenames as keys and the full path as values."""
        files = {}
        for filename in os.listdir(self.config_folder):
            if filename.endswith('.json'):
                full_path = os.path.join(self.config_folder, filename)
                files[filename] = full_path

        return files

    def load_config_file(self, name='config1.json') -> dict:
        """Loads a json config file from the config folder and returns it as dict."""
        try:
            with open(os.path.join(self.config_folder, name), 'r') as f:
                return json.load(f)
        except:
            self.log(f'Error: File {name} not found in config folder or could not be opened.', to_frontend=False)
            return {}

    def save_config_file(self, name: str, config: dict):
        """Saves a json config file to the config folder."""
        if name.endswith('.json') and self._isValidConfigFile(config):
            config['state_machine_config']['lastModified'] = datetime.now().isoformat()
            with open(os.path.join(self.config_folder, name), 'w') as f:
                json.dump(config, f, indent=4)
            return True
        else:
            self.log(f'Error: File {name} is not a valid config file.', to_frontend=False)
            return False

    def create_new_config_file(self, name: str, description: str):
        """Creates a new json config file in the config folder."""
        filename = self._get_valid_filename(name)
        file = os.path.join(self.config_folder, filename + '.json')
        config = {"state_machine_config": {
            "name": name,
            "lastModified": datetime.now().isoformat(),
            "creationDate": datetime.now().isoformat(),
            "description": description,
            "startStateNode": "",
            "stateNodes": []
        }}

        with open(file, 'w') as f:
            json.dump(config, f, indent=4)

        return True
    
    def delete_config_file(self, filename: str):
        """Deletes a config file from the config folder."""
        try:
            os.remove(os.path.join(self.config_folder, filename))
            return True
        except:
            self.log(f'Error: File {filename} not found in config folder or could not be deleted.', to_frontend=False)
            return False

    def _get_valid_filename(self, filename: str):
        """Returns a valid filename for a new config file."""
        org_filename = filename
        i = 0
        path = os.path.join(self.config_folder, filename + '.json')
        self.log(f"{path}, {os.path.isfile(path)}", to_frontend=False)
        while os.path.isfile(os.path.join(self.config_folder, filename + '.json')):
            i += 1
            filename = org_filename + str(i)
        return filename


    # { 'name': 'File 1', 'id': 0, 'description': 'Description 1', 'creationDate': new Date(), 'lastModified': new Date() },
    # { 'name': 'File 1', 'filename': 'config1.json, 'description': 'Description 1', 'creationDate': new Date(), 'lastModified': new Date() },

    def _load_config_files_info(self):
        config_infos = []

        for filename, filepath in self._scan_config_folder().items():
            try:
                with open(filepath, 'r') as f:
                    file_contents = json.load(f)
                file_contents = file_contents['state_machine_config']
                info = {'name': file_contents['name'], 'filename': filename, 'description': file_contents['description'],
                        'creationDate': file_contents['creationDate'], 'lastModified': file_contents['lastModified']}
                config_infos.append(info)
            except Exception as e:
                self.log(f'Error in SM {self.id}: File {filename} is not a valid config file. Please remove it.', to_frontend=False)
                continue

        return config_infos

    def _isValidConfigFile(self, config: dict) -> bool:
        return 'state_machine_config' in config and 'startStateNode' in config['state_machine_config'] and 'stateNodes' in config['state_machine_config'] and 'name' in config['state_machine_config']