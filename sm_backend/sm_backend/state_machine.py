import os
import json
from datetime import datetime


from .state import State


class StateMachine:

    def __init__(self, name: str, id: int, state_interface: list[State], config_folder_path: str) -> None:
        self.name: str = name
        self.id: int = id
        self.config_folder: os.path = os.path.normpath(config_folder_path)

        self.states: dict = {}
        for state in state_interface:
            self.states[state.id] = state

        self.global_vars = {}        # global variables


        self.log_msgs = []
        self.running_config = None

    def start(self, config):
        print(f"########\nStarting StateMachine {self.name}")
        nodes = {}  # each node in the graph corresponds to one of the states in the state machine with different input parameters transitions etc.
        self.running_config = config
        for node in self.running_config['stateNodes']:
            nodes[node['nodeId']] = node
        
        current_node_id = self.running_config['startStateNode']

        while current_node_id in nodes:
            current_node = nodes[current_node_id]
            input_parameters = current_node['input_parameters']

            outcome: str = self.states[current_node['stateId']].execute(input_parameters, global_vars=self.global_vars)

            if outcome in current_node['transitions']:
                current_node_id = current_node['transitions'][outcome]
            else:
                break
        print('State machine finished.\n########')
        return True
    
    def log(self, log_message: str, frontend_vis: bool = False):
        print(log_message)
        if frontend_vis:
            # send log message to frontend
            self.log_msgs.append(log_message)

    def get_running_status(self):
        

    


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
            print(
                f'Error: File {name} not found in config folder or could not be opened.')
            return {}

    def save_config_file(self, name: str, config: dict):
        """Saves a json config file to the config folder."""
        if name.endswith('.json') and self._isValidConfigFile(config):
            config['state_machine_config']['lastModified'] = datetime.now().isoformat()
            with open(os.path.join(self.config_folder, name), 'w') as f:
                json.dump(config, f, indent=4)
            return True
        else:
            print(f'Error: File {name} is not a valid config file.')
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
            print(f'Error: File {filename} not found in config folder or could not be deleted.')
            return False

    def _get_valid_filename(self, filename: str):
        """Returns a valid filename for a new config file."""
        org_filename = filename
        i = 0
        path = os.path.join(self.config_folder, filename + '.json')
        print(path, os.path.isfile(path))
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
                print(f'Error in SM {self.id}: File {filename} is not a valid config file. Please remove it.')
                continue

        return config_infos

    def _isValidConfigFile(self, config: dict) -> bool:
        return 'state_machine_config' in config and 'startStateNode' in config['state_machine_config'] and 'stateNodes' in config['state_machine_config'] and 'name' in config['state_machine_config']