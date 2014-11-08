# jQuery ScaleText

### Scale text inside a container to be as large as possible without spilling.

I work on a number of projects where I need to fit text to a container, so it is the largest font size possible without spilling out, to aid legibility at a distance.

I decided it would be worth while sticking some of this code into a jQuery plugin, especially so I can chain it.

This is a fairly specific requirement, and is no replacement for good, responsive layout.

* Works on any block/inline-block container
* Changes no CSS other than font-size
* Doesn't require a fixed sized container
* Maintains relative font sizes within container

I primarily use this as part of [ThinkWall](http://thinkwall.com), a Social Signage solution. If you were thinking of using this on something similar/competing - it's released under the MIT license, but you won't be making any friends...

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

## Options

* verticalMiddle : true

ScrollText will add padding element to the container in order to center the content, assuming it can't fit 100%

* animate : false

Animate the change in font-size.

* animateOptions : {}

Passthrough of animation options in case you want to change duration / easing etc.

* accuracy : 100

If you decrease this value, the less perfect the fit will be, but the less intensive the scaling is. This can be very handy on large elements where it doesn't matter so much. I believe 0 will give you a tolerance of -10%. Reducing accuracy will *never* leave you with the text overspilling.

* debug : false

Will output to the console how many iterations it required to scale and how long it took to do so. This is useful if you are tweaking your accuracy.


#### [Demo](https://github.com/unclespode/jquery-scaletext/tree/master/demo)

I'm not sure how to host a demo via GitHub, so I've put it on my [personal site](http://spode.me/jquery-scaletext/demo). It may not always be the latest version.

## Contributing

Check [CONTRIBUTING.md](https://github.com/unclespode/jquery-scaletext/blob/master/CONTRIBUTING.md) for more information.

## History

Check [Releases](https://github.com/unclespode/jquery-scaletext/releases) for detailed changelog.

## License

[MIT License](http://zenorocha.mit-license.org/) © Andrew @Spode Miller
