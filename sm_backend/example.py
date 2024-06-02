

from sm_backend.flask_backend import FlaskBackend
from sm_backend.state_machine import StateMachine
from sm_backend.state import State
import time
import os




# { name: "Idle", stateId: 45, infoText: "This is an Info Text and also especially long. So I mean very very very long. But not that long either", input_par_interface: {}, output_interface: ["Fail", "Success", "What?"] },
#     { name: "MoveBaseToGoal", stateId: 46, infoText: "This is an Info Text", input_par_interface: {'GoalPose': {'type': 'enum', 'values': ['GoalPose1', 'GoalPose2']}, 'Number-Select': {'type': 'number'}, 'String-Enter': {'type': 'string'}, 'Boolean-Select': {'type': 'boolean'}}, output_interface: ["Fail", "Success", "What?"] },
#     { name: "Spin", stateId: 47, infoText: "This is an Info Text", input_par_interface: {}, output_interface: ["Fail", "Success"] },


# Define three different states: Idle, MoveBaseToGoal, Spin
# Define input_par_interface, output_interface and infoText for each state
# Reimplement _state_code with the code that should be executed in this state.
class IdleState(State):

    def __init__(self) -> None:
        super().__init__("Idle", 44)
        self.input_par_interface = {}
        self.output_interface = ["Success", "Fail", "What?"]
        self.infoText = "This is an Info Text and also especially long. So I mean very very very long. But not that long either"

    def _state_code(self, input_parameters, global_vars):
        # implement state here
        self.log("We are doing some idle stuff here.")
        time.sleep(1)
        self.log("Oh no outcome is Fail")
        return "Fail"
    
class IdleState2(State):

    def __init__(self) -> None:
        super().__init__("Idle", 45)
        self.input_par_interface = {}
        self.output_interface = ["Success", "Fail", "What?"]
        self.infoText = "This is an Info Text and also especially long. So I mean very very very long. But not that long either"

    def _state_code(self, input_parameters, global_vars):
        # implement state here
        self.log("Oh sweet another idle state.")
        time.sleep(1)
        self.log("Oh no outcome is Fail")
        return "Fail"


class MoveBaseToGoalState(State):

    def __init__(self) -> None:
        super().__init__("MoveBaseToGoal", 46)
        self.input_par_interface = {'GoalPose': {'type': 'enum', 'values': ['GoalPose1', 'GoalPose2']},
                                    'Number-Select': {'type': 'number'},
                                    'String-Enter': {'type': 'string'},
                                    'Boolean-Select': {'type': 'boolean'}}
        self.output_interface = ["Success", "Fail", "What?"]
        self.infoText = "This is an Info Text"

    def _state_code(self, input_parameters, global_vars):
        # implement state here
        self.log("Oh damn thats a real state with input parameters and so on.")
        time.sleep(3)
        self.log(f"Here are the input parameters: {input_parameters}")
        self.log(f"And here are the global vars: {global_vars}")
        time.sleep(2)
        self.log("Oh no outcome is Fail!!!!")
        return "Fail"   # Return item from output_interface


class SpinState(State):

    def __init__(self) -> None:
        super().__init__("Spin", 47)
        self.input_par_interface = {}
        self.output_interface = ["Success", "Fail"]
        self.infoText = "This is an Info Text"

    def _state_code(self, input_parameters, global_vars):
        # implement state here
        self.log("We're doing some spinning, spinning, spinning...")
        time.sleep(3)
        self.log("Oh no outcome is Fail!!!!")
        return "Fail"

# Define the StateMachines here
def main():
    script_dir = os.path.dirname(os.path.realpath(__file__))
    config_dir = os.path.join(script_dir, 'sm_backend/SMConfigs')      # where to save the behavior tree files
    config_dir2 = os.path.join(script_dir, 'sm_backend/SMConfigs2')    # where to save the behavior tree files

    # Define two different StateMachines name, unique_id, list of available stats, where to save the behavior tree files
    sm1 = StateMachine('WZL1', 0, [IdleState(), MoveBaseToGoalState(), SpinState(), IdleState2()], config_dir)
    sm2 = StateMachine('WZL_other_SM_with_long_name', 1, [IdleState(), MoveBaseToGoalState()], config_dir2)

    sms = [sm1, sm2]
    flask = FlaskBackend(sms)   # forward the two StateMachines to the backend

    flask.start()   # Start backend


if __name__ == "__main__":
    main()
