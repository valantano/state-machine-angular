from enum import Enum

class EnumExample(Enum):
    GOALPOSE1 = 1
    GOALPOSE2 = 2
        # example of input_parameters = {'enum_example': EnumExample.GOALPOSE1, 'input2': 0.0, 'string_example': None, 'boolean_example': False}


class State:

    def __init__(self, name: str, id: int) -> None:
        self.name = name
        self.id = id # unique id of the state
        self.input_par_interface = {'GoalPose': {'type': 'enum', 'values': ['GoalPose1', 'GoalPose2']}, 'Number-Select': {'type': 'number'}, 'String-Enter': {'type': 'string'}, 'Boolean-Select': {'type': 'boolean'}}

        self.output_interface = ["Fail", "Success", "What?"]

        self.infoText = "This is an Info Text"


    def _state_code():
        # implement state here
        return "Fail"


    def execute(self, blackboard, input_parameters):
        self._before_execute()
        self._state_code()
        self._after_execute()
        return None
    
    def _before_execute():
        # check if input is valid if no input then ask frontend for it
        return None
    
    def _after_execute():
        # check if output is valid

        return None
    
    def to_json(self):
        return {'name': self.name, 'stateId': self.id, 'infoText': self.infoText, 'input_par_interface': self.input_par_interface, 'output_interface': self.output_interface}
    
        # { name: "Idle", stateId: 45, infoText: "This is an Info Text and also especially long. So I mean very very very long. But not that long either", input_par_interface: {}, output_interface: ["Fail", "Success", "What?"] },


class IdleState(State):

    def __init__(self) -> None:
        super().__init__("IdleState", 1)
        self.input_par_interface = {'enum_example': {'type': 'enum', 'value': EnumExample()}, 'input2': {'number_example': 'number', 'value': 0.0}, 'string_example': {'type': 'string', 'value': 'text or path'}, 'boolean_example': {'type': 'boolean', 'value': False}}
        self.output_interface = ["Fail", "Success", "What?"]

    def _state_code():
        # implement state here
        return "Fail"




class Backend:
    enter_update = {'entering_state': 'state1name'}
    exit_update = {'exiting_state': 'state1name', 'output': 'output2'}
    failed_update = {'current_state': 'failed', 'error_message': 'error message'}
    msg = {'type': 'enter', 'data': enter_update}
    input_parameters = {}
    states = [{'state1name': {'input_parameters': input_parameters, 'transitions': {'output1': 'state2name'}}}]
    config = {'states': states, 'initial_state': 'state1name'}
    pass
