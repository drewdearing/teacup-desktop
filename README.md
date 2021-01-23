Launch the app to initialize settings.json
You will need to enter your challonge username, api key, and bracket URL code.

You will need to define instructions for teaCup on how to use the label data.
As of now, teaCup supports writing to a text file and switching images.

Instructions for the two default labels, name and score, are already defined in settings.json.
Here's a closer look at the instruction object for name:

"name": {
	"nameLabel": {
		"type": "text"
	}
}

the object's key must match your desired label's name.
The instruction object contains more objects: one for each file we want to modify.

When the bracket match is updated, teaCup will write two files for the 'name' label:

1. 'nameLabel0.txt' -> 'player 1'
2. 'nameLabel1.txt' -> 'player 2'

One file for each participant's name.
As you can see, the filename's stem is determined by the name of the object within the instruction.

If I want to write multiple files with a single label, that is possible by supplying more files to the instruction.

"name": {
	"nameLabel": {
		"type": "text"
	},
	"anotherNameLabel": {
		"type": "text"
	}
}

Now, four name files will be written:

1. 'nameLabel0.txt' -> 'player 1'
2. 'nameLabel1.txt' -> 'player 2'
3. 'anotherNameLabel0.txt' -> 'player 1'
4. 'anotherNameLabel1.txt' -> 'player 2'

If you want to add images in association with a label, you will need to add an object of type 'image'.
```
"name": {
	"nameLabel": {
		"type": "text"
	},
	"anotherNameLabel": {
		"type": "text"
	},
	"nameImage": {
		"type": "image",
		"options": {
			"tom": "images/names/tom.png",
			"jerry": "images/names/jerry.png"
		}
	}
}
```
You'll notice that image objects require options.
Options define which values are associated with which image.

For example, in the case above, when the player 1's name is 'tom':
teaCup will make a copy of 'images/names/tom.png' and write it 'nameImage0.png'


This should be all you need to know to get the most out of teaCup!
