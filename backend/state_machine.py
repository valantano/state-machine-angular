import os
import json

from state import State


class StateMachine:

    def __init__(self, name: str, id: int, state_interface: list[State], config_folder_path: str) -> None:
        self.name: str = name
        self.id: int = id
        self.config_folder: os.path = os.path.normpath(config_folder_path)


        self.states: dict = {}
        for state in state_interface:
            self.states[state.id] = state

        self.current_state = 'state1'
        self.next_state = None

        self.blackboard = {}        # global variables


    def start(config):
        current_state = config['initial_state']
        # execute state
        # get next state
        # execute next state...

    def to_json_interface(self) -> dict:
        states = [state.to_json() for state in self.states.values()]
        return {'name': self.name, 'id': self.id, 'states': states}
    
    def to_json_config(self) -> dict:
        return {'name': self.name, 'id': self.id, 'configs': self.load_config_files_info()}

        
        
    def scan_config_folder(self):
        """Scans the config folder for all json files and returns a dictionary with the filenames as keys and the full path as values."""
        files = {}

        for filename in os.listdir(self.config_folder):
            if filename.endswith('.json'):
                full_path = os.path.join(self.config_folder, filename)
                files[filename] = full_path

        return files
    
    def load_config_file(self, name = 'config1.json') -> dict:
        """Loads a json config file from the config folder and returns it as dict."""
        try:
            with open(os.path.join(self.config_folder, name), 'r') as f:
                return json.load(f)
        except:
            print(f'Error: File {name} not found in config folder or could not be opened.')
            return {}
    
    
    # { 'name': 'File 1', 'id': 0, 'description': 'Description 1', 'creationDate': new Date(), 'lastModified': new Date() },
    # { 'name': 'File 1', 'filename': 'config1.json, 'description': 'Description 1', 'creationDate': new Date(), 'lastModified': new Date() },
    def load_config_files_info(self):
        config_infos = []

        for filename, filepath in self.scan_config_folder().items():
            with open(filepath, 'r') as f:
                file_contents = json.load(f)["state_machine_config"]
            info = { 'name': file_contents['name'], 'filename': filename, 'description': file_contents['description'], 'creationDate': file_contents['creationDate'], 'lastModified': file_contents['lastModified'] }
            config_infos.append(info)

        return config_infos

        
    

    # def save_config(self, config, name):
    #     # check if file exists
    #     i = 0
    #     filename = self.config_folder + name
    #     while os.path.isfile(filename + '.json'):
    #         i += 1
    #         filename = self.config_folder + name + str(i)
    #     with open(filename + '.json', 'w') as f:
    #         f.write(config)

    # def load_available_configs(self):
    #     files = os.listdir(self.config_folder)
    #     json_files = []
    #     for file in files:
    #         if file.endswith('.json'):
    #             json_files.append(file)
    #         else:
    #             print(f'Error: File {file} is not a json file. Config Folder should only contain json files.')
                
    #     valid_configs = []
    #     for file in json_files:
    #         with open(file, 'r') as f:
    #             try:
    #                 config = json.load(f)
    #                 if self.is_valid_config(config):
    #                     self.id_configs.append(config)
    #                 else:
    #                     print(f'Error: File {file} is not a valid config file.')
    #             except:
    #                 continue

    #     return valid_configs

    # def is_valid_config(self, config: dict):
    #     return 'StateMachineConfig' in config and 'startStateNode' in config['StateMachineConfig'] and 'stateNodes' in config['StateMachineConfig'] and 'name' in config['StateMachineConfig']

