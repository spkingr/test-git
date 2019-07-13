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

With the images representation:

![cannot rotate image](https://github.com/spkingr/test-git/raw/master/images/godot/Rotation_of_rigidbody2d_1.gif)
![normal rotation image](https://github.com/spkingr/test-git/raw/master/images/godot/Rotation_of_rigidbody2d_2.gif)

I opened the issue in Godot official repository: [https://github.com/godotengine/godot/issues/30551](https://github.com/godotengine/godot/issues/30551)

## My git test repository

Image: https://github.com/spkingr/test-git/raw/master/images/[dir]/[img].jpg

