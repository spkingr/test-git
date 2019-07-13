# test-git

Updated:

The game built with Godot 3.1 represents the following issue:

- in the `_ready` function if directly set the player state to *ALIVE* then all thing works fine
- but if set the state as *INIT* first then with other events or clicks trigger, change the state to *ALIVE* and the **rotation** cannot work

The test code:

```python
func _ready():
    _changeState(states.INIT)
    # _changeState(states.ALIVE) #This line works but not what I wanted
```

## My git test repository

Image: https://github.com/spkingr/test-git/raw/master/images/[dir]/[img].jpg

