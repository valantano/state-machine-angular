import os
import json

from state import State


class StateMachine:

    def __init__(self, name: str, id: int, state_interface: list[State], config_folder_path: str) -> None:
        self.name = name
        self.id = id
        self.config_folder = config_folder_path
        self.config_files = self.scan_config_folder()


        self.states = {}
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
    
    def load_config(self, config_id):
        with open(self.config_files[config_id], 'r') as f:
            return json.load(f)

        
        
    def scan_config_folder(self):
        config_files = []

        for filename in os.listdir(self.config_folder):
            if filename.endswith('.json'):
                full_path = os.path.join(self.config_folder, filename)
                config_files.append(full_path)

        files = {}
        for id, file in enumerate(config_files):
            files[id] = file

        return files
    
    
    # { 'name': 'File 1', 'id': 0, 'description': 'Description 1', 'creationDate': new Date(), 'lastModified': new Date() },
    def load_config_files_info(self):
        config_infos = []

        for id, file in self.config_files.items():
            with open(file, 'r') as f:
                file_contents = json.load(f)
                file_contents = file_contents["state_machine_config"]
            info = { 'name': file_contents['name'], 'id': id, 'description': file_contents['description'], 'creationDate': file_contents['creationDate'], 'lastModified': file_contents['lastModified'] }
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

