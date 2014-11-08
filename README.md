# jQuery ScaleText

### Scale text inside a container to be as large as possible without spilling.

I work on a number of projects where I need to fit text to a container, so it is the largest font size possible without spilling, to aid legibility at a distance.

I had a collection of different functions in different scenarios and decided to unify these into a jQuery plugin to make my own life, and perhaps yours easier.

I've experimented with various different techniques over the years and have found this method to be the fastest and most accurate. 

I'm always open to collaborate and add new features if someone sees them as useful. 

I primarily use this as part of ThinkWall, a Social Signage solution. If you were thinking of using this on something competing - it's released under the MIT license, but you won't be making any friends...

I used jQuery Boilerplate to put this together - so I apologise if I've done anything wrong. I have, for instance - never used Travis or Coffeescript, so I'm not in a position to test they are correct.

## Usage

1. Include jQuery:

	```html
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
	```

2. Include plugin's code:

	```html
	<script src="dist/jquery.scaletext.min.js"></script>
	```

3. Call the plugin:

	```javascript
	$("#element").scaleText();
	```

#### [demo/](https://github.com/unclespode/jquery-scaletext/tree/master/demo)

Contains a simple HTML file to demonstrate ScaleText.

## Contributing

Check [CONTRIBUTING.md](https://github.com/unclespode/jquery-scaletext/blob/master/CONTRIBUTING.md) for more information.

## History

Check [Releases](https://github.com/unclespode/jquery-scaletext/releases) for detailed changelog.

## License

[MIT License](http://zenorocha.mit-license.org/) © Zeno Rocha
