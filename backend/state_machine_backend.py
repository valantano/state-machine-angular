

from flask_backend import FlaskBackend
from state_machine import StateMachine
from state import State

# { name: "Idle", stateId: 45, infoText: "This is an Info Text and also especially long. So I mean very very very long. But not that long either", input_par_interface: {}, output_interface: ["Fail", "Success", "What?"] },
#     { name: "MoveBaseToGoal", stateId: 46, infoText: "This is an Info Text", input_par_interface: {'GoalPose': {'type': 'enum', 'values': ['GoalPose1', 'GoalPose2']}, 'Number-Select': {'type': 'number'}, 'String-Enter': {'type': 'string'}, 'Boolean-Select': {'type': 'boolean'}}, output_interface: ["Fail", "Success", "What?"] },
#     { name: "Spin", stateId: 47, infoText: "This is an Info Text", input_par_interface: {}, output_interface: ["Fail", "Success"] },


class IdleState(State):

    def __init__(self) -> None:
        super().__init__("Idle", 45)
        self.input_par_interface = {}
        self.output_interface = ["Success", "Fail", "What?"]
        self.infoText = "This is an Info Text and also especially long. So I mean very very very long. But not that long either"

    def _state_code():
        # implement state here
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

    def _state_code():
        # implement state here
        return "Fail"


class SpinState(State):

    def __init__(self) -> None:
        super().__init__("Spin", 47)
        self.input_par_interface = {}
        self.output_interface = ["Success", "Fail"]
        self.infoText = "This is an Info Text"

    def _state_code():
        # implement state here
        return "Fail"

import os
def main():
    script_dir = os.path.dirname(os.path.realpath(__file__))
    config_dir = os.path.join(script_dir, 'SMConfigs')

    sm1 = StateMachine('WZL1', 0, [IdleState(), MoveBaseToGoalState(), SpinState()], config_dir)
    sms = [sm1]
    flask = FlaskBackend(sms)

    flask.start()


if __name__ == "__main__":
    main()
