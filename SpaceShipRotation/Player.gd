extends RigidBody2D

enum states {INIT, ALIVE, INVULNERABLE, DEAD}
var _state : int
var _rotateDirection : = 0
var _thrustForceInput : = 0

func _ready():
	_changeState(states.INIT)
	# _changeState(states.ALIVE) #This line works but not my wanted

func _process(delta):
	if _state in [states.INIT, states.DEAD]:
		return
	_rotateDirection = int(Input.is_action_pressed('rotate_right')) - int(Input.is_action_pressed('rotate_left'))
	_thrustForceInput = int(Input.is_action_pressed('thrust'))

func _integrate_forces(state):
	state.apply_central_impulse(Vector2(_thrustForceInput * 10, 0).rotated(self.rotation))
	state.apply_torque_impulse(_rotateDirection * 100)
	var screenSize : = self.get_viewport_rect().size
	var xform = state.transform
	if xform.origin.x > screenSize.x:
		xform.origin.x = 0
	elif xform.origin.x < 0:
		xform.origin.x = screenSize.x
	if xform.origin.y > screenSize.y:
		xform.origin.y = 0
	elif xform.origin.y < 0:
		xform.origin.y = screenSize.y
	state.transform = xform

func _changeState(newState) -> void:
	match(newState):
		states.INIT:
			$CollisionShape2D.set_deferred('disabled', true)
		states.ALIVE:
			$CollisionShape2D.set_deferred('disabled', false)
		states.INVULNERABLE:
			$CollisionShape2D.set_deferred('disabled', true)
		states.DEAD:
			$CollisionShape2D.set_deferred('disabled', true)
	_state = newState

func startGame() -> void:
	_changeState(states.ALIVE)

